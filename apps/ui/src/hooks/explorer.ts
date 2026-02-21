import { useIDEStore } from "@/stores/ideStore";
import { FileSystemTree } from "@webcontainer/api";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { TabInfo } from "./topbar";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

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
    new Set(["vanilla-web-app", "vanilla-web-app/public"]),
  );
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const toDbPath = useCallback((uiPath: string): string => {
    return `/${uiPath.replace(/^\/+/, "")}`;
  }, []);

  const toggleFolder = useCallback((folderName: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderName)) {
        newSet.delete(folderName);
      } else {
        newSet.add(folderName);
      }
      return newSet;
    });
  }, []);

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

  const handleSaveCurrentFile = useCallback(async () => {
    if (!currentTabId) return;

    const currentTab = openTabs.find((t) => t.id === currentTabId);
    if (!currentTab) return;

    const state = useIDEStore.getState();
    const currentEditorView = state.editorView;
    const webContainer = state.webContainerRef.current;

    let contentToSave: string;

    if (currentEditorView) {
      contentToSave = currentEditorView.state.doc.toString();
    } else {
      contentToSave = currentTab.content;
    }

    const saveToast = toast.loading(`Saving ${currentTab.name}...`);

    try {
      // save to wc.
      if (webContainer) {
        const wcPath = `/${currentTab.path}`;
        await webContainer.fs.writeFile(wcPath, contentToSave);
      }

      console.log(`[Save] Saved to WebContainer: /${currentTab.path}`);

      // save to convexx
      if (projectId) {
        await updateContentMutation({
          projectId: projectId as Id<"Project">,
          path: `/${currentTab.path}`,
          content: contentToSave,
        });
      }

      // save to local
      setFileContent(currentTab.path, contentToSave);

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
      toast.error("Failed to save file", { id: saveToast });
    }
  }, [
    projectId,
    currentTabId,
    openTabs,
    setFileContent,
    setOpenTabs,
    updateContentMutation,
    toDbPath,
  ]);

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

  const handleFileContentChange = useCallback(
    (tabId: string, newContent: string) => {
      setOpenTabs((tabs: TabInfo[]) =>
        tabs.map((tab) =>
          tab.id === tabId
            ? { ...tab, content: newContent, isDirty: true }
            : tab,
        ),
      );
    },
    [setOpenTabs],
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

        // Also write to WebContainer
        const wc = useIDEStore.getState().webContainerRef.current;
        if (wc) {
          try {
            await wc.fs.writeFile(dbPath, content);
          } catch {
            // File might need parent dirs created first
          }
        }

        // Update local file structure
        setFileContent(path.replace(/^\/+/, ""), content);

        toast.success(`Created ${path.split("/").pop()}`);
      } catch (error) {
        console.error("[CreateFile] Error:", error);
        toast.error("Failed to create file");
      }
    },
    [projectId, createFileMutation, setFileContent, toDbPath],
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
    [projectId, createFolderMutation, toDbPath],
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

        // Close any open tabs for deleted files (strip leading slash for tab path matching)
        const tabPath = path.replace(/^\/+/, "");
        setOpenTabs((tabs) => tabs.filter((tab) => !tab.path.startsWith(tabPath)));

        toast.success(`Deleted ${path.split("/").pop()}`);
      } catch (error) {
        console.error("[DeleteNode] Error:", error);
        toast.error("Failed to delete");
      }
    },
    [projectId, deleteNodeMutation, setOpenTabs, toDbPath],
  );

  // Rename a file or folder (synced to Convex)
  const handleRenameNode = useCallback(
    async (oldPath: string, newPath: string) => {
      if (!projectId) return;

      try {
        await renameNodeMutation({
          projectId: projectId as Id<"Project">,
          oldPath: toDbPath(oldPath),
          newPath: toDbPath(newPath),
        });

        // Update open tabs with new path
        setOpenTabs((tabs) =>
          tabs.map((tab) => {
            if (tab.path === oldPath || tab.path.startsWith(`${oldPath}/`)) {
              const updatedPath = tab.path.replace(oldPath, newPath);
              return {
                ...tab,
                path: updatedPath,
                name: updatedPath.split("/").pop() || tab.name,
              };
            }
            return tab;
          }),
        );

        toast.success(`Renamed to ${newPath.split("/").pop()}`);
      } catch (error) {
        console.error("[RenameNode] Error:", error);
        toast.error("Failed to rename");
      }
    },
    [projectId, renameNodeMutation, setOpenTabs, toDbPath],
  );

  const isLoading = projectId ? project === undefined : false;

  return {
    fileStructure: project?.fileTree as unknown as FileSystemTree,
    setFileStructure,
    expandedFolders,
    setExpandedFolders,
    selectedFile,
    setSelectedFile,
    toggleFolder,
    getFileContent,
    setFileContent,
    handleFileClick,
    handleSaveCurrentFile,
    handleFileContentChange,
    handleCreateFile,
    handleCreateFolder,
    handleDeleteNode,
    handleRenameNode,
    isLoading,
    project,
  };
};
