"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { FileSystemTree } from "@webcontainer/api";

interface ExportGithubDialogProps {
  fileStructure: FileSystemTree;
  projectName?: string;
}

const ExportGithubDialog = ({
  fileStructure,
  projectName = "my-cocursor-project",
}: ExportGithubDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [repoName, setRepoName] = useState(projectName.toLowerCase().replace(/\s+/g, '-'));
  const [token, setToken] = useState("");
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  const flattenFiles = (
    tree: FileSystemTree,
    basePath: string = ""
  ): { path: string; content: string }[] => {
    let files: { path: string; content: string }[] = [];
    for (const [name, node] of Object.entries(tree)) {
      const currentPath = basePath ? `${basePath}/${name}` : name;
      if ("file" in node && "contents" in node.file && typeof node.file.contents === "string") {
        files.push({ path: currentPath, content: node.file.contents });
      } else if ("directory" in node) {
        files = [...files, ...flattenFiles(node.directory, currentPath)];
      }
    }
    return files;
  };

  const handleExport = async () => {
    if (!token) {
      toast.error("Please provide a GitHub Personal Access Token");
      return;
    }
    if (!repoName) {
      toast.error("Please provide a repository name");
      return;
    }

    setLoading(true);
    const authHeader = token.startsWith("ghp_") || token.startsWith("github_pat_") 
      ? `token ${token}` 
      : `Bearer ${token}`;

    try {
      const userRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: authHeader },
      });
      if (!userRes.ok) {
        const errData = await userRes.json().catch(() => ({}));
        throw new Error(errData.message || "Invalid GitHub token or insufficient permissions");
      }
      const user = await userRes.json();
      const username = user.login;

      const createRes = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: repoName,
          private: false,
          auto_init: false,
          description: "Exported from Cocursor IDE",
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        if (createRes.status === 422 && errData.errors?.some((e: any) => e.message?.includes("already exists"))) {
          console.log("Repository already exists, proceeding to update files.");
        } else {
          throw new Error(errData.message || `Failed to create repository (${createRes.status})`);
        }
      }

      const files = flattenFiles(fileStructure);
      const toastId = toast.loading(`Uploading ${files.length} files to GitHub...`);

      for (const file of files) {
        try {
          const fileCheckRes = await fetch(
            `https://api.github.com/repos/${username}/${repoName}/contents/${file.path}`,
            {
              headers: { Authorization: authHeader },
            }
          );
          
          let sha;
          if (fileCheckRes.ok) {
            const fileData = await fileCheckRes.json();
            sha = fileData.sha;
          }

          const encodedContent = btoa(unescape(encodeURIComponent(file.content)));

          await fetch(
            `https://api.github.com/repos/${username}/${repoName}/contents/${file.path}`,
            {
              method: "PUT",
              headers: {
                Authorization: authHeader,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: sha ? `Update ${file.path} from Cocursor` : `Create ${file.path} from Cocursor`,
                content: encodedContent,
                sha: sha,
              }),
            }
          );
        } catch (fileErr) {
          console.error(`Failed to upload ${file.path}:`, fileErr);
        }
      }

      setExportedUrl(`https://github.com/${username}/${repoName}`);
      toast.success("Project exported successfully!", { id: toastId });
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error.message || "Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="text-xs h-[34px] bg-orange-600 hover:bg-orange-700 text-white">
          <Github />
          Export To GitHub
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-background border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Github className="size-6" />
            Export to GitHub
          </DialogTitle>
          <div className="text-sm text-zinc-400 mt-2 space-y-2">
            <p>This will create a new repository and upload your project files.</p>
            <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-700/50 space-y-2">
              <p className="font-medium text-zinc-200 text-xs uppercase tracking-wider">Required Token Permissions:</p>
              <ul className="text-[11px] list-disc pl-4 space-y-1">
                <li><span className="text-orange-400 font-medium">Classic Token:</span> select the <b>'repo'</b> checkbox.</li>
                <li><span className="text-orange-400 font-medium">Fine-grained Token:</span> must have <b>'All Repositories'</b> access and <b>'Administration'</b> + <b>'Contents'</b> Write permissions.</li>
              </ul>
            </div>
          </div>
        </DialogHeader>

        {exportedUrl ? (
          <div className="pt-8 flex flex-col items-center text-center gap-6">
            <div className="size-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="size-10 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Project Exported!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your code is now live on GitHub.
              </p>
            </div>
            <div className="flex flex-col w-full gap-2">
              <Button asChild className="gap-2 bg-white text-black hover:bg-zinc-200">
                <a href={exportedUrl} target="_blank" rel="noopener noreferrer">
                  View Repository
                  <ExternalLink className="size-4" />
                </a>
              </Button>
              <Button variant="outline" onClick={() => setExportedUrl(null)}>
                Export another version
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="repo-name" className="text-sm font-medium">Repository Name</Label>
              <Input
                id="repo-name"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="my-cocursor-app"
                className="bg-zinc-950 border-zinc-800  focus:ring-[#FA6000]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="token" className="text-sm font-medium">
                GitHub Personal Access Token
              </Label>
              <Input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value.trim())}
                placeholder="ghp_... or github_pat_..."
                className="bg-zinc-950 border-zinc-800  focus:ring-[#FA6000]"
              />
              <p className="text-[11px] text-zinc-500 italic">
                Tokens are used only for this request and are never stored.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="pt-2">
          {!exportedUrl && (
            <Button
              type="submit"
              onClick={handleExport}
              disabled={loading}
              className="bg-[#FA6000] hover:bg-[#FA6000]/90 text-white w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Github className="size-4" />
                  Push to GitHub
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportGithubDialog;
