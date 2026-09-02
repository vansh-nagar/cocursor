import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireProjectAccess } from "./lib/auth";

/**
 * Normalizes any incoming path to the stored form: exactly one leading slash,
 * no trailing slash. The UI uses both "/a/b" and "a/b" in different places.
 */
function normalizePath(path: string): string {
  const trimmed = path.trim().replace(/^\/+/, "").replace(/\/+$/, "");
  if (!trimmed) {
    throw new Error("Invalid path: empty");
  }
  if (trimmed.split("/").some((seg) => seg === "." || seg === "..")) {
    throw new Error(`Invalid path: ${path}`);
  }
  return `/${trimmed}`;
}

/** True when `child` is `parent` itself or sits underneath it. */
function isSelfOrDescendant(child: string, parent: string): boolean {
  return child === parent || child.startsWith(`${parent}/`);
}

// Get file content by path
export const getContent = query({
  args: {
    projectId: v.id("Project"),
    path: v.string(),
  },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.projectId);

    const node = await ctx.db
      .query("Node")
      .withIndex("by_path", (q) =>
        q.eq("projectId", args.projectId).eq("path", normalizePath(args.path)),
      )
      .unique();

    return node?.content ?? null;
  },
});

// Update file content
export const updateContent = mutation({
  args: {
    projectId: v.id("Project"),
    path: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.projectId);
    const path = normalizePath(args.path);

    const node = await ctx.db
      .query("Node")
      .withIndex("by_path", (q) =>
        q.eq("projectId", args.projectId).eq("path", path),
      )
      .unique();

    // Create-or-update: agent tools and external writes hit paths that may not
    // have a Node row yet, and throwing there loses the write.
    if (!node) {
      await ctx.db.insert("Node", {
        projectId: args.projectId,
        name: path.split("/").pop() ?? path,
        type: "file",
        path,
        content: args.content,
      });
      return { success: true, created: true };
    }

    if (node.type !== "file") {
      throw new Error(`Not a file: ${path}`);
    }

    await ctx.db.patch(node._id, { content: args.content });

    return { success: true, created: false };
  },
});

// Create a new file
export const createFile = mutation({
  args: {
    projectId: v.id("Project"),
    path: v.string(),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.projectId);
    const path = normalizePath(args.path);

    const existing = await ctx.db
      .query("Node")
      .withIndex("by_path", (q) =>
        q.eq("projectId", args.projectId).eq("path", path),
      )
      .unique();

    if (existing) {
      throw new Error(`A file or folder already exists at ${path}`);
    }

    const nodeId = await ctx.db.insert("Node", {
      projectId: args.projectId,
      name: path.split("/").pop() ?? path,
      type: "file",
      path,
      content: args.content ?? "",
    });

    return { id: nodeId };
  },
});

// Create a new folder
export const createFolder = mutation({
  args: {
    projectId: v.id("Project"),
    path: v.string(),
  },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.projectId);
    const path = normalizePath(args.path);

    const existing = await ctx.db
      .query("Node")
      .withIndex("by_path", (q) =>
        q.eq("projectId", args.projectId).eq("path", path),
      )
      .unique();

    if (existing) {
      throw new Error(`A file or folder already exists at ${path}`);
    }

    const nodeId = await ctx.db.insert("Node", {
      projectId: args.projectId,
      name: path.split("/").pop() ?? path,
      type: "folder",
      path,
    });

    return { id: nodeId };
  },
});

// Delete a file or folder (and, for folders, everything under it)
export const deleteNode = mutation({
  args: {
    projectId: v.id("Project"),
    path: v.string(),
  },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.projectId);
    const path = normalizePath(args.path);

    const nodes = await ctx.db
      .query("Node")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Boundary-aware: deleting "/src/app" must not match "/src/application.ts".
    const toDelete = nodes.filter((n) => isSelfOrDescendant(n.path, path));

    for (const node of toDelete) {
      await ctx.db.delete(node._id);
    }

    return { deleted: toDelete.length };
  },
});

// Rename or move a file or folder, together with all its descendants
export const renameNode = mutation({
  args: {
    projectId: v.id("Project"),
    oldPath: v.string(),
    newPath: v.string(),
  },
  handler: async (ctx, args) => {
    await requireProjectAccess(ctx, args.projectId);
    const oldPath = normalizePath(args.oldPath);
    const newPath = normalizePath(args.newPath);

    if (oldPath === newPath) {
      return { renamed: 0 };
    }

    if (isSelfOrDescendant(newPath, oldPath)) {
      throw new Error("Cannot move a folder inside itself");
    }

    const nodes = await ctx.db
      .query("Node")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const toRename = nodes.filter((n) => isSelfOrDescendant(n.path, oldPath));

    if (toRename.length === 0) {
      throw new Error(`Nothing found at ${oldPath}`);
    }

    // Refuse to clobber anything already sitting at the destination.
    const collision = nodes.find(
      (n) =>
        isSelfOrDescendant(n.path, newPath) &&
        !isSelfOrDescendant(n.path, oldPath),
    );
    if (collision) {
      throw new Error(`A file or folder already exists at ${newPath}`);
    }

    for (const node of toRename) {
      // Anchored prefix replacement. String.replace would rewrite the first
      // match anywhere in the path, corrupting e.g. "/x/a/y" when renaming "/a".
      const newNodePath = newPath + node.path.slice(oldPath.length);

      await ctx.db.patch(node._id, {
        path: newNodePath,
        name: newNodePath.split("/").pop() ?? newNodePath,
      });
    }

    return { renamed: toRename.length };
  },
});
