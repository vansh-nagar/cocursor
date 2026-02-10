import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  templateToNodes,
  nodesToTemplate,
  Template,
} from "./lib/templateToNodes";
import { projectFiles } from "../src/data/project-file";

// Get all projects
export const list = query({
  handler: async (ctx, _) => {
    const identity = await ctx.auth.getUserIdentity();
    const user = await ctx.db
      .query("User")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity?.subject ?? ""))
      .unique();

    if (!identity || !user) return [];

    const projects = await ctx.db
      .query("Project")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    return projects;
  },
});

// Get a single project by ID
export const get = query({
  args: { id: v.id("Project") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) return null;

    const nodes = await ctx.db
      .query("Node")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    const fileTree = nodesToTemplate(nodes);

    return {
      ...project,
      fileTree: {
        "vanilla-web-app": fileTree,
      },
    };
  },
});

// Create a new project
export const create = mutation({
  args: {
    name: v.string(),
    initialFiles: v.optional(
      v.array(v.object({ path: v.string(), content: v.string() })),
    ),
    templateKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const user = await ctx.db
      .query("User")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity?.subject ?? ""))
      .unique();

    if (!identity || !user)
      throw new Error(
        "Unauthorized: User must be logged in to create a project",
      );

    const projectId = await ctx.db.insert("Project", {
      name: args.name,
      ownerId: user?._id,
    });

    // Create initial files if provided, otherwise seed from template
    if (args.initialFiles && args.initialFiles.length > 0) {
      for (const file of args.initialFiles) {
        await ctx.db.insert("Node", {
          projectId,
          name: file.path.split("/").pop() || file.path,
          type: "file",
          path: file.path,
          content: file.content,
        });
      }
    } else {
      const templateKey = args.templateKey ?? "vanilla-web-app";
      const template = projectFiles[templateKey as keyof typeof projectFiles];
      if (template) {
        const nodes = templateToNodes(template as unknown as Template);

        for (const node of nodes) {
          await ctx.db.insert("Node", {
            projectId,
            name: node.name,
            type: node.type,
            path: node.path,
            content: node.content,
          });
        }
      }
    }

    const project = await ctx.db.get(projectId);
    const files = await ctx.db
      .query("Node")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    return {
      ...project,
      files,
    };
  },
});

// Delete a project and all its files
export const remove = mutation({
  args: { id: v.id("Project") },
  handler: async (ctx, args) => {
    // Delete all nodes (files/folders) for this project
    const nodes = await ctx.db
      .query("Node")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    for (const node of nodes) {
      await ctx.db.delete(node._id);
    }

    // Delete the project
    await ctx.db.delete(args.id);

    return { success: true };
  },
});
