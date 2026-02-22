import React, { useState, useRef, KeyboardEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { Loader2, MessageSquare, Send } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "../ai-elements/conversation";
import { Message, MessageContent } from "../ai-elements/message";
import { Response } from "../ai-elements/response";
import { DefaultChatTransport } from "ai";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Badge } from "@/components/ui/badge";

const AiChat = () => {
  const [chatPrompt, setChatPrompt] = useState("");
  const textareaRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/agent-call",
    }),
    onError: (err) => {
      toast.error("Something went wrong");
      console.log("AI Chat Error:", err.message);
    },
  });

  const handlePromptSubmit = async () => {
    if (!chatPrompt.trim()) {
      toast.error("Prompt cannot be empty");
      return;
    }
    if (loading) {
      toast.info("You can't send a message while a response is coming.");
      return;
    }
    sendMessage({ role: "user", parts: [{ type: "text", text: chatPrompt }] });
    setChatPrompt("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  const loading = status === "streaming" || status === "submitted";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-2.5 border-b bg-muted/40 shrink-0">
        <Badge variant="outline" className="text-[#FA6000] border-[#FA6000]/30 bg-[#FA6000]/10 gap-1.5 py-0.5">
          {loading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <div className="size-1.5 rounded-full bg-[#FA6000]" />
          )}
          AI Assistant
        </Badge>
        <Badge variant="secondary" className="py-0.5 text-[10px]">
          {status === "streaming" ? "Typing..." : "Ready"}
        </Badge>
      </div>

      <Conversation className="w-full pb-26 mask-b-from-80% ">
        <ConversationContent className="p-3 gap-3">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquare className="size-12" />}
              title="No messages yet"
              description="Start chatting with the AI."
            />
          ) : (
            <>
              {messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    <Response>
                      {message.parts
                        .map((part) => (part.type === "text" ? part.text : ""))
                        .join("")}
                    </Response>
                  </MessageContent>
                </Message>
              ))}
 
              {loading && (
                <div className="flex justify-start p-2">
                  <Skeleton className="h-10 w-40" />
                </div>
              )}
            </>
          )}
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>

      <div className="shrink-0 p-3 bg-background border-t">
        <ButtonGroup className="flex-1">
          <Input
            ref={textareaRef}
            placeholder="Type your message..."
            value={chatPrompt}
            onChange={(e) => setChatPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-10 border px-3 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#FA6000]/30"
          />
          <Button
            onClick={handlePromptSubmit}
            disabled={!chatPrompt.trim() || loading}
            size="icon"
            className="h-10 w-10 shrink-0 bg-[#FA6000] hover:bg-[#E55800] text-white shadow-sm"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};

export default AiChat;
