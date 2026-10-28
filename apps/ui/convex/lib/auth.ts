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
 * Asserts the caller is signed in and `projectId` exists.
 *
 * The room link is the share mechanism: anyone signed in who has it may read
 * and edit the project. It used to require owner-or-member, but nothing ever
 * added members, so every shared link crashed the IDE for the second person.
 * Owner-only operations use requireProjectOwner below.
 *
 * Every query and mutation that takes a projectId must call this — Convex
 * functions are a public HTTP surface, so middleware.ts does not protect them.
 * It checks the identity rather than the User row, because someone who opens a
 * shared link directly has never visited /main, which is what creates the row.
 */
export async function requireProjectAccess(
  ctx: Ctx,
  projectId: Id<"Project">,
): Promise<{ project: Doc<"Project"> }> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized: not signed in");
  }

  const project = await ctx.db.get(projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  return { project };
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
