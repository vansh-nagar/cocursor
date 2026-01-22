import { projectFiles } from "@/utils/project-files";
import { WebContainer } from "@webcontainer/api";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export const useWebContainerRef = ({
  setLiveUrl,
}: {
  setLiveUrl: (url: string) => void;
}) => {
  const containerBooted = useRef(false);
  const webContainerRef = useRef<WebContainer | null>(null);

  const initializeWebContainer = async () => {
    if (containerBooted.current) return;
    containerBooted.current = true;
    toast.info("Starting WebContainer...");

    try {
      console.log("Booting WebContainer...");
      const wc = await WebContainer.boot();
      console.log("WebContainer booted.");
      webContainerRef.current = wc;

      // Check Node version
      const nodeProcess = await wc.spawn("node", ["-v"]);
      nodeProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log("Node version:", data);
          },
        }),
      );
      await nodeProcess.exit;
      console.log("Node.js is available in WebContainer.");

      toast.success("WebContainer started.");

      // Mount files
      await wc.mount(projectFiles);
      console.log("Files mounted.");

      // Read package.json to verify
      const catProcess = await wc.spawn("cat", ["package.json"], {
        cwd: "/vite-react-app",
      });

      catProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            console.log("package.json contents:", data);
          },
        }),
      );
      await catProcess.exit;
      toast.success("Project files loaded.");

      // THIS IS THE FIX: Properly handle the install stream
      console.log("Installing dependencies...");
      const installProcess = await wc.spawn("npm", ["install"], {
        cwd: "/vite-react-app",
      });

      // Create a reader for the output stream
      const reader = installProcess.output.getReader();

      // Read the stream until it's done
      (async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          console.log("npm:", value);
          toast.info(value);
        }
      })();

      const exitCode = await installProcess.exit;

      if (exitCode !== 0) {
        console.error("❌ npm install failed with exit code:", exitCode);
      } else {
        console.log("✅ Dependencies installed successfully!");
        toast.success("Dependencies installed successfully!");
        // Start dev server
        startDevServer(wc);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };

  const startDevServer = async (wc: WebContainer) => {
    console.log("Starting Vite dev server...");

    const devProcess = await wc.spawn("npm", ["run", "dev"], {
      cwd: "/vite-react-app",
    });

    const reader = devProcess.output.getReader();

    (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        console.log("Vite:", value);
      }
    })();

    // Listen for server-ready event
    wc.on("server-ready", (port, url) => {
      console.log(`✅ Server ready at ${url}`);
      setLiveUrl(url); // Update your iframe
      toast.success("Dev server is running!");
    });
  };

  useEffect(() => {
    initializeWebContainer();
  }, []);

  return { containerBooted, webContainerRef };
};
