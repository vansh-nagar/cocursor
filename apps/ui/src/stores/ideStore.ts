import { create } from "zustand";
import { FileSystemTree, WebContainer } from "@webcontainer/api";
import { EditorView } from "@codemirror/view";

export interface TabInfo {
  id: string;
  name: string;
  path: string;
  isDirty: boolean;
  content: string;
}

interface IDEStore {
  /** The project this store's state belongs to. Guards against cross-project leaks. */
  projectId: string | null;

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

  /**
   * Wipes all per-project state and rebinds the store to `projectId`.
   *
   * The store is a module singleton (many callers reach it via getState()
   * outside React), and Next.js client navigation between /room/A and /room/B
   * never reloads the page — so without this every field survives the move and
   * project A's tree, preview URL and editor view leak into project B.
   *
   * No-op when already bound to the same project, so it is safe in an effect.
   */
  resetForProject: (projectId: string | null) => void;
}

const initialProjectState = {
  // Empty, not the seed template: a non-empty default makes an unloaded
  // project look populated and lets stale contents be opened as real files.
  fileStructure: {} as FileSystemTree,
  editorView: null,
  liveUrl: null,
  activeTab: "code" as const,
  isLoading: true,
  loadingMessage: "Initializing...",
  isContainerBooted: false,
  previewDevice: "desktop" as const,
};

const createIDEStore = () =>
  create<IDEStore>((set, get) => ({
    projectId: null,
    ...initialProjectState,

    editorRef: { current: null },
    webContainerRef: { current: null },

    setFileStructure: (updater) =>
      set((state) => ({
        fileStructure:
          typeof updater === "function"
            ? updater(state.fileStructure)
            : updater,
      })),
    setEditorRef: (ref) => set({ editorRef: ref }),
    setEditorView: (view) => set({ editorView: view }),
    setWebContainerRef: (ref) => set({ webContainerRef: ref }),
    setLiveUrl: (url) => set({ liveUrl: url }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setLoadingMessage: (message) => set({ loadingMessage: message }),
    setIsContainerBooted: (booted) => set({ isContainerBooted: booted }),
    setPreviewDevice: (device) => set({ previewDevice: device }),

    resetForProject: (projectId) => {
      if (get().projectId === projectId) return;

      // Refs are mutable containers shared with consumers, so clear them in
      // place rather than swapping in new objects.
      get().editorRef.current = null;
      get().webContainerRef.current = null;

      set({ projectId, ...initialProjectState });
    },
  }));

export const useIDEStore =
  (globalThis as any).__IDE_STORE_V3__ ??
  ((globalThis as any).__IDE_STORE_V3__ = createIDEStore());
