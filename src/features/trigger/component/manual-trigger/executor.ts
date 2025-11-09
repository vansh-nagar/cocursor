import type { NodeExecutor } from "@/features/execution/lib/types";

export const manualTriggerExecutor: NodeExecutor = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  // For manual trigger, we can just return the existing context
  const result =  await step.run(`Executing Manual Trigger Node: ${nodeId}`, async () => {
    // You can add logging or other side effects here if needed
    console.log(`Manual Trigger Node ${nodeId} executed with data:`, data);
  });

  return context;
};
