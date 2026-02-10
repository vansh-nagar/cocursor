import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUserIfExists = mutation({
  args: {
    name: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const findIfUserExists = await ctx.db
      .query("User")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (findIfUserExists) {
      return findIfUserExists._id;
    }

    const userId = await ctx.db.insert("User", {
      name: args.name,
      clerkId: args.clerkId,
    });

    return userId;
  },
});

export const getMe = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("User")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});
