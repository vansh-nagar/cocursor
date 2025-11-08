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
  WorkflowIcon,
  PackageOpen,
} from "lucide-react";
import Link from "next/link";
import { SiNotion, SiOpenai, SiSlack } from "react-icons/si";
import { useState } from "react";

dayjs.extend(relativeTime);

export const WorkFlows = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data } = useGetWorkflows({ page, pageSize: 6, search });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1); // Reset to page 1 when searching
  };

  const createWorkflowMutation = useCreateWorkflow();

  return (
    <div className=" relative mt-14 overflow-hidden  ">
      <WorkFlowsContainer>
        <div className="  flex gap-2 justify-end mb-5">
          <ButtonGroup>
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

        {data.items.length ? (
          <div className="flex flex-col gap-3 mask-b-from-90% pb-14">
            {data.items.map((workflow) => (
              <Link key={workflow.id} href={`workflows/${workflow.id}`}>
                <div className=" border rounded-xl py-4 px-6 flex justify-between  items-center ">
                  <div className=" flex items-center gap-6">
                    <div>
                      <WorkflowIcon strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className=" line-clamp-1 ">{workflow.name}</div>
                      <div className="text-muted-foreground text-xs line-clamp-1">
                        Updated {dayjs(workflow.updatedAt).fromNow()} || Created{" "}
                        {dayjs(workflow.createdAt).fromNow()}
                      </div>
                    </div>{" "}
                  </div>
                  <EllipsisVertical />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="  flex justify-center items-center  border-dashed  mt-20  pb-14  ">
            <div className=" border py-10 flex justify-center flex-col w-md items-center rounded-xl ">
              <PackageOpen size={50} strokeWidth={1} />
              <span className=" pt-4">No workflows found</span>
              <span className=" text-xs text-muted-foreground text-center mt-2">
                You haven't created any workflows yet. Get <br /> started by
                creating your first workflow{" "}
              </span>

              <Button
                className=" mt-20"
                disabled={createWorkflowMutation.isPending}
                onClick={() => {
                  createWorkflowMutation.mutate();
                }}
              >
                Create Workflow
              </Button>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4 border-t p-4   fixed bottom-0 right-0 md:left-64 left-0 bg-background gap-2">
          <div className="text-sm text-muted-foreground line-clamp-1">
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
              <span className=" max-sm:hidden">Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!data.haveNextPage}
            >
              <span className=" max-sm:hidden">Next</span>
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
