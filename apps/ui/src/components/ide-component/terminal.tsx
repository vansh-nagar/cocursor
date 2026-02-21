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
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "var(--font-geist-mono), 'Cascadia Code', 'Consolas', monospace",
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

    const fitTerminal = () => {
      // Defensive check for terminal, its element, and its dimensions
      if (!term || !terminalRef.current || !term.element || terminalRef.current.clientWidth === 0) {
        return;
      }
      
      try {
        fitAddon.fit();
      } catch (err) {
        // Log sparingly as this can happen during rapid layout changes
        console.debug("Terminal fit latent:", err);
      }
    };

    term.open(terminalRef.current);
    termRef.current = term;
    fitAddonRef.current = fitAddon;

    // Initial stabilization fit
    const initTimer = setTimeout(fitTerminal, 150);

    // Use ResizeObserver instead of window resize — it only fires when 
    // this element's own dimensions change, and won't fire when collapsed
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(fitTerminal);
    });
    resizeObserver.observe(terminalRef.current);

    term.writeln("\x1b[1;38;5;208mCocursor Term\x1b[0m \x1b[90m(v1.0.0)\x1b[0m");
    term.writeln("\x1b[90mWelcome to the interactive development shell.\x1b[0m\r\n");

    if (isContainerBooted) {
      term.writeln("\x1b[32m✔\x1b[0m Environment ready.");
      term.write("\r\n\x1b[38;5;208m$ \x1b[0m");
    }

    let currentLine = "";
    const disposable = term.onData((data) => {
      if (data.startsWith("\x1B")) return;

      if (data === "\r") {
        term.writeln("");
        handleCommand(currentLine);
        currentLine = "";
      } else if (data === "\u007F") {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write("\b \b");
        }
      } else {
        currentLine += data;
        term.write(data);
      }
    });

    return () => {
      clearTimeout(initTimer);
      resizeObserver.disconnect();
      disposable.dispose();
      term.dispose();
      termRef.current = null;
    };
  }, []);

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
      <div 
        ref={terminalRef} 
        className="flex-1 w-full bg-[#0a0a0a] p-2 [&>.xterm]:h-full [&>.xterm-viewport]:bg-transparent!"
      />
    </div>
  );
};

export default TerminalComponent;
