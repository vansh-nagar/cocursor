"use client";

import { useEffect, useRef, useMemo } from "react";
import { EditorState } from "@codemirror/state";
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

interface CodeEditorProps {
  fileContent: string;
  filePath: string;
  onChange?: (content: string) => void;
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
      return javascript({ jsx: ext?.includes("x"), typescript: ext?.includes("ts") });
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

export default function CodeEditor({ fileContent, filePath, onChange }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const initialContentRef = useRef(fileContent);
  
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    initialContentRef.current = fileContent;
  }, [filePath]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    container.innerHTML = "";

    const languageExtension = getLanguageExtension(filePath);

    const state = EditorState.create({
      doc: initialContentRef.current || "",
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
        keymap.of([indentWithTab]),
        EditorView.theme({
          "&": { height: "100%" },
          ".cm-scroller": { overflow: "auto" },
          ".cm-content": { padding: "10px 0" },
        }),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return;

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
      useIDEStore.getState().setEditorView(null);
    };
  }, [filePath]);

  return (
    <div 
      ref={containerRef} 
      className="h-full w-full bg-[#282c34]"
      data-file={filePath}
    />
  );
}
