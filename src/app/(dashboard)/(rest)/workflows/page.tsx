export const dynamic = "force-dynamic";

import { Spinner } from "@/components/ui/spinner";
import { WorkFlows } from "@/features/workflows/component/workflows";
import { prefetchWorkflows } from "@/features/workflows/servers/prefetch";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = async () => {
  // prefetchWorkflows({ cursor: null, limit: 10 });

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense
          fallback={
            <div className=" flex justify-center items-center h-full w-full">
              <Spinner />
            </div>
          }
        >
          <WorkFlows />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default Page;
