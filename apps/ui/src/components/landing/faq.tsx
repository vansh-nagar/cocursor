"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

const faqItems = [
  {
    id: "item-1",
    question: "What exactly is Cocursor?",
    answer:
      "Cocursor is a collaborative, AI-powered code editor that runs entirely in your browser. It combines the power of advanced AI agents with a real-time multiplayer coding environment and a sandboxed Linux-like runtime.",
  },
  {
    id: "item-2",
    question: "How does the AI assistance work?",
    answer:
      "Cocursor features inline AI suggestions (ghost text), a context-aware prompt box (Ctrl+I), and an autonomous AI agent. The agent doesn't just suggest code; it can understand your entire project, plan features, and execute multi-step refactors.",
  },
  {
    id: "item-3",
    question: "How does real-time collaboration work?",
    answer:
      "Multiple users can edit the same project simultaneously. You'll see real-time cursor presence, live updates, and conflict-free file syncing, making it feel like you're coding together in the same room.",
  },
  {
    id: "item-4",
    question: "What is the 'In-Browser Dev Environment'?",
    answer:
      "Powered by WebContainers, Cocursor provides a secure, sandboxed Linux-like environment in your browser. You can run npm commands, start dev servers, and see live previews of your apps without installing anything locally.",
  },
  {
    id: "item-5",
    question: "Is my code secure in Cocursor?",
    answer:
      "Yes. Coding and execution happen in a isolated sandbox via WebContainers. Your projects are stored securely, and collaboration features use modern encrypted sync layers to ensure your data stays private.",
  },
];

export default function FAQs() {
  return (
    <section className="@container py-24 flex justify-center">
      <div className="w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] px-6">
        <div className="@xl:flex-row @xl:items-start @xl:gap-12 flex flex-col gap-8">
          <div className="@xl:sticky @xl:top-24 @xl:w-64 shrink-0">
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight">
              FAQs
            </h2>
            <p className="text-muted-foreground mt-3 text-sm">
              Your questions answered
            </p>
            <p className="text-muted-foreground @xl:block mt-6 hidden text-sm">
              Need more help?{" "}
              <Link
                href="mailto:support@cocursor.ai"
                className="text-orange-500 font-medium hover:underline"
              >
                Contact us
              </Link>
            </p>
          </div>
          <div className="flex-1">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-zinc-800"
                >
                  <AccordionTrigger className="cursor-pointer py-6 text-sm sm:text-base font-medium hover:no-underline hover:text-orange-500 transition-colors">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground pb-4 text-sm sm:text-base leading-relaxed">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="text-muted-foreground @xl:hidden mt-6 text-sm">
              Need more help?{" "}
              <Link
                href="mailto:support@cocursor.ai"
                className="text-orange-500 font-medium hover:underline"
              >
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
