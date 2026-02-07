import { create } from "zustand";
import { FileSystemTree, WebContainer } from "@webcontainer/api";
import { EditorView } from "@codemirror/view";
import { projectFiles } from "@/data/project-file";

export interface TabInfo {
  id: string;
  name: string;
  path: string;
  isDirty: boolean;
  content: string;
}

interface IDEStore {
  fileStructure: FileSystemTree;
  setFileStructure: (
    updater: FileSystemTree | ((prev: FileSystemTree) => FileSystemTree),
  ) => void;
  editorRef: React.MutableRefObject<HTMLDivElement | null>;
  setEditorRef: (ref: React.MutableRefObject<HTMLDivElement | null>) => void;
  editorView: EditorView | null;
  setEditorView: (view: EditorView | null) => void;
  webContainerRef: React.MutableRefObject<WebContainer | null>;
  setWebContainerRef: (
    ref: React.MutableRefObject<WebContainer | null>,
  ) => void;
  liveUrl: string | null;
  setLiveUrl: (url: string | null) => void;
  activeTab: "code" | "preview";
  setActiveTab: (tab: "code" | "preview") => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
  isContainerBooted: boolean;
  setIsContainerBooted: (booted: boolean) => void;
  previewDevice: "desktop" | "tablet" | "mobile";
  setPreviewDevice: (device: "desktop" | "tablet" | "mobile") => void;
}

const createIDEStore = () =>
  create<IDEStore>((set) => ({
    fileStructure: projectFiles as unknown as FileSystemTree,
    setFileStructure: (updater) =>
      set((state) => ({
        fileStructure:
          typeof updater === "function"
            ? updater(state.fileStructure)
            : updater,
      })),
    editorRef: { current: null },
    setEditorRef: (ref) => set({ editorRef: ref }),
    editorView: null,
    setEditorView: (view) => set({ editorView: view }),
    webContainerRef: { current: null },
    setWebContainerRef: (ref) => set({ webContainerRef: ref }),
    liveUrl: null,
    setLiveUrl: (url) => set({ liveUrl: url }),
    activeTab: "code",
    setActiveTab: (tab) => set({ activeTab: tab }),
    isLoading: true,
    setIsLoading: (loading) => set({ isLoading: loading }),
    loadingMessage: "Initializing...",
    setLoadingMessage: (message) => set({ loadingMessage: message }),
    isContainerBooted: false,
    setIsContainerBooted: (booted) => set({ isContainerBooted: booted }),
    previewDevice: "desktop",
    setPreviewDevice: (device) => set({ previewDevice: device }),
  }));

export const useIDEStore =
  (globalThis as any).__IDE_STORE_V3__ ??
  ((globalThis as any).__IDE_STORE_V3__ = createIDEStore());
