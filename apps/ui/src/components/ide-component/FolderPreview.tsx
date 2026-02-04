import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Folders,
  File,
  FolderClosed,
} from "lucide-react";
import { FileSystemTree } from "@webcontainer/api";

interface FolderPreviewProps {
  fileStructure: FileSystemTree;
  expandedFolders: Set<string>;
  selectedFile: string | null;
  onToggleFolder: (folderName: string) => void;
  onFileClick: (path: string, name: string) => void;
}

const FolderPreview: React.FC<FolderPreviewProps> = ({
  fileStructure,
  expandedFolders,
  selectedFile,
  onToggleFolder,
  onFileClick,
}) => {
  const renderFileTree = (
    tree: FileSystemTree,
    path = "",
  ): React.ReactNode[] => {
    return Object.entries(tree).map(([name, node]) => {
      const fullPath = path ? `${path}/${name}` : name;
      if ("directory" in node) {
        const isExpanded = expandedFolders.has(fullPath);
        return (
          <div key={fullPath}>
            <div
              className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent cursor-pointer text-sm rounded-sm group"
              onClick={() => onToggleFolder(fullPath)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 flex-shrink-0" />
              ) : (
                <FolderClosed className="h-4 w-4 flex-shrink-0" />
              )}
              <span className="font-medium truncate">{name}</span>
            </div>
            {isExpanded && (
              <div className="ml-4 border-l border-border pl-2">
                {renderFileTree(node.directory as FileSystemTree, fullPath)}
              </div>
            )}
          </div>
        );
      }
      return (
        <div
          key={fullPath}
          className={`flex items-center gap-2 px-2 py-1.5 pl-6 hover:bg-accent cursor-pointer text-sm rounded-sm group ${
            selectedFile === fullPath ? "bg-accent" : ""
          }`}
          onClick={() => onFileClick(fullPath, name)}
        >
          <File className="h-4 w-4 text-orange-600 flex-shrink-0" />
          <span className="truncate">{name}</span>
        </div>
      );
    });
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-3">
        <div className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Project Files
        </div>
        {renderFileTree(fileStructure)}
      </div>
    </ScrollArea>
  );
};

export default FolderPreview;
