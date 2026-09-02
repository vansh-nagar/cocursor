"use client";

import { findEnvProblems } from "@/lib/env-check";

/**
 * Renders in place of the app when required credentials are missing, so an
 * unconfigured checkout says what to do instead of redirecting into a
 * third-party 404. Development only.
 */
export default function EnvWarning() {
  const problems = findEnvProblems();
  if (problems.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black p-6">
      <div className="w-full max-w-lg space-y-5 border border-orange-600/30 bg-zinc-950 p-6">
        <div>
          <h1 className="text-lg font-medium text-white">
            Cocursor isn&apos;t configured yet
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            The app can&apos;t start until these are set.
          </p>
        </div>

        <ul className="space-y-3">
          {problems.map((p) => (
            <li key={p.name} className="text-sm">
              <code className="text-orange-500">{p.name}</code>
              <span className="text-zinc-500"> {p.problem}</span>
              <div className="mt-0.5 text-xs text-zinc-500">{p.where}</div>
            </li>
          ))}
        </ul>

        <p className="border-t border-zinc-800 pt-4 text-xs text-zinc-500">
          Add them to{" "}
          <code className="text-zinc-300">apps/ui/.env.local</code> and restart
          the dev server. <code className="text-zinc-300">.env.example</code>{" "}
          lists every variable and where it comes from.
        </p>
      </div>
    </div>
  );
}
