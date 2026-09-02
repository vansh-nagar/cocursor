import type { Metadata } from "next";
import PageShell, { Section } from "@/components/landing/legal/page-shell";

export const metadata: Metadata = {
  title: "Docs — Cocursor",
  description: "How to use Cocursor: the editor, the AI agent, and collaboration.",
};

const shortcuts: [string, string][] = [
  ["Ctrl / Cmd + S", "Save the current file"],
  ["Ctrl / Cmd + I", "Inline AI edit at the cursor or on the selection"],
  ["Tab", "Accept an inline AI suggestion"],
  ["Escape", "Dismiss an inline AI suggestion"],
  ["Ctrl / Cmd + B", "Toggle the file explorer"],
  ["Ctrl / Cmd + Shift + F", "Search across the project"],
  ["Ctrl / Cmd + `", "Toggle the terminal"],
  ["Ctrl / Cmd + Shift + A", "Toggle the AI panel"],
  ["Ctrl / Cmd + Shift + P", "Switch to the preview"],
  ["Ctrl / Cmd + Shift + C", "Switch back to the code"],
  ["Ctrl / Cmd + W", "Close the current tab"],
];

export default function DocsPage() {
  return (
    <PageShell
      title="Documentation"
      intro="Everything Cocursor does today, and how to drive it."
    >
      <Section heading="Getting started">
        <p>
          Sign in, then create a project from the dashboard. Each project boots
          its own Node.js container in your browser — nothing is installed on
          your machine. Open the terminal and run{" "}
          <code className="rounded bg-zinc-900 px-1.5 py-0.5 text-zinc-200">
            npm install &amp;&amp; npm run dev
          </code>{" "}
          to start the dev server; the preview tab picks it up automatically.
        </p>
      </Section>

      <Section heading="The AI agent">
        <p>
          The agent panel sits on the right of the editor. It can list, read,
          write, rename and delete files, and run commands in your container.
          It sees your project&apos;s file list and whichever file you have
          open, so &quot;add a health check to the server&quot; is enough
          context.
        </p>
        <p>
          Deleting files and running commands ask for your approval first —
          the tool call pauses with Allow and Decline buttons. Everything else
          runs immediately and shows you the input and result.
        </p>
      </Section>

      <Section heading="Inline AI">
        <p>
          Pause while typing and the agent suggests a continuation in grey.
          Press Tab to accept it or Escape to dismiss it. Press Ctrl+I to
          describe a change in words instead: with code selected it rewrites
          the selection, otherwise it inserts at the cursor. You see the
          proposed code and choose whether to apply it.
        </p>
      </Section>

      <Section heading="Collaboration">
        <p>
          Open the chat panel and share your project link. A room holds two
          people. You will see each other&apos;s cursors and edits live —
          concurrent changes are merged rather than overwriting each other.
        </p>
        <p>
          The same panel carries text chat, a voice and video call, and direct
          file transfer between the two browsers. Calls start only when you
          press Call, so nothing touches your camera or microphone until you
          ask it to.
        </p>
      </Section>

      <Section heading="Exporting to GitHub">
        <p>
          Export To GitHub creates a repository and pushes your project as a
          single commit. Repositories are created private by default; there is
          a toggle if you want it public. You will need a GitHub token with
          Administration: Write and Contents: Write — prefer a fine-grained
          token scoped as narrowly as you can.
        </p>
      </Section>

      <Section heading="Keyboard shortcuts">
        <div className="overflow-hidden rounded-md border border-zinc-800">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-zinc-800">
              {shortcuts.map(([keys, description]) => (
                <tr key={keys}>
                  <td className="w-56 px-4 py-2.5 font-mono text-xs text-zinc-300">
                    {keys}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-400">{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section heading="Limits">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Five projects per account.</li>
          <li>Two people per collaboration room.</li>
          <li>
            Your container runs in the browser tab. Closing it stops the dev
            server; your files are saved, installed packages are not.
          </li>
          <li>
            Binary files are skipped when exporting to GitHub.
          </li>
        </ul>
      </Section>
    </PageShell>
  );
}
