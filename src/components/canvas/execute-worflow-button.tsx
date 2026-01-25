import React from "react";
import { Button } from "../ui/button";
import { FlaskConical } from "lucide-react";
import { useExecuteWorkflow } from "@/hooks/use-workflows";

const ExecuteWorkflowButton = ({ workflowId }: { workflowId: string }) => {
  const executeworkFlow = useExecuteWorkflow();
  const handleExecute = () => {
    executeworkFlow.mutate({ id: workflowId });
  };
  return (
    <Button
      onClick={handleExecute}
      disabled={executeworkFlow.isPending}
      variant={"outline"}
    >
      <FlaskConical /> Execute Workflow
    </Button>
  );
};

export default ExecuteWorkflowButton;
