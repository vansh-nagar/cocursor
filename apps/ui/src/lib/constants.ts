/**
 * Maximum projects a single user may own.
 *
 * Shared by the Convex mutation that enforces it (convex/project.ts) and the
 * UI that reflects it (app/main/page.tsx), so the two can never disagree.
 */
export const PROJECT_LIMIT = 5;
