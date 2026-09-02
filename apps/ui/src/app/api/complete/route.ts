import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

// Inline completion must feel instant, so this is deliberately separate from
// the agent: no tools, no streaming, a small context window and a fast model.
export const maxDuration = 15;

const MAX_CONTEXT = 2000;

interface CompleteRequest {
  prefix: string;
  suffix: string;
  filePath: string;
}

export async function POST(req: Request) {
  const { prefix, suffix, filePath }: CompleteRequest = await req.json();

  if (!prefix?.trim()) {
    return Response.json({ completion: "" });
  }

  try {
    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: [
        "You complete code inline, like an editor's autocomplete.",
        "Output ONLY the text that should be inserted at the cursor.",
        "No explanations, no markdown fences, no repetition of the code before the cursor.",
        "Continue the current line, or add at most a few lines.",
        "Match the file's existing style, indentation and language exactly.",
        "If nothing useful can be added, output nothing at all.",
      ].join("\n"),
      prompt: [
        `File: ${filePath}`,
        "",
        "Code before the cursor:",
        prefix.slice(-MAX_CONTEXT),
        "",
        "Code after the cursor:",
        (suffix ?? "").slice(0, MAX_CONTEXT),
        "",
        "Insert at the cursor:",
      ].join("\n"),
      maxOutputTokens: 96,
      temperature: 0.1,
    });

    // Models still occasionally wrap output in a fence despite the instruction.
    const completion = text
      .replace(/^```[a-zA-Z]*\n?/, "")
      .replace(/```$/, "")
      .replace(/\n+$/, "");

    return Response.json({ completion });
  } catch (error) {
    console.error("[complete] error:", error);
    return Response.json({ completion: "" });
  }
}
