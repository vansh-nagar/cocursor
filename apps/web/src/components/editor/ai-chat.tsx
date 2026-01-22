import React, { useState } from "react";
import { ResizablePanel } from "@/components/ui/resizable";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";

import { Message, MessageContent } from "@/components/ai-elements/message";
import { DefaultChatTransport } from "ai";
import { Loader2, MessageSquare, Redo, Sparkles, Undo } from "lucide-react";
import {
  PromptInput,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Response } from "@/components/ai-elements/response";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useHistoryStore } from "@/stores/generate-resume/editor-history-store";
import { useProjectData } from "@/stores/generate-resume/project-data-store";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { useUserData } from "@/hooks/generate-reusme/use-user-data.hook";
import z from "zod";
import { MeshGradientSVG } from "@/components/shader-svg";

const InputSchema = z.object({
  chatPrompt: z.string().min(1, "Prompt cannot be empty"),
});

const AiChat = ({ defaultSize }: { defaultSize?: number }) => {
  const [chatPrompt, setChatPrompt] = useState("");

  const {
    htmlContent,
    setHtmlContent,
    urlPermission,
    isOwner,
    setlookUpDivId,
  } = useProjectData();
  const { currentIndex, setIndex, history, addVersion } = useHistoryStore();
  const [updateCallLoading, setUpdateCallLoading] = useState(false);
  const { token, setToken } = useUserData();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { messages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/dummy" }),
  });

  const { data: session, status } = useSession();

  const handlePromptSubmit = () => {
    const parseResult = InputSchema.safeParse({ chatPrompt });

    if (!parseResult.success) {
      return toast.error(parseResult.error.issues[0].message);
    }

    if (!isOwner && urlPermission !== "EDIT") {
      return toast.error("Only the owner can make changes to the resume.");
    }
    if (updateCallLoading) return;
    setUpdateCallLoading(true);
    messages.push({
      id: Date.now().toString(),
      role: "user",
      parts: [{ type: "text", text: chatPrompt }],
    });
    setChatPrompt("");
    setSuggestions([]);
    axios
      .post("/api/v1/generate-html/look-up-calls", {
        htmlContent,
        chatPrompt,
        userEmail: session?.user.email,
      })
      .then((res) => {
        messages.push({
          id: Date.now().toString(),
          role: "assistant",
          parts: [{ type: "text", text: res.data.reply }],
        });
        setHtmlContent(res.data.finalHtml);
        if (res.data.finalHtml !== htmlContent) {
          addVersion(res.data.finalHtml, res.data.divId);
        }
        setlookUpDivId(res.data.divId);
        setSuggestions(res.data.suggestions || []);
        setToken(res.data.token + token);
      })
      .catch((err) => {
        toast.error(err.response?.data?.error);
      })
      .finally(() => {
        setUpdateCallLoading(false);
      });
  };

  return (
    <>
      <Conversation
        className="w-full mask-b-from-90% hide-scrollbar "
        style={{ height: "100%" }}
      >
        <ConversationContent className="p-0">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquare className="size-12" />}
              title="No messages yet"
              description={
                !isOwner && urlPermission !== "EDIT"
                  ? "You do not have permission to edit this resume."
                  : "Start a conversation to refine and improve your resume. I am broke so please be kind :)"
              }
            />
          ) : (
            <>
              {messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    <Response>
                      {message.parts.find((part) => part.type === "text")
                        ?.text || ""}
                    </Response>
                  </MessageContent>
                </Message>
              ))}
              {updateCallLoading && (
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
        onSubmit={(e) => {
          handlePromptSubmit();
        }}
      >
        <PromptInputBody>
          <PromptInputTextarea
            placeholder={
              suggestions.length > 0
                ? suggestions[0]
                : "Make changes to a section and see AI suggestions to improve it here."
            }
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setChatPrompt(e.target.value);
            }}
            value={chatPrompt}
          />
        </PromptInputBody>
        <PromptInputToolbar className=" flex items-center justify-end">
          {updateCallLoading ? (
            <Button size="icon">
              <Loader2 className=" animate-spin" />
            </Button>
          ) : (
            <PromptInputSubmit disabled={false} status={"ready"} />
          )}
        </PromptInputToolbar>
      </PromptInput>
    </>
  );
};

export default AiChat;
