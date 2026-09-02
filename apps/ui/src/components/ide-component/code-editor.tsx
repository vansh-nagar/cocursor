"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EditorState, Prec } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  dropCursor,
  rectangularSelection,
} from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { useIDEStore } from "@/stores/ideStore";
import { peerSync } from "@/lib/collab-extension";
import { ghostText } from "@/lib/ghost-text";
import { InlinePrompt } from "./inline-prompt";
import { toDbPath } from "@/lib/project-paths";
import type { ClientMessage, ServerMessage } from "@/lib/collab-protocol";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

export interface CodeEditorCollab {
  roomId: string;
  send: (message: ClientMessage) => boolean;
  subscribe: (listener: (message: ServerMessage) => void) => () => void;
}

interface CodeEditorProps {
  fileContent: string;
  filePath: string;
  projectId?: string;
  onChange?: (content: string) => void;
  /** When present, edits and cursors sync with the peer in this room. */
  collab?: CodeEditorCollab;
}

function getLanguageExtension(filePath: string) {
  const ext = filePath.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "mjs":
    case "cjs":
      return javascript({
        jsx: ext?.includes("x"),
        typescript: ext?.includes("ts"),
      });
    case "css":
      return css();
    case "html":
    case "htm":
      return html();
    case "json":
      return json();
    default:
      return javascript();
  }
}

