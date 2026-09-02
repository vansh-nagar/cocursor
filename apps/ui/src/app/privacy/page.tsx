import type { Metadata } from "next";
import PageShell, { Section } from "@/components/landing/legal/page-shell";

export const metadata: Metadata = {
  title: "Privacy — Cocursor",
  description: "What Cocursor stores, where it goes, and what you can delete.",
};

export default function PrivacyPage() {
  return (
    <PageShell
      title="Privacy"
      intro="Plainly: what we store, who it is sent to, and how to get rid of it."
      updated="2 September 2026"
    >
      <Section heading="What we store">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-zinc-200">Account.</strong> Your name and an
            account identifier from our authentication provider, Clerk. Your
            password is handled by Clerk and never reaches us.
          </li>
          <li>
            <strong className="text-zinc-200">Projects and files.</strong> The
            names and full contents of the files in your projects, stored in
            Convex so they are there when you come back.
          </li>
        </ul>
        <p>
          Project and file operations check that you own the project before
          returning or changing anything.
        </p>
      </Section>

      <Section heading="What we do not store">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Voice and video calls are peer to peer. The audio and video go
            directly between the two browsers and are never recorded.
          </li>
          <li>
            Files sent through the chat panel transfer directly between
            browsers and are not uploaded to us.
          </li>
          <li>
            Peer chat messages are relayed in memory and are not written to a
            database. They are gone when the room empties.
          </li>
          <li>
            Anything installed or generated inside your browser container
            (<code className="rounded bg-zinc-900 px-1 py-0.5">node_modules</code>,
            build output) stays in the tab and disappears when you close it.
          </li>
        </ul>
      </Section>

      <Section heading="Who else sees your code">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong className="text-zinc-200">The AI features.</strong> When you
            use the agent, inline suggestions or Ctrl+I, the relevant code is
            sent to Groq to generate a response. Do not put secrets in files you
            ask the AI about.
          </li>
          <li>
            <strong className="text-zinc-200">Anyone you invite.</strong> A
            person with your room link can see and edit that project while they
            are in the room.
          </li>
          <li>
            <strong className="text-zinc-200">GitHub</strong>, if you use the
            export. Your token is used for that request and is not stored.
          </li>
        </ul>
      </Section>

      <Section heading="Deleting your data">
        <p>
          Deleting a project deletes its files immediately and permanently.
          There is no backup to restore from. To delete your account and
          everything in it, email{" "}
          <a
            className="text-orange-500 hover:underline"
            href="mailto:support@cocursor.ai"
          >
            support@cocursor.ai
          </a>
          .
        </p>
      </Section>

      <Section heading="Being straight with you">
        <p>
          Cocursor is a student project, not a company with a security team. It
          is a good place to build and share things; it is not the right place
          for production secrets, personal data belonging to other people, or
          anything you could not afford to lose.
        </p>
      </Section>
    </PageShell>
  );
}
