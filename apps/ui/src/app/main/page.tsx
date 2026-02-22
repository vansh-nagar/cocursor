"use client";

import Logo from "@/components/mine/logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  ArrowUpRight,
  FolderDown,
  FolderOpen,
  Trash,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "../../../convex/_generated/dataModel";
import OrangeButton, {
  BlackButton,
} from "@/components/landing/button/orange-button";
import { projectFiles } from "@/data/project-file";

const type = [
  {
    icon: <FolderOpen size={16} />,
    name: "Start new Project",
    link: "/room",
  },
  {
    icon: <FolderDown size={16} />,
    name: "Create With Prompt",
    link: "/room",
  },
  {
    icon: <FolderDown size={16} />,
    name: "Collab with friends",
    link: "/room",
  },
];

const Page = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const me = useQuery(api.user.getMe);
  const projects = useQuery(api.project.list, {});
  const createUser = useMutation(api.user.createUserIfExists);
  const createProject = useMutation(api.project.create);
  const deleteProject = useMutation(api.project.remove);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null,
  );
  const projectCount = projects?.length ?? 0;
  const isAtProjectLimit = projectCount >= 5;

  const formatCreationTime = (timestampMs: number) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestampMs));

  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    createUser({ name: user.fullName ?? "Unknown", clerkId: user.id });
  }, [isLoaded, user?.id, user?.fullName, createUser]);

  const handleEnterRoom = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectName.trim() || !user?.id) return;
    if (isCreating) return;
    if (isAtProjectLimit) return;

    setIsCreating(true);
    try {
      const project = await createProject({
        name: projectName.trim(),
      });
      setIsDialogOpen(false);
      setProjectName("");
      if (project?._id) {
        router.push(`/room/${project._id}`);
      } else {
        router.push("/room");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: Id<"Project">) => {
    if (deletingProjectId) return;
    setDeletingProjectId(projectId);
    try {
      await deleteProject({ id: projectId });
    } finally {
      setDeletingProjectId(null);
    }
  };

  const visibleProjects = projects?.slice(0, 5) ?? [];

  return (
    <div className="flex justify-center items-center min-h-screen sm:h-screen sm:overflow-hidden w-full relative py-12 px-6 sm:px-0">
      <div className="flex flex-col justify-center items-start w-full sm:w-auto max-w-4xl">
        <Logo />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div className="grid grid-cols-2 sm:flex gap-3 sm:gap-4 mt-6 w-full">
            {type.map((item, index) =>
              index === 0 ? (
                <DialogTrigger key={index} asChild disabled={isAtProjectLimit}>
                  <div
                    className={
                      "flex flex-col p-4 rounded-md bg-muted w-full sm:w-40 transition-all duration-150" +
                      (isAtProjectLimit
                        ? " opacity-60 cursor-not-allowed"
                        : " hover:bg-accent-foreground/20 cursor-pointer")
                    }
                  >
                    {item.icon}
                    <span className="text-sm mt-1">{item.name}</span>
                  </div>
                </DialogTrigger>
              ) : (
                <Link key={index} href={item.link}>
                  <div className=" flex flex-col p-4 rounded-md bg-muted w-full sm:w-40 hover:bg-accent-foreground/20 transition-all duration-150 cursor-pointer">
                    {item.icon}
                    <span className="text-sm mt-1">{item.name}</span>
                  </div>
                </Link>
              ),
            )}
          </div>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter project details</DialogTitle>
              <DialogDescription>
                Add a project name to continue.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEnterRoom} className="grid gap-4">
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
                autoFocus
              />
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    !projectName.trim() || isCreating || isAtProjectLimit
                  }
                >
                  {isCreating ? "Creating..." : "Continue"}
                </Button>
              </DialogFooter>
              {isAtProjectLimit && (
                <p className="text-xs text-muted-foreground">
                  You reached the 5 project limit. Delete a project to create a
                  new one.
                </p>
              )}
            </form>
          </DialogContent>
        </Dialog>
        <div className="flex mt-6 text-xs justify-between w-full">
          <div>Recent projects</div>
          <div>{projectCount} total</div>
        </div>

        <div className="mt-1 w-full">
          {visibleProjects.map((item, index) => (
            <div
              key={index}
              className="flex justify-between w-full items-center mt-2"
            >
              <div className="flex flex-col gap-0.5 min-w-0 flex-1 mr-4">
                <span className="text-sm font-medium truncate">{item.name}</span>
                <div className="text-xs text-muted-foreground">
                  Created At: {formatCreationTime(item._creationTime)}
                </div>
              </div>
              <div
                className="flex gap-2
              "
              >
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                    variant={"destructive"}
                      size={"icon"}
                      className="px-3 aspect-square cursor-pointer text-sm font-medium "
                    >
                      <Trash2 />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete project</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{item.name}" and its
                        files.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => handleDeleteProject(item._id)}
                        disabled={deletingProjectId === item._id}
                      >
                        {deletingProjectId === item._id
                          ? "Deleting..."
                          : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Link href={`/room/${item._id}`}>
                  <Button
                    size={"icon"}
                    variant={"secondary"} 
                    className="px-3 aspect-square cursor-pointer text-sm font-medium "
                  >
                    {" "}
                    <ArrowUpRight />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        {(projects?.length ?? 0) > 5 && (
          <p className="mt-4 w-full text-xs text-muted-foreground">
            You reached the 5 project limit. Delete a project to create a new
            one.
          </p>
        )}
      </div>
    </div>
  );
};

export default Page;
