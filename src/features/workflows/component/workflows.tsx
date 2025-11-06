"use client";
import {
  EntityContainer,
  EntityHeader,
} from "@/components/mine/entity-components";
import { useCreateWorkflow, useWorkflows } from "@/hooks/use-workflows";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { EllipsisVertical, Search } from "lucide-react";
import { SiNotion, SiOpenai, SiSlack } from "react-icons/si";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useEffect } from "react";
import { trpc } from "@/trpc/server";

dayjs.extend(relativeTime);

export const WorkFlows = () => {
  return (
    <div>
      <WorkFlowsContainer>
        <div className="  flex justify-end">
          <ButtonGroup className=" mb-5">
            <Input placeholder="Search workflows..." />
            <Button size={"icon"}>
              <Search />
            </Button>
          </ButtonGroup>
        </div>
        {/* <div className=" flex flex-col gap-2 h-[100vh]">
          {items.map((workflow) => (
            <Link key={workflow.id} href={`workflows/${workflow.id}`}>
              <div className=" border rounded-xl  p-4 flex justify-between items-center shadow">
                <div>
                  <div className=" flex gap-2">
                    <SiNotion
                      className="text-slate-700 dark:text-slate-200"
                      size={24}
                    />
                    <SiSlack
                      className="text-slate-700 dark:text-slate-200"
                      size={24}
                    />
                    <SiOpenai
                      className="text-slate-700 dark:text-slate-200"
                      size={24}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {workflow.name}
                  </div>
                  <div className=" text-muted-foreground text-xs">
                    Created {dayjs(workflow.createdAt).fromNow()}
                  </div>
                </div>
                <EllipsisVertical />
              </div>
            </Link>
          ))}{" "}
        </div> */}
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
