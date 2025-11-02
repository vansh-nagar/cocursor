"use client";
import {
  EntityContainer,
  EntityHeader,
} from "@/components/mine/entity-components";
import { useCreateWorkflow, useWorkflows } from "@/hooks/use-workflows";

export const WorkFlows = () => {
  const workflows = useWorkflows();

  return (
    <div>
      <WorkFlowsContainer>
        {JSON.stringify(workflows.data, null, 2)}
      </WorkFlowsContainer>
    </div>
  );
};

export const WorkflowsHeader = () => {
  const { mutate, isPending } = useCreateWorkflow();

  return (
    <>
      <EntityHeader
        title="Workflows"
        description="Create or manage your workflows"
        newButtonLabel="New Workflow"
        disabled={false}
        isCreating={isPending}
        onNew={() => mutate()}
      />
    </>
  );
};

export const WorkFlowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<></>}
      pagination={<></>}
    >
      {children}
    </EntityContainer>
  );
};
