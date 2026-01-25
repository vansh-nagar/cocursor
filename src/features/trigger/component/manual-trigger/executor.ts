import type { NodeExecutor } from "@/features/execution/lib/types";
import { manualTriggerChannel } from "@/inngest/chanels/manual-trigger";

export const manualTriggerExecutor: NodeExecutor = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(manualTriggerChannel().status({ nodeId, status: "loading" }));
  // For manual trigger, we can just return the existing context
  const result = await step.run(
    `Executing Manual Trigger Node: ${nodeId}`,
    async () => {
      // You can add logging or other side effects here if needed
      console.log(`Manual Trigger Node ${nodeId} executed with data:`, data);
    }
  );

  await publish(manualTriggerChannel().status({ nodeId, status: "success" }));

  return context;
};
