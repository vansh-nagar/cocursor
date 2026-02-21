import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import AiChat from "./ai-chat";
import PeerChat from "./peer-chat";

interface ChatProps {
  onClose: () => void;
  projectId?: string;
  roomConnection: any;
}

const Chat: React.FC<ChatProps> = ({ onClose, projectId, roomConnection }) => {
  const { totalUserCount, peerConnected } = roomConnection;
  const [activeTab, setActiveTab] = useState<"ai" | "peer">("peer");

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header with simple Shadcn-style toggle */}
      <div className="h-12 border-b flex items-center justify-between px-3 shrink-0">
        <div className="flex bg-muted p-0.5 rounded-md">
          <Button
            variant={activeTab === "ai" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("ai")}
            className={cn(
              "h-7 px-3 text-xs font-medium gap-2 transition-none shadow-none",
              activeTab === "ai" ? "bg-background shadow-sm" : ""
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
              "h-7 px-3 text-xs font-medium gap-2 transition-none shadow-none",
              activeTab === "peer" ? "bg-background shadow-sm" : ""
            )}
          >
            <Users className="size-3.5" />
            Peer Chat
            {totalUserCount > 1 && (
              <span className="flex size-1.5 ml-0.5 rounded-full bg-emerald-500" />
            )}
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
            activeTab === "ai" ? "visible opacity-100 z-10" : "invisible opacity-0 z-0"
          )}
        >
          <div className="h-full">
            <AiChat />
          </div>
        </div>
        <div
          className={cn(
            "absolute inset-0",
            activeTab === "peer" ? "visible opacity-100 z-10" : "invisible opacity-0 z-0"
          )}
        >
          <PeerChat projectId={projectId} roomConnection={roomConnection} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
