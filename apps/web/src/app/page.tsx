import { link } from "fs";
import { Folder, FolderDown, FolderOpen } from "lucide-react";
import Link from "next/link";
import React from "react";
const type = [
  {
    icon: <FolderOpen size={16} />,
    name: "Start new Project",
    link: "/editor",
  },
  {
    icon: <FolderDown size={16} />,
    name: "Create With Prompt",
    link: "/editor",
  },
  {
    icon: <FolderDown size={16} />,
    name: "Collab with friends",
    link: "/editor",
  },
];

const folder = [
  { name: "Landing Page Redesign", lastEdited: "2026-01-18" },
  { name: "Dashboard UI", lastEdited: "2026-01-16" },
  { name: "Auth Flow Prototype", lastEdited: "2026-01-12" },
  { name: "Pricing Page A/B Test", lastEdited: "2026-01-09" },
  { name: "Animation Experiments", lastEdited: "2026-01-05" },
];

const Page = () => {
  return (
    <div className="flex justify-center items-center h-screen w-full bg-background">
      <div className="flex flex-col justify-center items-start  ">
        <div>
          <img src="logo1.svg" alt="Description" className="dark:invert w-32" />
        </div>
        <div className="flex  gap-4 mt-4">
          {type.map((item, index) => (
            <Link key={index} href={item.link}>
              <div className=" flex flex-col p-4 rounded-md bg-muted w-40 hover:bg-accent-foreground/20 transition-all duration-150 cursor-pointer">
                {item.icon}
                <span className="text-sm mt-1">{item.name}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="flex mt-6 text-xs justify-between w-full">
          <div>Recent projects</div>
          <div>View all({folder.length})</div>
        </div>

        <div className="mt-1 w-full">
          {folder.map((item, index) => (
            <div
              key={index}
              className="flex justify-between w-full items-center mt-2"
            >
              <span className="text-xs">{item.name}</span>
              <div className="text-xs text-muted-foreground ml-6">
                Last edited: {item.lastEdited}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
