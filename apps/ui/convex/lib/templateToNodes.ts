// Types matching Convex schema
export type NodeInput = {
  name: string;
  content?: string;
  type: "folder" | "file";
  path: string;
};

export type FileTreeNode = {
  directory?: Record<string, FileTreeNode>;
  file?: { contents: string };
};

export type Template = {
  directory: Record<string, FileTreeNode>;
};

/**
 * Converts a project template JSON into an array of Node inputs
 * matching the Convex Node schema (without projectId, which is added at insert time).
 */
export function templateToNodes(template: Template): NodeInput[] {
  const nodes: NodeInput[] = [];

  function walk(tree: Record<string, FileTreeNode>, parentPath: string) {
    for (const [name, value] of Object.entries(tree)) {
      const currentPath = parentPath ? `${parentPath}/${name}` : name;

      // Folder
      if (value.directory) {
        nodes.push({
          name,
          type: "folder",
          path: currentPath,
        });
        // Recurse into folder
        walk(value.directory, currentPath);
      }

      // File
      if (value.file) {
        nodes.push({
          name,
          type: "file",
          path: currentPath,
          content: value.file.contents,
        });
      }
    }
  }

  walk(template.directory, "");

  return nodes;
}

/**
 * Converts a flat array of Nodes back to the nested template JSON structure.
 */
export function nodesToTemplate(
  nodes: {
    name: string;
    type: "folder" | "file";
    path: string;
    content?: string | null;
  }[],
): Template {
  const root: Record<string, FileTreeNode> = {};

  for (const node of nodes) {
    const parts = node.path.split("/").filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        // Final segment - either file or folder
        if (node.type === "file") {
          current[part] = {
            file: { contents: node.content ?? "" },
          };
        } else {
          // Folder - ensure directory exists
          if (!current[part]) {
            current[part] = { directory: {} };
          }
        }
      } else {
        // Intermediate path segment - ensure directory exists
        if (!current[part]) {
          current[part] = { directory: {} };
        }
        current = current[part].directory!;
      }
    }
  }

  return { directory: root };
}
