"use client";
import Link from "next/link";
import { Button } from "../ui/button";

export default function HeroSection() {
  return (
    <div className="  w-full h-screen pt-14 flex  flex-col justify-center items-center overflow-hidden">
      <p className="text-5xl sm:text-7xl md:text-9xl font-bold uppercase">
        Orcha
      </p>
      <p className=" text-sm text-muted-foreground   text-center mt-2 ">
        Low-code platform to build and automate workflows with a visual editor.
      </p>

      <div className=" flex flex-wrap  justify-center gap-2 sm:gap-8 mt-10">
        <Button className=" w-36">
          <Link href="/workflows">Workflows</Link>
        </Button>
        <Button className=" w-36">Learn More</Button>
      </div>
    </div>
  );
}
