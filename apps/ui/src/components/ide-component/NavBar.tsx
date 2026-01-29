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
  Eye,
  Code,
  Monitor,
  Tablet,
  Smartphone,
} from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { motion } from "motion/react";

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
  setShowAiChat: (v: boolean | ((prev: boolean) => boolean)) => void;
  showExplorer: boolean;
  setShowExplorer: (v: boolean | ((prev: boolean) => boolean)) => void;
  showTerminal: boolean;
  setShowTerminal: (v: boolean | ((prev: boolean) => boolean)) => void;
  handleSaveCurrentFile: () => void;
  liveUrl: string | null;
  activeTab?: "code" | "preview";
  setActiveTab?: (tab: "code" | "preview") => void;
  previewDevice?: "desktop" | "tablet" | "mobile";
  setPreviewDevice?: (device: "desktop" | "tablet" | "mobile") => void;
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
  handleSaveCurrentFile,
  liveUrl,
  activeTab = "code",
  setActiveTab = () => {},
  previewDevice = "desktop",
  setPreviewDevice = () => {},
}) => {
  const devices = [
    { id: "desktop", icon: Monitor, label: "Desktop" },
    { id: "tablet", icon: Tablet, label: "Tablet" },
    { id: "mobile", icon: Smartphone, label: "Mobile" },
  ] as const;

  return (
    <div className="flex items-center justify-between pr-2 bg-muted/30 h-[49px] border-b">
      <div className="flex items-center overflow-x-auto flex-1 h-full hide-scrollbar">
        {openTabs.length === 0
          ? ""
          : openTabs.map((tab) => (
              <div
                key={tab.id}
                className={`flex items-center gap-2 px-3 h-full text-sm cursor-pointer transition-colors ${
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

        {activeTab === "preview" && (
          <div className="flex items-center border rounded-md overflow-hidden h-8">
            {devices.map((device) => {
              const Icon = device.icon;
              const isActive = previewDevice === device.id;
              return (
                <Tooltip key={device.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setPreviewDevice(device.id)}
                      className={`relative px-2 h-full transition-colors flex items-center justify-center ${
                        isActive ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50"
                      }`}
                    >
                      <Icon className="h-4 w-4 relative z-10" />
                      {isActive && (
                        <motion.div
                          layoutId="activeDevicePill"
                          className="absolute inset-0 bg-accent z-0"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{device.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" className="h-8">
              Export To Github
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default NavBar;
