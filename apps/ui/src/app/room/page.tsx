"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { useAuthedQuery } from "@/hooks/use-authed-query";

/**
 * /room has no project to open.
 *
 * It used to render the IDE with projectId=undefined, which never booted a
 * WebContainer and left a permanent "Initializing..." spinner. Send people to
 * their most recent project, or to the dashboard to make one.
 */
export default function RoomPage() {
  const router = useRouter();
  const projects = useAuthedQuery(api.project.list, {});

  useEffect(() => {
    if (projects === undefined) return; // still loading

    if (projects.length > 0) {
      router.replace(`/room/${projects[0]._id}`);
    } else {
      router.replace("/main");
    }
  }, [projects, router]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Opening your workspace…</p>
      </div>
    </div>
  );
}
