import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { templateToNodes, nodesToTemplate } from "./lib/templateToNodes";
import { requireProjectAccess, requireProjectOwner, requireUser } from "./lib/auth";
import { projectFiles } from "../src/data/project-file";
import { PROJECT_LIMIT } from "../src/lib/constants";

// List the signed-in user's projects, newest first
export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("User")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    return await ctx.db
      .query("Project")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .collect();
  },
});

// Get a single project plus its file tree
export const get = query({
  args: { id: v.id("Project") },
  handler: async (ctx, args) => {
    const { project } = await requireProjectAccess(ctx, args.id);

    const nodes = await ctx.db
      .query("Node")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    return {
      ...project,
      fileTree: nodesToTemplate(nodes),
    };
  },
});

// Create a new project, seeded from a template or from supplied files
export const create = mutation({
  args: {
    name: v.string(),
    initialFiles: v.optional(
      v.array(v.object({ path: v.string(), content: v.string() })),
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const name = args.name.trim();
    if (!name) {
      throw new Error("Project name cannot be empty");
    }

    // Server-side limit. The UI also checks, but Convex functions are a public
    // HTTP surface — a client-only check is not a limit.
    const existing = await ctx.db
      .query("Project")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    if (existing.length >= PROJECT_LIMIT) {
      throw new Error(
        `Project limit reached (${PROJECT_LIMIT}). Delete a project to create another.`,
      );
    }

    const projectId = await ctx.db.insert("Project", {
      name,
      ownerId: user._id,
      members: [],
    });

    const seedNodes =
      args.initialFiles && args.initialFiles.length > 0
        ? args.initialFiles.map((file) => ({
            name: file.path.split("/").pop() || file.path,
            type: "file" as const,
            path: file.path.startsWith("/") ? file.path : `/${file.path}`,
            content: file.content,
          }))
        : templateToNodes(projectFiles);

    for (const node of seedNodes) {
      await ctx.db.insert("Node", {
        projectId,
        name: node.name,
        type: node.type,
        path: node.path,
        content: node.content,
      });
    }

    const project = await ctx.db.get(projectId);
    const files = await ctx.db
      .query("Node")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    return { ...project, files };
  },
});

// Delete a project and all its files. Owner only.
export const remove = mutation({
  args: { id: v.id("Project") },
  handler: async (ctx, args) => {
    await requireProjectOwner(ctx, args.id);

    const nodes = await ctx.db
      .query("Node")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    for (const node of nodes) {
      await ctx.db.delete(node._id);
    }

    await ctx.db.delete(args.id);

    return { success: true };
  },
});
