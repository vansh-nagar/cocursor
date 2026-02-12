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
import { Plus, RefreshCw, Loader2 } from "lucide-react";
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
import ActivityBar from "@/components/ide-component/activity-bar";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { FileSystemTree } from "@webcontainer/api";
import { useWsRtcConnection } from "@/hooks/rtc-ws";

interface IDEComponentProps {
  projectId?: string;
}

const IDEComponent = ({ projectId }: IDEComponentProps) => {
  // Fetch project data from Convex

  const roomConnection = useWsRtcConnection({ roomId: projectId || "" });

  console.log("Fetched project data:", projectId);

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
    handleCreateFile,
    handleCreateFolder,
    handleDeleteNode,
    handleRenameNode,
  } = useExplorer({
    projectId,
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

  const { initializeWebContainer, webContainerRef } = useWebContainer({
    projectId,
  });

  const getProjectData = useQuery(
    api.project.get,
    projectId ? { id: projectId as any } : "skip",
  );
  useEffect(() => {
    if (getProjectData) {
      initializeWebContainer(getProjectData.fileTree as FileSystemTree).catch(
        (error) => {
          console.error("[IDE] Failed to initialize WebContainer:", error);
        },
      );
    }
  }, [initializeWebContainer, getProjectData]);

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
      <div className="h-screen overflow-hidden w-full flex items-center justify-center bg-background">
        <svg
          className=" absolute z-10 inset-0 w-full"
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
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
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
            <ActivityBar
              showExplorer={showExplorer}
              setShowExplorer={setShowExplorer}
              showTerminal={showTerminal}
              setShowTerminal={setShowTerminal}
              showAiChat={showAiChat}
              setShowAiChat={setShowAiChat}
            />

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
                            colorInterpolationFilters="sRGB"
                          >
                            <feFlood
                              floodOpacity="0"
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
                                projectId={projectId}
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
                                    colorInterpolationFilters="sRGB"
                                  >
                                    <feFlood
                                      floodOpacity="0"
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
                  <Chat
                    onClose={() => setShowAiChat(false)}
                    projectId={projectId}
                    roomConnection={roomConnection}
                  />
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
