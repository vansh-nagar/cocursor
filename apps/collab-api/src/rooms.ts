import type {
  ClientMessage,
  ServerMessage,
  SerializedUpdate,
} from "./types";

/**
 * Room and document logic, independent of the socket library.
 *
 * Shared by the local Node server (src/server.ts, `ws`) and the Cloudflare
 * Worker (src/worker.ts, one Durable Object per room), so both behave the same.
 */

/** Two people per room, matching the 1:1 WebRTC topology. */
const ROOM_CAPACITY = 2;
const MAX_ROOM_ID_LENGTH = 128;
export const MAX_MESSAGE_BYTES = 512 * 1024;

export interface Peer {
  id: string;
  roomId: string | null;
  userName: string;
  send: (message: ServerMessage) => void;
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

function broadcast(room: Room, message: ServerMessage, except?: Peer) {
  for (const peer of room.peers) {
    if (peer !== except) peer.send(message);
  }
}

export class RoomRegistry {
  private rooms = new Map<string, Room>();

  stats() {
    return {
      rooms: this.rooms.size,
      peers: [...this.rooms.values()].reduce((n, r) => n + r.peers.size, 0),
    };
  }

  private getRoom(roomId: string): Room {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = { peers: new Set(), docs: new Map() };
      this.rooms.set(roomId, room);
    }
    return room;
  }

  leave(peer: Peer) {
    if (!peer.roomId) return;

    const room = this.rooms.get(peer.roomId);
    if (!room) return;

    room.peers.delete(peer);
    broadcast(room, { type: "peer-left", peerId: peer.id });
    broadcast(room, { type: "user-count", count: room.peers.size });

    // Drop empty rooms. Previously they were kept forever, one per room ever
    // created, and the doc states with them.
    if (room.peers.size === 0) {
      this.rooms.delete(peer.roomId);
    }

    peer.roomId = null;
  }

  private join(peer: Peer, msg: Extract<ClientMessage, { type: "join" }>) {
    const roomId = String(msg.roomId ?? "").trim();

    if (!roomId || roomId.length > MAX_ROOM_ID_LENGTH) {
      peer.send({ type: "join-rejected", reason: "Invalid room id" });
      return;
    }

    // Idempotent: rejoining the same room must not take the second slot.
    if (peer.roomId === roomId) return;
    if (peer.roomId) this.leave(peer);

    const room = this.getRoom(roomId);

    if (room.peers.size >= ROOM_CAPACITY) {
      // Was indistinguishable from success client-side, leaving people in a
      // connected-looking session whose messages were all discarded.
      peer.send({
        type: "join-rejected",
        reason: "This room already has two people in it.",
      });
      return;
    }

    peer.roomId = roomId;
    peer.userName = String(msg.userName ?? "Guest").slice(0, 64);
    room.peers.add(peer);

    peer.send({ type: "joined", roomId, peerId: peer.id });
    broadcast(room, { type: "user-count", count: room.peers.size });

    // The peer who was already here creates the WebRTC offer.
    if (room.peers.size === ROOM_CAPACITY) {
      const [first] = [...room.peers];
      first.send({
        type: "send-offer",
        message: "A peer joined — you can start the connection.",
      });
    }
  }

  /** Handles one raw text frame from a peer. */
  handle(peer: Peer, raw: string, byteLength: number) {
    if (byteLength > MAX_MESSAGE_BYTES) {
      peer.send({ type: "toast", message: "Message too large", variant: "error" });
      return;
    }

    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw);
    } catch {
      // A single malformed frame used to throw out of the handler and take the
      // whole process down, dropping every room on the server.
      peer.send({ type: "toast", message: "Malformed message", variant: "error" });
      return;
    }

    if (!msg || typeof msg !== "object" || typeof msg.type !== "string") return;

    if (msg.type === "join") {
      this.join(peer, msg);
      return;
    }

    // Everything else requires membership; the room is taken from server state,
    // not from whatever roomId the client claims.
    if (!peer.roomId) return;
    const room = this.rooms.get(peer.roomId);
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
        peer.send({
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
          peer.send({
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

        peer.send({
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
}
