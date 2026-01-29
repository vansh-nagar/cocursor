import { useIDEStore } from "@/stores/ideStore";
import { FileSystemTree } from "@webcontainer/api";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { TabInfo } from "./topbar";

export const useExplorer = ({
  currentTabId,
  openTabs,
  setOpenTabs,
  setCurrentTabId,
}: {
  currentTabId: string | null;
  openTabs: TabInfo[];
  setOpenTabs: (tabs: TabInfo[] | ((prev: TabInfo[]) => TabInfo[])) => void;
  setCurrentTabId: (id: string | null) => void;
}) => {
  const { fileStructure, setFileStructure, setActiveTab } = useIDEStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["vanilla-web-app", "vanilla-web-app/public"])
  );
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

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

  const getFileContent = useCallback((path: string): string => {
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
  }, [fileStructure]);

  const setFileContent = useCallback((path: string, content: string) => {
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
  }, [setFileStructure]);

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
      if (webContainer) {
        const wcPath = `/${currentTab.path}`;
        await webContainer.fs.writeFile(wcPath, contentToSave);
      }

      setFileContent(currentTab.path, contentToSave);

      setOpenTabs((tabs) =>
        tabs.map((tab) =>
          tab.id === currentTabId 
            ? { ...tab, isDirty: false, content: contentToSave } 
            : tab
        )
      );

      toast.success(`Saved ${currentTab.name}`, { id: saveToast });
    } catch (error) {
      console.error("[Save] Error:", error);
      toast.error("Failed to save file", { id: saveToast });
    }
  }, [currentTabId, openTabs, setFileContent, setOpenTabs]);

  const handleFileClick = useCallback((path: string, name: string) => {
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
  }, [openTabs, getFileContent, setOpenTabs, setCurrentTabId, setActiveTab]);

  const handleFileContentChange = useCallback((tabId: string, newContent: string) => {
    setOpenTabs((tabs: TabInfo[]) =>
      tabs.map((tab) =>
        tab.id === tabId ? { ...tab, content: newContent, isDirty: true } : tab
      )
    );
  }, [setOpenTabs]);

  return {
    fileStructure,
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
  };
};
