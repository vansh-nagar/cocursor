import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Ensures a User row exists for the *signed-in* identity.
 *
 * clerkId is taken from ctx.auth, never from arguments — accepting it as a
 * client argument let any caller create or claim a row for another person's
 * Clerk id.
 */
export const createUserIfExists = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: not signed in");
    }

    const clerkId = identity.subject;

    const existing = await ctx.db
      .query("User")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existing) {
      // Keep the display name fresh if it changed in Clerk.
      const name = args.name?.trim() || identity.name || existing.name;
      if (name !== existing.name) {
        await ctx.db.patch(existing._id, { name });
      }
      return existing._id;
    }

    return await ctx.db.insert("User", {
      name: args.name?.trim() || identity.name || "Unknown",
      clerkId,
    });
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
