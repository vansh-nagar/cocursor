import express from "express";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

const rooms = new Map<string, WebSocket[]>();

wss.on("connection", function connection(ws: any) {
  ws.on("message", function (data: any) {
    const message = JSON.parse(data.toString());

    if (message.type === "FileContent") {
      const clients = rooms.get(message.roomId);
      if (clients === undefined) return;
      clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          client.send(
            JSON.stringify({
              type: "FileContent",
              FileContent: message.FileContent,
              pos: message.CursorPos,
            }),
          );
        }
      });
      return;
    }

    if (message.type === "join") {
      if (!rooms.has(message.roomId)) {
        rooms.set(message.roomId, []);
      }

      const clients = rooms.get(message.roomId);
      if (clients === undefined) return;

      if (clients.length >= 2) {
        ws.send(
          JSON.stringify({
            type: "toast",
            message: `Room already filled`,
          }),
        );
        return;
      }

      clients.push(ws);
      ws.send(
        JSON.stringify({
          type: "toast",
          message: `Connected to ${message.roomId}`,
        }),
      );

      clients.forEach((client) => {
        if (client.readyState === 1)
          client.send(
            JSON.stringify({
              type: "user-count",
              count: clients.length,
            }),
          );
      });

      const firstUser = clients[0];
      if (clients.length === 2 && firstUser.readyState === 1) {
        firstUser.send(
          JSON.stringify({
            type: "send-offer",
            message: "Peer joined, you can start the transfer!",
          }),
        );
      }
    }

    if (message.type === "message") {
      const clients = rooms.get(message.roomId);
      if (clients === undefined) return;
      clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          client.send(
            JSON.stringify({
              type: "message",
              message: message.message,
            }),
          );
        }
      });
    }

    if (message.type === "offer") {
      const clients = rooms.get(message.roomId);
      if (clients === undefined) return;

      clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          client.send(
            JSON.stringify({
              type: "offer",
              offer: message.offer,
              roomId: message.roomId,
            }),
          );
        }
      });
    }

    if (message.type === "answer") {
      const clients = rooms.get(message.roomId);
      if (clients === undefined) return;

      clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          client.send(
            JSON.stringify({ type: "answer", answer: message.answer }),
          );
        }
      });
    }

    if (message.type === "candidate") {
      const clients = rooms.get(message.roomId);
      if (clients === undefined) return;

      clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          client.send(
            JSON.stringify({ type: "candidate", candidate: message.candidate }),
          );
        }
      });
    }
  });

  ws.on("close", () => {
    rooms.forEach((client, roomId) => {
      rooms.set(
        roomId,
        client.filter((c) => c !== ws),
      );
      rooms.get(roomId)?.forEach((client) => {
        if (client.readyState === 1)
          client.send(
            JSON.stringify({
              type: "user-count",
              count: rooms.get(roomId)?.length,
            }),
          );
      });
    });
  });
});

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000);
