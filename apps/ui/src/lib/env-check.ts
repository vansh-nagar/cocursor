/**
 * Development-time check for unset or placeholder credentials.
 *
 * Without it, a fake Clerk publishable key is not an obvious failure: Clerk
 * decodes the key to a frontend-API domain and redirects there, so you land on
 * Clerk's own "Page not found" instead of anything pointing at your .env.local.
 */

interface EnvProblem {
  name: string;
  problem: string;
  where: string;
}

const PLACEHOLDER = /placeholder|changeme|your[-_]?key|xxx/i;

export function findEnvProblems(): EnvProblem[] {
  const problems: EnvProblem[] = [];

  const check = (name: string, value: string | undefined, where: string) => {
    if (!value) {
      problems.push({ name, problem: "is not set", where });
    } else if (PLACEHOLDER.test(value)) {
      problems.push({ name, problem: "is still a placeholder", where });
    }
  };

  check(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    "https://dashboard.clerk.com → API Keys",
  );
  check(
    "NEXT_PUBLIC_CONVEX_URL",
    process.env.NEXT_PUBLIC_CONVEX_URL,
    "run `bunx convex dev`",
  );

  return problems;
}

export function envProblemMessage(problems: EnvProblem[]): string {
  return [
    "Cocursor is not configured yet.",
    "",
    ...problems.map((p) => `  • ${p.name} ${p.problem}  —  ${p.where}`),
    "",
    "Set these in apps/ui/.env.local, then restart the dev server.",
    "See apps/ui/.env.example for the full list.",
  ].join("\n");
}
