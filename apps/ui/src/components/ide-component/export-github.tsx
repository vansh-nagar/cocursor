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
import { projectRootNameOf } from "@/lib/project-paths";
import { Switch } from "@/components/ui/switch";

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

  const [isPrivate, setIsPrivate] = useState(true);

  /**
   * Flattens the tree to repo-relative paths.
   *
   * `stripRoot` removes the project's single top-level directory, so the repo
   * has package.json at its root instead of nesting everything under
   * "vanilla-web-app/" — which stopped GitHub detecting it as a Node project.
   */
  const flattenFiles = (
    tree: FileSystemTree,
    basePath: string = "",
  ): { path: string; content: string }[] => {
    let files: { path: string; content: string }[] = [];
    for (const [name, node] of Object.entries(tree)) {
      const currentPath = basePath ? `${basePath}/${name}` : name;
      if (
        "file" in node &&
        "contents" in node.file &&
        typeof node.file.contents === "string"
      ) {
        files.push({ path: currentPath, content: node.file.contents });
      } else if ("directory" in node) {
        files = [...files, ...flattenFiles(node.directory, currentPath)];
      }
    }
    return files;
  };

  /** Counts files skipped because their contents are binary, so we can warn. */
  const countBinaryFiles = (tree: FileSystemTree): number => {
    let n = 0;
    for (const node of Object.values(tree)) {
      if (
        "file" in node &&
        "contents" in node.file &&
        typeof node.file.contents !== "string"
      ) {
        n += 1;
      } else if ("directory" in node) {
        n += countBinaryFiles(node.directory);
      }
    }
    return n;
  };

  const gh = async <T = Record<string, unknown>,>(
    url: string,
    authHeader: string,
    init?: RequestInit,
  ): Promise<T> => {
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: authHeader,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });

    if (!res.ok) {
      const body: { message?: string } = await res.json().catch(() => ({}));
      throw new Error(
        body.message
          ? `${body.message} (${res.status})`
          : `GitHub request failed (${res.status})`,
      );
    }

    return (res.status === 204 ? null : await res.json()) as T;
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
    if (!/^[A-Za-z0-9._-]+$/.test(repoName)) {
      toast.error(
        "Repository name may only contain letters, numbers, dot, hyphen and underscore",
      );
      return;
    }
    if (!fileStructure || Object.keys(fileStructure).length === 0) {
      toast.error("No project files to export");
      return;
    }

    setLoading(true);
    const authHeader =
      token.startsWith("ghp_") || token.startsWith("github_pat_")
        ? `token ${token}`
        : `Bearer ${token}`;

    const toastId = toast.loading("Preparing export...");

    try {
      const user = await gh<{ login: string }>(
        "https://api.github.com/user",
        authHeader,
      );
      const username = user.login;

      // Strip the single top-level project directory, if there is one.
      const rootName = projectRootNameOf(fileStructure);
      const rootNode = rootName ? fileStructure[rootName] : undefined;
      const subtree =
        rootNode && "directory" in rootNode ? rootNode.directory : fileStructure;

      const files = flattenFiles(subtree);
      if (files.length === 0) {
        throw new Error("No text files to export");
      }

      const skipped = countBinaryFiles(subtree);

      // Create the repo. 422 "already exists" is fine — we push into it.
      try {
        await gh("https://api.github.com/user/repos", authHeader, {
          method: "POST",
          body: JSON.stringify({
            name: repoName,
            private: isPrivate,
            auto_init: false,
            description: "Exported from Cocursor",
          }),
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        if (!message.includes("already exists")) throw err;
      }

      const base = `https://api.github.com/repos/${username}/${repoName}/git`;

      toast.loading(`Uploading ${files.length} files...`, { id: toastId });

      // Find the current head, if the repo already has commits.
      let parentSha: string | undefined;
      let baseTreeSha: string | undefined;
      let defaultBranch = "main";

      try {
        const repo = await gh<{ default_branch?: string }>(
          `https://api.github.com/repos/${username}/${repoName}`,
          authHeader,
        );
        defaultBranch = repo.default_branch || "main";

        const ref = await gh<{ object: { sha: string } }>(
          `${base}/ref/heads/${defaultBranch}`,
          authHeader,
        );
        parentSha = ref.object.sha;

        const parentCommit = await gh<{ tree: { sha: string } }>(
          `${base}/commits/${parentSha}`,
          authHeader,
        );
        baseTreeSha = parentCommit.tree.sha;
      } catch {
        // Empty repository — this will be the initial commit.
      }

      // One tree, one commit, one ref update — instead of two REST calls per
      // file, which hit GitHub's secondary rate limit on any real project.
      const tree = await gh<{ sha: string }>(`${base}/trees`, authHeader, {
        method: "POST",
        body: JSON.stringify({
          ...(baseTreeSha ? { base_tree: baseTreeSha } : {}),
          tree: files.map((f) => ({
            path: f.path,
            mode: "100644",
            type: "blob",
            content: f.content,
          })),
        }),
      });

      const commit = await gh<{ sha: string }>(`${base}/commits`, authHeader, {
        method: "POST",
        body: JSON.stringify({
          message: "Export from Cocursor",
          tree: tree.sha,
          parents: parentSha ? [parentSha] : [],
        }),
      });

      if (parentSha) {
        await gh(`${base}/refs/heads/${defaultBranch}`, authHeader, {
          method: "PATCH",
          body: JSON.stringify({ sha: commit.sha }),
        });
      } else {
        await gh(`${base}/refs`, authHeader, {
          method: "POST",
          body: JSON.stringify({
            ref: `refs/heads/${defaultBranch}`,
            sha: commit.sha,
          }),
        });
      }

      setExportedUrl(`https://github.com/${username}/${repoName}`);
      toast.success(
        skipped > 0
          ? `Exported ${files.length} files. ${skipped} binary file${skipped === 1 ? "" : "s"} skipped.`
          : `Exported ${files.length} files.`,
        { id: toastId },
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error instanceof Error ? error.message : "Export failed", {
        id: toastId,
      });
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
              <p className="font-medium text-zinc-200 text-xs uppercase tracking-wider">
                Required token permissions
              </p>
              <ul className="text-[11px] list-disc pl-4 space-y-1">
                <li>
                  <span className="text-orange-400 font-medium">
                    Fine-grained token (recommended):
                  </span>{" "}
                  <b>Administration: Write</b> (to create the repo) and{" "}
                  <b>Contents: Write</b>. Scope it to <b>only this repository</b>
                  {" "}once it exists.
                </li>
                <li>
                  <span className="text-orange-400 font-medium">
                    Classic token:
                  </span>{" "}
                  <b>&apos;repo&apos;</b> — note this grants access to every
                  repository on your account, so prefer a fine-grained token.
                </li>
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

        <div className="flex items-center justify-between rounded-lg border border-zinc-700/50 bg-zinc-900/50 p-3">
          <div className="space-y-0.5">
            <Label htmlFor="repo-private" className="text-sm">
              Private repository
            </Label>
            <p className="text-[11px] text-zinc-400">
              {isPrivate
                ? "Only you will be able to see this repository."
                : "Anyone on GitHub will be able to see this repository."}
            </p>
          </div>
          <Switch
            id="repo-private"
            checked={isPrivate}
            onCheckedChange={setIsPrivate}
          />
        </div>

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
