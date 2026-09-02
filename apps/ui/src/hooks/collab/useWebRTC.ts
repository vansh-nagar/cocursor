"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { iceServers } from "@/lib/collab-protocol";
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
 * Uses perfect negotiation, so adding or replacing a track after the initial
 * offer actually reaches the peer. Without an onnegotiationneeded handler every
 * later track change was a silent no-op on the wire, which is why the camera
 * never came back after being switched off.
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

  // Perfect negotiation bookkeeping.
  const makingOffer = useRef(false);
  const politeRef = useRef(false);
  const ignoreOffer = useRef(false);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnected, setPeerConnected] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isRemoteVideoOn, setIsRemoteVideoOn] = useState(false);

  const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([]);
  const [sendProgress, setSendProgress] = useState<number | null>(null);
  const [receiveProgress, setReceiveProgress] = useState<number | null>(null);

  // Keyed by transfer id so two files in flight cannot interleave into one
  // corrupt blob, which a single shared buffer allowed.
  const incoming = useRef<Map<string, IncomingTransfer>>(new Map());
  const objectUrls = useRef<Set<string>>(new Set());

  const ensurePeerConnection = useCallback(() => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection({ iceServers: iceServers() });
    pcRef.current = pc;

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        send({ type: "candidate", roomId, candidate: e.candidate.toJSON() });
      }
    };

    pc.onnegotiationneeded = async () => {
      try {
        makingOffer.current = true;
        await pc.setLocalDescription();
        if (pc.localDescription) {
          send({ type: "offer", roomId, offer: pc.localDescription });
        }
      } catch (err) {
        console.error("[rtc] negotiation failed:", err);
      } finally {
        makingOffer.current = false;
      }
    };

    pc.ontrack = (e) => {
      const [stream] = e.streams;
      setRemoteStream(stream);
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
        setPeerConnected(true);
      } else if (s === "disconnected" || s === "failed" || s === "closed") {
        setPeerConnected(false);
        setIsInCall(false);
        setRemoteStream(null);
        setIsRemoteVideoOn(false);
      }
    };

    pc.ondatachannel = (e) => attachChannel(e.channel);

    return pc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, send]);

  const attachChannel = useCallback((channel: RTCDataChannel) => {
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

  /** Acquires mic and camera. Only ever called from an explicit user action. */
  const startMedia = useCallback(async (): Promise<MediaStream | null> => {
    if (localStreamRef.current) return localStreamRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      // Start muted, but keep one sender per kind for the whole session so
      // toggling only ever calls replaceTrack.
      stream.getTracks().forEach((t) => (t.enabled = false));

      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = ensurePeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

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

    if (!channelRef.current) {
      attachChannel(pc.createDataChannel("data-transfer"));
    }

    const stream = await startMedia();
    if (!stream) return;

    // Unmute audio by default once the user has chosen to call.
    stream.getAudioTracks().forEach((t) => (t.enabled = true));
    setIsAudioEnabled(true);
    setIsInCall(true);
    // onnegotiationneeded sends the offer.
  }, [ensurePeerConnection, attachChannel, startMedia]);

  const endCall = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setIsAudioEnabled(false);
    setIsVideoEnabled(false);
    setIsInCall(false);

    const pc = pcRef.current;
    if (pc) {
      // Drop our media but keep the connection for chat and files.
      pc.getSenders().forEach((sender) => {
        if (sender.track) sender.replaceTrack(null).catch(() => {});
      });
    }
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
    // self-view rendered black and the peer needed a renegotiation that the
    // missing onnegotiationneeded handler never triggered.
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
    return subscribe(async (message) => {
      const pc = pcRef.current;

      switch (message.type) {
        case "joined":
          // Deterministic roles: whoever is asked to offer is impolite.
          politeRef.current = true;
          break;

        case "send-offer": {
          politeRef.current = false;
          // Open the data channel so chat and files work without a call.
          const conn = ensurePeerConnection();
          if (!channelRef.current) {
            attachChannel(conn.createDataChannel("data-transfer"));
          }
          break;
        }

        case "offer": {
          const conn = ensurePeerConnection();
          const offerCollision =
            makingOffer.current || conn.signalingState !== "stable";
          ignoreOffer.current = !politeRef.current && offerCollision;
          if (ignoreOffer.current) return;

          await conn.setRemoteDescription(message.offer);
          // Candidates that arrived while we were awaiting the description —
          // previously these threw InvalidStateError and were lost, which is
          // why calls failed most often on the very first connection.
          for (const c of pendingCandidates.current.splice(0)) {
            await conn.addIceCandidate(c).catch(() => {});
          }
          await conn.setLocalDescription();
          if (conn.localDescription) {
            send({ type: "answer", roomId, answer: conn.localDescription });
          }
          return;
        }

        case "answer": {
          if (!pc) return;
          await pc.setRemoteDescription(message.answer).catch(() => {});
          for (const c of pendingCandidates.current.splice(0)) {
            await pc.addIceCandidate(c).catch(() => {});
          }
          return;
        }

        case "candidate": {
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
          return;
      }
    });
  }, [subscribe, ensurePeerConnection, attachChannel, send, roomId]);

  // Full teardown: tracks, channel, connection, and every object URL.
  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      channelRef.current?.close();
      channelRef.current = null;
      pcRef.current?.close();
      pcRef.current = null;
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
      incoming.current.clear();
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
