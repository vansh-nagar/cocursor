import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";

type OnMessageCallback = (payload: string, fromPeerId?: string) => void;

export type PeerMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  fromPeerId?: string;
};

export const useWsRtcConnection = ({ roomId }: { roomId: string }) => {
  const [message, setMessage] = useState<string>("");
  const [peerMessages, setPeerMessages] = useState<PeerMessage[]>([]);

  const messageCallbackRef = useRef<OnMessageCallback | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const channel = useRef<RTCDataChannel | undefined>(undefined);
  const recivedData = useRef<Uint8Array[]>([]);
  const [File, setFile] = useState<File[] | null>(null);
  const [Image, setImage] = useState<string | null>(null);
  const [totalSize, setTotalSize] = useState(0);
  const [uploadedSize, setUploadedSize] = useState(10);
  const updatedUploadedSize = useRef(0);
  const PAUSE_STREAMING = useRef(false);
  const [totalUserCount, setTotalUserCount] = useState(0);
  const reciverSize = useRef(0);
  const fileNameRef = useRef("");

  const [sendingFile, setSendingFile] = useState(false);

  const localVideoStream = useRef<HTMLVideoElement | null>(null);
  const remoteVideoStream = useRef<HTMLVideoElement | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const localStreams = useRef<MediaStream | null>(null);
  const remoteStreams = useRef<MediaStream | null>(null);

  // Sync refs with state for internal logic
  useEffect(() => {
    localStreams.current = localStream;
  }, [localStream]);

  useEffect(() => {
    remoteStreams.current = remoteStream;
    if (remoteStream && remoteVideoStream.current) {
      remoteVideoStream.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [peerConnected, setPeerConnected] = useState(false);

  const MAX_MEMORY = 8 * 1024 * 1024;
  const MIN_MEMORY = 2 * 1024 * 1024;
  const ACK_WINDOW = 32;

  const inFlightChunk = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      setUploadedSize(updatedUploadedSize.current);
    }, 50);
    return () => clearInterval(id);
  }, []);

  const pause = async () => {
    await new Promise<void>((resolve) => {
      const check = () => {
        if (channel.current?.bufferedAmount! < MIN_MEMORY) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  };

  const onMessageHandler = (e: any) => {
    if (typeof e.data === "string") {
      if (e.data === "ACK") {
        inFlightChunk.current = Math.max(0, inFlightChunk.current - 1);
      }
      if (e.data.startsWith("SIZE/")) {
        const sizeStr = e.data.split("/");
        setTotalSize(Number(sizeStr[1]));
      }

      if (e.data.startsWith("EOF/")) {
        const fileName = e.data.split("/");
        fileNameRef.current = fileName[1];
        let offset = 0;
        let finalFile = new Uint8Array(reciverSize.current);
        for (const chunk of recivedData.current) {
          finalFile.set(chunk, offset);
          offset += chunk.length;
        }
        const blob = new Blob([finalFile]);
        const url = URL.createObjectURL(blob);
        setImage(url);

        toast.success(`File received: ${fileName[1]}`);

        reciverSize.current = 0;
        recivedData.current = [];
        return;
      }
    }

    const byte = new Uint8Array(e.data);
    recivedData.current.push(byte);
    reciverSize.current += byte.length;
    channel.current?.send("ACK");
  };

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080");
    ws.current.onopen = () => {
      if (roomId && ws.current?.readyState === WebSocket.OPEN)
        ws.current?.send(JSON.stringify({ type: "join", roomId }));
    };

    pc.current = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    pc.current.onicecandidate = (e) => {
      if (e.candidate && ws.current) {
        ws.current.send(
          JSON.stringify({ type: "candidate", candidate: e.candidate, roomId }),
        );
      }
    };

    pc.current.onconnectionstatechange = () => {
      const state = pc.current?.connectionState;

      if (state === "connected") {
        setPeerConnected(true);
        toast.success("Peer connected!");
      } else if (state === "disconnected" || state === "failed" || state === "closed") {
        setPeerConnected(false);
        setIsInCall(false);
        toast.info("Peer disconnected");

        if (state === "failed" || state === "closed") {
          pc.current?.getSenders().forEach((sender) => {
            pc.current?.removeTrack(sender);
          });
        }
      }
    };

    pc.current.ontrack = async (e) => {
      const remoteMediaStream = e.streams[0];
      setRemoteStream(remoteMediaStream);
      setIsInCall(true);
    };

    pc.current.ondatachannel = (e) => {
      channel.current = e.channel;
      channel.current.binaryType = "arraybuffer";
      channel.current.onopen = () => {};
      channel.current.onmessage = async (e) => {
        onMessageHandler(e);
      };
      channel.current.bufferedAmountLowThreshold = MIN_MEMORY;
      channel.current.onbufferedamountlow = () => {
        PAUSE_STREAMING.current = false;
      };
    };

    ws.current.onmessage = async (message) => {
      const data = JSON.parse(message.data);

      if (data.type === "message") {
        const payload = data.payload || data.message;

        setPeerMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            role: "assistant",
            text: payload,
            fromPeerId: data.fromPeerId,
          },
        ]);

        if (messageCallbackRef.current) {
          messageCallbackRef.current(payload, data.fromPeerId);
        }
      }
      if (data.type === "offer") {
        await pc.current?.setRemoteDescription(
          new RTCSessionDescription(data.offer),
        );
        await answer();
      }
      if (data.type === "answer") {
        await pc.current?.setRemoteDescription(
          new RTCSessionDescription(data.answer),
        );
      }
      if (data.type === "candidate") {
        await pc.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
      if (data.type === "toast") {
        toast.message(`${data.message}`);
      }
      if (data.type === "send-offer") {
        await offer();
      }
      if (data.type === "user-count") {
        setTotalUserCount(data.count);
      }
    };

    return () => {
      if (localStreams.current) {
        localStreams.current.getTracks().forEach((track) => track.stop());
      }
      pc.current?.close();
      ws.current?.close();
    };
  }, []);

  const startMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);

      // Start with audio/video disabled to match initial state
      stream.getTracks().forEach((track) => {
        track.enabled = false;
      });

      if (localVideoStream.current) {
        localVideoStream.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => {
        pc.current?.addTrack(track, stream);
      });

      return stream;
    } catch (err) {
      console.error("Failed to get media stream:", err);
      toast.error("Failed to access camera/microphone. Please check permissions.");
      return null;
    }
  };

  const offer = async () => {
    channel.current = pc.current?.createDataChannel("data-transfer");
    if (channel.current) channel.current.binaryType = "arraybuffer";
    if (!channel.current) return;

    await startMediaStream();

    channel.current.onopen = () => {};

    channel.current.onmessage = (e) => {
      onMessageHandler(e);
    };

    if (!pc.current) return;
    const offerSdp = await pc.current.createOffer();
    await pc.current.setLocalDescription(offerSdp);

    if (offerSdp && ws.current) {
      ws.current.send(JSON.stringify({ type: "offer", offer: offerSdp, roomId }));
    }
  };

  const answer = async () => {
    if (!pc.current) return;

    await startMediaStream();

    const ans = await pc.current?.createAnswer();
    await pc.current?.setLocalDescription(ans);

    if (ws.current)
      ws.current.send(JSON.stringify({ type: "answer", answer: ans, roomId }));
  };

  const toggleAudio = useCallback(() => {
    if (localStreams.current) {
      const audioTracks = localStreams.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled((prev) => !prev);
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    if (!localStreams.current) return;

    const videoTracks = localStreams.current.getVideoTracks();
    
    if (isVideoEnabled) {
      // Turning OFF: true hardware stop
      videoTracks.forEach((track) => {
        track.enabled = false;
        track.stop();
        localStreams.current?.removeTrack(track);
      });
      
      // Update peer connection
      const sender = pc.current?.getSenders().find((s) => s.track?.kind === "video");
      if (sender) {
        await sender.replaceTrack(null);
      }
      
      // Trigger re-render by updating state with a fresh stream clone or the current one
      if (localStreams.current) {
        setLocalStream(new MediaStream(localStreams.current.getTracks()));
      }
      setIsVideoEnabled(false);
    } else {
      // Turning ON: re-acquire track
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newTrack = stream.getVideoTracks()[0];
        
        if (localStreams.current) {
          localStreams.current.addTrack(newTrack);
          
          const sender = pc.current?.getSenders().find((s) => s.track?.kind === "video");
          if (sender) {
            await sender.replaceTrack(newTrack);
          } else {
            pc.current?.addTrack(newTrack, localStreams.current);
          }
          
          setLocalStream(new MediaStream(localStreams.current.getTracks()));
        }

        setIsVideoEnabled(true);
      } catch (err) {
        console.error("Failed to re-acquire video:", err);
        toast.error("Could not turn on camera.");
      }
    }
  }, [isVideoEnabled]);

  const endCall = useCallback(() => {
    if (localStreams.current) {
      localStreams.current.getTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });
    }
    setIsAudioEnabled(false);
    setIsVideoEnabled(false);
    setIsInCall(false);
  }, []);

  const pauseTillStreamFalse = async () => {
    await new Promise<void>((r) => {
      const check = () => {
        if (PAUSE_STREAMING.current === false) {
          r();
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  };

  const send = async () => {
    setSendingFile(true);
    const file = File![0];
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const CHUNK_SIZE = 256 * 1024;
    setTotalSize(bytes.length);

    channel.current?.send(`SIZE/${bytes.length}`);

    for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
      if (PAUSE_STREAMING.current === true) await pauseTillStreamFalse();
      if (channel.current?.bufferedAmount! > MAX_MEMORY) await pause();

      while (inFlightChunk.current >= ACK_WINDOW) {
        await new Promise<void>((r) => setTimeout(r, 50));
      }

      channel.current?.send(bytes.slice(i, i + CHUNK_SIZE));
      inFlightChunk.current++;
      updatedUploadedSize.current += CHUNK_SIZE;
    }
    channel.current?.send(`EOF/${file.name}`);
    setSendingFile(false);
    toast.success(`File sent: ${file.name}`);
  };

  const sendFileContent = () => {
    if (ws.current === null) return;
    ws.current.send(
      JSON.stringify({
        type: "FileContent",
        FileContent: "Hello, this is a test file content!",
      }),
    );
  };

  const sendMessage = (payload: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;

    setPeerMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role: "user",
        text: payload,
      },
    ]);

    ws.current.send(
      JSON.stringify({
        type: "message",
        roomId,
        message: payload,
      }),
    );
  };

  const setMessageCallback = useCallback(
    (callback: OnMessageCallback | null) => {
      messageCallbackRef.current = callback;
    },
    [],
  );

  return {
    ws,
    message,
    setMessage,
    send,
    File,
    setFile,
    Image,
    uploadedSize,
    totalSize,
    setUploadedSize,
    setTotalSize,
    updatedUploadedSize,
    totalUserCount,
    pc,
    remoteVideoStream,
    offer,
    localVideoStream,
    localStream,
    remoteStream,
    localStreams,
    remoteStreams,
    sendingFile,
    fileNameRef,
    sendFileContent,
    sendMessage,
    peerMessages,
    setPeerMessages,
    setMessageCallback,
    isAudioEnabled,
    isVideoEnabled,
    isInCall,
    peerConnected,
    toggleAudio,
    toggleVideo,
    endCall,
  };
};

