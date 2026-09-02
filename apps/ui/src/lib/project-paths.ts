import type { FileSystemTree } from "@webcontainer/api";

/**
 * Path helpers shared by the explorer, terminal, GitHub export and AI tools.
 *
 * Two conventions exist in this codebase and mixing them silently corrupts data:
 *   - DB paths  (Convex `Node.path`): always one leading slash, e.g. "/app/index.js"
 *   - UI paths  (tabs, tree keys):    no leading slash,          e.g. "app/index.js"
 */

/** DB form: exactly one leading slash, no trailing slash. */
export function toDbPath(path: string): string {
  return `/${path.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

/** UI form: no leading or trailing slash. */
export function toUiPath(path: string): string {
  return path.replace(/^\/+/, "").replace(/\/+$/, "");
}

/** True when `child` is `parent` itself or nested under it (boundary-aware). */
export function isSelfOrDescendant(child: string, parent: string): boolean {
  return child === parent || child.startsWith(`${parent}/`);
}

/**
 * Re-roots a path after its ancestor was renamed.
 * Anchored, unlike String.replace, which rewrites the first match anywhere and
 * corrupts paths such as "/x/a/y" when renaming "/a".
 */
export function rebasePath(
  path: string,
  oldPrefix: string,
  newPrefix: string,
): string {
  if (!isSelfOrDescendant(path, oldPrefix)) return path;
  return newPrefix + path.slice(oldPrefix.length);
}

/**
 * The directory a project's commands should run in.
 *
 * Was hardcoded to "/vanilla-web-app" in the terminal, runCommand, the explorer's
 * new-file buttons and the initial expanded-folder set — so any project not seeded
 * from that exact template failed to spawn a shell with no usable error.
 *
 * Falls back to "/" when the tree has no single root directory.
 */
export function projectRootOf(tree: FileSystemTree | undefined): string {
  if (!tree) return "/";

  const dirs = Object.entries(tree)
    .filter(([, node]) => node && typeof node === "object" && "directory" in node)
    .map(([name]) => name);

  // A single top-level directory is the project root (the template shape).
  // Anything else means files live at the root itself.
  return dirs.length === 1 ? `/${dirs[0]}` : "/";
}

/** Same as projectRootOf but in UI form ("vanilla-web-app", or "" for root). */
export function projectRootNameOf(tree: FileSystemTree | undefined): string {
  return toUiPath(projectRootOf(tree));
}
