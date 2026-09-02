"use client";

import { useCallback } from "react";
import { useIDEStore } from "@/stores/ideStore";
import { toDbPath, toUiPath, projectRootOf } from "@/lib/project-paths";
import type { FileSystemTree } from "@webcontainer/api";
import type { AgentToolName } from "@/lib/agent-tools";

/**
 * Executes the agent's tool calls against the live workspace.
 *
 * Everything runs in the browser: WebContainer has no server-side existence,
 * and routing writes through the explorer's handlers is what keeps the
 * container, Convex and the open editor tabs in agreement.
 */

export interface ExplorerActions {
  getFileContent: (path: string) => string;
  handleCreateFile: (path: string, content?: string) => Promise<void>;
  handleDeleteNode: (path: string) => Promise<void>;
  handleRenameNode: (oldPath: string, newPath: string) => Promise<void>;
}

/** Flattens a WebContainer tree to a sorted list of file and folder paths. */
function listTree(tree: FileSystemTree, base = ""): string[] {
  const out: string[] = [];
  for (const [name, node] of Object.entries(tree)) {
    const path = base ? `${base}/${name}` : name;
    if ("directory" in node) {
      out.push(`${path}/`);
      out.push(...listTree(node.directory, path));
    } else {
      out.push(path);
    }
  }
  return out.sort();
}

export function useAgentToolRunner({
  projectId,
  explorer,
  persistFile,
  runCommand,
  onFileWritten,
}: {
  projectId?: string;
  explorer: ExplorerActions;
  persistFile: (uiPath: string, content: string) => Promise<void>;
  runCommand: (
    command: string,
    args: string[],
  ) => Promise<{ exit: Promise<number> }>;
  onFileWritten?: (uiPath: string, content: string) => void;
}) {
  return useCallback(
    async (toolName: AgentToolName, input: unknown): Promise<unknown> => {
      if (!projectId) {
        throw new Error("No project is open.");
      }

      const store = useIDEStore.getState();
      const tree = store.fileStructure;
      const root = toUiPath(projectRootOf(tree));

      /**
       * The model is told about project-relative paths, but the store and DB
       * are rooted at the project folder. Accept either form.
       */
      const resolve = (p: string): string => {
        const ui = toUiPath(p);
        if (!root) return ui;
        return ui === root || ui.startsWith(`${root}/`) ? ui : `${root}/${ui}`;
      };

      const relative = (uiPath: string): string =>
        root && uiPath.startsWith(`${root}/`)
          ? uiPath.slice(root.length + 1)
          : uiPath;

      switch (toolName) {
        case "listFiles": {
          const { path } = input as { path?: string };
          const all = listTree(tree).map(relative);
          if (!path) return { files: all };

          const prefix = toUiPath(relative(resolve(path)));
          return {
            files: all.filter((f) => f === prefix || f.startsWith(`${prefix}/`)),
          };
        }

        case "readFile": {
          const { path } = input as { path: string };
          const uiPath = resolve(path);
          const content = explorer.getFileContent(uiPath);
          if (content === undefined || content === null) {
            throw new Error(`File not found: ${path}`);
          }
          return { path: relative(uiPath), content };
        }

        case "writeFile": {
          const { path, content } = input as { path: string; content: string };
          const uiPath = resolve(path);

          // Existing file: persistFile updates Convex, the container and the
          // in-memory tree. New file: create it so the explorer picks it up.
          const exists = Boolean(explorer.getFileContent(uiPath));
          if (exists) {
            await persistFile(uiPath, content);
          } else {
            await explorer.handleCreateFile(toDbPath(uiPath), content);
          }

          onFileWritten?.(uiPath, content);
          return { path: relative(uiPath), bytesWritten: content.length };
        }

        case "deleteFile": {
          const { path } = input as { path: string };
          const uiPath = resolve(path);
          await explorer.handleDeleteNode(toDbPath(uiPath));
          return { path: relative(uiPath), deleted: true };
        }

        case "renameFile": {
          const { oldPath, newPath } = input as {
            oldPath: string;
            newPath: string;
          };
          const from = resolve(oldPath);
          const to = resolve(newPath);
          await explorer.handleRenameNode(from, to);
          return { from: relative(from), to: relative(to) };
        }

        case "runCommand": {
          const { command, args } = input as {
            command: string;
            args?: string[];
          };
          const process = await runCommand(command, args ?? []);
          const exitCode = await process.exit;
          return {
            command: [command, ...(args ?? [])].join(" "),
            exitCode,
            note:
              exitCode === 0
                ? "Command finished. Output was streamed to the user's terminal."
                : `Command failed with exit code ${exitCode}. Output is in the user's terminal.`,
          };
        }

        default: {
          throw new Error(`Unknown tool: ${toolName}`);
        }
      }
    },
    [projectId, explorer, persistFile, runCommand, onFileWritten],
  );
}
