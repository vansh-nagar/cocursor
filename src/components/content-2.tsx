import { Cpu, Zap } from "lucide-react";
import DemoCanvas from "./landing-page/demo-canvas";

export default function ContentSection() {
  return (
    <section className="py-16 md:py-32 flex justify-center">
      <div className=" grid max-w-7xl sm:grid-cols-2 grid-cols-1 items-end gap-4 m-3 ">
        <div>
          <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">
            The Lyra ecosystem brings together our models.
          </h2>
          <div>
            <div className="relative space-y-4">
              <p className="text-muted-foreground">
                Gemini is evolving to be more than just the models.{" "}
                <span className="text-accent-foreground font-bold">
                  It supports an entire ecosystem
                </span>{" "}
                — from products innovate.
              </p>
              <p className="text-muted-foreground">
                It supports an entire ecosystem — from products to the APIs and
                platforms helping developers and businesses innovate
              </p>

              <div className="grid grid-cols-2 gap-3 pt-6 sm:gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="size-4" />
                    <h3 className="text-sm font-medium">Faaast</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    It supports an entire helping developers and innovate.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="size-4" />
                    <h3 className="text-sm font-medium">Powerful</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    It supports an entire helping developers and businesses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative mt-6 sm:mt-0">
          <div className=" aspect-67/34 relative rounded-2xl bg-background border border-dashed shadow-inner  ">
            <DemoCanvas />
          </div>
        </div>
      </div>
    </section>
  );
}
