import { useIDEStore } from "@/stores/ideStore";
import { FileSystemTree } from "@webcontainer/api";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { TabInfo } from "./topbar";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  toDbPath,
  toUiPath,
  isSelfOrDescendant,
  rebasePath,
  projectRootNameOf,
} from "@/lib/project-paths";

/** Delay before an unsaved edit is written to Convex and the container. */
const AUTOSAVE_DELAY_MS = 800;

export const useExplorer = ({
  projectId,
  currentTabId,
  openTabs,
  setOpenTabs,
  setCurrentTabId,
}: {
  projectId?: string;
  currentTabId: string | null;
  openTabs: TabInfo[];
  setOpenTabs: (tabs: TabInfo[] | ((prev: TabInfo[]) => TabInfo[])) => void;
  setCurrentTabId: (id: string | null) => void;
}) => {
  const { fileStructure, setFileStructure, setActiveTab } = useIDEStore();

  // Fetch project data from Convex
  const project = useQuery(
    api.project.get,
    projectId ? { id: projectId as Id<"Project"> } : "skip",
  );

  // Sync fetched file tree to local state
  useEffect(() => {
    if (project?.fileTree) {
      const remoteTree = project.fileTree as unknown as FileSystemTree;
      setFileStructure(remoteTree);

      const getRemoteContent = (
        path: string,
        tree: FileSystemTree,
      ): string | undefined => {
        const parts = path.split("/").filter(Boolean);
        let current: any = tree;
        for (const part of parts) {
          if (!current || !current[part]) return undefined;
          if (current[part].file) return (current[part].file as any).contents;
          current = current[part].directory;
        }
        return undefined;
      };

      // Sync open tabs with remote data only if they aren't dirty
      setOpenTabs((prevTabs) => {
        let changed = false;
        const updatedTabs = prevTabs.map((tab) => {
          if (tab.isDirty) return tab;

          const remoteContent = getRemoteContent(tab.path, remoteTree);
          if (remoteContent !== undefined && remoteContent !== tab.content) {
            changed = true;
            return { ...tab, content: remoteContent };
          }
          return tab;
        });

        return changed ? updatedTabs : prevTabs;
      });
    }
  }, [project?.fileTree, setFileStructure, setOpenTabs]);

  // Convex mutations
  const updateContentMutation = useMutation(api.node.updateContent);
  const createFileMutation = useMutation(api.node.createFile);
  const createFolderMutation = useMutation(api.node.createFolder);
  const deleteNodeMutation = useMutation(api.node.deleteNode);
  const renameNodeMutation = useMutation(api.node.renameNode);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Latest tabs, readable from debounced callbacks without adding a dependency
  // that would reset the autosave timer on every keystroke.
  const openTabsRef = useRef(openTabs);
  useEffect(() => {
    openTabsRef.current = openTabs;
  }, [openTabs]);

  // Expand the project root by default. Was hardcoded to "vanilla-web-app",
  // so any project seeded differently opened fully collapsed.
  //
  // Derived rather than seeded through an effect: the root is only known once
  // the Convex query resolves, and writing it into state there would cascade
  // a render on every project load.
  const rootName = useMemo(
    () => projectRootNameOf(project?.fileTree as unknown as FileSystemTree),
    [project?.fileTree],
  );

  const effectiveExpandedFolders = useMemo(
    () =>
      expandedFolders.size === 0 && rootName
        ? new Set([rootName])
        : expandedFolders,
    [expandedFolders, rootName],
  );

  const toggleFolder = useCallback(
    (folderName: string) => {
      setExpandedFolders((prev) => {
        const base =
          prev.size === 0 && rootName ? new Set([rootName]) : new Set(prev);
        if (base.has(folderName)) {
          base.delete(folderName);
        } else {
          base.add(folderName);
        }
        return base;
      });
    },
    [rootName],
  );

  const getFileContent = useCallback(
    (path: string): string => {
      const parts = path.split("/");
      let current: any = fileStructure;

      for (const part of parts) {
        const node = current[part];
        if (!node) return "";

        if ("directory" in node) {
          current = node.directory;
        } else if ("file" in node) {
          return node.file.contents as string;
        }
      }

      return "";
    },
    [fileStructure],
  );

  const setFileContent = useCallback(
    (path: string, content: string) => {
      const parts = path.split("/");

      const updateTree = (tree: any, index: number): any => {
        const name = parts[index];

        if (index === parts.length - 1) {
          return {
            ...tree,
            [name]: {
              file: { contents: content },
            },
          };
        }

        return {
          ...tree,
          [name]: {
            directory: updateTree(tree[name]?.directory ?? {}, index + 1),
          },
        };
      };

      setFileStructure((prev: FileSystemTree) => updateTree(prev, 0));
    },
    [setFileStructure],
  );

  /**
   * Writes one file to Convex and to the WebContainer.
   *
   * Convex goes first, deliberately. The container write used to run first, so
   * a dead container (after a room change) threw before the mutation ran and
   * the edit was lost entirely rather than merely being absent from the runtime.
   */
  const persistFile = useCallback(
    async (uiPath: string, content: string) => {
      const dbPath = toDbPath(uiPath);

      if (projectId) {
        await updateContentMutation({
          projectId: projectId as Id<"Project">,
          path: dbPath,
          content,
        });
      }

      const wc = useIDEStore.getState().webContainerRef.current;
      if (wc) {
        const dir = dbPath.slice(0, dbPath.lastIndexOf("/"));
        if (dir) await wc.fs.mkdir(dir, { recursive: true });
        await wc.fs.writeFile(dbPath, content);
      }

      setFileContent(toUiPath(uiPath), content);
    },
    [projectId, updateContentMutation, setFileContent],
  );

  const handleSaveCurrentFile = useCallback(async () => {
    if (!currentTabId) return;

    const currentTab = openTabs.find((t) => t.id === currentTabId);
    if (!currentTab) return;

    const state = useIDEStore.getState();
    // Prefer the live document, but only when the editor showing it is the
    // current tab's — the store holds whichever view mounted last.
    const editorDoc = state.editorView?.state.doc.toString();
    const contentToSave = editorDoc ?? currentTab.content;

    const saveToast = toast.loading(`Saving ${currentTab.name}...`);

    try {
      await persistFile(currentTab.path, contentToSave);

      setOpenTabs((tabs) =>
        tabs.map((tab) =>
          tab.id === currentTabId
            ? { ...tab, isDirty: false, content: contentToSave }
            : tab,
        ),
      );

      toast.success(`Saved ${currentTab.name}`, { id: saveToast });
    } catch (error) {
      console.error("[Save] Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save file",
        { id: saveToast },
      );
    }
  }, [currentTabId, openTabs, persistFile, setOpenTabs]);

  const handleFileClick = useCallback(
    (path: string, name: string) => {
      const existingTab = openTabs.find((tab) => tab.path === path);

      if (existingTab) {
        setCurrentTabId(existingTab.id);
      } else {
        const content = getFileContent(path);

        const newTab: TabInfo = {
          id: `tab-${Date.now()}`,
          name,
          path,
          isDirty: false,
          content,
        };
        setOpenTabs([...openTabs, newTab]);
        setCurrentTabId(newTab.id);
      }

      setSelectedFile(path);
      setActiveTab("code");
    },
    [openTabs, getFileContent, setOpenTabs, setCurrentTabId, setActiveTab],
  );

  // One pending autosave timer per tab.
  const autosaveTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  useEffect(() => {
    const timers = autosaveTimers.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  const handleFileContentChange = useCallback(
    (tabId: string, newContent: string) => {
      setOpenTabs((tabs: TabInfo[]) =>
        tabs.map((tab) =>
          tab.id === tabId
            ? { ...tab, content: newContent, isDirty: true }
            : tab,
        ),
      );

      // Autosave. Previously this only touched React state and the sole
      // persistence path was Ctrl+S, so anyone who did not know the shortcut
      // lost every edit on navigation or refresh.
      const existing = autosaveTimers.current.get(tabId);
      if (existing) clearTimeout(existing);

      autosaveTimers.current.set(
        tabId,
        setTimeout(async () => {
          autosaveTimers.current.delete(tabId);

          const tab = openTabsRef.current.find((t) => t.id === tabId);
          if (!tab) return;

          try {
            await persistFile(tab.path, newContent);
            setOpenTabs((tabs) =>
              tabs.map((t) =>
                // Only clear the dirty flag if nothing was typed since.
                t.id === tabId && t.content === newContent
                  ? { ...t, isDirty: false }
                  : t,
              ),
            );
          } catch (error) {
            console.error("[Autosave] Error:", error);
            toast.error(`Could not save ${tab.name}`);
          }
        }, AUTOSAVE_DELAY_MS),
      );
    },
    [setOpenTabs, persistFile],
  );

  // Create a new file (synced to Convex)
  const handleCreateFile = useCallback(
    async (path: string, content: string = "") => {
      if (!projectId) return;

      try {
        const dbPath = toDbPath(path);
        await createFileMutation({
          projectId: projectId as Id<"Project">,
          path: dbPath,
          content,
        });

        // Also write to WebContainer. Parent dirs must exist first — the old
        // code swallowed that failure and still reported success for a file
        // that was never created in the runtime.
        const wc = useIDEStore.getState().webContainerRef.current;
        if (wc) {
          const dir = dbPath.slice(0, dbPath.lastIndexOf("/"));
          if (dir) await wc.fs.mkdir(dir, { recursive: true });
          await wc.fs.writeFile(dbPath, content);
        }

        // Update local file structure
        setFileContent(path.replace(/^\/+/, ""), content);

        toast.success(`Created ${path.split("/").pop()}`);
      } catch (error) {
        console.error("[CreateFile] Error:", error);
        toast.error("Failed to create file");
      }
    },
    [projectId, createFileMutation, setFileContent],
  );

  // Create a new folder (synced to Convex)
  const handleCreateFolder = useCallback(
    async (path: string) => {
      if (!projectId) return;

      try {
        const dbPath = toDbPath(path);
        await createFolderMutation({
          projectId: projectId as Id<"Project">,
          path: dbPath,
        });

        // Also create in WebContainer
        const wc = useIDEStore.getState().webContainerRef.current;
        if (wc) {
          try {
            await wc.fs.mkdir(dbPath, { recursive: true });
          } catch {
            // Might already exist
          }
        }

        toast.success(`Created folder ${path.split("/").pop()}`);
      } catch (error) {
        console.error("[CreateFolder] Error:", error);
        toast.error("Failed to create folder");
      }
    },
    [projectId, createFolderMutation],
  );

  // Delete a file or folder (synced to Convex)
  const handleDeleteNode = useCallback(
    async (path: string) => {
      if (!projectId) return;

      try {
        const dbPath = toDbPath(path);
        await deleteNodeMutation({
          projectId: projectId as Id<"Project">,
          path: dbPath,
        });

        // Also remove from WebContainer
        const wc = useIDEStore.getState().webContainerRef.current;
        if (wc) {
          try {
            await wc.fs.rm(dbPath, { recursive: true });
          } catch {
            // Already removed or doesn't exist
          }
        }

        // Close tabs for what was deleted. Boundary-aware: deleting "src/app"
        // must not also close "src/application.ts".
        const tabPath = toUiPath(path);
        setOpenTabs((tabs) =>
          tabs.filter((tab) => !isSelfOrDescendant(tab.path, tabPath)),
        );

        toast.success(`Deleted ${path.split("/").pop()}`);
      } catch (error) {
        console.error("[DeleteNode] Error:", error);
        toast.error("Failed to delete");
      }
    },
    [projectId, deleteNodeMutation, setOpenTabs],
  );

  // Rename a file or folder (synced to Convex)
  const handleRenameNode = useCallback(
    async (oldPath: string, newPath: string) => {
      if (!projectId) return;

      try {
        const oldDbPath = toDbPath(oldPath);
        const newDbPath = toDbPath(newPath);

        await renameNodeMutation({
          projectId: projectId as Id<"Project">,
          oldPath: oldDbPath,
          newPath: newDbPath,
        });

        // Also rename in the WebContainer. This step did not exist, so the
        // runtime kept serving the old filename after every rename and move.
        const wc = useIDEStore.getState().webContainerRef.current;
        if (wc) {
          const newDir = newDbPath.slice(0, newDbPath.lastIndexOf("/"));
          if (newDir) await wc.fs.mkdir(newDir, { recursive: true });
          await wc.fs.rename(oldDbPath, newDbPath);
        }

        const oldUi = toUiPath(oldPath);
        const newUi = toUiPath(newPath);

        // Update open tabs. rebasePath is anchored; String.replace rewrote the
        // first match anywhere and corrupted paths like "x/a/y" renaming "a".
        setOpenTabs((tabs) =>
          tabs.map((tab) => {
            if (!isSelfOrDescendant(tab.path, oldUi)) return tab;
            const updatedPath = rebasePath(tab.path, oldUi, newUi);
            return {
              ...tab,
              path: updatedPath,
              name: updatedPath.split("/").pop() || tab.name,
            };
          }),
        );

        // Carry the selection and any expanded folders across the rename.
        setSelectedFile((prev) =>
          prev && isSelfOrDescendant(prev, oldUi)
            ? rebasePath(prev, oldUi, newUi)
            : prev,
        );
        setExpandedFolders((prev) => {
          const next = new Set<string>();
          prev.forEach((f) =>
            next.add(
              isSelfOrDescendant(f, oldUi) ? rebasePath(f, oldUi, newUi) : f,
            ),
          );
          return next;
        });

        toast.success(`Renamed to ${newPath.split("/").pop()}`);
      } catch (error) {
        console.error("[RenameNode] Error:", error);
        toast.error("Failed to rename");
      }
    },
    [projectId, renameNodeMutation, setOpenTabs],
  );

  const isLoading = projectId ? project === undefined : false;

  return {
    fileStructure: (project?.fileTree as unknown as FileSystemTree) ?? fileStructure,
    setFileStructure,
    expandedFolders: effectiveExpandedFolders,
    setExpandedFolders,
    selectedFile,
    setSelectedFile,
    toggleFolder,
    getFileContent,
    setFileContent,
    handleFileClick,
    handleSaveCurrentFile,
    persistFile,
    handleFileContentChange,
    handleCreateFile,
    handleCreateFolder,
    handleDeleteNode,
    handleRenameNode,
    isLoading,
    project,
  };
};
