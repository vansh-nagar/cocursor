import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import AiChat, { type AiChatProps } from "./ai-chat";
import type { RoomConnection } from "@/hooks/rtc-ws";
import PeerChat from "./peer-chat";

interface ChatProps {
  onClose: () => void;
  projectId?: string;
  roomConnection: RoomConnection;
  /** Forwarded to the agent so it can see and edit the project. */
  buildProjectContext: AiChatProps["buildProjectContext"];
  runTool: AiChatProps["runTool"];
}

const Chat: React.FC<ChatProps> = ({
  onClose,
  projectId,
  roomConnection,
  buildProjectContext,
  runTool,
}) => {
  const { totalUserCount, peerConnected } = roomConnection;
  const [activeTab, setActiveTab] = useState<"ai" | "peer">("ai");

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header with simple Shadcn-style toggle */}
      <div className="py-1.5 border-b flex items-center justify-between px-2 shrink-0">
        <div className="flex bg-muted p-0.5 rounded-md ">
          <Button
            variant={activeTab === "ai" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("ai")}
            className={cn(
              "h-8 px-3 text-xs font-medium gap-2 transition-none shadow-none",
              activeTab === "ai" ? "bg-background shadow-sm" : "",
            )}
          >
            <Sparkles className="size-3.5" />
            AI Chat
          </Button>
          <Button
            variant={activeTab === "peer" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("peer")}
            className={cn(
              "h-8 px-3 text-xs font-medium gap-2 transition-none shadow-none",
              activeTab === "peer" ? "bg-background shadow-sm" : "",
            )}
          >
            <Users className="size-3.5" />
            Peer Chat
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Content area with simple mounting logic (no flashy animations) */}
      <div className="flex-1 overflow-hidden relative">
        <div
          className={cn(
            "absolute inset-0",
            activeTab === "ai"
              ? "visible opacity-100 z-10"
              : "invisible opacity-0 z-0",
          )}
        >
          <div className="h-full">
            <AiChat
              projectId={projectId}
              buildProjectContext={buildProjectContext}
              runTool={runTool}
            />
          </div>
        </div>
        <div
          className={cn(
            "absolute inset-0",
            activeTab === "peer"
              ? "visible opacity-100 z-10"
              : "invisible opacity-0 z-0",
          )}
        >
          <PeerChat projectId={projectId} roomConnection={roomConnection} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
