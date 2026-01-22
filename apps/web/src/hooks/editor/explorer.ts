import { FileSystemTree } from "@webcontainer/api";
import { useState } from "react";
import { toast } from "sonner";
import { TabInfo } from "./topbar";
import { projectFiles } from "../../utils/project-files";

export const useExplorer = ({
  currentTabId,
  openTabs,
  setOpenTabs,
  setCurrentTabId,
}: any) => {
  const [fileStructure, setFileStructure] =
    useState<FileSystemTree>(projectFiles);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["src", "src/components"]),
  );

  const [selectedFile, setSelectedFile] = useState<string | null>(null);

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

  const setFileContent = (path: string, content: string) => {
    const parts = path.split("/");

    const updateTree = (tree: any, index: number): any => {
      const name = parts[index];
      const node = tree[name];
      if (!node) return tree;

      if (index === parts.length - 1 && "file" in node) {
        return {
          ...tree,
          [name]: {
            file: {
              contents: content,
            },
          },
        };
      }

      if ("directory" in node) {
        return {
          ...tree,
          [name]: {
            directory: updateTree(node.directory, index + 1),
          },
        };
      }

      return tree;
    };

    setFileStructure((prev) => updateTree(prev, 0));
  };
  const handleSaveCurrentFile = () => {
    if (!currentTabId) return;

    const currentTab = openTabs.find((t) => t.id === currentTabId);
    if (!currentTab) return;

    setFileContent(currentTab.path, currentTab.content);

    setOpenTabs((tabs: any) =>
      tabs.map((tab: any) =>
        tab.id === currentTabId ? { ...tab, isDirty: false } : tab,
      ),
    );

    toast.success(`Saved ${currentTab.name}`);
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
