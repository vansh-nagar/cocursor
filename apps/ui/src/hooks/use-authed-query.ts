"use client";

import { useConvexAuth, useQuery } from "convex/react";
import type {
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
} from "convex/server";

/**
 * useQuery, held until Convex actually has the Clerk token.
 *
 * ConvexProviderWithClerk fetches that token after mount, so for the first
 * moment of every load the Convex client is unauthenticated. Queries guarded by
 * requireUser / requireProjectAccess throw "Unauthorized: not signed in" during
 * that window and blow up as a runtime error -- even though the user is signed
 * in, since middleware.ts already redirected them if they weren't.
 *
 * The quieter version of the same race: project.list returns [] rather than
 * throwing, so callers briefly read "this user has no projects" as fact.
 *
 * Returns undefined until the token lands, which is the value useQuery already
 * uses for "still loading", so call sites need no extra state.
 */
export function useAuthedQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: FunctionArgs<Query> | "skip",
): FunctionReturnType<Query> | undefined {
  const { isAuthenticated } = useConvexAuth();
  return useQuery(query, isAuthenticated ? args : "skip");
}
