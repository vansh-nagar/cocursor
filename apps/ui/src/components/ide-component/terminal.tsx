"use client";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { WebContainer } from "@webcontainer/api";
import { projectFiles } from "@/data/project-file";
import { useIDEStore } from "@/stores/ideStore";

const TerminalComponent = () => {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const { webContainerRef } = useIDEStore();
  const { setLiveUrl } = useIDEStore();

  useEffect(() => {
    bootWebContainer();
  }, []);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  };

  const bootWebContainer = async () => {
    reportOutput("Booting WebContainer...");
    webContainerRef.current = await WebContainer.boot();
    reportOutput("WebContainer booted successfully.");

    await webContainerRef.current.mount(projectFiles);
    reportOutput("Project files mounted successfully.");

    webContainerRef.current.on("server-ready", (port: number, url: string) => {
      setLiveUrl(url);
    });
  };

  const reportOutput = (data: string) => {
    if (terminalRef.current) {
      terminalRef.current.textContent += "\n" + "$ " + data;
      scrollToBottom();
    }
  };

  ///////////////////////////////////////////////////////////////
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements[0] as HTMLInputElement;
    console.log("Command entered:", input.value);

    if (webContainerRef.current) {
      const cmd = input.value.split(" ")[0];
      const args = input.value.split(" ").slice(1);
      // Clear the input after
      runCommand({ cmd, args });
    }

    if (terminalRef.current)
      terminalRef.current.textContent += "\n" + input.value;
    scrollToBottom();
    input.value = "";
  };

  const runCommand = async ({ cmd, args }: { cmd: string; args: string[] }) => {
    if (cmd === "clear") {
      if (terminalRef.current) terminalRef.current.textContent = "";
      return;
    }
    if (cmd === "help") {
      const helpText = `
Available commands:
- clear: Clear the terminal
- help: Show this help message
- ls: List files in the current directory
- pwd: Show current directory
- echo [text]: Print text to the terminal
      `;
      reportOutput(helpText);

      return;
    }
    if ("pwd" === cmd) {
      if (webContainerRef.current) {
        const pwdProcess = webContainerRef.current.spawn("pwd", [], {
          cwd: "/vanilla-web-app",
        });

        if (!pwdProcess) return;
        const reader = (await pwdProcess).output.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          reportOutput(value);
        }
      }
      return;
    }
    if ("ls" === cmd) {
      if (webContainerRef.current) {
        const lsProcess = webContainerRef.current.spawn("ls", ["-la"], {
          cwd: "/vanilla-web-app",
        });
        if (!lsProcess) return;
        const reader = (await lsProcess).output.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          reportOutput(value);
        }
      }
      return;
    }

    const outputProcess = webContainerRef.current?.spawn(cmd, args, {
      cwd: "/vanilla-web-app",
    });

    if (!outputProcess) return;
    const reader = (await outputProcess).output.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      reportOutput(value);
    }
  };

  return (
    <div className="w-full mx-auto overflow-hidden">
      {/* Header */}
      <div className=" flex items-end gap-2 px-3 py-2 border-b border-t text-xs ">
        TERMINAL
      </div>

      {/* Terminal */}
      <form onSubmit={handleSubmit} className="w-full">
        <Input
          className=" rounded-none border-none"
          placeholder="Enter your command"
        />
      </form>
      <div
        ref={scrollContainerRef}
        className="
    min-h-[220px]
    max-h-[220px]
    overflow-y-auto
    bg-black
  "
      >
        <div
          ref={terminalRef}
          className="whitespace-pre-wrap px-2 py-2 text-white flex-col-reverse"
        />
      </div>
    </div>
  );
};

export default TerminalComponent;
