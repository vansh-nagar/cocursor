import React, { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { Loader2, MessageSquare } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "../ai-elements/conversation";
import { Message, MessageContent } from "../ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
} from "../ai-elements/prompt-input";
import { PromptInputToolbar } from "../ai-elements/prompt-input copy";
import { Response } from "../ai-elements/response";
import { DefaultChatTransport } from "ai";
import { Separator } from "../ui/separator";

const AiChat = () => {
  const [chatPrompt, setChatPrompt] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai-call",
    }),
    onError: (err) => {
      toast.error("Something went wrong");
      console.log("AI Chat Error:", err.message);
    },
  });

  const handlePromptSubmit = async () => {
    if (!chatPrompt.trim()) {
      return toast.error("Prompt cannot be empty");
    }

    sendMessage({ role: "user", parts: [{ type: "text", text: chatPrompt }] });
    setChatPrompt("");
  };

  const loading = status === "streaming" || status === "submitted";

  return (
    <>
      <Conversation className="w-full h-full hide-scrollbar">
        <ConversationContent className="p-0">
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
      <PromptInput
        onSubmit={(_message, event) => {
          event.preventDefault();
          handlePromptSubmit();
        }}
      >
        <PromptInputBody className="">
          <PromptInputTextarea
            className=" "
            placeholder="Type your message..."
            value={chatPrompt}
            onChange={(e) => setChatPrompt(e.target.value)}
          />
        </PromptInputBody>

        <PromptInputToolbar className="flex justify-end">
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <PromptInputSubmit status="ready" />
          )}
        </PromptInputToolbar>
      </PromptInput>
    </>
  );
};

export default AiChat;
