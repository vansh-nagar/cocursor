import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type Input = inferInput<typeof trpc.Workflows.getMany>;

// prefetching all data in server

export const prefetchWorkflows = () => {
  return prefetch(trpc.Workflows.getMany.queryOptions({}));
};
