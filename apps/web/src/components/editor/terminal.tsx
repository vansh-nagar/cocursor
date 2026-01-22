"use client";
import React, { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";

const TerminalComponent = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const term = new Terminal({
      cols: 80,
      rows: 18,
      cursorBlink: true,
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 13,
      theme: {
        background: "#0b0b0b",
        foreground: "#e5e7eb",
        cursor: "#ffffff",
      },
    });

    if (terminalRef.current) {
      term.open(terminalRef.current);
    }

    term.writeln("Welcome to the ArcLabs Terminal!");
    term.writeln("");
    term.writeln("$ ");

    return () => {
      term.dispose();
    };
  }, []);

  return (
    <div className="w-full mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex items-end gap-2 px-3 py-2 border-b border-t text-xs ">
        TERMINAL
      </div>

      {/* Terminal */}
      <div ref={terminalRef} className="h-[220px] px-2 py-2" />
    </div>
  );
};

export default TerminalComponent;
