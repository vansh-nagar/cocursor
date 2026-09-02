import { useIDEStore } from "@/stores/ideStore";
import { WebContainer, FileSystemTree } from "@webcontainer/api";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { projectRootOf } from "@/lib/project-paths";

/**
 * Boot state is module-level, not per-hook.
 *
 * WebContainer.boot() throws if a second instance is booted before the first is
 * torn down, and React remounts (StrictMode, Fast Refresh, route changes) create
 * fresh hook instances. A ref inside the hook resets on every remount and so
 * cannot serialise boots across them.
 */
let bootPromise: Promise<WebContainer> | null = null;
let bootedProjectId: string | null = null;

/** Tears down the live container, if any, and clears all boot state. */
export async function teardownWebContainer() {
  const { webContainerRef, setIsContainerBooted, setLiveUrl } =
    useIDEStore.getState();

  const wc = webContainerRef.current;

  // Clear first: a failed teardown must not leave a dead instance reachable.
  webContainerRef.current = null;
  bootPromise = null;
  bootedProjectId = null;
  setIsContainerBooted(false);
  setLiveUrl(null);

  if (wc) {
    try {
      wc.teardown();
    } catch (e) {
      console.warn("[WebContainer] teardown failed:", e);
    }
  }
}

export const useWebContainer = ({ projectId }: { projectId?: string }) => {
  const {
    webContainerRef,
    setLiveUrl,
    setIsLoading,
    setLoadingMessage,
    setIsContainerBooted,
    isContainerBooted,
  } = useIDEStore();

  const terminalOutputRef = useRef<((data: string) => void) | null>(null);

  const setTerminalOutput = useCallback((callback: (data: string) => void) => {
    terminalOutputRef.current = callback;
  }, []);

  const initializeWebContainer = useCallback(
    async (fileTree: FileSystemTree) => {
      // Idempotent per project, not per truthiness. The old check returned
      // webContainerRef.current whenever it was set — including after teardown
      // left it pointing at a dead instance — so entering a second room handed
      // back a container that had never mounted that project's files, and every
      // subsequent write silently failed.
      if (bootedProjectId === (projectId ?? null) && bootPromise) {
        return bootPromise;
      }

      // Different project: tear the old one down before booting a new one.
      if (bootPromise) {
        await teardownWebContainer();
      }

      bootedProjectId = projectId ?? null;

      bootPromise = (async () => {
        setLoadingMessage("Booting Container...");
        const wc = await WebContainer.boot();
        webContainerRef.current = wc;

        setLoadingMessage("Mounting project files...");

        if (fileTree && Object.keys(fileTree).length > 0) {
          await wc.mount(fileTree);
          toast.success("Project files loaded 🚀");
        } else {
          toast.error(
            "No project files found. Starting with an empty file system.",
          );
        }

        wc.on("server-ready", (port, url) => {
          setLiveUrl(url);
          toast.success(`Server running on port ${port} 🚀`);
        });

        wc.on("error", ({ message }) => {
          console.error("[WebContainer] error:", message);
          toast.error(`WebContainer error: ${message}`);
        });

        setIsContainerBooted(true);
        setIsLoading(false);

        return wc;
      })();

      try {
        return await bootPromise;
      } catch (error) {
        console.error("WebContainer error:", error);
        toast.error("Failed to start WebContainer");
        // Reset so a retry can actually re-boot rather than resolving the
        // rejected promise forever.
        bootPromise = null;
        bootedProjectId = null;
        webContainerRef.current = null;
        setIsLoading(false);
        throw error;
      }
    },
    [
      projectId,
      webContainerRef,
      setLiveUrl,
      setIsLoading,
      setLoadingMessage,
      setIsContainerBooted,
    ],
  );

  const runCommand = useCallback(
    async (command: string, args: string[], cwd?: string) => {
      if (!webContainerRef.current) {
        throw new Error("WebContainer not initialized");
      }

      const process = await webContainerRef.current.spawn(command, args, {
        cwd: cwd ?? projectRootOf(useIDEStore.getState().fileStructure),
      });

      const reader = process.output.getReader();
      const readOutput = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (terminalOutputRef.current) {
            terminalOutputRef.current(value);
          }
        }
      };

      readOutput();

      return process;
    },
    [webContainerRef],
  );

  /** Writes a file, creating any missing parent directories first. */
  const writeFile = useCallback(
    async (path: string, content: string) => {
      const wc = webContainerRef.current;
      if (!wc) {
        throw new Error("WebContainer not initialized");
      }

      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      const dir = normalizedPath.slice(0, normalizedPath.lastIndexOf("/"));

      // fs.writeFile rejects when the parent doesn't exist. Callers used to
      // swallow that, reporting success for files that were never created.
      if (dir) {
        await wc.fs.mkdir(dir, { recursive: true });
      }

      await wc.fs.writeFile(normalizedPath, content);
    },
    [webContainerRef],
  );

  const readFile = useCallback(
    async (path: string): Promise<string> => {
      if (!webContainerRef.current) {
        throw new Error("WebContainer not initialized");
      }

      const normalizedPath = path.startsWith("/") ? path : `/${path}`;
      return await webContainerRef.current.fs.readFile(normalizedPath, "utf-8");
    },
    [webContainerRef],
  );

  // Tear down when the last consumer unmounts, so re-entering a room re-boots.
  useEffect(() => {
    return () => {
      void teardownWebContainer();
    };
  }, []);

  return {
    webContainerRef,
    initializeWebContainer,
    runCommand,
    writeFile,
    readFile,
    setTerminalOutput,
    isContainerBooted,
  };
};
