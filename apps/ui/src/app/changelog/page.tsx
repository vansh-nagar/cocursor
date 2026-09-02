import type { Metadata } from "next";
import PageShell from "@/components/landing/legal/page-shell";

export const metadata: Metadata = {
  title: "Changelog — Cocursor",
  description: "What has shipped in Cocursor.",
};

const releases = [
  {
    date: "2026-09-02",
    title: "The agent can actually edit your code",
    changes: [
      "AI agent gained real tools: list, read, write, rename and delete files, and run commands in your container.",
      "Destructive actions (deleting files, running commands) now ask for approval before they run.",
      "Tool calls, their inputs and their results are shown in the chat instead of being hidden.",
      "The agent now receives your project's file list and the file you have open as context.",
      "Added inline suggestions (ghost text) with Tab to accept, and a Ctrl+I inline prompt that previews its change before applying.",
    ],
  },
  {
    date: "2026-09-02",
    title: "Live collaboration",
    changes: [
      "Edits now sync between peers character by character and merge concurrent changes instead of overwriting them.",
      "Added live cursors showing where the other person is working.",
      "Calls now start from a button — the camera and microphone are no longer requested automatically.",
      "Fixed the camera not returning after being switched off, and calls failing when permissions were slow to grant.",
      "Added a hang-up control, which previously did not exist.",
      "File transfer rewritten: large files stream instead of loading into memory, progress is accurate, and transfers no longer corrupt each other.",
      "The collaboration server now survives malformed messages and socket errors, reclaims abandoned rooms, and reconnects clients automatically.",
    ],
  },
  {
    date: "2026-09-02",
    title: "Editor and workspace fixes",
    changes: [
      "Your work now saves automatically as you type; a Save button was also added.",
      "Fixed remote updates overwriting what you were typing.",
      "Fixed opening a second project reusing the first project's container, which made every save in that session fail.",
      "Fixed files from a previously open project appearing in a newly opened one.",
      "Renaming a file now updates the running container, not just the file tree.",
      "The terminal now works for any project, not only the default template.",
      "GitHub export now pushes one commit, creates private repositories by default, and reports failures instead of always claiming success.",
    ],
  },
  {
    date: "2026-09-02",
    title: "Security",
    changes: [
      "Every project and file operation now verifies you own the project. Previously anyone with a project ID could read, edit or delete someone else's work.",
      "Account creation no longer accepts an arbitrary identity from the client.",
      "The project limit is now enforced on the server rather than only in the UI.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <PageShell
      title="Changelog"
      intro="What has shipped, most recent first."
    >
      <div className="space-y-12">
        {releases.map((release) => (
          <section key={release.title} className="space-y-3">
            <div className="flex items-baseline gap-3">
              <time className="font-mono text-xs text-zinc-600">
                {release.date}
              </time>
              <h2 className="text-lg font-medium text-white">
                {release.title}
              </h2>
            </div>
            <ul className="list-disc space-y-1.5 pl-5">
              {release.changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
