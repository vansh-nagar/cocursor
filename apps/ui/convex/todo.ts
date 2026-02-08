import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addTodo = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("todo", {
      todos: args.text,
    });
  },
});
