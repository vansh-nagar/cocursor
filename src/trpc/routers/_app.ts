import { workFlowsRouter } from "@/features/workflows/servers/router";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  Workflows: workFlowsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
