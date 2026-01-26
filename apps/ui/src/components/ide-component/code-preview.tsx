"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
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

export default function CodeEditor({ FileContent }: { FileContent?: string }) {
  const { editorRef, setEditorRef, editorView, setEditorView } = useIDEStore();

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: FileContent || "",
      extensions: [
        javascript(),
        oneDark,
        lineNumbers(),
        highlightActiveLine(),
        highlightActiveLineGutter(),
        drawSelection(),
        dropCursor(),
        rectangularSelection(),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,

      extensions: [
        oneDark,
        EditorView.lineWrapping,
        keymap.of([indentWithTab]),
      ],
    });

    setEditorView(view);

    return () => {
      view.destroy();
    };
  }, [FileContent]);

  return <div ref={editorRef} className="h-full"></div>;
}
