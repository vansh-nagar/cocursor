"use client";

import React, { useEffect, useRef, useCallback } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  File,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Terminal,
  UserRound,
  Loader2,
} from "lucide-react";
import FolderPreview from "@/components/ide-component/FolderPreview";
import NavBar from "@/components/ide-component/NavBar";
import TerminalComponent from "@/components/ide-component/terminal";
import CodeEditor from "@/components/ide-component/code-editor";
import PreviewFrame from "@/components/ide-component/PreviewFrame";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useIDEStore } from "@/stores/ideStore";
import { useTopbar } from "@/hooks/topbar";
import { useExplorer } from "@/hooks/explorer";
import { useKeyShortcutListeners } from "@/hooks/key-shortcut-listners";
import { useWebContainer } from "@/hooks/webcontainer";

const IDEComponent = () => {
  const {
    liveUrl,
    activeTab,
    setActiveTab,
    isLoading,
    loadingMessage,
    isContainerBooted,
    previewDevice,
    setPreviewDevice,
  } = useIDEStore();

  const { openTabs, setOpenTabs, currentTabId, setCurrentTabId, handleCloseTab } = useTopbar();
  
  const {
    fileStructure,
    expandedFolders,
    selectedFile,
    toggleFolder,
    handleFileClick,
    handleSaveCurrentFile,
    handleFileContentChange,
  } = useExplorer({
    currentTabId,
    openTabs,
    setOpenTabs,
    setCurrentTabId,
  });

  const {
    showExplorer,
    setShowExplorer,
    showTerminal,
    setShowTerminal,
    showAiChat,
    setShowAiChat,
  } = useKeyShortcutListeners({
    handleSaveCurrentFile,
    handleCloseTab,
    currentTabId,
  });

  const { initializeWebContainer, webContainerRef } = useWebContainer();

  const initRef = useRef(false);
  
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    initializeWebContainer().catch((error) => {
      console.error("[IDE] Failed to initialize WebContainer:", error);
    });
  }, [initializeWebContainer]);

  const currentTab = openTabs.find((tab) => tab.id === currentTabId);

  const handleEditorChange = useCallback(
    (content: string) => {
      if (currentTabId) {
        handleFileContentChange(currentTabId, content);
      }
    },
    [currentTabId, handleFileContentChange]
  );

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-screen flex-1">
        <div className="flex-1 flex flex-col h-full">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <div className="bg-accent p-2 z-50 flex flex-col justify-between">
              <div className="flex flex-col gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showExplorer ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setShowExplorer((prev) => !prev)}
                    >
                      <File />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Explorer (Ctrl+B)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Search />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Search</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showTerminal ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setShowTerminal((prev) => !prev)}
                    >
                      <Terminal />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Terminal (Ctrl+`)</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="ghost" size="icon">
                  <UserRound />
                </Button>
                <Button variant="ghost" size="icon">
                  <Settings />
                </Button>
              </div>
            </div>

            {showExplorer && (
              <>
                <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
                  <div className="h-full bg-muted/30 flex flex-col">
                    <div className="px-4 py-3 font-semibold text-sm border-b flex items-center justify-between">
                      <span>Explorer</span>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>New File</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Refresh</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <FolderPreview
                      fileStructure={fileStructure}
                      expandedFolders={expandedFolders}
                      selectedFile={selectedFile}
                      onToggleFolder={toggleFolder}
                      onFileClick={handleFileClick}
                    />
                  </div>
                </ResizablePanel>
                <ResizableHandle />
              </>
            )}

            <ResizablePanel className="h-full" defaultSize={60}>
              <div className="h-full flex flex-col">
                <NavBar
                  openTabs={openTabs}
                  currentTabId={currentTabId}
                  setCurrentTabId={setCurrentTabId}
                  handleCloseTab={handleCloseTab}
                  showAiChat={showAiChat}
                  setShowAiChat={setShowAiChat}
                  showExplorer={showExplorer}
                  setShowExplorer={setShowExplorer}
                  showTerminal={showTerminal}
                  setShowTerminal={setShowTerminal}
                  handleSaveCurrentFile={handleSaveCurrentFile}
                  liveUrl={liveUrl}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  previewDevice={previewDevice}
                  setPreviewDevice={setPreviewDevice}
                />

                <ResizablePanelGroup direction="vertical" className="flex-1">
                  <ResizablePanel defaultSize={showTerminal ? 70 : 100}>
                    <div className="h-full overflow-hidden bg-background">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="h-full w-full"
                        >
                          {activeTab === "preview" ? (
                            liveUrl ? (
                              <PreviewFrame url={liveUrl} device={previewDevice} />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                  <h3 className="text-lg font-semibold mb-2">
                                    Server Not Running
                                  </h3>
                                  <p className="text-sm text-muted-foreground mb-4">
                                    Run these commands in the terminal:
                                  </p>
                                  <pre className="bg-muted p-4 rounded-lg text-left text-sm">
                                    cd vanilla-web-app{"\n"}
                                    npm install{"\n"}
                                    npm run dev
                                  </pre>
                                </div>
                              </div>
                            )
                          ) : currentTab ? (
                            <div className="h-full relative">
                              <CodeEditor
                                key={currentTab.id}
                                fileContent={currentTab.content}
                                filePath={currentTab.path}
                                onChange={handleEditorChange}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <h3 className="text-lg font-semibold mb-2">
                                  No File Open
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Select a file from the explorer to start editing
                                </p>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </ResizablePanel>

                  {showTerminal && (
                    <>
                      <ResizableHandle />
                      <ResizablePanel defaultSize={30} minSize={10}>
                        <TerminalComponent />
                      </ResizablePanel>
                    </>
                  )}
                </ResizablePanelGroup>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default IDEComponent;
