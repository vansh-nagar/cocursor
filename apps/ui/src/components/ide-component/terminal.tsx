"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useIDEStore } from "@/stores/ideStore";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebContainer } from "@webcontainer/api";

const TerminalComponent: React.FC = () => {
  const {
    webContainerRef,
    isContainerBooted,
  }: {
    webContainerRef: React.MutableRefObject<WebContainer | null>;
    isContainerBooted: boolean;
  } = useIDEStore();

  const terminalRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current!);
    fitAddon.fit();
    term.clear();
    term.writeln("Welcome to the Cocursor terminal !\r\n");

    termRef.current = term;
    fitAddonRef.current = fitAddon;

    let currentLine = "";

    term.onData((data) => {
      const char = data;
      if (char.startsWith("\x1B")) return;

      // Enter key
      if (char === "\r") {
        term.writeln(""); // move to new line
        handleCommand(currentLine);
        currentLine = "";
      }
      // Backspace
      else if (char === "\u007F") {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write("\b \b"); // erase character visually
        }
      }
      // Normal characters
      else {
        currentLine += char;
        term.write(char);
      }
    });

    return () => {
      term.dispose();
    };
  }, []);

  useEffect(() => {
    if (isContainerBooted) {
      termRef.current?.writeln(
        "Web Container is booted! You can start typing commands.",
      );
    }
  }, [isContainerBooted]);

  const handleCommand = async (currentLine: string) => {
    if (!webContainerRef.current) return;
    const splitArr = currentLine.split(" ");
    const cmd = splitArr[0];
    const args = splitArr.slice(1);

    console.log("Executing command:", cmd, "with args:", args);

    const process = await webContainerRef.current.spawn(cmd, args, {
      cwd: "/vanilla-web-app",
    });

    try {
      const reader = process.output.getReader();
      console.log(process);

      const readOutput = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          termRef.current?.write(value);
          termRef.current?.scrollToBottom();
        }
      };

      await readOutput();
    } catch (error) {
      console.log("Error reading process output:", error);
    }
  };

  return (
    <div
      ref={terminalRef}
      style={{ width: "100%", height: "100%", minHeight: "300px" }}
    ></div>
  );
};

export default TerminalComponent;
