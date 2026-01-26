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

function Editor({
  ws,
  sendFileContent,
}: {
  ws: WebSocket | null;
  sendFileContent: ({ content }: { content: string }) => void;
}) {
  const { editorRef, setEditorRef, setEditorView, editorView } = useIDEStore();

  useEffect(() => {
    if (!editorRef?.current) return;

    const state = EditorState.create({
      doc: `// CodeMirror is alive 🎉
function hello() {
  console.log("Hello world");
}
`,
      extensions: [
        javascript(),
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
        }),
        EditorView.updateListener.of((update) => {
          if (
            !update.transactions.some(
              (tr) =>
                tr.isUserEvent("input") ||
                tr.isUserEvent("delete") ||
                tr.isUserEvent("paste"),
            )
          )
            return;

          if (update.docChanged) {
            console.log("Document changed");
            const content = update.state.doc.toString();
            sendFileContent({ content: content });
          }
        }),
      ],
    });

    if (setEditorRef) {
      setEditorRef(editorRef);
    }

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    setEditorView(view);

    return () => {
      view.destroy();
      editorRef.current = null;
    };
  }, []);

  return <div ref={editorRef} className=" h-full w-full bg-black" />;
}

export default Editor;
