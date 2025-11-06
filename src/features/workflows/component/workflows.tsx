"use client";
import {
  EntityContainer,
  EntityHeader,
} from "@/components/mine/entity-components";
import { useCreateWorkflow, useGetWorkflows } from "@/hooks/use-workflows";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  EllipsisVertical,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { SiNotion, SiOpenai, SiSlack } from "react-icons/si";
import { useState } from "react";

dayjs.extend(relativeTime);

export const WorkFlows = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data } = useGetWorkflows({ page, pageSize: 4, search });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1); // Reset to page 1 when searching
  };

  return (
    <div>
      <WorkFlowsContainer>
        <div className="  flex gap-2 justify-end">
          <ButtonGroup className=" mb-5">
            <Input
              onChange={(e) => {
                setSearchInput(e.target.value);
              }}
              value={searchInput}
              placeholder="Search workflows..."
            />
            <Button size={"icon"} onClick={handleSearch}>
              <Search />
            </Button>
          </ButtonGroup>
        </div>

        <div className="flex flex-col gap-2 min-h-[60vh]">
          {data.items.map((workflow) => (
            <Link key={workflow.id} href={`workflows/${workflow.id}`}>
              <div className="border rounded-xl p-4 flex justify-between items-center shadow">
                <div>
                  <div className="flex gap-2">
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
                  <div className="text-muted-foreground text-xs">
                    Created {dayjs(workflow.createdAt).fromNow()}
                  </div>
                </div>
                <EllipsisVertical />
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4 border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Page {page} of {data.totalPages} ({data.totalCount} total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!data.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!data.haveNextPage}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
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
    <EntityContainer header={<WorkflowsHeader />}>{children}</EntityContainer>
  );
};
