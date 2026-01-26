import { useState } from "react";
export interface TabInfo {
  id: string;
  name: string;
  path: string;
  isDirty: boolean;
  content: string;
}

export const useTopbar = () => {
  const [openTabs, setOpenTabs] = useState<TabInfo[]>([]);
  const [currentTabId, setCurrentTabId] = useState<string | null>(null);

  const handleCloseTab = (tabId: string) => {
    const tabToClose = openTabs.find((tab) => tab.id === tabId);

    if (tabToClose?.isDirty) {
      if (!confirm(`Save changes to ${tabToClose.name}?`)) return;
    }

    const newTabs = openTabs.filter((tab) => tab.id !== tabId);
    setOpenTabs(newTabs);

    if (currentTabId === tabId) {
      const index = openTabs.findIndex((t) => t.id === tabId);
      const next = newTabs[index] || newTabs[index - 1];
      setCurrentTabId(next?.id || null);
    }
  };
  return {
    openTabs,
    setOpenTabs,
    currentTabId,
    setCurrentTabId,
    handleCloseTab,
  };
};
