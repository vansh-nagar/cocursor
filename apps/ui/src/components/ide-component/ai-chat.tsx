"use client";

import React, { useState, useRef, KeyboardEvent, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { Loader2, MessageSquare, Send, Square } from "lucide-react";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "../ai-elements/conversation";
import { Message, MessageContent } from "../ai-elements/message";
import { Response } from "../ai-elements/response";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "../ai-elements/tool";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "../ai-elements/reasoning";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Badge } from "@/components/ui/badge";
import type { AgentToolName } from "@/lib/agent-tools";

export interface AiChatProps {
  projectId?: string;
  /** Context sent with every turn so the model knows what it is working on. */
  buildProjectContext: () => Record<string, unknown>;
  /** Executes one tool call against the live workspace. */
  runTool: (toolName: AgentToolName, input: unknown) => Promise<unknown>;
}

/** "tool-writeFile" -> "writeFile" */
function toolNameOf(partType: string): AgentToolName {
  return partType.replace(/^tool-/, "") as AgentToolName;
}

const AiChat = ({ projectId, buildProjectContext, runTool }: AiChatProps) => {
  const [chatPrompt, setChatPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/agent-call",
        // The model previously received nothing but the message history, so it
        // had no idea what project it was in or which file was open.
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: { ...body, messages, projectContext: buildProjectContext() },
        }),
      }),
    [buildProjectContext],
  );

  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
    addToolResult,
    addToolApprovalResponse,
  } = useChat({
    transport,
    // Tools are declared without `execute` on the server, so the model's calls
    // arrive here and run against the live workspace in this browser tab.
    async onToolCall({ toolCall }) {
      const name = toolNameOf(toolCall.toolName);
      try {
        const output = await runTool(name, toolCall.input);
        addToolResult({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output,
        });
      } catch (err) {
        addToolResult({
          state: "output-error",
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          errorText: err instanceof Error ? err.message : "Tool failed",
        });
      }
    },
    // Without this the turn ends once the client returns its tool results and
    // the model never gets to act on them or reply.
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onError: (err) => {
      console.error("AI Chat error:", err.message);
      toast.error("The assistant hit an error. See the message for details.");
    },
  });

  const loading = status === "streaming" || status === "submitted";

  const handlePromptSubmit = () => {
    if (!chatPrompt.trim()) return;
    if (!projectId) {
      toast.error("Open a project before chatting with the agent.");
      return;
    }
    if (loading) return;

    sendMessage({ role: "user", parts: [{ type: "text", text: chatPrompt }] });
    setChatPrompt("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handlePromptSubmit();
    }
  };

  const respondToApproval = (approvalId: string, approved: boolean) =>
    addToolApprovalResponse({ id: approvalId, approved });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-1 px-3 py-2.5 border-b bg-muted/40 shrink-0">
        <Badge
          variant="outline"
          className="text-[#FA6000] rounded-none border-[#FA6000]/30 bg-[#FA6000]/10 gap-1.5 py-0.5"
        >
          {loading ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <div className="size-1.5 bg-[#FA6000]" />
          )}
          AI Agent
        </Badge>
        <Badge variant="secondary" className="py-0.5 text-xs rounded-none">
          {status === "streaming" ? "Working..." : "Ready"}
        </Badge>
      </div>

      <Conversation className="w-full">
        <ConversationContent className="p-3 gap-3">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquare className="size-12" />}
              title="Ask the agent to build something"
              description="It can read and edit your files and run commands in the container."
            />
          ) : (
            messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    const key = `${message.id}-${i}`;

                    if (part.type === "text") {
                      return <Response key={key}>{part.text}</Response>;
                    }

                    if (part.type === "reasoning") {
                      return (
                        <Reasoning
                          key={key}
                          isStreaming={status === "streaming"}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    }

                    // Every tool call the model makes. These used to be mapped
                    // to "" and rendered as nothing, so a working agent still
                    // showed an empty bubble.
                    if (part.type.startsWith("tool-")) {
                      const tool = part as typeof part & {
                        type: `tool-${string}`;
                        toolCallId: string;
                        state:
                          | "input-streaming"
                          | "input-available"
                          | "approval-requested"
                          | "approval-responded"
                          | "output-available"
                          | "output-error"
                          | "output-denied";
                        input?: unknown;
                        output?: unknown;
                        errorText?: string;
                        approval?: { id: string };
                      };

                      const awaitingApproval =
                        tool.state === "approval-requested" && tool.approval;

                      return (
                        <Tool
                          key={key}
                          defaultOpen={
                            tool.state === "output-error" ||
                            tool.state === "approval-requested"
                          }
                        >
                          <ToolHeader type={tool.type} state={tool.state} />
                          <ToolContent>
                            <ToolInput input={tool.input} />
                            <ToolOutput
                              output={tool.output}
                              errorText={tool.errorText}
                            />
                            {awaitingApproval && (
                              <div className="flex items-center gap-2 border-t p-3">
                                <p className="text-xs text-muted-foreground flex-1">
                                  The agent wants to run this.
                                </p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    respondToApproval(tool.approval!.id, false)
                                  }
                                >
                                  Decline
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-[#FA6000] hover:bg-[#E55800] text-white"
                                  onClick={() =>
                                    respondToApproval(tool.approval!.id, true)
                                  }
                                >
                                  Allow
                                </Button>
                              </div>
                            )}
                          </ToolContent>
                        </Tool>
                      );
                    }

                    return null;
                  })}
                </MessageContent>
              </Message>
            ))
          )}

          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              {error.message || "Something went wrong."}
            </div>
          )}
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>

      <div className="shrink-0 p-3 bg-background border-t">
        <ButtonGroup className="flex-1 w-full">
          <Input
            ref={inputRef}
            placeholder={
              projectId ? "Ask the agent to build something..." : "Open a project first"
            }
            value={chatPrompt}
            onChange={(e) => setChatPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!projectId}
            className="flex-1 h-10 border w-full px-3 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#FA6000]/30"
          />
          <Button
            onClick={loading ? stop : handlePromptSubmit}
            disabled={!loading && (!chatPrompt.trim() || !projectId)}
            size="icon"
            className="h-10 w-10 shrink-0 bg-[#FA6000] hover:bg-[#E55800] text-white shadow-sm"
            title={loading ? "Stop" : "Send"}
          >
            {loading ? (
              <Square className="size-3.5 fill-current" />
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
