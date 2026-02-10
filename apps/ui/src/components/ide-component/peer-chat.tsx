"use client";

import React, { useRef, useState, KeyboardEvent } from "react";
import { MessageSquare, Send } from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "../ai-elements/conversation";
import { Message, MessageContent } from "../ai-elements/message";
import { Response } from "../ai-elements/response";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type PeerMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const PeerChat = () => {
  const [chatPrompt, setChatPrompt] = useState("");
  const [messages, setMessages] = useState<PeerMessage[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePromptSubmit = () => {
    if (!chatPrompt.trim()) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role: "user",
        text: chatPrompt.trim(),
      },
    ]);
    setChatPrompt("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  return (
    <div className="flex flex-col relative h-full">
      <Conversation className="w-full pb-26 mask-b-from-80%">
        <ConversationContent className="p-2">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquare className="size-12" />}
              title="No peer messages"
              description="Invite a peer to start chatting."
            />
          ) : (
            messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  <Response>{message.text}</Response>
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>

      <div className="flex flex-col items-end border rounded-md overflow-hidden absolute bottom-0 inset-x-0 z-50 backdrop-blur-xl">
        <Textarea
          ref={textareaRef}
          placeholder="Message your peer..."
          value={chatPrompt}
          onChange={(e) => setChatPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          className="resize-none border-0 focus:ring-0 focus-visible:ring-0 outline-none bg-transparent rounded-b-none"
          rows={1}
        />
        <div className="border-t w-full flex justify-end">
          <Button
            onClick={handlePromptSubmit}
            disabled={!chatPrompt.trim()}
            size="icon"
            className="bg-orange-500 hover:bg-orange-600 text-white shrink-0 m-1"
          >
            <Send className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PeerChat;
