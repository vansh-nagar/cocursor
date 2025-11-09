import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { topologicalSort } from "@/utils/topo-sort";
import { NodeType } from "@prisma/client";
import { getExecutor } from "@/features/execution/lib/executer-registry";

export const executeWorkflow = inngest.createFunction(
  { id: "execute-workflow" },
  { event: "workflows/execute.workflow" },
  async ({ event, step }) => {
    const workFlowId = event.data.id;
    if (!workFlowId) {
      throw new NonRetriableError("No workflow ID provided");
    }

    const sortedNodes = await step.run("Fetch Workflow Nodes", async () => {
      // Fetch nodes from the database
      const workflow = await prisma?.workflows.findUnique({
        where: { id: workFlowId },
        include: { nodes: true, edge: true },
      });

      return topologicalSort(workflow?.nodes || [], workflow?.edge || []);
    });

    let context = event.data.initalData || {};

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type as NodeType);
      context = await executor({
        data: node.data as Record<string, unknown>,
        nodeId: node.id,
        context,
        step,
      });
    }

    return { workFlowId, context };
  }
);
