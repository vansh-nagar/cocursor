"use client";

import dynamic from "next/dynamic";

const IDEComponent = dynamic(() => import("./_ide-component"), {
  ssr: false,
});

export default function RoomPage() {
  return <IDEComponent />;
}
