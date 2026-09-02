import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

type Ctx = QueryCtx | MutationCtx;

/**
 * Resolves the signed-in Clerk identity to a User row.
 * Throws if there is no valid session or no matching user.
 */
export async function requireUser(ctx: Ctx): Promise<Doc<"User">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized: not signed in");
  }

  const user = await ctx.db
    .query("User")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("Unauthorized: no user record for this identity");
  }

  return user;
}

/**
 * Resolves the signed-in user and asserts they may access `projectId`.
 * Access means: they own the project, or they are listed as a member.
 *
 * Every query and mutation that takes a projectId must call this — Convex
 * functions are a public HTTP surface, so middleware.ts does not protect them.
 */
export async function requireProjectAccess(
  ctx: Ctx,
  projectId: Id<"Project">,
): Promise<{ user: Doc<"User">; project: Doc<"Project"> }> {
  const user = await requireUser(ctx);

  const project = await ctx.db.get(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  const isOwner = project.ownerId === user._id;
  const isMember = (project.members ?? []).includes(user._id);

  if (!isOwner && !isMember) {
    throw new Error("Forbidden: you do not have access to this project");
  }

  return { user, project };
}

/**
 * Stricter variant for operations only the owner may perform
 * (deleting the project, managing members).
 */
export async function requireProjectOwner(
  ctx: Ctx,
  projectId: Id<"Project">,
): Promise<{ user: Doc<"User">; project: Doc<"Project"> }> {
  const user = await requireUser(ctx);

  const project = await ctx.db.get(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== user._id) {
    throw new Error("Forbidden: only the project owner can do this");
  }

  return { user, project };
}
