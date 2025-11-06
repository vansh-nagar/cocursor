import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type Input = inferInput<typeof trpc.Workflows.getPaginated>;

// prefetching all data in server

export const prefetchWorkflows = (params: Input) => {
  return prefetch(trpc.Workflows.getPaginated.queryOptions({ ...params }));
};
