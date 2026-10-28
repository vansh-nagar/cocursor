import { DurableObject } from "cloudflare:workers";
import { RoomRegistry, type Peer } from "./rooms";

/**
 * Cloudflare deployment of the collab server.
 *
 * Each room is one Durable Object, so both people in a room always reach the
 * same instance and its in-memory document state. The client puts the room id
 * in the URL (`?room=`) because the Worker has to pick the object before the
 * first message arrives.
 *
 * Sockets are accepted with the standard (non-hibernating) API on purpose:
 * hibernation can evict the object from memory while sockets stay open, which
 * would drop every document's version history mid-session.
 */

interface Env {
  ROOMS: DurableObjectNamespace<CollabRoom>;
  ALLOWED_ORIGINS: string;
}

export class CollabRoom extends DurableObject<Env> {
  private registry = new RoomRegistry();

  fetch(request: Request): Response {
    const { 0: client, 1: server } = new WebSocketPair();
    server.accept();

    const peer: Peer = {
      id: crypto.randomUUID(),
      roomId: null,
      userName: "Guest",
      send(message) {
        try {
          server.send(JSON.stringify(message));
        } catch (err) {
          console.warn("[ws] send failed:", err);
        }
      },
    };

    server.addEventListener("message", (event) => {
      try {
        const raw =
          typeof event.data === "string"
            ? event.data
            : new TextDecoder().decode(event.data);
        this.registry.handle(peer, raw, new TextEncoder().encode(raw).length);
      } catch (err) {
        console.error("[ws] handler error:", err);
      }
    });

    const leave = () => this.registry.leave(peer);
    server.addEventListener("close", leave);
    server.addEventListener("error", leave);

    return new Response(null, { status: 101, webSocket: client });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({ ok: true });
    }

    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected a WebSocket upgrade", { status: 426 });
    }

    const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
    const origin = request.headers.get("Origin");
    if (origin && !allowed.includes(origin)) {
      return new Response("Origin not allowed", { status: 403 });
    }

    const roomId = url.searchParams.get("room")?.trim();
    if (!roomId || roomId.length > 128) {
      return new Response("Missing or invalid ?room=", { status: 400 });
    }

    const stub = env.ROOMS.get(env.ROOMS.idFromName(roomId));
    return stub.fetch(request);
  },
} satisfies ExportedHandler<Env>;
