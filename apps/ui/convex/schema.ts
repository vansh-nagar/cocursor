import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  User: defineTable({
    name: v.string(),
    clerkId: v.string(),
  }).index("by_clerkId", ["clerkId"]),

  Project: defineTable({
    name: v.string(),
    ownerId: v.id("User"), // ✅ link to user
  }).index("by_owner", ["ownerId"]),

  Node: defineTable({
    projectId: v.id("Project"),
    name: v.string(),
    content: v.optional(v.string()),
    type: v.union(v.literal("folder"), v.literal("file")),
    path: v.string(),
  })
    .index("by_project", ["projectId"])
    .index("by_path", ["projectId", "path"]),
});
