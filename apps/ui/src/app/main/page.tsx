import Logo from "@/components/mine/logo";
import { link } from "fs";
import { Folder, FolderDown, FolderOpen } from "lucide-react";
import Link from "next/link";
import React from "react";
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

const folder = [
  { name: "Landing Page Redesign", lastEdited: "2026-01-18" },
  { name: "Dashboard UI", lastEdited: "2026-01-16" },
  { name: "Auth Flow Prototype", lastEdited: "2026-01-12" },
  { name: "Pricing Page A/B Test", lastEdited: "2026-01-09" },
  { name: "Animation Experiments", lastEdited: "2026-01-05" },
];

const Page = () => {
  return (
    <div className="flex justify-center items-center h-screen w-full overflow-hidden relative">
      {" "}
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
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
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

        <div className="flex  gap-4 mt-2">
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
