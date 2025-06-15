import { WebContainer } from "@webcontainer/api";
import { WebcontainerFileNode } from "@/types/webcontainer";
import { IGNORE_PATTERNS } from "@/constants/ignore-list";
import { minimatch } from "minimatch";
import { confirm } from "@tauri-apps/plugin-dialog";

export async function deleteFile(
  webcontainerInstance: WebContainer,
  fileTree: WebcontainerFileNode[],
  path: string,
  buildFileTree: () => void,
  findNodeByPath: (tree: WebcontainerFileNode[], path: string) => WebcontainerFileNode | null
): Promise<void> {
  const confirmed = await confirm(
    `Are you sure you want to delete ${path}?`,
    { title: "Delete File", cancelLabel: "Cancel", kind: "warning" }
  );
  if (!confirmed) return;
  const node = fileTree ? findNodeByPath(fileTree, path) : null;
  if (node && node.type === "directory") {
    await webcontainerInstance.fs.rm(path, { recursive: true });
  } else {
    await webcontainerInstance.fs.rm(path);
  }
  buildFileTree();
}

export function findNodeByPath(
  tree: WebcontainerFileNode[],
  path: string
): WebcontainerFileNode | null {
  for (const node of tree) {
    if (node.path === path) return node;
    if (node.type === "directory" && node.children) {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

export function onCreate(
  currentNode: WebcontainerFileNode | null,
  setCreateMode: (mode: { type: "file" | "directory"; cwd: string; value: string } | null) => void
): void {
  let cwd = "/";
  if (currentNode) {
    if (currentNode.type === "directory") {
      cwd = currentNode.path;
    } else {
      const segments = currentNode.path.split("/");
      segments.pop();
      cwd = segments.join("/") || "/";
    }
  }
  if (!cwd.startsWith("/")) cwd = "/" + cwd;
  if (cwd !== "/" && cwd.endsWith("/")) cwd = cwd.slice(0, -1);
  setCreateMode({ type: "file", cwd, value: "" });
}

export async function onCreateConfirm(
  createMode: { type: "file" | "directory"; cwd: string; value: string } | null,
  name: string,
  webcontainerInstance: WebContainer,
  buildFileTree: () => void,
  setCreateMode: (mode: { type: "file" | "directory"; cwd: string; value: string } | null) => void
): Promise<void> {
  if (!createMode || !name.trim()) return;
  const trimmedName = name.trim();
  let cwd = createMode.cwd;
  if (!cwd.startsWith("/")) cwd = "/" + cwd;
  if (cwd !== "/" && cwd.endsWith("/")) cwd = cwd.slice(0, -1);
  try {
    if (trimmedName.startsWith("/")) {
      const parts = trimmedName.split("/").filter(Boolean);
      if (parts.length === 1) {
        const dirPath = cwd === "/" ? `/${parts[0]}` : `${cwd}/${parts[0]}`;
        await webcontainerInstance.fs.mkdir(dirPath, { recursive: true });
      } else if (parts.length > 1) {
        const dirPath = cwd === "/" ? `/${parts[0]}` : `${cwd}/${parts[0]}`;
        await webcontainerInstance.fs.mkdir(dirPath, { recursive: true });
        const filePath = `${dirPath}/${parts.slice(1).join("/")}`;
        await webcontainerInstance.fs.writeFile(filePath, "", "utf8");
      }
    } else {
      const filePath = cwd === "/"
        ? `/${trimmedName}`
        : `${cwd}/${trimmedName}`;
      await webcontainerInstance.fs.writeFile(filePath, "", "utf8");
    }
    buildFileTree();
    setCreateMode(null);
  } catch (error) {
    console.error("Failed to create file/folder:", error);
  }
}

export function onCreateCancel(
  setCreateMode: (mode: { type: "file" | "directory"; cwd: string; value: string } | null) => void
): void {
  setCreateMode(null);
}

export function isIgnored(path: string): boolean {
  const normalizedPath = path.replace(/\\/g, "/");
  return IGNORE_PATTERNS.some(pattern => minimatch(normalizedPath, pattern, { dot: true }));
}

/**
 * Extracts the best run script and package manager for a project folder.
 * Returns {cmd, args, reason} or null if not runnable.
 */
export function extractRunScript(
  fileTree: WebcontainerFileNode[],
  folderPath: string
): { cmd: string; args: string[]; reason: string } | null {
  // Helper to find a file in a folder
  function findFileInFolder(nodes: WebcontainerFileNode[], name: string): WebcontainerFileNode | undefined {
    return nodes.find((n) => n.name === name && n.type === "file");
  }
  // Helper to find a folder node by path
  function findFolderByPath(nodes: WebcontainerFileNode[], path: string): WebcontainerFileNode | undefined {
    for (const node of nodes) {
      if (node.path === path && node.type === "directory") return node;
      if (node.type === "directory" && node.children) {
        const found = findFolderByPath(node.children, path);
        if (found) return found;
      }
    }
    return undefined;
  }
  const folderNode = findFolderByPath(fileTree, folderPath);
  if (!folderNode || !folderNode.children) return null;
  // Find package.json
  const pkgNode = findFileInFolder(folderNode.children, "package.json");
  if (!pkgNode || !pkgNode.content) return null;
  let pkg;
  try {
    pkg = JSON.parse(pkgNode.content);
  } catch {
    return null;
  }
  if (!pkg.scripts) return null;
  // Find best script
  const scriptOrder = ["dev", "start", "serve", "preview"];
  let scriptName = scriptOrder.find((s) => pkg.scripts[s]);
  if (!scriptName) return null;
  // Detect package manager
  let pm = "npm";
  if (findFileInFolder(folderNode.children, "pnpm-lock.yaml")) pm = "pnpm";
  else if (findFileInFolder(folderNode.children, "yarn.lock")) pm = "yarn";
  else if (findFileInFolder(folderNode.children, "package-lock.json")) pm = "npm";
  // Build command
  let cmd = pm;
  let args: string[] = [];
  if (pm === "npm") args = ["run", scriptName];
  else if (pm === "pnpm") args = ["run", scriptName];
  else if (pm === "yarn") args = [scriptName];
  return { cmd, args, reason: `Found ${scriptName} script in package.json using ${pm}` };
}