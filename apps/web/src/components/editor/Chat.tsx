import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import AiChat from "@/components/pages/make-my-portfolio/ai-chat";

interface ChatProps {
  onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ onClose }) => (
  <div className="h-full bg-muted/30 flex flex-col">
    <div className="px-4 py-3 font-semibold text-sm border-b flex items-center justify-between">
      <span>AI Assistant</span>
      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
        <X className="h-3 w-3" />
      </Button>
    </div>
    <div className="flex-1 flex flex-col h-full p-2">
      <AiChat />
    </div>
  </div>
);

export default Chat;
