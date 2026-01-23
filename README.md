# Orcha

**Orcha** is a collaborative, AI-powered code editor inspired by Cursor.  
It enables real-time collaboration, AI-assisted coding, and an interactive development environment directly in the browser.

---

## Features

### 🧠 AI-Assisted Coding
- Inline AI suggestions (ghost text)
- Context-aware code generation
- Inline prompt box (`Ctrl + I` style workflow)
- Agent-based AI chat for multi-step tasks

### 👥 Real-Time Collaboration
- Multiple users editing the same project
- Cursor presence & live updates
- Conflict-free file syncing

### 🖥️ In-Browser Development Environment
- WebContainer-powered file system
- Run terminal commands securely
- Live preview of running apps
- Instant file updates reflected in runtime

### 📁 Project & File Management
- Virtual file system (folders + files)
- Persistent storage (DB-backed)
- Change tracking & syncing

### ⚡ Developer Experience
- Fast UI with proper loading states
- Keyboard-first workflows
- Minimal latency updates

---

## Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- xterm.js (terminal)
- AI SDK + custom UI components

### Backend
- Node.js
- AI agents (LLM-powered)
- Database for projects & files
- WebSocket / real-time sync layer

### Infra
- WebContainer API (sandboxed runtime)
- Server Actions / API routes
- Edge + Server execution

---

## Architecture Overview

```text
Client (Editor UI)
 ├─ Code Editor
 ├─ Terminal (xterm)
 ├─ AI UI (chat, inline, ghost text)
 └─ Collaboration Layer
        ↓
Backend
 ├─ AI Orchestrator (agents)
 ├─ File Sync Engine
 ├─ Command Executor
 └─ Database
        ↓
WebContainer
 ├─ Virtual FS
 ├─ Dev Server
 └─ Runtime Processes
