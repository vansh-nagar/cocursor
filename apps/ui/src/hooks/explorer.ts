import { projectFiles } from "@/data/project-file";
import { useIDEStore } from "@/stores/ideStore";
import { FileSystemTree } from "@webcontainer/api";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { TabInfo } from "./topbar";

export const useExplorer = ({
  currentTabId,
  openTabs,
  setOpenTabs,
  setCurrentTabId,
}: any) => {
  const { fileStructure, setFileStructure } = useIDEStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["src", "src/components"]),
  );

  const { setActiveTab, activeTab } = useIDEStore();

  const { webContainerRef } = useIDEStore();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const { editorRef, setEditorRef, editorView } = useIDEStore();

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderName)) {
        newSet.delete(folderName);
      } else {
        newSet.add(folderName);
      }
      return newSet;
    });
  };

  useEffect(() => {
    console.log("Explorer mounted");
    return () => console.log("Explorer unmounted");
  }, []);

  const getFileContent = (path: string): string => {
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
  };

  const setFileContent = async (path: string, content: string) => {
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
  };
  const handleSaveCurrentFile = async () => {
    if (!currentTabId) return;

    const currentTab = openTabs.find((t: any) => t.id === currentTabId);
    if (!currentTab) return;

    if (webContainerRef.current == null) {
      toast.error("WebContainer is not initialized.");
      return;
    }

    console.log("Current Tab Content" + currentTab.content);

    console.log("Saving file to WebContainer FS:", currentTab.path);
    toast.info(`Saving ${currentTab.path}`);
    /////////////////////////////////

    const editorView = useIDEStore.getState().editorView;
    if (!editorView) {
      toast.error("Editor View is not initialized.");
      return;
    }
    const editorContent = editorView.state.doc.toString();

    await webContainerRef.current?.fs.writeFile(
      `/${currentTab.path}`,
      editorContent || currentTab.content,
    );

    ////////////////////////////////////////
    setFileContent(currentTab.path, editorContent);
    console.log("File content after save:", getFileContent(currentTab.path));

    setOpenTabs((tabs: any) =>
      tabs.map((tab: any) =>
        tab.id === currentTabId ? { ...tab, isDirty: false } : tab,
      ),
    );

    // toast.success(`Saved ${currentTab.name}`);
  };

  const handleFileClick = (path: string, name: string) => {
    const existingTab = openTabs.find((tab: any) => tab.path === path);

    if (existingTab) {
      setCurrentTabId(existingTab.id);
    } else {
      const newTab: TabInfo = {
        id: `tab-${Date.now()}`,
        name,
        path,
        isDirty: false,
        content: getFileContent(path),
      };
      setOpenTabs([...openTabs, newTab]);
      setCurrentTabId(newTab.id);
    }

    setSelectedFile(path);
    setActiveTab("code");
  };

  const handleFileContentChange = (tabId: string, newContent: string) => {
    setOpenTabs((tabs: any) =>
      tabs.map((tab: any) =>
        tab.id === tabId ? { ...tab, content: newContent, isDirty: true } : tab,
      ),
    );
  };

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
  };
};
