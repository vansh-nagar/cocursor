"use client";

import React, { useEffect, useRef, useCallback, useState, useMemo } from "react";
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
import { Plus, RefreshCw, Loader2, FolderPlus } from "lucide-react";
import FolderPreview, { FolderPreviewRef } from "@/components/ide-component/FolderPreview";
import NavBar from "@/components/ide-component/NavBar";
import TerminalComponent from "@/components/ide-component/terminal";
import CodeEditor from "@/components/ide-component/code-editor";
import PreviewFrame from "@/components/ide-component/PreviewFrame";
import { motion, AnimatePresence } from "motion/react";
import { useIDEStore } from "@/stores/ideStore";
import { useAgentToolRunner } from "@/hooks/agent-tool-runner";
import { projectRootNameOf } from "@/lib/project-paths";
import { useTopbar } from "@/hooks/topbar";
import { useExplorer } from "@/hooks/explorer";
import { useKeyShortcutListeners } from "@/hooks/key-shortcut-listners";
import { useWebContainer } from "@/hooks/webcontainer";
import Chat from "@/components/ide-component/Chat";
import ActivityBar from "@/components/ide-component/activity-bar";
import SearchPanel from "@/components/ide-component/SearchPanel";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { FileSystemTree } from "@webcontainer/api";
import { useWsRtcConnection } from "@/hooks/rtc-ws";
import type { ImperativePanelHandle } from "react-resizable-panels";

interface IDEComponentProps {
  projectId?: string;
}