export default function CodeEditor({
  fileContent,
  filePath,
  onChange,
  projectId,
  collab,
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const initialContentRef = useRef(fileContent);
  const suppressOnChangeRef = useRef(false);
  const fetchCompletion = useCallback(
    async ({
      prefix,
      suffix,
      filePath: path,
      signal,
    }: {
      prefix: string;
      suffix: string;
      filePath: string;
      signal: AbortSignal;
    }) => {
      const res = await fetch("/api/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix, suffix, filePath: path }),
        signal,
      });
      if (!res.ok) return "";
      const data: { completion?: string } = await res.json();
      return data.completion ?? "";
    },
    [],
  );

  const [inlinePromptOpen, setInlinePromptOpen] = useState(false);

  const clientIdRef = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2),
  );

  // Use the direct query for real-time sync if projectId is provided
  const remoteContent = useQuery(
    api.node.getContent,
    projectId
      ? {
          projectId: projectId as Id<"Project">,
          path: toDbPath(filePath),
        }
      : "skip",
  );

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Sync with remote content if provided and if we're not currently editing (or it's the first load)
  // Apply an incoming remote change, but only when the local buffer has no
  // unsaved edits.
  //
  // initialContentRef is the last content known to match the server. It must
  // NOT be reassigned on every keystroke — doing so made the "has the user
  // edited?" test below always true, so a remote push replaced the whole
  // document mid-typing and the local edit was then written back over it.
  useEffect(() => {
    // While collaborating, the collab server is the authority for this
    // document. Letting Convex pushes also rewrite the buffer would fight the
    // OT stream and clobber in-flight edits.
    if (collab) return;
    if (remoteContent === undefined || remoteContent === null) return;

    const view = viewRef.current;
    if (!view) {
      initialContentRef.current = remoteContent;
      return;
    }

    const currentContent = view.state.doc.toString();
    if (remoteContent === currentContent) {
      initialContentRef.current = remoteContent;
      return;
    }

    const hasLocalEdits = initialContentRef.current !== currentContent;
    if (hasLocalEdits) return;

    // Preserve the cursor across the replacement.
    const prevSelection = view.state.selection.main;
    suppressOnChangeRef.current = true;
    view.dispatch({
      changes: { from: 0, to: currentContent.length, insert: remoteContent },
      selection: {
        anchor: Math.min(prevSelection.anchor, remoteContent.length),
        head: Math.min(prevSelection.head, remoteContent.length),
      },
    });
    suppressOnChangeRef.current = false;
    initialContentRef.current = remoteContent;
  }, [remoteContent, collab]);

  // A different file was opened in this editor: reset the baseline.
  useEffect(() => {
    initialContentRef.current = fileContent;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filePath]);

  // The tab's content changed from outside the editor (a tab switch, or an AI
  // tool writing this file). Sync the document without touching the baseline.
  useEffect(() => {
    if (collab) return;

    const view = viewRef.current;
    if (!view) return;

    const currentContent = view.state.doc.toString();
    if (fileContent === currentContent) return;

    const prevSelection = view.state.selection.main;
    suppressOnChangeRef.current = true;
    view.dispatch({
      changes: { from: 0, to: currentContent.length, insert: fileContent },
      selection: {
        anchor: Math.min(prevSelection.anchor, fileContent.length),
        head: Math.min(prevSelection.head, fileContent.length),
      },
    });
    suppressOnChangeRef.current = false;
  }, [fileContent, collab]);

  // Handshake with the collab authority before building the view: we need the
  // server's current version and document to start from, otherwise the first
  // push is rejected and the two sides never converge.
  const [collabSession, setCollabSession] = useState<{
    path: string;
    version: number;
    doc: string;
  } | null>(null);

  useEffect(() => {
    if (!collab) {
      setCollabSession(null);
      return;
    }

    const path = toDbPath(filePath);
    let cancelled = false;

    const unsubscribe = collab.subscribe((message) => {
      if (cancelled) return;
      if (message.type === "doc-opened" && message.path === path) {
        setCollabSession({
          path,
          version: message.version,
          doc: message.doc,
        });
      }
    });

    collab.send({
      type: "doc-open",
      roomId: collab.roomId,
      path,
      fallbackDoc: initialContentRef.current ?? "",
    });

    return () => {
      cancelled = true;
      unsubscribe();
      setCollabSession(null);
    };
  }, [collab, filePath]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    container.innerHTML = "";

    const languageExtension = getLanguageExtension(filePath);

    // When collaborating, the server's copy is authoritative.
    const startDoc = collabSession
      ? collabSession.doc
      : initialContentRef.current || "";
    initialContentRef.current = startDoc;

    const state = EditorState.create({
      doc: startDoc,
      extensions: [
        languageExtension,
        oneDark,
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        drawSelection(),
        dropCursor(),
        rectangularSelection(),
        EditorView.lineWrapping,
        Prec.high(
          keymap.of([
            {
              key: "Mod-i",
              run: () => {
                setInlinePromptOpen(true);
                return true;
              },
            },
          ]),
        ),
        keymap.of([indentWithTab]),
        EditorView.theme({
          "&": { height: "100%" },
          ".cm-scroller": { overflow: "auto" },
          ".cm-content": { padding: "10px 0" },
        }),
        ghostText({ filePath, fetchCompletion }),
        ...(collab && collabSession
          ? [
              peerSync({
                path: collabSession.path,
                roomId: collab.roomId,
                startVersion: collabSession.version,
                clientID: clientIdRef.current,
                send: collab.send,
                subscribe: collab.subscribe,
              }),
            ]
          : []),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return;
          if (suppressOnChangeRef.current) return;

          const content = update.state.doc.toString();

          if (onChangeRef.current) {
            onChangeRef.current(content);
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: container,
    });

    viewRef.current = view;

    useIDEStore.getState().setEditorView(view);

    return () => {
      view.destroy();
      viewRef.current = null;
      // Only clear the global handle if it still points at this view.
      // Unconditionally nulling it meant the last unmount of any editor wiped
      // a live view, breaking Ctrl+S for the tab that was still open.
      const store = useIDEStore.getState();
      if (store.editorView === view) {
        store.setEditorView(null);
      }
    };
  }, [filePath, collab, collabSession, fetchCompletion]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full bg-[#282c34]"
        data-file={filePath}
      />
      {inlinePromptOpen && viewRef.current && (
        <InlinePrompt
          view={viewRef.current}
          filePath={filePath}
          onClose={() => setInlinePromptOpen(false)}
        />
      )}
    </div>
  );
}
