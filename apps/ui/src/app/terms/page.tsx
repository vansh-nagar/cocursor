import type { Metadata } from "next";
import PageShell, { Section } from "@/components/landing/legal/page-shell";

export const metadata: Metadata = {
  title: "Terms — Cocursor",
  description: "The terms for using Cocursor.",
};

export default function TermsPage() {
  return (
    <PageShell
      title="Terms of Service"
      intro="Short, because the service is small."
      updated="2 September 2026"
    >
      <Section heading="Using Cocursor">
        <p>
          You need an account. You are responsible for what you build and run,
          and for having the right to use any code you bring. Do not use
          Cocursor to host or distribute malware, to attack other systems, or
          to break the law.
        </p>
      </Section>

      <Section heading="Your code is yours">
        <p>
          You keep all rights to the code you write here. We store it only to
          provide the service, and we do not use it to train models. See the{" "}
          <a className="text-orange-500 hover:underline" href="/privacy">
            privacy page
          </a>{" "}
          for who your code is sent to.
        </p>
      </Section>

      <Section heading="AI output">
        <p>
          The agent and inline suggestions produce code that can be wrong,
          insecure, or similar to code that exists elsewhere. Review anything it
          writes before you rely on it. You are responsible for what you ship.
        </p>
      </Section>

      <Section heading="Availability">
        <p>
          Cocursor is free and provided as is, with no uptime guarantee. It may
          change or stop working at any time. Keep your own copy of anything
          that matters — the GitHub export exists for exactly this.
        </p>
      </Section>

      <Section heading="Liability">
        <p>
          To the extent the law allows, we are not liable for lost work, lost
          data, or damage arising from using Cocursor. Since the service is
          free, no refunds are possible.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Questions about these terms:{" "}
          <a
            className="text-orange-500 hover:underline"
            href="mailto:support@cocursor.ai"
          >
            support@cocursor.ai
          </a>
          .
        </p>
      </Section>
    </PageShell>
  );
}
