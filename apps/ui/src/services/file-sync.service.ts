/**
 * File Sync Service
 *
 * Manages bidirectional file synchronization between:
 * - Editor (CodeMirror)
 * - Database (Convex)
 * - WebContainer filesystem
 *
 * Sync flows:
 * 1. Editor → DB → WebContainer (user edits)
 * 2. WebContainer → DB → Editor (external changes from npm install, generators, etc.)
 * 3. Project Load: DB → WebContainer (initial mount)
 */

import { EventEmitter } from "events";
import { getWebContainerService } from "./webcontainer.service";
import { FileSystemTree } from "@webcontainer/api";

// Types for file operations
export interface FileData {
  id?: string;
  projectId: string;
  path: string;
  content: string;
  updatedAt?: Date;
}

export interface FileSyncEvent {
  type: "update" | "create" | "delete" | "external-update";
  projectId: string;
  path: string;
  content?: string;
}

// Debounce utility
type DebouncedSaveFunc = (
  projectId: string,
  path: string,
  content: string,
) => void;

function debounce(func: DebouncedSaveFunc, wait: number): DebouncedSaveFunc {
  let timeout: NodeJS.Timeout | null = null;
  return (projectId: string, path: string, content: string) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(projectId, path, content), wait);
  };
}

class FileSyncService extends EventEmitter {
  private static instance: FileSyncService | null = null;
  private writeQueue: Map<string, { content: string; projectId: string }> =
    new Map();
  private isProcessingQueue: boolean = false;
  private debouncedSaves: Map<string, DebouncedSaveFunc> = new Map();
  private currentProjectId: string | null = null;
  private initialized: boolean = false;

  private constructor() {
    super();
    console.log("[FileSyncService] Initialized");
  }

  static getInstance(): FileSyncService {
    if (!FileSyncService.instance) {
      FileSyncService.instance = new FileSyncService();
    }
    return FileSyncService.instance;
  }

  /**
   * Initialize the sync service for a project
   */
  async initializeProject(projectId: string): Promise<void> {
    this.currentProjectId = projectId;
    this.initialized = true;
    console.log(`[FileSyncService] Initialized for project: ${projectId}`);
  }

  /**
   * Load project files from DB and return as FileSystemTree for WebContainer
   */
  async loadProjectFiles(
    projectId: string,
  ): Promise<{ files: FileData[]; tree: FileSystemTree }> {
    console.log(`[FileSyncService] Loading files for project: ${projectId}`);

    try {
      const response = await fetch(`/api/files?projectId=${projectId}`);
      if (!response.ok) {
        throw new Error(`Failed to load files: ${response.statusText}`);
      }

      const files: FileData[] = await response.json();
      const tree = this.filesToTree(files);

      console.log(`[FileSyncService] Loaded ${files.length} files`);
      return { files, tree };
    } catch (error) {
      console.error("[FileSyncService] Error loading files:", error);
      throw error;
    }
  }

  /**
   * Convert flat file array to FileSystemTree structure
   */
  private filesToTree(files: FileData[]): FileSystemTree {
    const tree: FileSystemTree = {};

    for (const file of files) {
      const parts = file.path.split("/").filter(Boolean);
      let current: FileSystemTree = tree;

      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = { directory: {} };
        }
        const node = current[part];
        if ("directory" in node) {
          current = node.directory as FileSystemTree;
        }
      }

