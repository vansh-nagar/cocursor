/**
 * WebContainer Service
 * 
 * This is a singleton service that manages all WebContainer operations.
 * Responsibilities:
 * - Boot container
 * - Mount file system
 * - Handle file write events
 * - Watch FS changes (future)
 * - Run processes
 * - Stream terminal output
 * 
 * NO UI logic should be in this service.
 */

import { WebContainer, FileSystemTree, WebContainerProcess } from "@webcontainer/api";
import { EventEmitter } from "events";

// Type definitions for events
export interface FileSyncEvent {
  type: "file:update" | "file:external-update" | "file:delete" | "file:create";
  path: string;
  content?: string;
}

export interface ServerReadyEvent {
  port: number;
  url: string;
}

export interface ProcessOutputEvent {
  processId: string;
  data: string;
}

class WebContainerService extends EventEmitter {
  private static instance: WebContainerService | null = null;
  private container: WebContainer | null = null;
  private booting: boolean = false;
  private bootPromise: Promise<WebContainer> | null = null;
  private processes: Map<string, WebContainerProcess> = new Map();
  private mountedFiles: Map<string, string> = new Map(); // path -> content hash

  private constructor() {
    super();
    console.log("[WebContainerService] Initialized");
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): WebContainerService {
    if (!WebContainerService.instance) {
      WebContainerService.instance = new WebContainerService();
    }
    return WebContainerService.instance;
  }

  /**
   * Check if the container is booted
   */
  isBooted(): boolean {
    return this.container !== null;
  }

  /**
   * Get the WebContainer instance (may be null if not booted)
   */
  getContainer(): WebContainer | null {
    return this.container;
  }

  /**
   * Boot the WebContainer
   * This is idempotent - calling multiple times will return the same promise
   */
  async boot(): Promise<WebContainer> {
    if (this.container) {
      console.log("[WebContainerService] Already booted");
      return this.container;
    }

    if (this.booting && this.bootPromise) {
      console.log("[WebContainerService] Boot in progress, waiting...");
      return this.bootPromise;
    }

    this.booting = true;
    console.log("[WebContainerService] Booting WebContainer...");

    this.bootPromise = WebContainer.boot().then((container) => {
      this.container = container;
      this.booting = false;
      console.log("[WebContainerService] WebContainer booted successfully");

      // Set up server-ready listener
      container.on("server-ready", (port: number, url: string) => {
        console.log(`[WebContainerService] Server ready on port ${port}: ${url}`);
        this.emit("server-ready", { port, url } as ServerReadyEvent);
      });

      return container;
    }).catch((error) => {
      this.booting = false;
      this.bootPromise = null;
      console.error("[WebContainerService] Failed to boot:", error);
      throw error;
    });

    return this.bootPromise;
  }

  /**
   * Mount files into the WebContainer filesystem
   * @param files - FileSystemTree structure to mount
   */
  async mountFiles(files: FileSystemTree): Promise<void> {
    if (!this.container) {
      throw new Error("[WebContainerService] Cannot mount files - container not booted");
    }

    console.log("[WebContainerService] Mounting files...");
    await this.container.mount(files);
    console.log("[WebContainerService] Files mounted successfully");
  }

  /**
   * Write a single file to the WebContainer filesystem
   * This should be called by the file sync service
   * @param path - File path (relative to container root)
   * @param content - File content
   */
  async writeFile(path: string, content: string): Promise<void> {
    if (!this.container) {
      throw new Error("[WebContainerService] Cannot write file - container not booted");
    }

    console.log(`[WebContainerService] Writing file: ${path}`);
    
    // Ensure path starts with /
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    
    // Ensure parent directories exist
    const parts = normalizedPath.split("/").filter(Boolean);
    if (parts.length > 1) {
      let currentPath = "";
      for (let i = 0; i < parts.length - 1; i++) {
        currentPath += "/" + parts[i];
        try {
          await this.container.fs.mkdir(currentPath, { recursive: true });
        } catch {
          // Directory might already exist, ignore
        }
      }
    }

    await this.container.fs.writeFile(normalizedPath, content);
    this.emit("file:written", { path: normalizedPath, content });
  }

  /**
   * Read a file from the WebContainer filesystem
   * @param path - File path (relative to container root)
   */
  async readFile(path: string): Promise<string> {
    if (!this.container) {
      throw new Error("[WebContainerService] Cannot read file - container not booted");
    }

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const content = await this.container.fs.readFile(normalizedPath, "utf-8");
    return content;
  }

  /**
   * Delete a file from the WebContainer filesystem
   * @param path - File path (relative to container root)
   */
  async deleteFile(path: string): Promise<void> {
    if (!this.container) {
      throw new Error("[WebContainerService] Cannot delete file - container not booted");
    }

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    console.log(`[WebContainerService] Deleting file: ${normalizedPath}`);
    await this.container.fs.rm(normalizedPath);
  }

  /**
   * Create a directory in the WebContainer filesystem
   * @param path - Directory path
   */
  async mkdir(path: string): Promise<void> {
    if (!this.container) {
      throw new Error("[WebContainerService] Cannot create directory - container not booted");
    }

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    await this.container.fs.mkdir(normalizedPath, { recursive: true });
  }

  /**
   * Spawn a process in the WebContainer
   * @param command - Command to run
   * @param args - Command arguments
   * @param options - Spawn options
   */
  async spawn(
    command: string,
    args: string[] = [],
    options: { cwd?: string } = {}
  ): Promise<{ process: WebContainerProcess; processId: string }> {
    if (!this.container) {
      throw new Error("[WebContainerService] Cannot spawn process - container not booted");
    }

    console.log(`[WebContainerService] Spawning: ${command} ${args.join(" ")}`);

    const process = await this.container.spawn(command, args, {
      cwd: options.cwd,
    });

    const processId = `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.processes.set(processId, process);

    // Stream output
    const reader = process.output.getReader();
    const streamOutput = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          this.emit("process:output", { processId, data: value } as ProcessOutputEvent);
        }
      } catch (error) {
        console.error(`[WebContainerService] Error reading process output:`, error);
      }
    };
    streamOutput();

    return { process, processId };
  }

  /**
   * Get a running process by ID
   */
  getProcess(processId: string): WebContainerProcess | undefined {
    return this.processes.get(processId);
  }

  /**
   * Kill a running process
   */
  async killProcess(processId: string): Promise<void> {
    const process = this.processes.get(processId);
    if (process) {
      process.kill();
      this.processes.delete(processId);
      console.log(`[WebContainerService] Killed process: ${processId}`);
    }
  }

  /**
   * Destroy the WebContainer and clean up
   */
  async destroy(): Promise<void> {
    if (this.container) {
      // Kill all running processes
      for (const [id, process] of this.processes) {
        process.kill();
      }
      this.processes.clear();

      // Tear down the container
      await this.container.teardown();
      this.container = null;
      this.bootPromise = null;
      console.log("[WebContainerService] Container destroyed");
    }
  }
}

// Export singleton instance getter
export const getWebContainerService = () => WebContainerService.getInstance();

// Export for direct access
export default WebContainerService;
