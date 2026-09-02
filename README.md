# Cocursor

A collaborative, AI-powered code editor that runs entirely in the browser. Write code with an
AI agent that can actually edit your files, run it in a real Node.js container without
installing anything, and share the room with someone else.

## What it does

**In-browser dev environment.** Each project boots its own Node.js container (WebContainer) in
your tab: a real shell, `npm install`, a dev server and a live preview. Nothing runs on your
machine and nothing runs on ours.

**An AI agent that edits code.** The agent can list, read, write, rename and delete files and
run commands in your container. It sees your project's file list and the file you have open.
Deleting files and running commands ask for your approval first; every tool call shows its
input and result. Inline suggestions appear as you type (Tab to accept), and Ctrl+I takes an
instruction in words and previews its change before applying it.

**Live collaboration for two.** Share a room link and you'll see each other's cursors and edits
as they happen. Concurrent changes to the same file are merged rather than overwriting each
other (operational transform via `@codemirror/collab`, with the collab server as authority).
The same panel carries chat, a voice/video call and direct peer-to-peer file transfer.

**Export to GitHub.** One commit, private by default.

## Stack

| Layer | Choice |
|---|---|
| App | Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/ui |
| Editor | CodeMirror 6 (`@codemirror/collab` for sync), xterm.js |
| Runtime | WebContainer API |
| Data | Convex (reactive DB, auth-checked queries and mutations) |
| Auth | Clerk |
| AI | AI SDK v6 + Groq, with client-executed tools |
| Realtime | `apps/collab-api` — Express + `ws` signalling and document authority |
| Jobs | Inngest |
| Monorepo | Turborepo + Bun |

## Layout

```
apps/
  ui/           Next.js app (port 3100) + convex/ backend functions
  collab-api/   WebSocket signalling + collab document authority (port 8080)
packages/       shared eslint / tsconfig
```

## Running it

```bash
bun install
cp apps/ui/.env.example apps/ui/.env.local   # then fill it in
bun run convex dev                           # once, to create a deployment
bun dev                                      # UI on :3100, collab-api on :8080
```

`apps/ui/.env.example` documents every variable and where to get it. Two notes that cost time
otherwise:

- `CLERK_JWT_ISSUER_DOMAIN` belongs to the **Convex** environment, not Next. Set it with
  `bun run convex env set CLERK_JWT_ISSUER_DOMAIN <issuer>`, using the issuer URL of a Clerk JWT
  template named exactly `convex`. Without that template, Convex never receives a token and every
  authenticated query fails.
- The `convex` and `inngest` binaries are installed under `apps/ui`, not the workspace root, so
  running them from the repo root gives "command not found". The root `convex` / `inngest` scripts
  above forward to the right workspace.
- `GROQ_API_KEY` is read implicitly by the AI SDK. Without it, every AI request fails.

For background jobs, run `bun run inngest` alongside the dev server.

## Architecture

```
                        Browser
  ┌──────────────────────────────────────────────────────┐
  │  Landing        Dashboard          IDE (/room/:id)    │
  │                                    ├ CodeMirror       │
  │                                    ├ xterm terminal   │
  │                                    ├ Live preview     │
  │                                    └ Chat: AI | Peer  │
  └───┬───────────────┬──────────────────────┬───────────┘
      │               │                      │
  Convex          collab-api            /api/agent-call
  (projects,      (signalling,          (Groq; declares
   files, auth)    doc authority,        tools, runs none)
      │            presence)                  │
      │               │              tools execute in the
      └───────────────┴──────────────  browser, against ↓
                                       ┌──────────────────┐
                                       │  WebContainer    │
                                       │  fs · shell · dev│
                                       └──────────────────┘
```

The agent's tools are declared server-side without an `execute` function, so AI SDK v6 hands
the calls to the browser. That's the only place they can run — WebContainer has no server-side
existence — and it means agent writes go through the same path the file explorer uses, so the
container, the database and your open tabs can't drift apart.

## Limits

- 5 projects per account, 2 people per room.
- The container lives in the tab: files persist, installed packages don't.
- Binary files are skipped on GitHub export.
- Calls between different networks need a TURN server (`NEXT_PUBLIC_TURN_*`); STUN alone covers
  the same machine and the same LAN.
