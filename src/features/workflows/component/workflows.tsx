"use client";
import {
  EntityContainer,
  EntityHeader,
} from "@/components/mine/entity-components";
import { useCreateWorkflow, useWorkflows } from "@/hooks/use-workflows";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { EllipsisVertical } from "lucide-react";

dayjs.extend(relativeTime);

export const WorkFlows = () => {
  const workflows = useWorkflows();

  return (
    <div>
      <WorkFlowsContainer>
        <div className=" flex flex-col gap-2">
          {workflows.data.map((workflow) => (
            <Link key={workflow.id} href={`workflows/${workflow.id}`}>
              <div className=" border rounded-xl  p-4 flex justify-between items-center">
                <div className=" leading-4">
                  <span>{workflow.name}</span> <br />
                  <span className=" text-muted-foreground text-xs">
                    {dayjs(workflow.createdAt).fromNow()}
                  </span>
                </div>
                <EllipsisVertical />
              </div>
            </Link>
          ))}{" "}
        </div>
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
