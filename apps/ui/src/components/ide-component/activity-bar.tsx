"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { File, Search, Terminal, BotMessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SidebarProps = {
  showExplorer: boolean;
  setShowExplorer: React.Dispatch<React.SetStateAction<boolean>>;
  showTerminal: boolean;
  setShowTerminal: React.Dispatch<React.SetStateAction<boolean>>;
  showAiChat: boolean;
  setShowAiChat: React.Dispatch<React.SetStateAction<boolean>>;
};

const ActivityBar = ({
  showExplorer,
  setShowExplorer,
  showTerminal,
  setShowTerminal,
  showAiChat,
  setShowAiChat,
}: SidebarProps) => {
  return (
    <div className="bg-accent p-2 z-50 flex flex-col justify-between">
      <div className="flex flex-col gap-2">
        <Link href="/" className=" flex justify-center items-center my-1 mt-2">
          <svg
            width="25"
            height="25"
            viewBox="0 0 87 91"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M47.1643 21.4431L1.51616 34.7167C0.385676 35.0454 0.305338 36.6102 1.39625 37.0521L21.7132 45.2821C22.083 45.4319 22.358 45.7495 22.4525 46.1357L28.1896 69.5876C28.4777 70.7653 30.1174 70.8716 30.5564 69.741L48.6718 23.0781C49.0431 22.1215 48.1526 21.1557 47.1643 21.4431Z"
              fill="#FA6000"
              stroke="#FA6000"
              strokeWidth="1.14286"
            />
            <path
              d="M39.811 69.2416L85.4341 55.8831C86.564 55.5523 86.6415 53.9874 85.5497 53.5476L65.2175 45.3554C64.8473 45.2063 64.5717 44.8891 64.4765 44.5029L58.6954 21.0619C58.4051 19.8847 56.7653 19.7815 56.3284 20.9129L38.3004 67.6093C37.9309 68.5666 38.8231 69.5308 39.811 69.2416Z"
              fill="#FA6000"
              stroke="#FA6000"
              strokeWidth="1.14286"
            />
          </svg>
        </Link>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showExplorer ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setShowExplorer((prev) => !prev)}
              className={`cursor-pointer ${showExplorer ? "[&_svg]:text-[#FA6000]" : ""}`}
            >
              <File />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Explorer (Ctrl+B)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <Search />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Search</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showTerminal ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setShowTerminal((prev) => !prev)}
              className={`cursor-pointer ${showTerminal ? "[&_svg]:text-[#FA6000]" : ""}`}
            >
              <Terminal />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Terminal (Ctrl+`)</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showAiChat ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setShowAiChat((prev) => !prev)}
              className={`cursor-pointer ${showAiChat ? "[&_svg]:text-[#FA6000]" : ""}`}
            >
              <BotMessageSquare />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">AI Chat (Ctrl+Shift+A)</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-col gap-2">
        <div className=" flex justify-center items-center">
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-12 h-12",
                  userButtonTrigger: "w-12 h-12",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </div>
  );
};

export default ActivityBar;
