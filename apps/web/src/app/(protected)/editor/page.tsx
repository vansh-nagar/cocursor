"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useState } from "react";
import { Check, Plus, RefreshCw } from "lucide-react";
import { useWebContainerRef } from "@/hooks/editor/webcontainer";
import { useTopbar } from "@/hooks/editor/topbar";
import { useExplorer } from "@/hooks/editor/explorer";
import { useKeyShortcutListeners } from "@/hooks/editor/key-shortcut-listners";
import FolderPreview from "@/components/editor/FolderPreview";
import NavBar from "@/components/editor/NavBar";
import CodeEditor from "@/components/editor/code-preview";
import TerminalComponent from "@/components/editor/terminal";
import Chat from "@/components/editor/Chat";

const IDEComponent = () => {
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const { containerBooted, webContainerRef } = useWebContainerRef({
    setLiveUrl,
  });
  const {
    activeTab,
    setActiveTab,
    openTabs,
    setOpenTabs,
    currentTabId,
    setCurrentTabId,
    handleCloseTab,
  } = useTopbar();

  const {
    toggleFolder,
    fileStructure,
    setFileStructure,
    expandedFolders,
    setExpandedFolders,
    getFileContent,
    selectedFile,
    setSelectedFile,
    setFileContent,
    handleFileClick,
    handleSaveCurrentFile,
  } = useExplorer({
    currentTabId,
    openTabs,
    setOpenTabs,
    setCurrentTabId,
  });

  const {
    setShowAiChat,
    setShowTerminal,
    setShowExplorer,
    showExplorer,
    showTerminal,
    showAiChat,
  } = useKeyShortcutListeners({
    setActiveTab,
    handleSaveCurrentFile,
    handleCloseTab,
    currentTabId,
  });

  const currentTab = openTabs.find((tab) => tab.id === currentTabId);

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col h-full">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar - File Explorer */}
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
                        <TooltipContent>
                          <p>New File</p>
                        </TooltipContent>
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
                        <TooltipContent>
                          <p>Refresh</p>
                        </TooltipContent>
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
            </>
          )}

          <ResizableHandle />
          {/* Editor Panel */}
          <ResizablePanel defaultSize={60}>
            <div className="h-full flex flex-col">
              {/* Tab Bar */}
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
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleSaveCurrentFile={handleSaveCurrentFile}
                liveUrl={liveUrl}
              />

              {/* Editor Content */}
              <ResizablePanelGroup direction="vertical" className="flex-1">
                <ResizablePanel defaultSize={showTerminal ? 70 : 100}>
                  <div className="h-full overflow-hidden bg-background">
                    {activeTab === "preview" ? (
                      <div className="h-full w-full relative">
                        {liveUrl ? (
                          <iframe
                            src={liveUrl}
                            className="w-full h-full border-0"
                            title="Preview"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <h3 className="text-lg font-semibold">
                              Server Not Running
                            </h3>
                          </div>
                        )}
                      </div>
                    ) : currentTab ? (
                      <div className="h-full ">
                        <CodeEditor FileContent={currentTab.content} />
                        {currentTab.isDirty && (
                          <div className="absolute top-4 right-4">
                            <Badge variant="secondary" className="gap-2">
                              <span>Unsaved</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0"
                                onClick={handleSaveCurrentFile}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            </Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <h3 className="text-lg font-semibold">No File Open</h3>
                      </div>
                    )}
                  </div>
                </ResizablePanel>

                {showTerminal && (
                  <>
                    terminal
                    {/* <TerminalComponent /> */}
                  </>
                )}
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Sidebar - AI Chat */}
          {showAiChat && (
            <>
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                chat
                {/* <Chat onClose={() => setShowAiChat(false)} /> */}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  );
};

export default IDEComponent;
