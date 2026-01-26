import { create } from "zustand";
import { FileSystemTree, WebContainer } from "@webcontainer/api";
import { EditorView } from "@codemirror/view";
import { projectFiles } from "@/data/project-file";

interface IDEStore {
  liveUrl: string | null;
  setLiveUrl: (url: string | null) => void;

  webContainerRef: React.MutableRefObject<WebContainer | null>;
  setWebContainerRef: (
    ref: React.MutableRefObject<WebContainer | null>,
  ) => void;

  editorRef: React.MutableRefObject<HTMLDivElement | null>;
  setEditorRef: (ref: React.MutableRefObject<HTMLDivElement | null>) => void;

  editorView: EditorView | null;
  setEditorView: (view: EditorView | null) => void;

  activeTab: "code" | "preview";
  setActiveTab: (tab: "code" | "preview") => void;

  fileStructure: FileSystemTree;
  setFileStructure: (
    updater: FileSystemTree | ((prev: FileSystemTree) => FileSystemTree),
  ) => void;
}

// 👇 THIS IS THE MAGIC
const createIDEStore = () =>
  create<IDEStore>((set) => ({
    liveUrl: null,
    setLiveUrl: (url) => set({ liveUrl: url }),

    webContainerRef: { current: null },
    setWebContainerRef: (ref) => set({ webContainerRef: ref }),

    editorRef: { current: null },
    setEditorRef: (ref) => set({ editorRef: ref }),

    editorView: null,
    setEditorView: (view) => set({ editorView: view }),

    activeTab: "preview",
    setActiveTab: (tab) => set({ activeTab: tab }),

    fileStructure: structuredClone(projectFiles),
    setFileStructure: (updater) =>
      set((state) => ({
        fileStructure:
          typeof updater === "function"
            ? updater(state.fileStructure)
            : updater,
      })),
  }));

// 👇 Persist across Fast Refresh
export const useIDEStore =
  (globalThis as any).__IDE_STORE__ ??
  ((globalThis as any).__IDE_STORE__ = createIDEStore());
