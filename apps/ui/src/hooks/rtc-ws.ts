"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useCollabSocket } from "./collab/useCollabSocket";
import { useWebRTC } from "./collab/useWebRTC";

export type PeerMessage = {
  id: string;
  role: "self" | "peer";
  text: string;
  authorId?: string;
  sentAt: number;
};

/**
 * Everything a room needs: signalling socket, WebRTC media/files, and peer chat.
 *
 * Mount this only when collaboration is actually wanted (`enabled`). It used to
 * be mounted unconditionally for every project page, which opened a socket,
 * joined a room and — because getUserMedia fired the moment a second person
 * arrived — produced a camera prompt with no user gesture behind it.
 */
export const useWsRtcConnection = ({
  roomId,
  enabled = true,
}: {
  roomId: string;
  enabled?: boolean;
}) => {
  const { user } = useUser();
  const userName = user?.firstName || user?.fullName || "Guest";

  const socket = useCollabSocket({
    roomId,
    userName,
    enabled: enabled && Boolean(roomId),
  });

  const rtc = useWebRTC({ socket, roomId });

  // Tagged with the room so switching project drops the old transcript
  // without a setState-in-effect cascade.
  const [transcript, setTranscript] = useState<{
    roomId: string;
    messages: PeerMessage[];
  }>({ roomId, messages: [] });

  const peerMessages = transcript.roomId === roomId ? transcript.messages : [];

  const appendMessage = useCallback(
    (message: PeerMessage) => {
      setTranscript((prev) =>
        prev.roomId === roomId
          ? { roomId, messages: [...prev.messages, message] }
          : { roomId, messages: [message] },
      );
    },
    [roomId],
  );

  useEffect(() => {
    return socket.subscribe((message) => {
      if (message.type !== "message") return;
      appendMessage({
        id: `${message.sentAt}-${message.fromPeerId}`,
        role: "peer",
        text: message.message,
        authorId: message.fromPeerId,
        sentAt: message.sentAt,
      });
    });
  }, [socket, appendMessage]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // Report failure rather than showing the message as sent when the socket
      // is down and the server would silently discard it.
      const delivered = socket.send({
        type: "message",
        roomId,
        message: trimmed,
      });
      if (!delivered) return false;

      appendMessage({
        id: `${Date.now()}-self`,
        role: "self",
        text: trimmed,
        sentAt: Date.now(),
      });
      return true;
    },
    [socket, roomId, appendMessage],
  );

  return useMemo(
    () => ({
      // connection
      connectionState: socket.state,
      isConnected: socket.isConnected,
      totalUserCount: socket.peerCount,
      selfId: socket.selfId,
      send: socket.send,
      subscribe: socket.subscribe,

      // chat
      peerMessages,
      sendMessage,

      // rtc
      ...rtc,
    }),
    [socket, peerMessages, sendMessage, rtc],
  );
};

export type RoomConnection = ReturnType<typeof useWsRtcConnection>;
