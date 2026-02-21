"use client";

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  FolderClosed,
  File,
  FilePlus,
  FolderPlus,
  Pencil,
  Trash2,
} from "lucide-react";
import { FileSystemTree } from "@webcontainer/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FolderPreviewProps {
  fileStructure: FileSystemTree;
  expandedFolders: Set<string>;
  selectedFile: string | null;
  onToggleFolder: (folderName: string) => void;
  onFileClick: (path: string, name: string) => void;
  onCreateFile?: (path: string, content?: string) => void;
  onCreateFolder?: (path: string) => void;
  onDeleteNode?: (path: string) => void;
  onRenameNode?: (oldPath: string, newPath: string) => void;
}

// --- Context Menu ---
interface ContextMenuState {
  x: number;
  y: number;
  path: string;
  name: string;
  type: "file" | "folder" | "root";
}

// --- Inline Input ---
interface InlineInputState {
  parentPath: string;
  type: "file" | "folder";
}

// --- Drag State ---
interface DragState {
  sourcePath: string;
  sourceName: string;
  sourceType: "file" | "folder";
}

export interface FolderPreviewRef {
  startNewFile: () => void;
  startNewFolder: () => void;
}

const FolderPreview = forwardRef<FolderPreviewRef, FolderPreviewProps>(({
  fileStructure,
  expandedFolders,
  selectedFile,
  onToggleFolder,
  onFileClick,
  onCreateFile,
  onCreateFolder,
  onDeleteNode,
  onRenameNode,
}, ref) => {
  useImperativeHandle(ref, () => ({
    startNewFile: () => {
      if (!expandedFolders.has("vanilla-web-app")) {
        onToggleFolder("vanilla-web-app");
      }
      setInlineInput({ parentPath: "vanilla-web-app", type: "file" });
      setNewItemName("");
    },
    startNewFolder: () => {
      if (!expandedFolders.has("vanilla-web-app")) {
        onToggleFolder("vanilla-web-app");
      }
      setInlineInput({ parentPath: "vanilla-web-app", type: "folder" });
      setNewItemName("");
    },
  }));
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [inlineInput, setInlineInput] = useState<InlineInputState | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ path: string; name: string } | null>(null);

  const contextMenuRef = useRef<HTMLDivElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Auto-focus inline input
  useEffect(() => {
    if (inlineInput && inlineInputRef.current) {
      inlineInputRef.current.focus();
    }
  }, [inlineInput]);

  // Auto-focus rename input
  useEffect(() => {
    if (renamingPath && renameInputRef.current) {
      renameInputRef.current.focus();
      // Select filename without extension
      const dotIndex = renameValue.lastIndexOf(".");
      if (dotIndex > 0) {
        renameInputRef.current.setSelectionRange(0, dotIndex);
      } else {
        renameInputRef.current.select();
      }
    }
  }, [renamingPath]);

  // --- Context Menu Handler ---
  const handleContextMenu = useCallback(
    (
      e: React.MouseEvent,
      path: string,
      name: string,
      type: "file" | "folder" | "root"
    ) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, path, name, type });
    },
    []
  );

  // --- Inline Create ---
  const startInlineCreate = useCallback(
    (parentPath: string, type: "file" | "folder") => {
      setInlineInput({ parentPath, type });
      setNewItemName("");
      setContextMenu(null);
      // Auto-expand the parent folder
      if (!expandedFolders.has(parentPath)) {
        onToggleFolder(parentPath);
      }
    },
    [expandedFolders, onToggleFolder]
  );

  const confirmInlineCreate = useCallback(() => {
    if (!inlineInput || !newItemName.trim()) {
      setInlineInput(null);
      return;
    }

    const fullPath = inlineInput.parentPath
      ? `${inlineInput.parentPath}/${newItemName.trim()}`
      : newItemName.trim();

    if (inlineInput.type === "file") {
      onCreateFile?.(`/${fullPath}`, "");
    } else {
      onCreateFolder?.(`/${fullPath}`);
    }

    setInlineInput(null);
    setNewItemName("");
  }, [inlineInput, newItemName, onCreateFile, onCreateFolder]);

  // --- Rename ---
  const startRename = useCallback(
    (path: string, name: string) => {
      setRenamingPath(path);
      setRenameValue(name);
      setContextMenu(null);
    },
    []
  );

  const confirmRename = useCallback(() => {
    if (!renamingPath || !renameValue.trim()) {
      setRenamingPath(null);
      return;
    }

    const parts = renamingPath.split("/");
    parts[parts.length - 1] = renameValue.trim();
    const newPath = parts.join("/");

    if (newPath !== renamingPath) {
      onRenameNode?.(`/${renamingPath}`, `/${newPath}`);
    }

    setRenamingPath(null);
    setRenameValue("");
  }, [renamingPath, renameValue, onRenameNode]);

  // --- Delete ---
  const handleDelete = useCallback(
    (path: string, name: string) => {
      setContextMenu(null);
      setDeleteTarget({ path, name });
    },
    []
  );

  const confirmDelete = useCallback(() => {
    if (deleteTarget) {
      onDeleteNode?.(`/${deleteTarget.path}`);
      setDeleteTarget(null);
    }
  }, [deleteTarget, onDeleteNode]);

  // --- Drag & Drop ---
  const handleDragStart = useCallback(
    (e: React.DragEvent, path: string, name: string, type: "file" | "folder") => {
      e.stopPropagation();
      setDragState({ sourcePath: path, sourceName: name, sourceType: type });
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", path);
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, targetPath: string, targetType: "folder" | "root") => {
      e.preventDefault();
      e.stopPropagation();
      if (!dragState) return;

      // Can't drop into itself or its own children
      if (
        dragState.sourcePath === targetPath ||
        targetPath.startsWith(`${dragState.sourcePath}/`)
      ) {
        e.dataTransfer.dropEffect = "none";
        return;
      }

      e.dataTransfer.dropEffect = "move";
      setDropTarget(targetPath);
    },
    [dragState]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetFolderPath: string) => {
      e.preventDefault();
      e.stopPropagation();
      setDropTarget(null);

      if (!dragState) return;

      const newPath = targetFolderPath
        ? `${targetFolderPath}/${dragState.sourceName}`
        : dragState.sourceName;

      if (newPath !== dragState.sourcePath) {
        onRenameNode?.(`/${dragState.sourcePath}`, `/${newPath}`);
      }

      setDragState(null);
    },
    [dragState, onRenameNode]
  );

  const handleDragEnd = useCallback(() => {
    setDragState(null);
    setDropTarget(null);
  }, []);

  // --- Render Inline Input ---
  const renderInlineInput = (parentPath: string) => {
    if (!inlineInput || inlineInput.parentPath !== parentPath) return null;

    return (
      <div className="flex items-center gap-1.5 px-2 py-1 ml-6">
        {inlineInput.type === "folder" ? (
          <FolderClosed className="h-4 w-4 text-blue-400 shrink-0" />
        ) : (
          <File className="h-4 w-4 text-[#FA6000] shrink-0" />
        )}
        <input
          ref={inlineInputRef}
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") confirmInlineCreate();
            if (e.key === "Escape") setInlineInput(null);
          }}
          onBlur={confirmInlineCreate}
          className="flex-1 bg-accent/50 border border-primary/50 rounded px-1.5 py-0.5 text-sm outline-none focus:border-primary min-w-0"
          placeholder={inlineInput.type === "file" ? "filename.ext" : "folder-name"}
        />
      </div>
    );
  };

  // --- Recursive Tree Renderer ---
  const renderFileTree = (
    tree: FileSystemTree,
    path = ""
  ): React.ReactNode[] => {
    // Sort: folders first, then files, alphabetically
    const entries = Object.entries(tree).sort(([aName, aNode], [bName, bNode]) => {
      const aIsDir = "directory" in aNode;
      const bIsDir = "directory" in bNode;
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return aName.localeCompare(bName);
    });

    return entries.map(([name, node]) => {
      const fullPath = path ? `${path}/${name}` : name;

      if ("directory" in node) {
        const isExpanded = expandedFolders.has(fullPath);
        const isDropTarget = dropTarget === fullPath;
        const isBeingRenamed = renamingPath === fullPath;

        return (
          <div key={fullPath}>
            <div
              className={`flex items-center gap-1.5 px-2 py-1.5 hover:bg-accent cursor-pointer text-sm rounded-sm group transition-colors ${
                isDropTarget ? "bg-primary/15 ring-1 ring-primary/40" : ""
              }`}
              onClick={() => onToggleFolder(fullPath)}
              onContextMenu={(e) => handleContextMenu(e, fullPath, name, "folder")}
              draggable
              onDragStart={(e) => handleDragStart(e, fullPath, name, "folder")}
              onDragOver={(e) => handleDragOver(e, fullPath, "folder")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, fullPath)}
              onDragEnd={handleDragEnd}
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-400 shrink-0" />
              ) : (
                <FolderClosed className="h-4 w-4 text-blue-400 shrink-0" />
              )}

              {isBeingRenamed ? (
                <input
                  ref={renameInputRef}
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === "Enter") confirmRename();
                    if (e.key === "Escape") setRenamingPath(null);
                  }}
                  onBlur={confirmRename}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-accent/50 border border-primary/50 rounded px-1.5 py-0.5 text-sm outline-none focus:border-primary min-w-0"
                />
              ) : (
                <span className="font-medium truncate flex-1">{name}</span>
              )}

              {/* Hover actions */}
              {!isBeingRenamed && (
                <div className="hidden group-hover:flex items-center gap-0.5 ml-auto">
                  <button
                    className="p-0.5 hover:bg-muted rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      startInlineCreate(fullPath, "file");
                    }}
                    title="New File"
                  >
                    <FilePlus className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button
                    className="p-0.5 hover:bg-muted rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      startInlineCreate(fullPath, "folder");
                    }}
                    title="New Folder"
                  >
                    <FolderPlus className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button
                    className="p-0.5 hover:bg-muted rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      startRename(fullPath, name);
                    }}
                    title="Rename"
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  <button
                    className="p-0.5 hover:bg-muted rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(fullPath, name);
                    }}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-400" />
                  </button>
                </div>
              )}
            </div>

            {isExpanded && (
              <div className="ml-3 border-l border-border/50 pl-2">
                {renderInlineInput(fullPath)}
                {renderFileTree(node.directory as FileSystemTree, fullPath)}
              </div>
            )}
          </div>
        );
      }

      // --- File Node ---
      const isBeingRenamed = renamingPath === fullPath;

      return (
        <div
          key={fullPath}
          className={`flex items-center gap-1.5 px-2 py-1.5 pl-6 hover:bg-accent cursor-pointer text-sm rounded-sm group transition-colors ${
            selectedFile === fullPath ? "bg-accent" : ""
          }`}
          onClick={() => {
            if (!isBeingRenamed) onFileClick(fullPath, name);
          }}
          onContextMenu={(e) => handleContextMenu(e, fullPath, name, "file")}
          draggable
          onDragStart={(e) => handleDragStart(e, fullPath, name, "file")}
          onDragEnd={handleDragEnd}
        >
          <File className="h-4 w-4 text-[#FA6000] shrink-0" />

          {isBeingRenamed ? (
            <input
              ref={renameInputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") confirmRename();
                if (e.key === "Escape") setRenamingPath(null);
              }}
              onBlur={confirmRename}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-accent/50 border border-primary/50 rounded px-1.5 py-0.5 text-sm outline-none focus:border-primary min-w-0"
            />
          ) : (
            <span className="truncate flex-1">{name}</span>
          )}

          {/* Hover actions */}
          {!isBeingRenamed && (
            <div className="hidden group-hover:flex items-center gap-0.5 ml-auto">
              <button
                className="p-0.5 hover:bg-muted rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  startRename(fullPath, name);
                }}
                title="Rename"
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button
                className="p-0.5 hover:bg-muted rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(fullPath, name);
                }}
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
              </button>
            </div>
          )}
        </div>
      );
    });
  };

  // --- Root-Level Context Menu ---
  const handleRootContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, path: "", name: "", type: "root" });
    },
    []
  );

  // Root-level drop target
  const handleRootDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!dragState) return;
      e.dataTransfer.dropEffect = "move";
      setDropTarget("__root__");
    },
    [dragState]
  );

  const handleRootDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDropTarget(null);
      if (!dragState) return;

      // Move to root level
      const newPath = dragState.sourceName;
      if (newPath !== dragState.sourcePath) {
        onRenameNode?.(`/${dragState.sourcePath}`, `/${newPath}`);
      }
      setDragState(null);
    },
    [dragState, onRenameNode]
  );

  return (
    <>
      <ScrollArea className="flex-1">
        <div
          className={`p-3 min-h-full ${
            dropTarget === "__root__" ? "bg-primary/5" : ""
          }`}
          onContextMenu={handleRootContextMenu}
          onDragOver={handleRootDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleRootDrop}
        >
          <div className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
            Project Files
          </div>
          {renderInlineInput("")}
          {fileStructure && renderFileTree(fileStructure)}
        </div>
      </ScrollArea>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 min-w-[160px] bg-popover border border-border rounded-md shadow-lg py-1 text-sm animate-in fade-in-0 zoom-in-95"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {(contextMenu.type === "folder" || contextMenu.type === "root") && (
            <>
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-accent text-left transition-colors"
                onClick={() => {
                  startInlineCreate(contextMenu.path, "file");
                }}
              >
                <FilePlus className="h-4 w-4 text-muted-foreground" />
                New File
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-accent text-left transition-colors"
                onClick={() => {
                  startInlineCreate(contextMenu.path, "folder");
                }}
              >
                <FolderPlus className="h-4 w-4 text-muted-foreground" />
                New Folder
              </button>
            </>
          )}

          {contextMenu.type !== "root" && (
            <>
              {contextMenu.type === "folder" && (
                <div className="border-t border-border my-1" />
              )}
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-accent text-left transition-colors"
                onClick={() => {
                  startRename(contextMenu.path, contextMenu.name);
                }}
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
                Rename
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-accent text-left text-red-400 transition-colors"
                onClick={() => {
                  handleDelete(contextMenu.path, contextMenu.name);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-medium text-foreground">{deleteTarget?.name}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

FolderPreview.displayName = "FolderPreview";

export default FolderPreview;
