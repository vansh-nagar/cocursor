import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

// Backs the Ctrl+I inline prompt: rewrite a selection (or insert at the
// cursor) and return only the replacement text, ready to diff.
export const maxDuration = 30;

interface InlineEditRequest {
  instruction: string;
  selection: string;
  prefix: string;
  suffix: string;
  filePath: string;
}

export async function POST(req: Request) {
  const {
    instruction,
    selection,
    prefix,
    suffix,
    filePath,
  }: InlineEditRequest = await req.json();

  if (!instruction?.trim()) {
    return Response.json({ error: "No instruction given" }, { status: 400 });
  }

  try {
    const { text } = await generateText({
      model: groq("openai/gpt-oss-120b"),
      system: [
        "You edit code in place inside an editor.",
        "Output ONLY the replacement code. No explanation, no markdown fences.",
        selection
          ? "Rewrite the SELECTED code to satisfy the instruction. Preserve surrounding indentation."
          : "Produce code to insert at the cursor.",
        "Match the file's existing style and language exactly.",
      ].join("\n"),
      prompt: [
        `File: ${filePath}`,
        "",
        "Instruction:",
        instruction,
        "",
        "Code before:",
        prefix.slice(-3000),
        "",
        selection ? "Selected code to rewrite:" : "(nothing selected)",
        selection,
        "",
        "Code after:",
        suffix.slice(0, 3000),
      ].join("\n"),
      maxOutputTokens: 1500,
      temperature: 0.2,
    });

    const result = text
      .replace(/^```[a-zA-Z]*\n?/, "")
      .replace(/```\s*$/, "");

    return Response.json({ result });
  } catch (error) {
    console.error("[inline-edit] error:", error);
    return Response.json({ error: "Edit failed" }, { status: 500 });
  }
}
