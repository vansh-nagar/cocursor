import { Cpu, Zap } from "lucide-react";
import DemoCanvas from "./demo-canvas";

export default function ContentSection() {
  return (
    <section className=" flex justify-center">
      <div className=" grid max-w-7xl sm:grid-cols-2 grid-cols-1 items-end gap-4 mx-3 ">
        <div>
          <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl mb-3">
            The Orcha ecosystem brings automation together.
          </h2>
          <div>
            <div className="relative space-y-4">
              <p className="text-muted-foreground">
                Orcha isn’t just a workflow tool.{" "}
                <span className="text-accent-foreground font-bold">
                  It’s a complete automation ecosystem
                </span>{" "}
                — built to connect apps, automate tasks and reduce manual work.
              </p>
              <p className="text-muted-foreground">
                From visual workflows to APIs and integrations, Lyra helps
                developers and teams create powerful automations with zero
                complexity.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-6 sm:gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="size-4" />
                    <h3 className="text-sm font-medium">Fast Automation</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Build workflows in minutes with a clean visual editor and
                    instant execution.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="size-4" />
                    <h3 className="text-sm font-medium">Powerful Engine</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Execute complex logic, conditional branches, webhooks and
                    background jobs with high reliability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-6 sm:mt-0">
          <div className=" aspect-67/34 relative rounded-2xl bg-background border border-dashed shadow  ">
            <DemoCanvas />
          </div>
        </div>
      </div>
    </section>
  );
}
