import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get file content by path
export const getContent = query({
  args: {
    projectId: v.id("Project"),
    path: v.string(),
  },
  handler: async (ctx, args) => {
    const node = await ctx.db
      .query("Node")
      .withIndex("by_path", (q) =>
        q.eq("projectId", args.projectId).eq("path", args.path),
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
    const node = await ctx.db
      .query("Node")
      .withIndex("by_path", (q) =>
        q.eq("projectId", args.projectId).eq("path", args.path),
      )
      .unique();

    if (!node) {
      throw new Error(`File not found: ${args.path}`);
    }

    await ctx.db.patch(node._id, { content: args.content });

    return { success: true };
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
    const name = args.path.split("/").pop() || args.path;

    const nodeId = await ctx.db.insert("Node", {
      projectId: args.projectId,
      name,
      type: "file",
      path: args.path,
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
    const name = args.path.split("/").pop() || args.path;

    const nodeId = await ctx.db.insert("Node", {
      projectId: args.projectId,
      name,
      type: "folder",
      path: args.path,
    });

    return { id: nodeId };
  },
});

// Delete a file or folder
export const deleteNode = mutation({
  args: {
    projectId: v.id("Project"),
    path: v.string(),
  },
  handler: async (ctx, args) => {
    // Delete the node and all children (for folders)
    const nodes = await ctx.db
      .query("Node")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const toDelete = nodes.filter(
      (n) => n.path === args.path || n.path.startsWith(`${args.path}/`),
    );

    for (const node of toDelete) {
      await ctx.db.delete(node._id);
    }

    return { deleted: toDelete.length };
  },
});

// Rename a file or folder
export const renameNode = mutation({
  args: {
    projectId: v.id("Project"),
    oldPath: v.string(),
    newPath: v.string(),
  },
  handler: async (ctx, args) => {
    const nodes = await ctx.db
      .query("Node")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Find the node being renamed and all children
    const toRename = nodes.filter(
      (n) => n.path === args.oldPath || n.path.startsWith(`${args.oldPath}/`),
    );

    for (const node of toRename) {
      const newNodePath = node.path.replace(args.oldPath, args.newPath);
      const newName = newNodePath.split("/").pop() || newNodePath;

      await ctx.db.patch(node._id, {
        path: newNodePath,
        name: newName,
      });
    }

    return { renamed: toRename.length };
  },
});
