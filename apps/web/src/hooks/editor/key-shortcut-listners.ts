import { useEffect, useState } from "react";

export const useKeyShortcutListeners = ({
  setActiveTab,
  handleSaveCurrentFile,
  handleCloseTab,
  currentTabId,
}: {
  setActiveTab: React.Dispatch<React.SetStateAction<"code" | "preview">>;
  handleSaveCurrentFile: () => void;
  handleCloseTab: (tabId: string) => void;
  currentTabId: string | null;
}) => {
  // Sidebar State
  const [showExplorer, setShowExplorer] = useState(true);
  const [showAiChat, setShowAiChat] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);
  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + B - Toggle Explorer
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setShowExplorer((prev) => !prev);
      }

      // Ctrl/Cmd + ` - Toggle Terminal
      if ((e.ctrlKey || e.metaKey) && e.key === "`") {
        e.preventDefault();
        setShowTerminal((prev) => !prev);
      }

      // Ctrl/Cmd + Shift + E - Toggle Explorer
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "E") {
        e.preventDefault();
        setShowExplorer((prev) => !prev);
      }

      // Ctrl/Cmd + Shift + A - Toggle AI Chat
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "A") {
        e.preventDefault();
        setShowAiChat((prev) => !prev);
      }

      // Ctrl/Cmd + Shift + P - Preview
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "P") {
        e.preventDefault();
        setActiveTab("preview");
      }

      // Ctrl/Cmd + Shift + C - Code
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
        e.preventDefault();
        setActiveTab("code");
      }

      // Ctrl/Cmd + S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveCurrentFile();
      }

      // Ctrl/Cmd + W - Close Tab
      if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        e.preventDefault();
        if (currentTabId) {
          handleCloseTab(currentTabId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTabId]);

  return {
    setShowTerminal,
    setShowExplorer,
    setShowAiChat,
    showExplorer,
    showTerminal,
    showAiChat,
  };
};
