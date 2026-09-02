import { z } from "zod";

/**
 * Tool contract shared by the server (which declares the tools to the model)
 * and the client (which executes them).
 *
 * Tools are declared server-side WITHOUT an `execute` function. Under AI SDK
 * v6 that makes them client-side tools: the model's call is streamed to the
 * browser, `useChat`'s onToolCall runs it, and the result goes back via
 * addToolResult. This is the only arrangement that can run terminal commands,
 * because WebContainer only exists in the browser — and it means file writes
 * go through the same path the explorer uses, so WebContainer, Convex and the
 * open editor tabs cannot drift apart.
 */

export const listFilesSchema = z.object({
  path: z
    .string()
    .optional()
    .describe("Directory to list, relative to the project root. Omit for the whole tree."),
});

export const readFileSchema = z.object({
  path: z.string().describe("File path, e.g. 'src/index.js' or '/src/index.js'."),
});

export const writeFileSchema = z.object({
  path: z.string().describe("File to write. Created if it does not exist."),
  content: z.string().describe("Full new contents of the file."),
});

export const deleteFileSchema = z.object({
  path: z.string().describe("File or folder to delete. Folders delete recursively."),
});

export const renameFileSchema = z.object({
  oldPath: z.string().describe("Current path."),
  newPath: z.string().describe("New path."),
});

export const runCommandSchema = z.object({
  command: z.string().describe("Executable, e.g. 'npm'."),
  args: z.array(z.string()).default([]).describe("Arguments, e.g. ['install','react']."),
});

/** Tools the model may call. No `execute` — see the note above. */
export const agentTools = {
  listFiles: {
    description:
      "List the project's files and folders. Use this first to orient yourself before reading or writing.",
    inputSchema: listFilesSchema,
  },
  readFile: {
    description:
      "Read a file's full contents. Always read a file before rewriting it, so you preserve what should not change.",
    inputSchema: readFileSchema,
  },
  writeFile: {
    description:
      "Create or overwrite a file with the given contents. Pass the complete file, not a diff or a fragment.",
    inputSchema: writeFileSchema,
  },
  deleteFile: {
    description:
      "Delete a file or folder. Destructive — the user is asked to approve it.",
    inputSchema: deleteFileSchema,
    // Puts the call in "approval-requested" until the user responds.
    needsApproval: true,
  },
  renameFile: {
    description: "Rename or move a file or folder.",
    inputSchema: renameFileSchema,
  },
  runCommand: {
    description:
      "Run a shell command in the project's dev container, e.g. npm install. Output streams to the user's terminal. The user is asked to approve it.",
    inputSchema: runCommandSchema,
    needsApproval: true,
  },
} as const;

export type AgentToolName = keyof typeof agentTools;

