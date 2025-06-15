import { WebContainer } from "@webcontainer/api";
import { WebcontainerFileNode } from "@/types/webcontainer";
import { fs } from "@/services/tauri/fs";
import { join } from "@tauri-apps/api/path";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { downloadDir } from "@tauri-apps/api/path";
import { download } from "@tauri-apps/plugin-upload";
import { open, confirm } from "@tauri-apps/plugin-dialog";
import { IGNORE_PATTERNS } from "@/constants/ignore-list";
import { minimatch } from "minimatch";

export interface FileOperation {
  type: "create" | "update" | "rename" | "move" | "copy" | "delete";
  sourcePath: string;
  targetPath?: string;
  content?: string;
  isDirectory?: boolean;
}

export interface FileOperationResult {
  success: boolean;
  error?: string;
  node?: WebcontainerFileNode;
}

/**
 * Creates a new file or directory
 */
export async function createNode(
  webcontainerInstance: WebContainer,
  path: string,
  isDirectory: boolean = false,
  content: string = ""
): Promise<FileOperationResult> {
  try {
    if (isDirectory) {
      await webcontainerInstance.fs.mkdir(path, { recursive: true });
    } else {
      // Ensure parent directory exists
      const parentDir = path.split("/").slice(0, -1).join("/");
      if (parentDir) {
        await webcontainerInstance.fs.mkdir(parentDir, { recursive: true });
      }
      await webcontainerInstance.fs.writeFile(path, content, "utf-8");
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Updates an existing file's content
 */
export async function updateNode(
  webcontainerInstance: WebContainer,
  path: string,
  content: string
): Promise<FileOperationResult> {
  try {
    await webcontainerInstance.fs.writeFile(path, content, "utf-8");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Renames a file or directory
 */
export async function renameNode(
  webcontainerInstance: WebContainer,
  oldPath: string,
  newPath: string
): Promise<FileOperationResult> {
  try {
    // Read the old file/directory
    const isDirectory = await isNodeDirectory(webcontainerInstance, oldPath);

    if (isDirectory) {
      // For directories, we need to recreate the directory structure
      await webcontainerInstance.fs.mkdir(newPath, { recursive: true });
      const entries = await webcontainerInstance.fs.readdir(oldPath, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        const srcPath = `${oldPath}/${entry}`;
        const destPath = `${newPath}/${entry}`;
        await renameNode(webcontainerInstance, srcPath, destPath);
      }

      await webcontainerInstance.fs.rm(oldPath, { recursive: true });
    } else {
      // For files, we can copy and delete
      const content = await webcontainerInstance.fs.readFile(oldPath, "utf-8");
      await createNode(webcontainerInstance, newPath, false, content);
      await webcontainerInstance.fs.rm(oldPath);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Copies a file or directory
 */
export async function copyNode(
  webcontainerInstance: WebContainer,
  sourcePath: string,
  targetPath: string
): Promise<FileOperationResult> {
  try {
    const isDirectory = await isNodeDirectory(webcontainerInstance, sourcePath);

    if (isDirectory) {
      await webcontainerInstance.fs.mkdir(targetPath, { recursive: true });
      const entries = await webcontainerInstance.fs.readdir(sourcePath, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        const srcPath = `${sourcePath}/${entry}`;
        const destPath = `${targetPath}/${entry}`;
        await copyNode(webcontainerInstance, srcPath, destPath);
      }
    } else {
      const content = await webcontainerInstance.fs.readFile(
        sourcePath,
        "utf-8"
      );
      await createNode(webcontainerInstance, targetPath, false, content);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Deletes a file or directory
 */
export async function deleteNode(
  webcontainerInstance: WebContainer,
  path: string,
  skipConfirmation: boolean = false
): Promise<FileOperationResult> {
  try {
    if (!skipConfirmation) {
      const confirmed = await confirm(
        `Are you sure you want to delete ${path}?`,
        { title: "Delete Confirmation", kind: "warning" }
      );
      if (!confirmed) {
        return { success: false, error: "Operation cancelled by user" };
      }
    }

    await webcontainerInstance.fs.rm(path, { recursive: true });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Moves a file or directory
 */
export async function moveNode(
  webcontainerInstance: WebContainer,
  sourcePath: string,
  targetPath: string
): Promise<FileOperationResult> {
  try {
    const copyResult = await copyNode(
      webcontainerInstance,
      sourcePath,
      targetPath
    );
    if (!copyResult.success) {
      return copyResult;
    }

    const deleteResult = await deleteNode(
      webcontainerInstance,
      sourcePath,
      true
    );
    if (!deleteResult.success) {
      // If delete fails, try to rollback the copy
      await deleteNode(webcontainerInstance, targetPath, true);
      return deleteResult;
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Checks if a path points to a directory
 */
export async function isNodeDirectory(
  webcontainerInstance: WebContainer,
  path: string
): Promise<boolean> {
  try {
    await webcontainerInstance.fs.readdir(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates a file/folder name
 */
export function validateNodeName(name: string): {
  valid: boolean;
  error?: string;
} {
  if (!name) {
    return { valid: false, error: "Name cannot be empty" };
  }

  if (name.includes("\\") || name.includes("..")) {
    return { valid: false, error: "Invalid characters in name" };
  }

  // Add more validation rules as needed
  return { valid: true };
}

/**
 * Executes a file operation
 */
export async function executeFileOperation(
  webcontainerInstance: WebContainer,
  operation: FileOperation
): Promise<FileOperationResult> {
  switch (operation.type) {
    case "create":
      return createNode(
        webcontainerInstance,
        operation.sourcePath,
        operation.isDirectory,
        operation.content
      );

    case "update":
      return updateNode(
        webcontainerInstance,
        operation.sourcePath,
        operation.content || ""
      );

    case "rename":
      return renameNode(
        webcontainerInstance,
        operation.sourcePath,
        operation.targetPath || ""
      );

    case "move":
      return moveNode(
        webcontainerInstance,
        operation.sourcePath,
        operation.targetPath || ""
      );

    case "copy":
      return copyNode(
        webcontainerInstance,
        operation.sourcePath,
        operation.targetPath || ""
      );

    case "delete":
      return deleteNode(webcontainerInstance, operation.sourcePath);

    default:
      return {
        success: false,
        error: "Unsupported operation type",
      };
  }
}

export async function importFolder(webcontainerInstance: WebContainer) {
  const selectedFolder = await open({
    multiple: false,
    directory: true,
  });
  if (selectedFolder && webcontainerInstance) {
    const toastId = toast.loading("Building file tree...");
    await clearWebContainerRoot(webcontainerInstance);
    const filetree = await buildFileTreeFromFS({
      fs,
      rootPath: selectedFolder as string,
      basePath: selectedFolder as string,
      isWebContainer: false,
    });
    const fsTree = toFileSystemTree(filetree);
    await webcontainerInstance.mount(fsTree);
    toast.success("File tree built", { id: toastId });
  }
}

export async function importZip(
  webcontainerInstance: WebContainer,
  zipFilePath: string,
  zipFolderName: string
) {
  if (!zipFilePath || !zipFolderName || !webcontainerInstance) return;
  const toastId = toast.loading("Extracting ZIP...");
  const downloadsFolderPath = await downloadDir();
  const dest_path = await join(downloadsFolderPath, zipFolderName);
  await fs.create_dir(dest_path);
  await invoke("extract_zip", { zipPath: zipFilePath, destPath: dest_path });
  await clearWebContainerRoot(webcontainerInstance);
  const filetree = await buildFileTreeFromFS({
    fs,
    rootPath: dest_path,
    basePath: dest_path,
    isWebContainer: false,
  });
  const fsTree = toFileSystemTree(filetree);
  await webcontainerInstance.mount(fsTree);
  toast.success("ZIP extracted and mounted", { id: toastId });
}

export async function downloadRepo(
  webcontainerInstance: WebContainer,
  repoUrl: string,
  folderName: string
) {
  if (!repoUrl || !folderName || !webcontainerInstance) return;
  const toast_id = "download_repo";
  let zipUrl = repoUrl;
  const match = repoUrl.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$)/
  );
  if (match) {
    zipUrl = `https://github.com/${match[1]}/${match[2]}/archive/refs/heads/main.zip`;
  }
  try {
    const downloadsFolderPath = await downloadDir();
    const savePath = await join(downloadsFolderPath, `${folderName}.zip`);
    await fs.create_file(savePath);
    await download(zipUrl, savePath, ({ progress, total }) => {
      toast.loading(`Downloaded ${progress} of ${total} bytes`, {
        id: toast_id,
      });
    });
    const dest_path = await join(downloadsFolderPath, folderName);
    await fs.create_dir(dest_path);
    await invoke("extract_zip", { zipPath: savePath, destPath: dest_path });
    await clearWebContainerRoot(webcontainerInstance);
    const filetree = await buildFileTreeFromFS({
      fs,
      rootPath: dest_path,
      basePath: dest_path,
      isWebContainer: false,
    });
    const fsTree = toFileSystemTree(filetree);
    await webcontainerInstance.mount(fsTree);
    toast.success("Repo downloaded and mounted", { id: toast_id });
  } catch (error) {
    toast.error("Error downloading repo", { id: toast_id });
  }
}

/**
 * Generic file tree builder for any FS interface (Tauri or WebContainer)
 */
export async function buildFileTreeFromFS({
  fs,
  rootPath = "/",
  basePath = "/",
  isWebContainer = false,
  setFileTree,
  withContent = true,
  ignore = isIgnored,
}: {
  fs: any;
  rootPath?: string;
  basePath?: string;
  isWebContainer?: boolean;
  setFileTree?: (tree: WebcontainerFileNode[]) => void;
  withContent?: boolean;
  ignore?: (path: string) => boolean;
}): Promise<WebcontainerFileNode[]> {
  const nodes: WebcontainerFileNode[] = [];
  let entries;
  try {
    entries = isWebContainer
      ? await fs.readdir(rootPath)
      : await fs.read_dir(rootPath);
  } catch (e) {
    return [];
  }
  for (const entry of entries) {
    let entryName = isWebContainer ? entry : entry.name;
    let entryPath = isWebContainer
      ? rootPath === "/"
        ? `/${entryName}`
        : `${rootPath}/${entryName}`
      : await join(rootPath, entry.name);
    let relativePath = entryPath.replace(basePath, "").replace(/^[/\\]/, "");
    if (ignore(relativePath) || ignore(relativePath + "/")) continue;
    let isDir = false;
    if (isWebContainer) {
      try {
        await fs.readdir(entryPath, { withFileTypes: true });
        isDir = true;
      } catch {
        isDir = false;
      }
    } else {
      isDir = entry.isDirectory;
    }
    if (isDir) {
      const children = await buildFileTreeFromFS({
        fs,
        rootPath: entryPath,
        basePath,
        isWebContainer,
        withContent,
        ignore,
      });
      nodes.push({
        name: entryName,
        path: entryPath,
        type: "directory",
        children,
        lastModified: Date.now(),
      });
    } else {
      let content = "";
      if (withContent) {
        try {
          content = isWebContainer
            ? await fs.readFile(entryPath, "utf8")
            : await fs.read_text_file(entryPath);
        } catch {}
      }
      nodes.push({
        name: entryName,
        path: entryPath,
        type: "file",
        content,
        lastModified: Date.now(),
      });
    }
  }
  if (setFileTree) setFileTree(nodes);
  return nodes;
}

export function toFileSystemTree(
  nodes: WebcontainerFileNode[]
): Record<string, any> {
  const tree: Record<string, any> = {};
  for (const node of nodes) {
    if (node.type === "file") {
      tree[node.name] = {
        file: {
          contents: node.content ?? "",
        },
      };
    } else if (node.type === "directory" && node.children) {
      tree[node.name] = {
        directory: toFileSystemTree(node.children),
      };
    }
  }
  return tree;
}

export async function clearWebContainerRoot(
  webcontainerInstance: WebContainer
) {
  if (!webcontainerInstance?.fs?.readdir || !webcontainerInstance?.fs?.rm)
    return;
  const entries = await webcontainerInstance.fs.readdir("/");
  for (const entry of entries) {
    const path = `/${entry}`;
    await webcontainerInstance.fs.rm(path, { recursive: true });
  }
}
export function isIgnored(path: string): boolean {
  const normalizedPath = path.replace(/\\/g, "/");
  return IGNORE_PATTERNS.some((pattern) =>
    minimatch(normalizedPath, pattern, { dot: true })
  );
}
