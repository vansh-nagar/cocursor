"use client";
import Editor from "@/components/mine/editor";
import { useIDEStore } from "@/stores/ideStore";
import { StateEffect } from "@codemirror/state";
import { useEffect, useRef } from "react";

const page = () => {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080");

    ws.current.onopen = () => {
      console.log("WebSocket connection opened");

      ws.current?.send(
        JSON.stringify({
          type: "join",
          roomId: "example-room-id",
        }),
      );
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received message:", message.FileContent);

      const Eview = useIDEStore.getState().editorView;
      if (Eview) {
        Eview.dispatch({
          changes: {
            from: 0,
            to: Eview.state.doc.length,
            insert: message.FileContent,
          },
        });
      }
    };
  }, []);

  const sendFileContent = ({ content }: { content: string }) => {
    if (ws.current === null) return;

    ws.current.send(
      JSON.stringify({
        type: "FileContent",
        FileContent: content,
        roomId: "example-room-id",
      }),
    );
  };

  return (
    <div>
      <Editor ws={ws.current} sendFileContent={sendFileContent} />
    </div>
  );
};

export default page;

// cursorEffects.ts

export const setRemoteCursor = StateEffect.define<{
  clientId: string;
  pos: number;
  name?: string;
}>();
