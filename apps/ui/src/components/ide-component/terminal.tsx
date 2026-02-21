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
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      theme: {
        background: "#0a0a0a",
        foreground: "#d4d4d4",
        cursor: "#f8f8f2",
        selectionBackground: "#3e4451",
        black: "#000000",
        red: "#ff5555",
        green: "#50fa7b",
        yellow: "#f1fa8c",
        blue: "#bd93f9",
        magenta: "#ff79c6",
        cyan: "#8be9fd",
        white: "#bfbfbf",
        brightBlack: "#4d4d4d",
        brightRed: "#ff6e6e",
        brightGreen: "#69ff94",
        brightYellow: "#ffffa5",
        brightBlue: "#d6acff",
        brightMagenta: "#ff92df",
        brightCyan: "#a4ffff",
        brightWhite: "#e6e6e6",
      },
      allowTransparency: true,
      cursorStyle: "bar",
      cursorWidth: 2,
      letterSpacing: 0.5,
      lineHeight: 1.2,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current!);
    fitAddon.fit();
    term.clear();
    term.writeln("\x1b[1;38;5;208mCocursor Terminal\x1b[0m");
    term.writeln("\x1b[90mWelcome to the interactive development shell.\x1b[0m\r\n");

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
        "\x1b[32m✔\x1b[0m WebContainer booted successfully.",
      );
      termRef.current?.write("\r\n\x1b[38;5;208m$ \x1b[0m");
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
    <div className="flex flex-col h-full bg-neutral-950 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 bg-neutral-900/50 shrink-0">
        <div className="size-2.5 rounded-full bg-emerald-500/50" />
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
          Terminal
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="text-[10px] font-mono text-neutral-500">
            {isContainerBooted ? "webcontainer-v1" : "initializing..."}
          </div>
        </div>
      </div>
      <div 
        ref={terminalRef} 
        className="flex-1 w-full bg-[#0a0a0a] p-2 [&>.xterm]:h-full [&>.xterm-viewport]:bg-transparent!"
      />
    </div>
  );
};

export default TerminalComponent;
