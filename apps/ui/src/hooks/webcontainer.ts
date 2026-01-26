import { projectFiles } from "@/data/project-file";
import { WebContainer } from "@webcontainer/api";
import { useRef } from "react";
import { toast } from "sonner";

export const useWebContainerRef = () => {
  const webContainerRef = useRef<WebContainer | null>(undefined);

  // const initializeWebContainer = async () => {
  //   if (containerBooted.current) return;
  //   containerBooted.current = true;

  //   const loadingToast = toast.loading("Starting WebContainer...");

  //   try {
  //     console.log("🚀 Booting WebContainer...");
  //     const wc = await WebContainer.boot();
  //     webContainerRef.current = wc;
  //     toast.success("WebContainer ready", { id: loadingToast });

  //     await wc.mount(projectFiles);

  //     toast.success("Project loaded", { id: loadingToast });

  //     toast.loading("Installing dependencies...", { id: loadingToast });

  //     terminalRef?.current &&
  //       (terminalRef.current.textContent += "\n$ npm install\n");

  //     const installProcess = await wc.spawn(
  //       "npm",
  //       ["install", "--no-fund", "--no-audit"],
  //       { cwd: "/vanilla-web-app" },
  //     );

  //     const installReader = installProcess.output.getReader();
  //     while (true) {
  //       const { done, value } = await installReader.read();
  //       if (done) break;
  //       terminalRef?.current && (terminalRef.current.textContent += value);
  //     }

  //     const installExitCode = await installProcess.exit;
  //     if (installExitCode !== 0) {
  //       throw new Error("npm install failed");
  //     }

  //     toast.success("Dependencies installed", { id: loadingToast });

  //     // ---------------------------------------
  //     // 5️⃣ Start dev server
  //     // ---------------------------------------
  //     console.log("▶️ Starting dev server...");
  //     toast.loading("Starting server...", { id: loadingToast });

  //     const devProcess = await wc.spawn("npm", ["run", "dev"], {
  //       cwd: "/vanilla-web-app",
  //     });
  //     terminalRef?.current &&
  //       (terminalRef.current.textContent += "\n$ npm run dev\n");

  //     // ---------------------------------------
  //     // 6️⃣ Listen for server-ready
  //     // ---------------------------------------
  //     if (setLiveUrl)
  //       wc.on("server-ready", (port, url) => {
  //         setLiveUrl(url); // iframe / preview window
  //         toast.success("Server running 🚀", { id: loadingToast });
  //       });

  //     terminalRef?.current &&
  //       (terminalRef.current.textContent += "\n$ Server running\n");

  //     return wc;
  //   } catch (error) {
  //     console.error("❌ WebContainer error:", error);
  //     toast.error("Failed to start WebContainer", { id: loadingToast });
  //     containerBooted.current = false;
  //   }
  // };

  return { webContainerRef };
};
