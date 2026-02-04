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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const AiChat = () => {
  const [chatPrompt, setChatPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  const loading = status === "streaming" || status === "submitted";

  return (
    <div className="flex flex-col relative h-full">
      <Conversation className="w-full pb-26 mask-b-from-80% ">
        <ConversationContent className="p-2">
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

      <div className="flex flex-col items-end border rounded-md overflow-hidden absolute bottom-0 inset-x-0 z-50 backdrop-blur-xl ">
        <Textarea
          ref={textareaRef}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          value={chatPrompt}
          onChange={(e) => setChatPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          className="resize-none border-0 focus:ring-0 focus-visible:ring-0 outline-none bg-transparent rounded-b-none"
          rows={1}
        />
        <div className=" border-t w-full flex justify-end">
          <Button
            onClick={handlePromptSubmit}
            disabled={!chatPrompt.trim()}
            size="icon"
            className="bg-orange-500 hover:bg-orange-600 text-white shrink-0 m-1"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Send className="size-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AiChat;
