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
  CircleArrowOutUpRight,
  FolderDown,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "../../../convex/_generated/dataModel";
import OrangePremButton from "@/components/landing/button/orange-prem-buttion";
import OrangeButton, {
  BlackButton,
} from "@/components/landing/button/orange-button";

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
  const projects = useQuery(api.project.list, { clerkId: user?.id ?? "" });
  const createUser = useMutation(api.user.createUserIfExists);
  const createProject = useMutation(api.project.create);
  const deleteProject = useMutation(api.project.remove);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null,
  );

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

    setIsCreating(true);
    try {
      const project = await createProject({
        name: projectName.trim(),
        clerkId: user.id,
      });
      setIsDialogOpen(false);
      setProjectName("");
      if (project?._id) {
        router.push(`/room?projectId=${project._id}`);
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

  return (
    <div className="flex justify-center items-center h-screen w-full overflow-hidden relative">
      <svg
        className=" absolute -z-50 inset-0 w-full"
        viewBox="0 0 1920 1796"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_f_3_23)">
          <path
            d="M13.3671 760C433.367 1154 1526.03 617.5 2019.87 300L2203.87 1237.5L313.867 1496C-193.5 1081.5 -406.633 366 13.3671 760Z"
            fill="#FA6000"
          />
        </g>
        <defs>
          <filter
            id="filter0_f_3_23"
            x="-509.978"
            y="0"
            width="3013.85"
            height="1796"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="150"
              result="effect1_foregroundBlur_3_23"
            />
          </filter>
        </defs>
      </svg>
      <div className="flex flex-col justify-center items-start  ">
        <Logo />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div className="flex  gap-4 mt-2">
            {type.map((item, index) =>
              index === 0 ? (
                <DialogTrigger key={index} asChild>
                  <div className=" flex flex-col p-4 rounded-md bg-muted w-40 hover:bg-accent-foreground/20 transition-all duration-150 cursor-pointer">
                    {item.icon}
                    <span className="text-sm mt-1">{item.name}</span>
                  </div>
                </DialogTrigger>
              ) : (
                <Link key={index} href={item.link}>
                  <div className=" flex flex-col p-4 rounded-md bg-muted w-40 hover:bg-accent-foreground/20 transition-all duration-150 cursor-pointer">
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
                  disabled={!projectName.trim() || isCreating}
                >
                  {isCreating ? "Creating..." : "Continue"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <div className="flex mt-6 text-xs justify-between w-full">
          <div>Recent projects</div>
          <div>View all({projects?.length ?? 0})</div>
        </div>

        <div className="mt-1 w-full">
          {projects?.map((item, index) => (
            <div
              key={index}
              className="flex justify-between w-full items-center mt-2"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs">{item.name}</span>
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
                    <BlackButton className="py-1.5 px-3  cursor-pointer text-sm ">
                      Delete
                    </BlackButton>
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
                <Link href={`/room?projectId=${item._id}`}>
                  <OrangeButton className="py-1.5 px-2  cursor-pointer text-sm ">
                    <ArrowUpRight />
                  </OrangeButton>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
