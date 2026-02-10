import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import AiChat from "./ai-chat";
import PeerChat from "./peer-chat";

interface ChatProps {
  onClose: () => void;
}

const Chat: React.FC<ChatProps> = ({ onClose }) => (
  <div className="h-full bg-muted/30 flex flex-col">
    <Tabs defaultValue="ai" className="flex-1 flex flex-col">
      <div className="pr-3 pl-1.5 py-1.5 font-semibold text-sm border-b flex items-center justify-between">
        <TabsList className="w-fit">
          <TabsTrigger value="ai" className="flex-1 text-xs">
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="peer" className="flex-1 text-xs">
            Peer Chat
          </TabsTrigger>
        </TabsList>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="flex-1 flex flex-col h-full p-2">
        <TabsContent value="ai" className="h-full">
          <AiChat />
        </TabsContent>
        <TabsContent value="peer" className="h-full">
          <PeerChat />
        </TabsContent>
      </div>
    </Tabs>
  </div>
);
//sun raha hu
export default Chat;
