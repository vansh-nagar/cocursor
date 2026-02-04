import { groq } from "@ai-sdk/groq";
import { convertToModelMessages, streamText, UIMessage } from "ai";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: Request) {
 try {
     const { messages }: { messages: UIMessage[] } = await req.json();
   
     const result = streamText({
       model: groq("openai/gpt-oss-120b"),
       system: "You are a helpful assistant.",
       messages: await convertToModelMessages(messages),
     });
   
     return result.toUIMessageStreamResponse();
 } catch (error : unknown) {
    console.log(error)
    return NextResponse.json({ error: "Failed to stream AI response" }, { status: 500 });
 }
}
