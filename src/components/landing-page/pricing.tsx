import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export default function Pricing() {
  return (
    <div className="relative mx-3">
      <div className="mx-auto max-w-7xl ">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
            Automate your workflows smarter with Orcha
          </h2>
        </div>
        <div className="mt-4 md:mt-10">
          <div className="bg-card relative rounded-3xl border shadow-2xl shadow-zinc-950/5">
            <div className="grid items-center gap-12 divide-y p-12 md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="pb-12 text-center md:pb-0 md:pr-12">
                <h3 className="text-2xl font-semibold">Orcha Premium</h3>
                <p className="mt-2 text-lg">
                  Enterprises that want full automation power
                </p>
                <span className="mb-6 mt-12 inline-block text-6xl font-bold">
                  <span className="text-4xl">$</span>29.99
                </span>

                <div className="flex justify-center">
                  <Button asChild size="lg">
                    <Link href="#">Get started</Link>
                  </Button>
                </div>

                <p className="text-muted-foreground mt-12 text-sm">
                  Includes everything from automation to security—all in one
                  platform.
                </p>
              </div>
              <div className="relative">
                <ul role="list" className="space-y-4">
                  {[
                    "First premium advantage",
                    "Second advantage weekly",
                    "Third advantage donate to project",
                    "Fourth, access to all components weekly",
                    "Fifth, priority support",
                    "Sixth, advanced security features",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="size-3" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
