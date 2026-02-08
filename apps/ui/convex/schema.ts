import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  todo: defineTable({
    todos: v.string(),
  }),
});
