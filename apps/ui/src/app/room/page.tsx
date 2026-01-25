"use client";
import Editor from "@/components/mine/editor";
import { Button } from "@/components/ui/button";
import { useIDEStore } from "@/stores/ideStore";
// import { wsRtcConnectionHook } from "@/hooks/rtc-ws";
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";

const page = () => {
  const { editorRef, editorView } = useIDEStore();
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

  const sendFileContent = () => {
    if (ws.current === null) return;
    const Eview = useIDEStore.getState().editorView;

    if (!Eview) {
      toast.error("Editor view is not ready");
      return;
    }

    const fileContent = Eview.state.doc.toString();

    console.log("Sending file content:", fileContent);

    ws.current.send(
      JSON.stringify({
        type: "FileContent",
        FileContent: fileContent,
        roomId: "example-room-id",
      }),
    );
  };

  return (
    <div>
      <Button
        onClick={() => {
          setInterval(() => {
            sendFileContent();
          }, 100);
        }}
      >
        Send File
      </Button>
      <Editor ws={ws.current} />
    </div>
  );
};

export default page;