const IDEComponent = ({ projectId }: IDEComponentProps) => {
  // Fetch project data from Convex

  // Collaboration mounts only when the chat panel is open. It used to mount
  // for every project page, opening a socket and joining a room whether or not
  // anyone wanted to collaborate.
  const [collabEnabled, setCollabEnabled] = useState(false);
  const roomConnection = useWsRtcConnection({
    roomId: projectId || "",
    enabled: collabEnabled && Boolean(projectId),
  });

  console.log("Fetched project data:", projectId);

  const {
    liveUrl,
    activeTab,
    setActiveTab,
    isLoading,
    loadingMessage,
    previewDevice,
    setPreviewDevice,
    resetForProject,
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
    getFileContent,
    persistFile,
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
    showSearch,
    setShowSearch,
    showTerminal,
    setShowTerminal,
    showAiChat,
    setShowAiChat,
  } = useKeyShortcutListeners({
    handleSaveCurrentFile,
    handleCloseTab,
    currentTabId,
  });

  useEffect(() => {
    if (showAiChat) setCollabEnabled(true);
  }, [showAiChat]);

  const folderPreviewRef = useRef<FolderPreviewRef>(null);
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);

  const { initializeWebContainer, runCommand } = useWebContainer({ projectId });

  const getProjectData = useQuery(
    api.project.get,
    projectId ? { id: projectId as Id<"Project"> } : "skip",
  );

  // Rebind the (singleton) store to this project before anything reads it.
  // Client-side navigation between rooms never reloads the page, so without
  // this the previous project's tree, preview URL and editor view leak in.
  useEffect(() => {
    resetForProject(projectId ?? null);
  }, [projectId, resetForProject]);

  // getProjectData gets a fresh object identity on every Convex push (any file
  // save re-runs project.get), so guard on the tree itself rather than the
  // wrapper object to avoid re-initialising on every remote change.
  const fileTree = getProjectData?.fileTree;
  useEffect(() => {
    if (!fileTree) return;
    initializeWebContainer(fileTree as FileSystemTree).catch((error) => {
      console.error("[IDE] Failed to initialize WebContainer:", error);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializeWebContainer, Boolean(fileTree)]);

  // Teardown is owned by useWebContainer, which also clears the ref and the
  // module-level boot state so re-entering a room can boot again.

  const currentTab = openTabs.find((tab) => tab.id === currentTabId);

  const currentTabRef = useRef(currentTab);
  useEffect(() => {
    currentTabRef.current = currentTab;
  }, [currentTab]);

  // Sent to the model on every turn. Stable identity so the chat transport is
  // not rebuilt on each render.
  const buildProjectContext = useCallback(() => {
    const tree = useIDEStore.getState().fileStructure;
    const root = projectRootNameOf(tree);
    const tab = currentTabRef.current;

    const walk = (node: FileSystemTree, base = ""): string[] => {
      const out: string[] = [];
      for (const [name, child] of Object.entries(node)) {
        const path = base ? `${base}/${name}` : name;
        if ("directory" in child) out.push(...walk(child.directory, path));
        else out.push(path);
      }
      return out;
    };

    const strip = (p: string) =>
      root && p.startsWith(`${root}/`) ? p.slice(root.length + 1) : p;

    return {
      projectName: getProjectData?.name,
      root: root || "/",
      files: walk(tree).map(strip).sort(),
      activeFilePath: tab ? strip(tab.path) : null,
      activeFileContent: tab?.content ?? null,
    };
  }, [getProjectData?.name]);

  const explorerActions = useMemo(
    () => ({ getFileContent, handleCreateFile, handleDeleteNode, handleRenameNode }),
    [getFileContent, handleCreateFile, handleDeleteNode, handleRenameNode],
  );

  const runTool = useAgentToolRunner({
    projectId,
    explorer: explorerActions,
    persistFile,
    runCommand,
    // Keep an open tab in sync when the agent rewrites the file being viewed.
    onFileWritten: (uiPath, content) => {
      setOpenTabs((tabs) =>
        tabs.map((t) =>
          t.path === uiPath ? { ...t, content, isDirty: false } : t,
        ),
      );
    },
  });

  const handleEditorChange = useCallback(
    (content: string) => {
      if (currentTabId) {
        handleFileContentChange(currentTabId, content);
      }
    },
    [currentTabId, handleFileContentChange],
  );

  // Refs for imperative panel control
  const explorerPanelRef = useRef<ImperativePanelHandle>(null);
  const aiChatPanelRef = useRef<ImperativePanelHandle>(null);

  // Sync panel collapse/expand with state
  useEffect(() => {
    const panel = explorerPanelRef.current;
    if (!panel) return;
    if (showExplorer || showSearch) {
      if (panel.isCollapsed()) panel.expand();
    } else {
      if (!panel.isCollapsed()) panel.collapse();
    }
  }, [showExplorer, showSearch]);

  useEffect(() => {
    const panel = aiChatPanelRef.current;
    if (!panel) return;
    if (showAiChat) {
      if (panel.isCollapsed()) panel.expand();
    } else {
      if (!panel.isCollapsed()) panel.collapse();
    }
  }, [showAiChat]);

  if (isLoading) {
    return (
      <div className="h-screen overflow-hidden w-full flex items-center justify-center bg-background">
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
              showSearch={showSearch}
              setShowSearch={setShowSearch}
              showTerminal={showTerminal}
              setShowTerminal={setShowTerminal}
              showAiChat={showAiChat}
              setShowAiChat={setShowAiChat}
            />


            <ResizablePanel
              ref={explorerPanelRef}
              defaultSize={showExplorer || showSearch ? 20 : 0}
              minSize={15}
              maxSize={40}
              collapsible={true}
              collapsedSize={0}
              onCollapse={() => {
                if (showExplorer) setShowExplorer(false);
                if (showSearch) setShowSearch(false);
              }}
              onExpand={() => {
                if (!showExplorer && !showSearch) setShowExplorer(true);
              }}
            >
              <div className="h-full bg-muted/30 flex flex-col">
                {showSearch ? (
                  <SearchPanel
                    fileStructure={fileStructure}
                    onFileClick={handleFileClick}
                  />
                ) : (
                  <>
                    <div className="px-4 py-3 font-semibold text-sm border-b flex items-center justify-between">
                      <span>Explorer</span>
                      <div className="flex gap-0.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() =>
                                folderPreviewRef.current?.startNewFile()
                              }
                            >
                              <Plus className="h-3.5 w-3.5" />
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
                              onClick={() =>
                                folderPreviewRef.current?.startNewFolder()
                              }
                            >
                              <FolderPlus className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>New Folder</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <FolderPreview
                      ref={folderPreviewRef}
                      fileStructure={fileStructure}
                      expandedFolders={expandedFolders}
                      selectedFile={selectedFile}
                      onToggleFolder={toggleFolder}
                      onFileClick={handleFileClick}
                      onCreateFile={handleCreateFile}
                      onCreateFolder={handleCreateFolder}
                      onDeleteNode={handleDeleteNode}
                      onRenameNode={handleRenameNode}
                    />
                  </>
                )}
              </div>
            </ResizablePanel>
            <ResizableHandle />

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
                  fileStructure={fileStructure}
                  projectName={getProjectData?.name}
                />

                <div className="flex flex-col flex-1 overflow-hidden">
                  <div className="flex-1 overflow-hidden">
                    <div className="h-full overflow-hidden relative">
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
                                collab={
                                  collabEnabled && roomConnection.isConnected
                                    ? {
                                        roomId: projectId!,
                                        send: roomConnection.send,
                                        subscribe: roomConnection.subscribe,
                                      }
                                    : undefined
                                }
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
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  <div
                    className={`border-t border-border shrink-0 ${
                      isTerminalMaximized ? "h-[60vh]" : "h-[220px]"
                    } ${!showTerminal ? "hidden" : ""}`}
                  >
                    <TerminalComponent
                      onClose={() => setShowTerminal(false)}
                      onToggleMaximize={() =>
                        setIsTerminalMaximized((prev) => !prev)
                      }
                      isMaximized={isTerminalMaximized}
                    />
                  </div>
                </div>
              </div>
            </ResizablePanel>


            <ResizableHandle />
            <ResizablePanel
              ref={aiChatPanelRef}
              defaultSize={showAiChat ? 25 : 0}
              minSize={15}
              maxSize={40}
              collapsible={true}
              collapsedSize={0}
              onCollapse={() => {
                if (showAiChat) setShowAiChat(false);
              }}
              onExpand={() => {
                if (!showAiChat) setShowAiChat(true);
              }}
            >
              <Chat
                onClose={() => setShowAiChat(false)}
                projectId={projectId}
                roomConnection={roomConnection}
                buildProjectContext={buildProjectContext}
                runTool={runTool}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default IDEComponent;
