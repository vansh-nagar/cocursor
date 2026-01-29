"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { useIDEStore } from "@/stores/ideStore";

const BLOCKED_COMMANDS = ["rm -rf /", "rm -rf /*", ":(){ :|:& };:"];

const TerminalComponent: React.FC = () => {
  const { webContainerRef, isContainerBooted } = useIDEStore();
  
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isContainerBooted && webContainerRef.current) {
      setIsReady(true);
      reportOutput("WebContainer ready. Type 'help' for available commands.");
    }
  }, [isContainerBooted, webContainerRef]);

  const scrollToBottom = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, []);

  const reportOutput = useCallback((data: string) => {
    if (terminalRef.current) {
      const lines = data.split("\n");
      for (const line of lines) {
        if (line.trim()) {
          terminalRef.current.textContent += "\n" + line;
        }
      }
      scrollToBottom();
    }
  }, [scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = inputRef.current;
    if (!input) return;

    const command = input.value.trim();
    if (!command) return;

    setCommandHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);

    if (terminalRef.current) {
      terminalRef.current.textContent += `\n> ${command}`;
    }
    
    input.value = "";
    scrollToBottom();

    if (BLOCKED_COMMANDS.some((blocked) => command.includes(blocked))) {
      reportOutput("⚠️ This command is blocked for safety reasons.");
      return;
    }

    const parts = command.split(" ");
    const cmd = parts[0];
    const args = parts.slice(1);

    if (cmd === "cd") {
      reportOutput(`Already in /vanilla-web-app - all commands run from here`);
      return;
    }

    await runCommand(cmd, args);
  };

  const runCommand = async (cmd: string, args: string[]) => {
    switch (cmd) {
      case "clear":
        if (terminalRef.current) {
          terminalRef.current.textContent = "";
        }
        return;

      case "help":
        reportOutput(`
Available commands:
  clear       - Clear the terminal
  help        - Show this help message
  pwd         - Show current directory
  ls [path]   - List files
  npm         - Run npm commands
  node        - Run Node.js
  
Working directory: /vanilla-web-app

Quick start:
  npm install
  npm run dev
        `);
        return;
    }

    if (!webContainerRef.current) {
      reportOutput("Error: WebContainer is not ready. Please wait...");
      return;
    }

    try {
      reportOutput(`$ ${cmd} ${args.join(" ")}`);
      
      const process = await webContainerRef.current.spawn(cmd, args, {
        cwd: "/vanilla-web-app",
      });

      const reader = process.output.getReader();
      const readOutput = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          reportOutput(value);
        }
      };

      await readOutput();

      const exitCode = await process.exit;
      if (exitCode !== 0) {
        reportOutput(`Process exited with code ${exitCode}`);
      }

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      reportOutput(`Error: ${message}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        if (inputRef.current) {
          inputRef.current.value = commandHistory[commandHistory.length - 1 - newIndex] || "";
        }
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        if (inputRef.current) {
          inputRef.current.value = commandHistory[commandHistory.length - 1 - newIndex] || "";
        }
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-t text-xs bg-accent/50">
        <span>TERMINAL</span>
        {!isReady && (
          <span className="text-yellow-500 ml-2">(initializing...)</span>
        )}
        {isReady && (
          <span className="text-green-500 ml-2">(ready)</span>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto bg-black min-h-0"
      >
        <div
          ref={terminalRef}
          className="whitespace-pre-wrap px-2 py-2 text-white text-sm font-mono"
        />
      </div>

      <form onSubmit={handleSubmit} className="w-full border-t border-border">
        <Input
          ref={inputRef}
          className="rounded-none border-none bg-black text-white font-mono focus-visible:ring-0"
          placeholder={isReady ? "Enter command..." : "Waiting for container..."}
          disabled={!isReady}
          onKeyDown={handleKeyDown}
        />
      </form>
    </div>
  );
};

export default TerminalComponent;
