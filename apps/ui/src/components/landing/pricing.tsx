import { Button } from "@/components/ui/button";
import { Check, Circle } from "lucide-react";
import Link from "next/link";
import { PROJECT_LIMIT } from "@/lib/constants";

/** What Cocursor does today. */
const included = [
  "Full in-browser dev container",
  "AI agent that reads and edits your project",
  "Inline suggestions and Ctrl+I edits",
  `${PROJECT_LIMIT} projects`,
  "Live collaboration for two, with cursors",
  "Voice, video and file transfer between peers",
  "One-click export to GitHub",
];

/** Honest about what does not exist yet. */
const planned = [
  "Rooms larger than two people",
  "More project templates",
  "Team workspaces and shared ownership",
  "Deploy from the editor",
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <h1 className="text-center text-4xl font-semibold lg:text-5xl">
            Free while it&apos;s being built
          </h1>
          <p className="text-muted-foreground">
            Cocursor is a work in progress and everything in it is free to use.
            There&apos;s no paid tier, no card, and no trial that runs out.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:mt-20 md:grid-cols-5 md:gap-0">
          <div className="rounded-(--radius) flex flex-col justify-between space-y-8 border p-6 md:col-span-3 md:my-2 md:rounded-r-none md:border-r-0 lg:p-10">
            <div className="space-y-4">
              <div>
                <h2 className="font-medium">Everything, right now</h2>
                <span className="my-3 block text-2xl font-semibold">
                  $0
                </span>
                <p className="text-muted-foreground text-sm">
                  No account limits beyond the ones listed here.
                </p>
              </div>

              <Button
                asChild
                className="w-full bg-orange-600 text-white hover:bg-orange-700"
              >
                <Link href="/sign-up">Start building</Link>
              </Button>

              <hr className="border-dashed opacity-20" />

              <ul className="list-outside space-y-3 text-sm">
                {included.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="size-3 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="dark:bg-white/5 rounded-(--radius) border p-6 shadow-lg shadow-gray-950/5 md:col-span-2 lg:p-10">
            <div className="space-y-4">
              <div>
                <h2 className="font-medium">Not built yet</h2>
                <p className="text-muted-foreground mt-3 text-sm">
                  Where this is going. None of it exists today.
                </p>
              </div>

              <hr className="border-dashed opacity-20" />

              <ul className="list-outside space-y-3 text-sm">
                {planned.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Circle className="size-3 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
