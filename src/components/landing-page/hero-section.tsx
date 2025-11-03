import Link from "next/link";
import { Button } from "../ui/button";
import { InfiniteMovingCards } from "../ui/infinite-moving-cards";

export default function HeroSection() {
  return (
    <div className=" h-screen w-full pt-14 flex  flex-col justify-center items-center overflow-hidden">
      <p className=" text-9xl font-bold">ORHCA</p>
      <p className=" text-sm text-muted-foreground   text-center mt-2 ">
        Low-code platform to build and automate workflows with a visual editor.
      </p>

      <div className=" flex gap-4 mt-10">
        <Button className=" w-36">
          <Link href="/workflows">Workflows</Link>
        </Button>
        <Button className=" w-36">Learn More</Button>
      </div>
      <InfiniteMovingCards items={[]} />
    </div>
  );
}