      const fileName = parts[parts.length - 1];
      current[fileName] = {
        file: { contents: file.content },
      };
    }

    return tree;
  }

  /**
   * Save file to DB with debouncing
   * Called when editor content changes
   */
  saveFile(
    projectId: string,
    path: string,
    content: string,
    immediate: boolean = false,
  ): void {
    const key = `${projectId}:${path}`;

    if (immediate) {
      this.performSave(projectId, path, content);
      return;
    }

    // Get or create debounced save function for this file
    if (!this.debouncedSaves.has(key)) {
      this.debouncedSaves.set(
        key,
        debounce((pId: string, p: string, c: string) => {
          this.performSave(pId, p, c);
        }, 1000), // 1 second debounce
      );
    }

    const debouncedSave = this.debouncedSaves.get(key)!;
    debouncedSave(projectId, path, content);
  }

  /**
   * Actually perform the save operation
   */
  private async performSave(
    projectId: string,
    path: string,
    content: string,
  ): Promise<void> {
    // Add to queue
    const key = `${projectId}:${path}`;
    this.writeQueue.set(key, { content, projectId });

    // Process queue if not already processing
    if (!this.isProcessingQueue) {
      this.processQueue();
    }
  }

  /**
   * Process the write queue to prevent race conditions
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (this.writeQueue.size > 0) {
      const entries = Array.from(this.writeQueue.entries());
      this.writeQueue.clear();

      for (const [key, { content, projectId }] of entries) {
        const [, ...pathParts] = key.split(":");
        const path = pathParts.join(":"); // Handle paths with colons

        try {
          console.log(`[FileSyncService] Saving to DB: ${path}`);

          // 1. Save to database
          const response = await fetch("/api/files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId, path, content }),
          });

          if (!response.ok) {
            throw new Error(`Failed to save file: ${response.statusText}`);
          }

          const savedFile = await response.json();
          console.log(`[FileSyncService] Saved to DB: ${path}`);

          // 2. Write to WebContainer
          const wcs = getWebContainerService();
          if (wcs.isBooted()) {
            await wcs.writeFile(path, content);
            console.log(`[FileSyncService] Written to WebContainer: ${path}`);
          }

          // 3. Emit sync event
          this.emit("file:synced", {
            type: "update",
            projectId,
            path,
            content,
          } as FileSyncEvent);
        } catch (error) {
          console.error(`[FileSyncService] Error saving file ${path}:`, error);
          this.emit("file:error", { path, error });
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Handle external file change from WebContainer
   * (e.g., from npm install, build tools)
   */
  async handleExternalChange(
    projectId: string,
    path: string,
    content: string,
  ): Promise<void> {
    console.log(`[FileSyncService] External change detected: ${path}`);

    try {
      // 1. Save to database
      const response = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, path, content }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to save external change: ${response.statusText}`,
        );
      }

      // 2. Emit event for editor to update
      this.emit("file:external-update", {
        type: "external-update",
        projectId,
        path,
        content,
      } as FileSyncEvent);
    } catch (error) {
      console.error(`[FileSyncService] Error handling external change:`, error);
    }
  }

  /**
   * Create a new file
   */
  async createFile(
    projectId: string,
    path: string,
    content: string = "",
  ): Promise<FileData> {
    console.log(`[FileSyncService] Creating file: ${path}`);

    // 1. Save to database
    const response = await fetch("/api/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, path, content }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create file: ${response.statusText}`);
    }

    const file = await response.json();

    // 2. Write to WebContainer
    const wcs = getWebContainerService();
    if (wcs.isBooted()) {
      await wcs.writeFile(path, content);
    }

    // 3. Emit event
    this.emit("file:created", {
      type: "create",
      projectId,
      path,
      content,
    } as FileSyncEvent);

    return file;
  }

  /**
   * Delete a file
   */
  async deleteFile(projectId: string, path: string): Promise<void> {
    console.log(`[FileSyncService] Deleting file: ${path}`);

    // 1. Delete from database
    const response = await fetch(
      `/api/files?projectId=${projectId}&path=${encodeURIComponent(path)}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }

    // 2. Delete from WebContainer
    const wcs = getWebContainerService();
    if (wcs.isBooted()) {
      try {
        await wcs.deleteFile(path);
      } catch {
        // File might not exist in container, ignore
      }
    }

    // 3. Emit event
    this.emit("file:deleted", {
      type: "delete",
      projectId,
      path,
    } as FileSyncEvent);
  }

  /**
   * Get current project ID
   */
  getProjectId(): string | null {
    return this.currentProjectId;
  }

  /**
   * Force immediate save of all pending changes
   */
  async flush(): Promise<void> {
    // Clear all debounced saves and trigger immediate saves
    for (const [key] of this.debouncedSaves) {
      const [projectId, ...pathParts] = key.split(":");
      const path = pathParts.join(":");
      const pending = this.writeQueue.get(key);
      if (pending) {
        await this.performSave(projectId, path, pending.content);
      }
    }
  }
}

// Export singleton instance getter
export const getFileSyncService = () => FileSyncService.getInstance();

export default FileSyncService;
