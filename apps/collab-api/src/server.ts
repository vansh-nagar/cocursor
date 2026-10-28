import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";
import { RoomRegistry, type Peer } from "./rooms";

/**
 * Local Node server. In production the same room logic runs on Cloudflare
 * (src/worker.ts); this one is for `bun dev`.
 */

const PORT = Number(process.env.PORT ?? 8080);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "http://localhost:3100")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const HEARTBEAT_MS = 30_000;

const registry = new RoomRegistry();
const alive = new WeakMap<WebSocket, boolean>();

const app = express();

app.get("/health", (_req, res) => {
  res.json({ ok: true, ...registry.stats() });
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
    roomId: null,
    userName: "Guest",
    send(message) {
      if (socket.readyState !== WebSocket.OPEN) return;
      try {
        socket.send(JSON.stringify(message));
      } catch (err) {
        console.warn("[ws] send failed:", err);
      }
    },
  };
  alive.set(socket, true);

  socket.on("message", (raw) => {
    try {
      const buf = raw as Buffer;
      registry.handle(peer, buf.toString(), Buffer.byteLength(buf));
    } catch (err) {
      console.error("[ws] handler error:", err);
    }
  });

  socket.on("pong", () => {
    alive.set(socket, true);
  });

  // Without this an abrupt socket error emits an unhandled 'error' event,
  // which crashes the process.
  socket.on("error", (err) => {
    console.warn("[ws] socket error:", err.message);
  });

  socket.on("close", () => {
    registry.leave(peer);
  });
});

// Reap half-open sockets, which otherwise sit in a room forever and make it
// read as full to anyone actually trying to join.
const heartbeat = setInterval(() => {
  for (const socket of wss.clients) {
    if (!alive.get(socket)) {
      socket.terminate();
      continue;
    }
    alive.set(socket, false);
    socket.ping();
  }
}, HEARTBEAT_MS);

wss.on("close", () => clearInterval(heartbeat));

server.listen(PORT, () => {
  console.log(`[collab-api] http + ws listening on :${PORT}`);
  console.log(`[collab-api] allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
});
