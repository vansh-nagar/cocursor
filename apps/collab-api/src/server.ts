import express from "express";
import http from "http";
import { WebSocketServer, WebSocket, RawData } from "ws";
import { randomUUID } from "crypto";
import type {
  ClientMessage,
  ServerMessage,
  SerializedUpdate,
} from "./types";

const PORT = Number(process.env.PORT ?? 8080);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3001")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

/** Two people per room, matching the 1:1 WebRTC topology. */
const ROOM_CAPACITY = 2;
const HEARTBEAT_MS = 30_000;
const MAX_ROOM_ID_LENGTH = 128;
const MAX_MESSAGE_BYTES = 512 * 1024;

interface Peer {
  id: string;
  socket: WebSocket;
  roomId: string | null;
  userName: string;
  isAlive: boolean;
}

/**
 * Authoritative state for one file, per @codemirror/collab.
 *
 * The server owns the document and its version. Clients push updates based on
 * a version; if they are behind, the push is rejected and they pull and rebase.
 * This is what makes concurrent edits converge instead of the last save
 * silently clobbering the other person's work.
 */
interface DocState {
  version: number;
  doc: string;
  updates: SerializedUpdate[];
}

interface Room {
  peers: Set<Peer>;
  docs: Map<string, DocState>;
}

const rooms = new Map<string, Room>();
const peers = new WeakMap<WebSocket, Peer>();

function send(socket: WebSocket, message: ServerMessage) {
  if (socket.readyState !== WebSocket.OPEN) return;
  try {
    socket.send(JSON.stringify(message));
  } catch (err) {
    console.warn("[ws] send failed:", err);
  }
}

function broadcast(room: Room, message: ServerMessage, except?: Peer) {
  for (const peer of room.peers) {
    if (peer !== except) send(peer.socket, message);
  }
}

function getRoom(roomId: string): Room {
  let room = rooms.get(roomId);
  if (!room) {
    room = { peers: new Set(), docs: new Map() };
    rooms.set(roomId, room);
  }
  return room;
}

function leaveRoom(peer: Peer) {
  if (!peer.roomId) return;

  const room = rooms.get(peer.roomId);
  if (!room) return;

  room.peers.delete(peer);
  broadcast(room, { type: "peer-left", peerId: peer.id });
  broadcast(room, { type: "user-count", count: room.peers.size });

  // Drop empty rooms. Previously they were kept forever, one per room ever
  // created, and the doc states with them.
  if (room.peers.size === 0) {
    rooms.delete(peer.roomId);
  }

  peer.roomId = null;
}

function handleJoin(peer: Peer, msg: Extract<ClientMessage, { type: "join" }>) {
  const roomId = String(msg.roomId ?? "").trim();

  if (!roomId || roomId.length > MAX_ROOM_ID_LENGTH) {
    send(peer.socket, { type: "join-rejected", reason: "Invalid room id" });
    return;
  }

  // Idempotent: rejoining the same room must not take the second slot.
  if (peer.roomId === roomId) return;
  if (peer.roomId) leaveRoom(peer);

  const room = getRoom(roomId);

  if (room.peers.size >= ROOM_CAPACITY) {
    // Was indistinguishable from success client-side, leaving people in a
    // connected-looking session whose messages were all discarded.
    send(peer.socket, {
      type: "join-rejected",
      reason: "This room already has two people in it.",
    });
    return;
  }

  peer.roomId = roomId;
  peer.userName = String(msg.userName ?? "Guest").slice(0, 64);
  room.peers.add(peer);

  send(peer.socket, { type: "joined", roomId, peerId: peer.id });
  broadcast(room, { type: "user-count", count: room.peers.size });

  // The peer who was already here creates the WebRTC offer.
  if (room.peers.size === ROOM_CAPACITY) {
    const [first] = [...room.peers];
    send(first.socket, {
      type: "send-offer",
      message: "A peer joined — you can start the connection.",
    });
  }
}

