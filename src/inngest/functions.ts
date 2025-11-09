import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import { topologicalSort } from "@/utils/topo-sort";

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

    return { sortedNodes };
  }
);
