import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  File,
  X,
  BotMessageSquare,
  Folders,
  TerminalIcon,
  Eye,
  Code,
  RotateCcw,
  Github,
} from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";

interface TabInfo {
  id: string;
  name: string;
  path: string;
  isDirty: boolean;
  content: string;
}

interface NavBarProps {
  openTabs: TabInfo[];
  currentTabId: string | null;
  setCurrentTabId: (id: string) => void;
  handleCloseTab: (id: string) => void;
  showAiChat: boolean;
  setShowAiChat: (v: (prev: boolean) => boolean) => void;
  showExplorer: boolean;
  setShowExplorer: (v: (prev: boolean) => boolean) => void;
  showTerminal: boolean;
  setShowTerminal: (v: (prev: boolean) => boolean) => void;
  activeTab: "code" | "preview";
  setActiveTab: (tab: "code" | "preview") => void;
  handleSaveCurrentFile: () => void;
  liveUrl: string | null;
}

const NavBar: React.FC<NavBarProps> = ({
  openTabs,
  currentTabId,
  setCurrentTabId,
  handleCloseTab,
  showAiChat,
  setShowAiChat,
  showExplorer,
  setShowExplorer,
  showTerminal,
  setShowTerminal,
  activeTab,
  setActiveTab,
  handleSaveCurrentFile,
  liveUrl,
}) => (
  <div className="flex items-center justify-between pr-2 bg-muted/30 h-[49px] border-b">
    <div className="flex items-center overflow-x-auto flex-1 h-full hide-scrollbar mask-r-from-98%">
      {openTabs.length === 0
        ? ""
        : openTabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-3 h-full text-sm cursor-pointer transition-colors  ${
                currentTabId === tab.id
                  ? "bg-background border-primary"
                  : "bg-transparent border-transparent hover:bg-accent"
              }`}
              onClick={() => setCurrentTabId(tab.id)}
            >
              <File size={16} />
              <span className="truncate max-w-[150px]">
                {tab.name}
                {tab.isDirty && " •"}
              </span>
              <X
                size={16}
                className="hover:text-accent-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseTab(tab.id);
                }}
              />
            </div>
          ))}
    </div>
    <div className="flex items-center gap-2 ml-2 h-full">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={showExplorer ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 flex-shrink-0 border"
            onClick={() => setShowExplorer((prev) => !prev)}
          >
            <Folders className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle Explorer (Ctrl+Shift+E)</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={showTerminal ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 flex-shrink-0 border"
            onClick={() => setShowTerminal((prev) => !prev)}
          >
            <TerminalIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle Terminal (Ctrl + `)</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={showAiChat ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 border"
            onClick={() => setShowAiChat((prev) => !prev)}
          >
            <BotMessageSquare className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle AI Assistant (Ctrl+Shift+A)</p>
        </TooltipContent>
      </Tooltip>
      <ButtonGroup className="border rounded-md overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("preview")}
          className={`h-8 px-3 text-xs rounded-none ${
            activeTab === "preview" ? "bg-accent" : ""
          }`}
        >
          <Eye className="h-3 w-3 mr-1" />
          Preview
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActiveTab("code")}
          className={`h-8 px-3 text-xs rounded-none ${
            activeTab === "code" ? "bg-accent" : ""
          }`}
        >
          <Code className="h-3 w-3 mr-1" />
          Code
        </Button>
      </ButtonGroup>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (liveUrl) {
                window.location.reload();
              }
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reload Preview</p>
        </TooltipContent>
      </Tooltip>{" "}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" className="h-8">
            Export to github
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Refresh</p>
        </TooltipContent>
      </Tooltip>
    </div>
  </div>
);

export default NavBar;
