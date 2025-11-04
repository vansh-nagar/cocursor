"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import DemoCanvas from "./demo-canvas";

export default function HeroSection() {
  return (
    <div className="  w-full pt-14 flex  flex-col justify-center items-center overflow-hidden">
      <div className=" flex  flex-col h-[70vh] items-center justify-center ">
        <p className="text-5xl sm:text-7xl md:text-9xl font-bold">ORHCA</p>
        <p className=" text-sm text-muted-foreground   text-center mt-2 ">
          Low-code platform to build and automate workflows with a visual
          editor.
        </p>

        <div className=" flex flex-wrap  justify-center gap-4 mt-10">
          <Button className=" w-36">
            <Link href="/workflows">Workflows</Link>
          </Button>
          <Button className=" w-36">Learn More</Button>
        </div>
      </div>
    </div>
  );
}
