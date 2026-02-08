import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  Project: defineTable({
    name: v.string(),
  }),

  Node: defineTable({
    projectId: v.id("Project"),
    parentId: v.optional(v.id("Node")),
    name: v.string(),
    content: v.optional(v.string()),
    type: v.union(v.literal("folder"), v.literal("file")),
    path: v.string(),
  })
    .index("by_project", ["projectId"])
    .index("by_parent", ["parentId"])
    .index("by_path", ["projectId", "path"]),
});
