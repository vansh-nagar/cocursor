"use client";

import dynamic from "next/dynamic";
import { use } from "react";

const IDEComponent = dynamic(() => import("../_ide-component"), {
  ssr: false,
});

export default function RoomPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  return <IDEComponent projectId={projectId} />;
}
