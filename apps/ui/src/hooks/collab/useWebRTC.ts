"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { iceServers, type ServerMessage } from "@/lib/collab-protocol";
import type { CollabSocket } from "./useCollabSocket";

export interface ReceivedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

const CHUNK_SIZE = 16 * 1024;
const BUFFER_HIGH = 8 * 1024 * 1024;
const BUFFER_LOW = 2 * 1024 * 1024;

/** How long to wait for ICE to connect before telling the user it failed. */
const ICE_TIMEOUT_MS = 20_000;

/** Control frames on the data channel, kept distinct from binary payload. */
const CTRL = {
  begin: "BEGIN:",
  end: "END:",
} as const;

interface IncomingTransfer {
  id: string;
  name: string;
  size: number;
  mime: string;
  chunks: Uint8Array[];
  received: number;
}

/**
 * One-to-one WebRTC: media, chat data channel and file transfer.
 *
 * The connection is deliberately peer-to-peer only. Media and files travel
 * directly between the two browsers over STUN-discovered candidates; no relay
 * server is required or assumed, so the feature works with nothing deployed
 * beyond the signalling socket. The cost of that choice is that two peers
 * behind different symmetric NATs cannot reach each other at all, so the
 * failure is detected and reported in words instead of hanging on a black
 * rectangle.
 *
 * Negotiation follows the perfect-negotiation pattern: one peer is impolite
 * (the one the server asks to offer) and wins glare, the other rolls back.
 */
