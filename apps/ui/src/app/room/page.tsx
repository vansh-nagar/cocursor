"use client";

import React, { useEffect, useRef } from "react";
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

import { Check, Plus, RefreshCw } from "lucide-react";

import Editor from "@/components/mine/editor";
import FolderPreview from "@/components/ide-component/FolderPreview";
import NavBar from "@/components/ide-component/NavBar";
import Chat from "@/components/ide-component/Chat";
import TerminalComponent from "@/components/ide-component/terminal";
import { useIDEStore } from "@/stores/ideStore";
import { useTopbar } from "@/hooks/topbar";
import { useExplorer } from "@/hooks/explorer";
import { useKeyShortcutListeners } from "@/hooks/key-shortcut-listners";

const IDEComponent = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const { liveUrl } = useIDEStore();
  const { activeTab } = useIDEStore();

  const { openTabs, currentTabId, setCurrentTabId, handleCloseTab } =
    useTopbar();

  const {
    toggleFolder,
    fileStructure,
    expandedFolders,
    selectedFile,
    handleFileClick,
    handleSaveCurrentFile,
  } = useExplorer({
    currentTabId,
    openTabs,
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
    handleSaveCurrentFile,
    handleCloseTab,
    currentTabId,
  });

  const currentTab = openTabs.find((tab) => tab.id === currentTabId);

  // 🌐 WebSocket Setup
  useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:8080");

    wsRef.current.onopen = () => {
      wsRef.current?.send(
        JSON.stringify({
          type: "join",
          roomId: "example-room-id",
        }),
      );
    };

    wsRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const Eview = useIDEStore.getState().editorView;
      if (!Eview) return;

      if (message.type === "FileContent") {
        Eview.dispatch({
          changes: {
            from: 0,
            to: Eview.state.doc.length,
            insert: message.FileContent,
          },
        });
      }
    };

    return () => wsRef.current?.close();
  }, []);

  // Fix for SharedArrayBuffer: set crossOriginIsolated headers
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!window.crossOriginIsolated) {
        console.warn(
          "This page is not crossOriginIsolated. SharedArrayBuffer may not work as expected. " +
            "Make sure your server sets the following headers: " +
            "Cross-Origin-Opener-Policy: same-origin and Cross-Origin-Embedder-Policy: require-corp.",
        );
      }
    }
  }, []);

  const sendFileContent = ({ content }: { content: string }) => {
    if (!wsRef.current) return;

    wsRef.current.send(
      JSON.stringify({
        type: "FileContent",
        FileContent: content,
        roomId: "example-room-id",
      }),
    );
  };

  return (
    <TooltipProvider>
      <div className=" h-screen flex-1 ">
        <div className="flex-1 flex flex-col h-full">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Explorer */}
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

            {/* Editor Section */}
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
                />

                <ResizablePanelGroup direction="vertical" className="flex-1">
                  <ResizablePanel defaultSize={showTerminal ? 70 : 100}>
                    <div className="h-full overflow-hidden bg-background">
                      {activeTab === "preview" ? (
                        liveUrl ? (
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
                        )
                      ) : currentTab ? (
                        <div className="h-full relative">
                          <Editor
                            ws={wsRef.current}
                            sendFileContent={sendFileContent}
                          />

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
                          <h3 className="text-lg font-semibold">
                            No File Open
                          </h3>
                        </div>
                      )}
                    </div>
                  </ResizablePanel>

                  <ResizablePanel>
                    {showTerminal && <TerminalComponent />}
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </ResizablePanel>

            <ResizableHandle />

            {/* AI Chat */}
            {showAiChat && (
              <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                <Chat onClose={() => setShowAiChat(false)} />
              </ResizablePanel>
            )}
          </ResizablePanelGroup>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default IDEComponent;
