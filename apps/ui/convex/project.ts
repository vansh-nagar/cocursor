import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all projects
export const list = query({
  args: {},
  handler: async (ctx) => {
    const projects = await ctx.db.query("Project").order("desc").collect();

    // Get file counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const files = await ctx.db
          .query("Node")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .filter((q) => q.eq(q.field("type"), "file"))
          .collect();

        return {
          ...project,
          _count: { files: files.length },
        };
      }),
    );

    return projectsWithCounts;
  },
});

// Get a single project by ID
export const get = query({
  args: { id: v.id("Project") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) return null;

    const files = await ctx.db
      .query("Node")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .filter((q) => q.eq(q.field("type"), "file"))
      .collect();

    return {
      ...project,
      files: files.map((f) => ({
        id: f._id,
        path: f.path,
        updatedAt: f._creationTime,
      })),
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
  },
  handler: async (ctx, args) => {
    const projectId = await ctx.db.insert("Project", {
      name: args.name,
    });

    // Create initial files if provided
    if (args.initialFiles) {
      for (const file of args.initialFiles) {
        await ctx.db.insert("Node", {
          projectId,
          name: file.path.split("/").pop() || file.path,
          type: "file",
          path: file.path,
          content: file.content,
        });
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