export function useWebRTC({
  socket,
  roomId,
}: {
  socket: CollabSocket;
  roomId: string;
}) {
  const { send, subscribe } = socket;

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // One sender per kind for the whole session. Re-calling addTrack on a second
  // call added a second sender per kind, which produced duplicate m-lines, a
  // remote stream that changed identity mid-call, and a peer that saw nothing
  // the second time a call was placed.
  const sendersRef = useRef<{
    audio: RTCRtpSender | null;
    video: RTCRtpSender | null;
  }>({ audio: null, video: null });

  // Perfect negotiation bookkeeping.
  const makingOffer = useRef(false);
  const politeRef = useRef(true);
  const ignoreOffer = useRef(false);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  // Signalling messages are handled one at a time. They used to run as
  // overlapping async callbacks, so an offer and the candidates behind it could
  // call setRemoteDescription concurrently and throw InvalidStateError, which
  // is the single most common reason a first call never connected.
  const signalQueue = useRef<Promise<void>>(Promise.resolve());

  const iceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnected, setPeerConnected] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isRemoteVideoOn, setIsRemoteVideoOn] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<
    "idle" | "connecting" | "direct" | "failed"
  >("idle");

  const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([]);
  const [sendProgress, setSendProgress] = useState<number | null>(null);
  const [receiveProgress, setReceiveProgress] = useState<number | null>(null);

  // Keyed by transfer id so two files in flight cannot interleave into one
  // corrupt blob, which a single shared buffer allowed.
  const incoming = useRef<Map<string, IncomingTransfer>>(new Map());
  const objectUrls = useRef<Set<string>>(new Set());

  const attachChannel = useCallback((channel: RTCDataChannel) => {
    // Keep whichever channel is actually usable. Both peers may create one
    // during glare; the loser's would otherwise overwrite an open channel with
    // a connecting one and the first file send would fail.
    const existing = channelRef.current;
    if (existing && existing !== channel && existing.readyState === "open") {
      channel.close();
      return;
    }

    channel.binaryType = "arraybuffer";
    channel.bufferedAmountLowThreshold = BUFFER_LOW;
    channelRef.current = channel;

    channel.onmessage = (e) => {
      // Control frames are strings; anything else is payload. Each branch
      // returns — falling through used to re-ACK every ACK, producing an
      // endless ping-pong that grew unbounded buffers until the tab died.
      if (typeof e.data === "string") {
        if (e.data.startsWith(CTRL.begin)) {
          const meta = JSON.parse(e.data.slice(CTRL.begin.length));
          incoming.current.set(meta.id, {
            id: meta.id,
            name: meta.name,
            size: meta.size,
            mime: meta.mime || "application/octet-stream",
            chunks: [],
            received: 0,
          });
          setReceiveProgress(0);
          return;
        }

        if (e.data.startsWith(CTRL.end)) {
          const id = e.data.slice(CTRL.end.length);
          const transfer = incoming.current.get(id);
          if (!transfer) return;
          incoming.current.delete(id);

          const merged = new Uint8Array(transfer.received);
          let offset = 0;
          for (const chunk of transfer.chunks) {
            merged.set(chunk, offset);
            offset += chunk.length;
          }

          // Typed, so the browser can preview it.
          const blob = new Blob([merged], { type: transfer.mime });
          const url = URL.createObjectURL(blob);
          objectUrls.current.add(url);

          setReceivedFiles((prev) => [
            ...prev,
            {
              id: transfer.id,
              name: transfer.name,
              url,
              size: transfer.size,
              type: transfer.mime,
            },
          ]);
          setReceiveProgress(null);
          toast.success(`Received ${transfer.name}`);
          return;
        }
        return;
      }

      // Binary payload. The transfer id is a 36-byte UUID prefix.
      const buffer = new Uint8Array(e.data as ArrayBuffer);
      const id = new TextDecoder().decode(buffer.subarray(0, 36));
      const transfer = incoming.current.get(id);
      if (!transfer) return;

      const chunk = buffer.subarray(36);
      transfer.chunks.push(chunk);
      transfer.received += chunk.length;
      setReceiveProgress(
        transfer.size ? (transfer.received / transfer.size) * 100 : 0,
      );
    };

    channel.onclose = () => {
      if (channelRef.current === channel) channelRef.current = null;
    };
  }, []);

  /**
   * Reports why a connection failed, using the candidates actually gathered.
   *
   * Without a relay the only routes are host (same machine), server-reflexive
   * (same network, or a cooperative NAT) and peer-reflexive. When none of them
   * pair up, the honest answer is that the two networks cannot see each other —
   * not that "something went wrong".
   */
  const explainFailure = useCallback(async (pc: RTCPeerConnection) => {
    let sawRemoteCandidate = false;
    try {
      const stats = await pc.getStats();
      stats.forEach((report) => {
        if (report.type === "remote-candidate") sawRemoteCandidate = true;
      });
    } catch {
      // Stats are best-effort; the message below is still the right one.
    }

    toast.error(
      sawRemoteCandidate
        ? "Could not open a direct connection. Cocursor calls are peer-to-peer, so both of you need to be reachable from each other — the same Wi-Fi network works, two different mobile networks usually will not."
        : "The other browser never sent its network details. Ask them to reload the room and try the call again.",
    );
  }, []);

  const ensurePeerConnection = useCallback(() => {
    if (pcRef.current && pcRef.current.connectionState !== "closed") {
      return pcRef.current;
    }

    const pc = new RTCPeerConnection({
      iceServers: iceServers(),
      // Gather ahead of the first offer so the handshake is not waiting on
      // STUN round-trips when the user presses Call.
      iceCandidatePoolSize: 4,
    });
    pcRef.current = pc;
    sendersRef.current = { audio: null, video: null };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        send({ type: "candidate", roomId, candidate: e.candidate.toJSON() });
      }
    };

    pc.onnegotiationneeded = () => {
      // Queued behind any in-flight remote description, so an offer is never
      // built while the connection is mid-way through applying one.
      signalQueue.current = signalQueue.current
        .then(async () => {
          try {
            makingOffer.current = true;
            await pc.setLocalDescription();
            if (pc.localDescription) {
              send({ type: "offer", roomId, offer: pc.localDescription });
            }
          } finally {
            makingOffer.current = false;
          }
        })
        .catch((err) => console.error("[rtc] negotiation failed:", err));
    };

    pc.ontrack = (e) => {
      const [stream] = e.streams;
      if (stream) setRemoteStream(stream);
      setIsInCall(true);

      const track = e.track;
      if (track.kind === "video") {
        // Track enabled/muted state, so "camera off" can be distinguished from
        // "connecting" instead of showing an unexplained black rectangle.
        setIsRemoteVideoOn(!track.muted);
        track.onmute = () => setIsRemoteVideoOn(false);
        track.onunmute = () => setIsRemoteVideoOn(true);
        track.onended = () => setIsRemoteVideoOn(false);
      }
    };

    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;

      if (s === "connected") {
        if (iceTimer.current) clearTimeout(iceTimer.current);
        iceTimer.current = null;
        setPeerConnected(true);
        setConnectionQuality("direct");
        return;
      }

      if (s === "connecting") {
        setConnectionQuality("connecting");
        // A handshake that never completes used to sit at "connecting"
        // indefinitely with no explanation anywhere in the UI.
        if (iceTimer.current) clearTimeout(iceTimer.current);
        iceTimer.current = setTimeout(() => {
          if (pc.connectionState !== "connected") {
            setConnectionQuality("failed");
            void explainFailure(pc);
          }
        }, ICE_TIMEOUT_MS);
        return;
      }

      if (s === "failed") {
        setConnectionQuality("failed");
        setPeerConnected(false);
        // One restart attempt: a candidate can be lost to a transient network
        // change, and re-gathering recovers it. The impolite peer drives it so
        // the two sides do not restart against each other.
        if (!politeRef.current) pc.restartIce();
        else void explainFailure(pc);
        return;
      }

      if (s === "disconnected" || s === "closed") {
        setPeerConnected(false);
        setIsInCall(false);
        setRemoteStream(null);
        setIsRemoteVideoOn(false);
        setConnectionQuality(s === "closed" ? "idle" : "connecting");
      }
    };

    pc.ondatachannel = (e) => attachChannel(e.channel);

    return pc;
  }, [roomId, send, attachChannel, explainFailure]);

  /**
   * Acquires mic and camera and binds them to this session's two senders.
   *
   * Only ever called from an explicit user action, and safe to call again
   * after a hang-up: the second call replaces the track on the existing sender
   * rather than adding another one.
   */
  const startMedia = useCallback(async (): Promise<MediaStream | null> => {
    const live = localStreamRef.current;
    if (live && live.getTracks().some((t) => t.readyState === "live")) {
      return live;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Start muted. The call button unmutes audio; video stays off until the
      // user asks for it.
      stream.getTracks().forEach((t) => (t.enabled = false));

      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = ensurePeerConnection();
      const senders = sendersRef.current;

      for (const track of stream.getTracks()) {
        const kind = track.kind as "audio" | "video";
        const existing = senders[kind];
        if (existing) {
          await existing.replaceTrack(track);
        } else {
          senders[kind] = pc.addTrack(track, stream);
        }
      }

      return stream;
    } catch (err) {
      console.error("[rtc] getUserMedia failed:", err);
      toast.error(
        "Could not access your camera or microphone. Check the site's permissions.",
      );
      return null;
    }
  }, [ensurePeerConnection]);

  /** Starts a call. Bound to a button — never fired automatically. */
  const startCall = useCallback(async () => {
    const pc = ensurePeerConnection();

    const channel = channelRef.current;
    if (!channel || channel.readyState === "closed") {
      attachChannel(pc.createDataChannel("data-transfer"));
    }

    const stream = await startMedia();
    if (!stream) return;

    // Unmute audio by default once the user has chosen to call.
    stream.getAudioTracks().forEach((t) => (t.enabled = true));
    setIsAudioEnabled(true);
    setIsVideoEnabled(false);
    setIsInCall(true);
    if (pc.connectionState !== "connected") setConnectionQuality("connecting");
    // onnegotiationneeded sends the offer.
  }, [ensurePeerConnection, attachChannel, startMedia]);

  const endCall = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setIsAudioEnabled(false);
    setIsVideoEnabled(false);
    setIsInCall(false);

    // Drop our media but keep the senders and the connection, so chat and file
    // transfer survive a hang-up and the next call reuses the same m-lines.
    const senders = sendersRef.current;
    senders.audio?.replaceTrack(null).catch(() => {});
    senders.video?.replaceTrack(null).catch(() => {});
  }, []);

  const toggleAudio = useCallback(() => {
    const tracks = localStreamRef.current?.getAudioTracks() ?? [];
    if (tracks.length === 0) {
      toast.info("Start a call first.");
      return;
    }
    const next = !tracks[0].enabled;
    tracks.forEach((t) => (t.enabled = next));
    setIsAudioEnabled(next);
  }, []);

  const toggleVideo = useCallback(() => {
    const tracks = localStreamRef.current?.getVideoTracks() ?? [];
    if (tracks.length === 0) {
      toast.info("Start a call first.");
      return;
    }
    // Enable/disable the existing track rather than adding a new one. Adding a
    // second track left the original disabled track first in the stream, so the
    // self-view rendered black and the peer needed a renegotiation.
    const next = !tracks[0].enabled;
    tracks.forEach((t) => (t.enabled = next));
    setIsVideoEnabled(next);
  }, []);

  const sendFile = useCallback(async (file: File) => {
    const channel = channelRef.current;
    if (!channel || channel.readyState !== "open") {
      toast.error("No peer connection. Start a call first.");
      return;
    }

    const id = crypto.randomUUID();
    const idBytes = new TextEncoder().encode(id);

    channel.send(
      CTRL.begin +
        JSON.stringify({
          id,
          name: file.name,
          size: file.size,
          mime: file.type || "application/octet-stream",
        }),
    );

    setSendProgress(0);
    let sent = 0;

    try {
      // Streamed with File.slice rather than buffering the whole file into
      // memory, which OOM'd the tab before a byte went out.
      for (let offset = 0; offset < file.size; offset += CHUNK_SIZE) {
        const slice = await file.slice(offset, offset + CHUNK_SIZE).arrayBuffer();

        const frame = new Uint8Array(idBytes.length + slice.byteLength);
        frame.set(idBytes, 0);
        frame.set(new Uint8Array(slice), idBytes.length);
        channel.send(frame);

        sent += slice.byteLength;
        setSendProgress((sent / file.size) * 100);

        if (channel.bufferedAmount > BUFFER_HIGH) {
          await new Promise<void>((resolve) => {
            const onLow = () => {
              channel.removeEventListener("bufferedamountlow", onLow);
              resolve();
            };
            channel.addEventListener("bufferedamountlow", onLow);
            // Don't hang forever if the channel dies mid-transfer.
            setTimeout(onLow, 10_000);
          });
        }

        if (channel.readyState !== "open") {
          throw new Error("Connection lost during transfer");
        }
      }

      channel.send(CTRL.end + id);
      toast.success(`Sent ${file.name}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : `Failed to send ${file.name}`,
      );
    } finally {
      setSendProgress(null);
    }
  }, []);

  const dismissFile = useCallback((id: string) => {
    setReceivedFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
        objectUrls.current.delete(target.url);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  // Signalling.
  useEffect(() => {
    /** Applies every candidate that arrived before its description did. */
    const flushCandidates = async (pc: RTCPeerConnection) => {
      for (const c of pendingCandidates.current.splice(0)) {
        await pc.addIceCandidate(c).catch(() => {});
      }
    };

    const handle = async (message: ServerMessage) => {
      switch (message.type) {
        case "joined":
          // Default role. The server promotes exactly one peer to impolite
          // below, and does so after this message on the same socket.
          politeRef.current = true;
          return;

        case "send-offer": {
          politeRef.current = false;
          // Open the data channel so chat and files work without a call. This
          // also triggers negotiation, which is what connects the two peers.
          const conn = ensurePeerConnection();
          const channel = channelRef.current;
          if (!channel || channel.readyState === "closed") {
            attachChannel(conn.createDataChannel("data-transfer"));
          }
          return;
        }

        case "offer": {
          const conn = ensurePeerConnection();

          const collision =
            makingOffer.current || conn.signalingState !== "stable";
          ignoreOffer.current = !politeRef.current && collision;
          if (ignoreOffer.current) return;

          if (collision) {
            // Polite peer yields: discard our own half-finished offer so the
            // remote one can be applied. Skipping this left the connection in
            // have-local-offer and the handshake never completed.
            await conn
              .setLocalDescription({ type: "rollback" })
              .catch(() => {});
          }

          await conn.setRemoteDescription(message.offer);
          await flushCandidates(conn);
          await conn.setLocalDescription();
          if (conn.localDescription) {
            send({ type: "answer", roomId, answer: conn.localDescription });
          }
          return;
        }

        case "answer": {
          const pc = pcRef.current;
          // An answer that arrives when we are not expecting one (a duplicate,
          // or the loser of a glare) must be dropped, not applied.
          if (!pc || pc.signalingState !== "have-local-offer") return;
          await pc.setRemoteDescription(message.answer);
          await flushCandidates(pc);
          return;
        }

        case "candidate": {
          const pc = pcRef.current;
          if (!pc || !pc.remoteDescription) {
            pendingCandidates.current.push(message.candidate);
            return;
          }
          await pc.addIceCandidate(message.candidate).catch((err) => {
            if (!ignoreOffer.current) console.warn("[rtc] ICE:", err);
          });
          return;
        }

        case "peer-left":
          setPeerConnected(false);
          setIsInCall(false);
          setRemoteStream(null);
          setIsRemoteVideoOn(false);
          setConnectionQuality("idle");
          pendingCandidates.current.length = 0;
          return;
      }
    };

    return subscribe((message) => {
      // Serialized: the WebRTC API is a state machine, and two descriptions
      // applied at once throw rather than queue.
      signalQueue.current = signalQueue.current
        .then(() => handle(message))
        .catch((err) => console.error("[rtc] signalling:", err));
    });
  }, [subscribe, ensurePeerConnection, attachChannel, send, roomId]);

  // Full teardown: tracks, channel, connection, and every object URL.
  useEffect(() => {
    const urls = objectUrls.current;
    const transfers = incoming.current;
    return () => {
      if (iceTimer.current) clearTimeout(iceTimer.current);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      channelRef.current?.close();
      channelRef.current = null;
      pcRef.current?.close();
      pcRef.current = null;
      sendersRef.current = { audio: null, video: null };
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
      transfers.clear();
    };
  }, []);

  return {
    localStream,
    remoteStream,
    peerConnected,
    isInCall,
    isAudioEnabled,
    isVideoEnabled,
    isRemoteVideoOn,
    connectionQuality,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
    sendFile,
    receivedFiles,
    dismissFile,
    sendProgress,
    receiveProgress,
  };
}
