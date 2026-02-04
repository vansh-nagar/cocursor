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
  BotMessageSquare,
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
import Chat from "@/components/ide-component/Chat";
import Link from "next/link";

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

  const {
    openTabs,
    setOpenTabs,
    currentTabId,
    setCurrentTabId,
    handleCloseTab,
  } = useTopbar();

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
    [currentTabId, handleFileContentChange],
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
                <Link
                  href="/"
                  className=" flex justify-center items-center my-1 mt-2"
                >
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 87 91"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M47.1643 21.4431L1.51616 34.7167C0.385676 35.0454 0.305338 36.6102 1.39625 37.0521L21.7132 45.2821C22.083 45.4319 22.358 45.7495 22.4525 46.1357L28.1896 69.5876C28.4777 70.7653 30.1174 70.8716 30.5564 69.741L48.6718 23.0781C49.0431 22.1215 48.1526 21.1557 47.1643 21.4431Z"
                      fill="#FF4A00"
                      stroke="#FF4A00"
                      strokeWidth="1.14286"
                    />
                    <path
                      d="M39.811 69.2416L85.4341 55.8831C86.564 55.5523 86.6415 53.9874 85.5497 53.5476L65.2175 45.3554C64.8473 45.2063 64.5717 44.8891 64.4765 44.5029L58.6954 21.0619C58.4051 19.8847 56.7653 19.7815 56.3284 20.9129L38.3004 67.6093C37.9309 68.5666 38.8231 69.5308 39.811 69.2416Z"
                      fill="#FF4A00"
                      stroke="#FF4A00"
                      strokeWidth="1.14286"
                    />
                  </svg>
                </Link>
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
                  <TooltipContent side="right">
                    Explorer (Ctrl+B)
                  </TooltipContent>
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
                  <TooltipContent side="right">
                    Terminal (Ctrl+`)
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showAiChat ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => setShowAiChat((prev) => !prev)}
                    >
                      <BotMessageSquare />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    AI Chat (Ctrl+Shift+A)
                  </TooltipContent>
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

            <ResizablePanel
              className="h-full"
              defaultSize={showAiChat ? 50 : 60}
            >
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
                    <div className="h-full overflow-hidden relative">
                      <svg
                        className=" absolute -z-50 inset-0 w-full"
                        viewBox="0 0 1920 1796"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g filter="url(#filter0_f_3_23)">
                          <path
                            d="M13.3671 760C433.367 1154 1526.03 617.5 2019.87 300L2203.87 1237.5L313.867 1496C-193.5 1081.5 -406.633 366 13.3671 760Z"
                            fill="#FA6000"
                          />
                        </g>
                        <defs>
                          <filter
                            id="filter0_f_3_23"
                            x="-509.978"
                            y="0"
                            width="3013.85"
                            height="1796"
                            filterUnits="userSpaceOnUse"
                            color-interpolation-filters="sRGB"
                          >
                            <feFlood
                              flood-opacity="0"
                              result="BackgroundImageFix"
                            />
                            <feBlend
                              mode="normal"
                              in="SourceGraphic"
                              in2="BackgroundImageFix"
                              result="shape"
                            />
                            <feGaussianBlur
                              stdDeviation="150"
                              result="effect1_foregroundBlur_3_23"
                            />
                          </filter>
                        </defs>
                      </svg>
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
                              <PreviewFrame
                                url={liveUrl}
                                device={previewDevice}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                  <h3 className="text-lg font-semibold mb-1">
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
                            <div className="flex items-center justify-center h-full relative">
                              <div className="text-center z-10">
                                <h3 className="text-lg font-semibold mb-2">
                                  No File Open
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  Select a file from the explorer to start
                                  editing
                                </p>
                              </div>
                              <svg
                                className=" absolute z-0 inset-0 w-full"
                                viewBox="0 0 1920 1796"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g filter="url(#filter0_f_3_23)">
                                  <path
                                    d="M13.3671 760C433.367 1154 1526.03 617.5 2019.87 300L2203.87 1237.5L313.867 1496C-193.5 1081.5 -406.633 366 13.3671 760Z"
                                    fill="#FA6000"
                                  />
                                </g>
                                <defs>
                                  <filter
                                    id="filter0_f_3_23"
                                    x="-509.978"
                                    y="0"
                                    width="3013.85"
                                    height="1796"
                                    filterUnits="userSpaceOnUse"
                                    color-interpolation-filters="sRGB"
                                  >
                                    <feFlood
                                      flood-opacity="0"
                                      result="BackgroundImageFix"
                                    />
                                    <feBlend
                                      mode="normal"
                                      in="SourceGraphic"
                                      in2="BackgroundImageFix"
                                      result="shape"
                                    />
                                    <feGaussianBlur
                                      stdDeviation="150"
                                      result="effect1_foregroundBlur_3_23"
                                    />
                                  </filter>
                                </defs>
                              </svg>
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

            {showAiChat && (
              <>
                <ResizableHandle />
                <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
                  <Chat onClose={() => setShowAiChat(false)} />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default IDEComponent;
