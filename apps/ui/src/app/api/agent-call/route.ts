import { groq } from "@ai-sdk/groq";
import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  UIMessage,
} from "ai";
import { agentTools } from "@/lib/agent-tools";

export const maxDuration = 60;

interface AgentRequest {
  messages: UIMessage[];
  /** Serialized project tree, sent by the client each turn. */
  projectContext?: {
    projectName?: string;
    root?: string;
    files?: string[];
    activeFilePath?: string | null;
    activeFileContent?: string | null;
    selection?: string | null;
  };
}

function buildSystemPrompt(context: AgentRequest["projectContext"]): string {
  const lines = [
    "You are Cocursor's coding agent, working inside a browser IDE backed by a real Node.js container (WebContainer).",
    "",
    "How to work:",
    "- Orient yourself with listFiles, then readFile before you change anything. Never rewrite a file you have not read.",
    "- writeFile takes the COMPLETE new contents of the file, never a diff or a snippet.",
    "- Prefer the smallest change that satisfies the request. Do not reformat or restructure code you were not asked to touch.",
    "- After making changes, tell the user in one or two sentences what you changed and why. Do not paste whole files back to them.",
    "- If a request is ambiguous in a way that changes what you would build, ask before writing.",
    "- deleteFile and runCommand need the user's approval, so use them only when they are genuinely needed.",
  ];

  if (context?.projectName) {
    lines.push("", `Project: ${context.projectName}`);
  }
  if (context?.root) {
    lines.push(`Project root: ${context.root}`);
  }
  if (context?.files?.length) {
    // Cap the listing so a large project cannot crowd out the conversation.
    const shown = context.files.slice(0, 200);
    lines.push("", "Files:", shown.map((f) => `  ${f}`).join("\n"));
    if (context.files.length > shown.length) {
      lines.push(`  ...and ${context.files.length - shown.length} more (use listFiles)`);
    }
  }
  if (context?.activeFilePath) {
    lines.push("", `The user is currently looking at: ${context.activeFilePath}`);
    if (context.activeFileContent) {
      lines.push(
        "Its current contents:",
        "```",
        context.activeFileContent.slice(0, 20_000),
        "```",
      );
    }
  }
  if (context?.selection) {
    lines.push("", "They have this selected:", "```", context.selection, "```");
  }

  return lines.join("\n");
}

export async function POST(req: Request) {
  const { messages, projectContext }: AgentRequest = await req.json();

  const result = streamText({
    model: groq("openai/gpt-oss-120b"),
    system: buildSystemPrompt(projectContext),
    messages: await convertToModelMessages(messages),
    tools: agentTools,
    // Without this the stream stops after the first tool step and the model
    // never gets a turn to write its reply — the user sees an empty bubble.
    stopWhen: stepCountIs(24),
  });

  return result.toUIMessageStreamResponse();
}
