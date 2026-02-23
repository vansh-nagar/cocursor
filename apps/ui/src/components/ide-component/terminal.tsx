"use client";

import React, { useEffect, useRef, useState } from "react";
import { useIDEStore } from "@/stores/ideStore";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { Terminal as TerminalIcon, X, Maximize2, Trash2, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";

const TerminalComponent: React.FC = () => {
  const {
    webContainerRef,
    isContainerBooted,
  } = useIDEStore();

  const terminalRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const shellProcessRef = useRef<any>(null);
  const inputWriterRef = useRef<any>(null);

  // Suggestions state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const startShell = async (terminal: Terminal) => {
    if (!webContainerRef.current) return;

    try {
      // Start an interactive shell in the project directory
      const shellProcess = await webContainerRef.current.spawn("jsh", {
        terminal: {
          cols: terminal.cols,
          rows: terminal.rows,
        },
        cwd: "/vanilla-web-app", // Start in the web app directory
      });

      shellProcessRef.current = shellProcess;

      shellProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            terminal.write(data);
            terminal.scrollToBottom();
          },
        })
      );

      const input = shellProcess.input.getWriter();
      inputWriterRef.current = input;

      terminal.onData((data) => {
        // Handle basic command line tracking for suggestions
        if (data === "\r") {
          setCurrentLine("");
          setShowSuggestions(false);
        } else if (data === "\u007f") { // Backspace
          setCurrentLine((prev) => prev.slice(0, -1));
        } else {
          setCurrentLine((prev) => prev + data);
        }
        
        input.write(data);
      });

      return shellProcess;
    } catch (error) {
      console.error("Failed to start shell:", error);
      terminal.writeln("\r\n\x1b[31mFailed to start interactive shell.\x1b[0m");
    }
  };

  // Directory suggestion logic
  useEffect(() => {
    const updateSuggestions = async () => {
      if (!webContainerRef.current || !currentLine.includes("cd ")) return;

      const parts = currentLine.split(" ");
      const lastPart = parts[parts.length - 1];
      const cmd = parts[0];

      if (cmd === "cd") {
        try {
          // We assume we are in the project dir or use absolute-ish paths
          // For simplicity, we list the current dir contents
          const entries = await webContainerRef.current.fs.readdir("/vanilla-web-app", { withFileTypes: true });
          const dirs = entries
            .filter((e: any) => e.isDirectory())
            .map((e: any) => e.name)
            .filter((name: string) => name.startsWith(lastPart));
          
          if (dirs.length > 0) {
            setSuggestions(dirs);
            setShowSuggestions(true);
            setSelectedIndex(0);
          } else {
            setShowSuggestions(false);
          }
        } catch (e) {
          setShowSuggestions(false);
        }
      } else {
        setShowSuggestions(false);
      }
    };

    const timer = setTimeout(updateSuggestions, 50);
    return () => clearTimeout(timer);
  }, [currentLine, webContainerRef]);

  const handleSuggestionClick = (dir: string) => {
    if (!inputWriterRef.current) return;
    
    // Clear the current partial path and write the directory
    const parts = currentLine.split(" ");
    const lastPart = parts[parts.length - 1];
    
    // Send backspaces for the partial name
    const bss = "\b".repeat(lastPart.length);
    inputWriterRef.current.write(bss + dir + "/");
    
    setShowSuggestions(false);
    termRef.current?.focus();
  };

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "var(--font-geist-mono), 'Cascadia Code', 'Consolas', monospace",
      theme: {
        background: "#0a0a0a",
        foreground: "#d4d4d4",
        cursor: "#d4d4d4",
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
      allowTransparency: false,
      cursorStyle: "block",
      cursorWidth: 2,
      letterSpacing: 0,
      lineHeight: 1.2,
      scrollback: 5000,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    const fitTerminal = () => {
      if (!term || !terminalRef.current || !term.element || terminalRef.current.clientWidth === 0) {
        return;
      }
      try {
        fitAddon.fit();
        if (shellProcessRef.current) {
          shellProcessRef.current.resize({
            cols: term.cols,
            rows: term.rows,
          });
        }
      } catch (err) {
        console.debug("Terminal fit latent:", err);
      }
    };

    term.open(terminalRef.current);
    termRef.current = term;
    fitAddonRef.current = fitAddon;

    const initTimer = setTimeout(fitTerminal, 150);

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(fitTerminal);
    });
    resizeObserver.observe(terminalRef.current);

    if (isContainerBooted) {
      startShell(term);
    }

    return () => {
      clearTimeout(initTimer);
      resizeObserver.disconnect();
      if (shellProcessRef.current) {
        shellProcessRef.current.kill();
      }
      term.dispose();
      termRef.current = null;
    };
  }, [isContainerBooted]);

  const clearTerminal = () => {
    termRef.current?.clear();
    termRef.current?.scrollToTop();
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-t border-white/5 overflow-hidden group/term relative rounded-none">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#0d0d0d] border-b border-white/5 select-none shrink-0 rounded-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-white/5 border border-white/10">
            <TerminalIcon className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Terminal</span>
          </div>
          <div className="h-4 w-[1px] bg-white/10 mx-1" />
          <span className="text-[11px] text-neutral-500 font-medium italic">node — jsh</span>
        </div>
        
        <div className="flex items-center gap-1 opacity-60 group-hover/term:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-neutral-400 rounded-none"
            onClick={clearTerminal}
            title="Clear Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-neutral-400 rounded-none"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-none text-neutral-400"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Suggestion Overlay */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-12 left-6 z-50 bg-[#161616] border border-white/10 rounded-none shadow-2xl p-1 min-w-[200px]"
          >
            <div className="px-2 py-1 text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-b border-white/5 mb-1 flex items-center gap-2">
              <Folder size={10} className="text-neutral-400" />
              Suggestions
            </div>
            {suggestions.map((dir, i) => (
              <button
                key={dir}
                onClick={() => handleSuggestionClick(dir)}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-none flex items-center gap-2 transition-colors ${
                  i === selectedIndex ? "bg-white/10 text-white" : "text-neutral-300 hover:bg-white/5"
                }`}
              >
                <Folder size={12} className={i === selectedIndex ? "text-white" : "text-neutral-500"} />
                {dir}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terminal Content */}
      <div className="flex-1 w-full bg-[#0a0a0a] relative overflow-hidden rounded-none">
        <div 
          ref={terminalRef} 
          className="w-full h-full p-2 xterm-container rounded-none"
        />
      </div>
      
      <style jsx global>{`
        .xterm-container .xterm-viewport {
          background-color: transparent !important;
          overflow-y: auto !important;
        }
        .xterm-container .xterm-screen {
          padding-bottom: 20px;
        }
      `}</style>
    </div>
  );
};

export default TerminalComponent;

