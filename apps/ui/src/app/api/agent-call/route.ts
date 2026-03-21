import { inngest } from "@/inngest/client";
import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, streamText, UIMessage } from "ai";
import z from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: groq("openai/gpt-oss-120b"),
    system:
      "You are a helpful ai agent that calls inngest functions based on user requests. to change there code base after calling the function give a correct reply don't left it empty ",
    messages: await convertToModelMessages(messages),
    tools: {
      "call-inngest": {
        description: "Call an inngest function",
        inputSchema: z.object({}),
        execute: (input) => {
          inngest.send({
            name: "change-code-base",
          });
        },
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
