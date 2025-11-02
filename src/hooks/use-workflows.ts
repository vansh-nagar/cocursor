import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useWorkflows = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.Workflows.getMany.queryOptions());
};

export const useCreateWorkflow = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.Workflows.create.mutationOptions({
      onSuccess: (data) => {
        toast(`Workflow ${data.name} created`);
        router.push(`/workflows/${data.id}`);
        queryClient.invalidateQueries(trpc.Workflows.getMany.queryOptions());
      },
      onError: (error) => {
        toast(`Failed to create workflow`);
      },
    })
  );
};
