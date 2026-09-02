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
      "Three ways. Pause while typing and a suggestion appears in grey — press Tab to accept it. Press Ctrl+I to describe a change in words and review the result before applying it. Or use the agent panel, which can read and write files across your whole project and run commands in your container, asking permission before anything destructive.",
  },
  {
    id: "item-3",
    question: "How does real-time collaboration work?",
    answer:
      "Share your room link and a second person can edit the project with you. You'll see their cursor and their changes as they type, and concurrent edits to the same file are merged rather than overwriting each other. The same panel gives you chat, a voice and video call, and direct file transfer.",
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
      "Your code runs in an isolated WebContainer sandbox in your own browser, never on a shared server. Projects are private to your account: every read and write checks that you own the project. Collaboration is peer-to-peer and encrypted by WebRTC, and calls and file transfers are never recorded. One thing to know: when you use the AI features, the relevant code is sent to the model provider to generate a response.",
  },
];

export default function FAQs() {
  return (
    <section className="@container py-10 sm:py-24 flex justify-center">
      <div className="w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] px-6">
        <div className="@xl:flex-row @xl:items-start @xl:gap-12 flex flex-col gap-8">
          <div className="@xl:sticky @xl:top-24 @xl:w-64 shrink-0">
            <h2 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight">
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
