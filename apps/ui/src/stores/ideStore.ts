import { EditorView } from "@codemirror/view";
import React from "react";
import { create } from "zustand";

export interface IDEState {
  editorView: EditorView | null;
  setEditorView: (view: EditorView | null) => void;
  editorRef?: React.RefObject<HTMLDivElement | null> | null;
  setEditorRef?: (ref: React.RefObject<HTMLDivElement | null>) => void;
}

export const useIDEStore = create<IDEState>((set) => ({
  editorView: null,
  setEditorView: (view) => set({ editorView: view }),
  editorRef: React.createRef<HTMLDivElement>(),
  setEditorRef: (ref) => set({ editorRef: ref }),
}));