function handleMessage(peer: Peer, raw: RawData) {
  if (Buffer.byteLength(raw as Buffer) > MAX_MESSAGE_BYTES) {
    send(peer.socket, {
      type: "toast",
      message: "Message too large",
      variant: "error",
    });
    return;
  }

  let msg: ClientMessage;
  try {
    msg = JSON.parse(raw.toString());
  } catch {
    // A single malformed frame used to throw out of the handler and take the
    // whole process down, dropping every room on the server.
    send(peer.socket, {
      type: "toast",
      message: "Malformed message",
      variant: "error",
    });
    return;
  }

  if (!msg || typeof msg !== "object" || typeof msg.type !== "string") return;

  if (msg.type === "join") {
    handleJoin(peer, msg);
    return;
  }

  // Everything else requires membership; the room is taken from server state,
  // not from whatever roomId the client claims.
  if (!peer.roomId) return;
  const room = rooms.get(peer.roomId);
  if (!room) return;

  switch (msg.type) {
    case "message":
      broadcast(
        room,
        {
          type: "message",
          message: String(msg.message ?? ""),
          fromPeerId: peer.id,
          sentAt: Date.now(),
        },
        peer,
      );
      return;

    case "offer":
      broadcast(room, { type: "offer", offer: msg.offer }, peer);
      return;

    case "answer":
      broadcast(room, { type: "answer", answer: msg.answer }, peer);
      return;

    case "candidate":
      broadcast(room, { type: "candidate", candidate: msg.candidate }, peer);
      return;

    case "doc-open": {
      const path = String(msg.path);
      let doc = room.docs.get(path);
      if (!doc) {
        // First client to open this file seeds the authoritative copy from
        // what it loaded out of Convex.
        doc = { version: 0, doc: String(msg.fallbackDoc ?? ""), updates: [] };
        room.docs.set(path, doc);
      }
      send(peer.socket, {
        type: "doc-opened",
        path,
        version: doc.version,
        doc: doc.doc,
      });
      return;
    }

    case "doc-push": {
      const path = String(msg.path);
      const doc = room.docs.get(path);
      if (!doc) return;

      // Stale base version: reject silently. The client pulls, rebases and
      // pushes again — this is the ordinary path, not an error.
      if (msg.version !== doc.version) {
        send(peer.socket, {
          type: "doc-updates",
          path,
          version: doc.version,
          updates: doc.updates.slice(msg.version),
        });
        return;
      }

      doc.updates.push(...msg.updates);
      doc.version += msg.updates.length;

      broadcast(room, {
        type: "doc-updates",
        path,
        version: doc.version,
        updates: msg.updates,
      });
      return;
    }

    case "doc-pull": {
      const path = String(msg.path);
      const doc = room.docs.get(path);
      if (!doc) return;
      if (msg.version >= doc.version) return;

      send(peer.socket, {
        type: "doc-updates",
        path,
        version: doc.version,
        updates: doc.updates.slice(msg.version),
      });
      return;
    }

    case "presence":
      broadcast(
        room,
        {
          type: "presence",
          path: String(msg.path),
          peerId: peer.id,
          userName: peer.userName,
          anchor: msg.anchor,
          head: msg.head,
        },
        peer,
      );
      return;
  }
}

const app = express();

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    rooms: rooms.size,
    peers: [...rooms.values()].reduce((n, r) => n + r.peers.size, 0),
  });
});

// One HTTP server for both, so there is a single endpoint to put behind a
// proxy. They used to listen on two unrelated ports.
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (socket, req) => {
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    socket.close(1008, "Origin not allowed");
    return;
  }

  const peer: Peer = {
    id: randomUUID(),
    socket,
    roomId: null,
    userName: "Guest",
    isAlive: true,
  };
  peers.set(socket, peer);

  socket.on("message", (raw) => {
    try {
      handleMessage(peer, raw);
    } catch (err) {
      console.error("[ws] handler error:", err);
    }
  });

  socket.on("pong", () => {
    peer.isAlive = true;
  });

  // Without this an abrupt socket error emits an unhandled 'error' event,
  // which crashes the process.
  socket.on("error", (err) => {
    console.warn("[ws] socket error:", err.message);
  });

  socket.on("close", () => {
    leaveRoom(peer);
  });
});

// Reap half-open sockets, which otherwise sit in a room forever and make it
// read as full to anyone actually trying to join.
const heartbeat = setInterval(() => {
  for (const socket of wss.clients) {
    const peer = peers.get(socket);
    if (!peer) continue;

    if (!peer.isAlive) {
      socket.terminate();
      continue;
    }
    peer.isAlive = false;
    socket.ping();
  }
}, HEARTBEAT_MS);

wss.on("close", () => clearInterval(heartbeat));

server.listen(PORT, () => {
  console.log(`[collab-api] http + ws listening on :${PORT}`);
  console.log(`[collab-api] allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
});
