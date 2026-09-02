"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  collabWsUrl,
  type ClientMessage,
  type ServerMessage,
} from "@/lib/collab-protocol";

type Listener = (message: ServerMessage) => void;

export type ConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "rejected"
  | "disconnected";

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 15_000;

/**
 * The room's WebSocket, with reconnect.
 *
 * The previous implementation had no onclose and no onerror at all, so a
 * server restart or a brief network drop killed signalling permanently with no
 * indication in the UI. It also captured roomId in a []-dependency effect, so
 * switching project left the socket bound to the old room.
 */
export function useCollabSocket({
  roomId,
  userName,
  enabled = true,
}: {
  roomId: string;
  userName: string;
  enabled?: boolean;
}) {
  const [state, setState] = useState<ConnectionState>("idle");
  const [peerCount, setPeerCount] = useState(0);
  const [selfId, setSelfId] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Set<Listener>>(new Set());
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closedByUs = useRef(false);

  // Read inside callbacks without re-opening the socket when they change.
  const roomIdRef = useRef(roomId);
  const userNameRef = useRef(userName);
  useEffect(() => {
    roomIdRef.current = roomId;
    userNameRef.current = userName;
  }, [roomId, userName]);

  const subscribe = useCallback((listener: Listener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const send = useCallback((message: ClientMessage) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(message));
    return true;
  }, []);

  // Empty when NEXT_PUBLIC_COLLAB_WS_URL is unset on an HTTPS origin, where a
  // ws:// connection would be blocked as mixed content anyway.
  const url = useMemo(() => collabWsUrl(), []);
  const active = enabled && Boolean(roomId) && Boolean(url);

  useEffect(() => {
    if (!active) return;

    closedByUs.current = false;
    let cancelled = false;

    const open = () => {
      if (cancelled) return;

      setState("connecting");
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectAttempts.current = 0;
        socket.send(
          JSON.stringify({
            type: "join",
            roomId: roomIdRef.current,
            userName: userNameRef.current,
          } satisfies ClientMessage),
        );
      };

      socket.onmessage = (event) => {
        let message: ServerMessage;
        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }

        switch (message.type) {
          case "joined":
            setSelfId(message.peerId);
            setState("connected");
            break;
          case "join-rejected":
            // Used to be indistinguishable from a successful join, leaving
            // people in a session whose messages were all silently dropped.
            setState("rejected");
            toast.error(message.reason);
            closedByUs.current = true;
            socket.close();
            break;
          case "user-count":
            setPeerCount(message.count);
            break;
          case "toast":
            if (message.variant === "error") toast.error(message.message);
            else toast.info(message.message);
            break;
        }

        listenersRef.current.forEach((listener) => listener(message));
      };

      socket.onerror = () => {
        // onclose always follows; reconnect is handled there.
      };

      socket.onclose = () => {
        if (cancelled || closedByUs.current) return;

        setState("disconnected");
        setPeerCount(0);

        const attempt = reconnectAttempts.current++;
        const delay = Math.min(
          RECONNECT_BASE_MS * 2 ** attempt,
          RECONNECT_MAX_MS,
        );
        if (attempt === 0) toast.info("Reconnecting to the collaboration server…");
        reconnectTimer.current = setTimeout(open, delay);
      };
    };

    open();

    return () => {
      cancelled = true;
      closedByUs.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      socketRef.current?.close();
      socketRef.current = null;
    };
    // Reconnects deliberately when the room changes.
  }, [roomId, active, url]);

  const publicState: ConnectionState = active
    ? state
    : enabled && roomId && !url
      ? "disconnected"
      : "idle";

  return {
    state: publicState,
    isConnected: publicState === "connected",
    peerCount,
    selfId,
    send,
    subscribe,
  };
}

export type CollabSocket = ReturnType<typeof useCollabSocket>;
