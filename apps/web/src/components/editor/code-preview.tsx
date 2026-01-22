"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { getLanguageExtension } from "@/app/features/language-extension";
import { customSetup } from "@/app/features/custom-setup";
import { minimap } from "@/app/features/minimap";

export default function CodeEditor({ FileContent }: { FileContent?: string }) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: FileContent || "",
      extensions: [javascript(), oneDark],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,

      extensions: [
        getLanguageExtension("file.js"),
        indentationMarkers(),
        oneDark,
        EditorView.lineWrapping,
        customSetup,
        keymap.of([indentWithTab]),
        minimap(),
        customSetup,
      ],
    });

    return () => {
      view.destroy();
    };
  }, [FileContent]);

  return <div ref={editorRef} className="h-full"></div>;
}
