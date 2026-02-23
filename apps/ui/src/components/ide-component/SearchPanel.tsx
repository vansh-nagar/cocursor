"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileSystemTree } from "@webcontainer/api";
import { File, Search, ChevronRight, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileIconCustom } from "./file-icon";

interface SearchResult {
  path: string;
  name: string;
  type: "file" | "directory";
  matchType: "name" | "content";
  line?: number;
  preview?: string;
}

interface SearchPanelProps {
  fileStructure: FileSystemTree;
  onFileClick: (path: string, name: string) => void;
}

function searchFileSystem(
  tree: FileSystemTree,
  query: string,
  basePath: string = "",
): SearchResult[] {
  if (!query) return [];
  let results: SearchResult[] = [];
  const lowercaseQuery = query.toLowerCase();

  for (const [name, node] of Object.entries(tree)) {
    const currentPath = basePath ? `${basePath}/${name}` : name;


    if (name.toLowerCase().includes(lowercaseQuery)) {
      results.push({
        path: currentPath,
        name,
        type: "directory" in node ? "directory" : "file",
        matchType: "name",
      });
    }


    if ("file" in node && "contents" in node.file && typeof node.file.contents === "string") {
      const content = node.file.contents;
      if (content.toLowerCase().includes(lowercaseQuery)) {
        const lines = content.split("\n");
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(lowercaseQuery)) {
            results.push({
              path: currentPath,
              name,
              type: "file",
              matchType: "content",
              line: index + 1,
              preview: line.trim(),
            });
          }
        });
      }
    } else if ("directory" in node) {
      results = [
        ...results,
        ...searchFileSystem(node.directory, query, currentPath),
      ];
    }
  }

  return results;
}

const SearchPanel = ({ fileStructure, onFileClick }: SearchPanelProps) => {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    return searchFileSystem(fileStructure, query);
  }, [fileStructure, query]);


  const groupedResults = useMemo(() => {
    const groups: { [path: string]: SearchResult[] } = {};
    results.forEach((res) => {
      if (!groups[res.path]) groups[res.path] = [];
      groups[res.path].push(res);
    });
    return groups;
  }, [results]);

  return (
    <div className="h-full flex flex-col bg-muted/30">
      <div className="px-4 py-3 font-semibold text-sm border-b flex items-center justify-between">
        <span>Search</span>
      </div>
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files and content..."
            className="pl-9 h-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {query && results.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No results found for "{query}"
          </div>
        ) : (
          <div className="px-2 pb-4">
            {Object.entries(groupedResults).map(([path, fileResults]) => (
              <div key={path} className="mb-2">
                <button
                  onClick={() => onFileClick(path, fileResults[0].name)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded-md text-sm text-left group"
                >
                  <FileIconCustom filename={path.split('/').pop() || ''} className="h-4 w-4 shrink-0" />
                  <span className="truncate flex-1">{path}</span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {fileResults.length}
                  </span>
                </button>
                <div className="ml-4 space-y-1">
                  {fileResults.map((res, i) =>
                    res.matchType === "content" ? (
                      <button
                        key={`${path}-${i}`}
                        onClick={() => onFileClick(path, res.name)}
                        className="w-full flex items-start gap-2 px-2 py-1 hover:bg-accent/50 rounded text-[11px] text-left text-muted-foreground"
                      >
                        <span className="text-zinc-500 shrink-0 tabular-nums">
                          {res.line}:
                        </span>
                        <span className="line-clamp-1 italic truncate">
                          {res.preview}
                        </span>
                      </button>
                    ) : null,
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default SearchPanel;
