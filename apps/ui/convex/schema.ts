import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  User: defineTable({
    name: v.string(),
    clerkId: v.string(),
    projects: v.array(v.id("Project")),
  }).index("by_clerkId", ["clerkId"]),

  Project: defineTable({
    name: v.string(),
    clerkId: v.string(),
    nodes: v.array(v.id("Node")),
  }).index("by_clerkId", ["clerkId"]),

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
