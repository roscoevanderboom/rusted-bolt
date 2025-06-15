import React, { useState, useEffect, useCallback, useRef } from "react";
import { WebContainer } from "@webcontainer/api";
import { WebcontainerFileNode } from "@/types/webcontainer";

import { open, save } from "@tauri-apps/plugin-dialog";
import { fs } from "@/services/tauri/fs";
import {
  createNode,
  deleteNode,
  downloadRepo,
  importFolder,
  importZip,
  renameNode,
  buildFileTreeFromFS,
} from "@/utils/file-tree-util";
import FileTreeNode from "./filetree-node";
import FileTreeContextMenu from "./filetree-context-menu";
import { ZipModal, CloneModal } from "./filetree-actionbar-modals";
import { ActionBar } from "./filetree-actionbar";

interface FileTreeWithActionBarProps {
  webcontainerInstance: WebContainer | null;
  fileTree: WebcontainerFileNode[];
  setFileTree: React.Dispatch<React.SetStateAction<WebcontainerFileNode[]>>;
  currentNode: WebcontainerFileNode | null;
  setCurrentNode: React.Dispatch<
    React.SetStateAction<WebcontainerFileNode | null>
  >;
  setFilePath: (path: string) => void;
}

const FileTreeWithActionBar: React.FC<FileTreeWithActionBarProps> = ({
  webcontainerInstance,
  fileTree,
  setFileTree,
  currentNode,
  setCurrentNode,
  setFilePath,
}) => {
  // Action bar state
  const [showZipModal, setShowZipModal] = useState(false);
  const [zipFilePath, setZipFilePath] = useState("");
  const [zipFolderName, setZipFolderName] = useState("repo");
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneRepoUrl, setCloneRepoUrl] = useState("");
  const [cloneFolderName, setCloneFolderName] = useState("repo");
  const [isDownloading, setIsDownloading] = useState(false);

  // File explorer state
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(["/"])
  );
  const [renamingNode, setRenamingNode] = useState<WebcontainerFileNode | null>(
    null
  );
  const [creatingNode, setCreatingNode] = useState<{
    parentPath: string;
    type: "file" | "directory";
    name?: string;
    content?: string;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    node: WebcontainerFileNode;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refreshFileTree = useCallback(async () => {
    if (!webcontainerInstance) return;
    let newFileTree = await buildFileTreeFromFS({
      fs: webcontainerInstance.fs,
      rootPath: "/",
      basePath: "/",
      isWebContainer: true,
      withContent: true,
    });
    // Sort: directories first, then files, both alphabetically
    function sortNodes(nodes: WebcontainerFileNode[]): WebcontainerFileNode[] {
      return nodes
        .slice()
        .sort((a: WebcontainerFileNode, b: WebcontainerFileNode) => {
          if (a.type === "directory" && b.type === "file") return -1;
          if (a.type === "file" && b.type === "directory") return 1;
          return a.name.localeCompare(b.name);
        })
        .map((node: WebcontainerFileNode) =>
          node.type === "directory" && node.children
            ? { ...node, children: sortNodes(node.children) }
            : node
        );
    }
    newFileTree = sortNodes(newFileTree);
    setFileTree(newFileTree);
  }, [webcontainerInstance, setFileTree]);

  // Focus input when renaming or creating
  useEffect(() => {
    if ((renamingNode || creatingNode) && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renamingNode, creatingNode]);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // --- File Operation Handlers ---
  const handleNodeClick = (node: WebcontainerFileNode) => {
    if (node.type === "directory") {
      setCurrentNode(node);
      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(node.path)) {
          newSet.delete(node.path);
        } else {
          newSet.add(node.path);
        }
        return newSet;
      });
    } else {
      setCurrentNode(node);
      setFilePath(node.path);
    }
  };

  const handleCreate = async (name: string) => {
    if (!webcontainerInstance || !creatingNode || !name) {
      setCreatingNode(null);
      return;
    }
    const path = `${creatingNode.parentPath}/${name}`.replace(/\/+/g, "/");
    await createNode(
      webcontainerInstance,
      path,
      creatingNode.type === "directory"
    );
    setCreatingNode(null);
    await refreshFileTree();
  };

  const handleRename = async (newName: string) => {
    if (
      !webcontainerInstance ||
      !renamingNode ||
      !newName ||
      newName === renamingNode.name
    ) {
      setRenamingNode(null);
      return;
    }
    const parentPath =
      renamingNode.path.substring(0, renamingNode.path.lastIndexOf("/")) || "/";
    const newPath = `${parentPath}/${newName}`.replace(/\/+/g, "/");
    await renameNode(webcontainerInstance, renamingNode.path, newPath);
    setRenamingNode(null);
    await refreshFileTree();
  };

  const handleDelete = async (node: WebcontainerFileNode) => {
    if (!webcontainerInstance) return;
    const result = await deleteNode(webcontainerInstance, node.path);
    if (result.success) {
      await refreshFileTree();
      if (currentNode?.path.startsWith(node.path)) {
        setCurrentNode(null);
      }
    }
  };

  const handleContextMenu = (
    event: React.MouseEvent,
    node: WebcontainerFileNode
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentNode(node);
    setContextMenu({ x: event.clientX, y: event.clientY, node });
  };

  // --- Import/Export Handlers (existing logic) ---
  const handleImportFolder = async () => {
    if (webcontainerInstance) await importFolder(webcontainerInstance);
    await refreshFileTree();
  };

  const handleImportZip = async () => {
    if (!webcontainerInstance) return;
    const selectedFile = await open({
      multiple: false,
      directory: false,
      filters: [{ name: "ZIP files", extensions: ["zip"] }],
    });
    if (selectedFile) {
      setZipFilePath(selectedFile as string);
      setShowZipModal(true);
    }
  };

  const handleExtractZip = async () => {
    if (webcontainerInstance && zipFilePath && zipFolderName) {
      setIsDownloading(true);
      try {
        await importZip(webcontainerInstance, zipFilePath, zipFolderName);
        await refreshFileTree();
        setShowZipModal(false);
        setZipFilePath("");
        setZipFolderName("repo");
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleCloneRepo = () => setShowCloneModal(true);

  const handleDownloadRepo = async () => {
    if (webcontainerInstance && cloneRepoUrl && cloneFolderName) {
      setIsDownloading(true);
      try {
        await downloadRepo(webcontainerInstance, cloneRepoUrl, cloneFolderName);
        await refreshFileTree();
        setShowCloneModal(false);
        setCloneRepoUrl("");
        setCloneFolderName("repo");
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleExportZip = async () => {
    if (!webcontainerInstance) return;
    const data = await webcontainerInstance.export("image", { format: "zip" });
    const zip = new Blob([data], { type: "application/zip" });
    const savePath = await save({
      filters: [{ name: "ZIP Files", extensions: ["zip"] }],
      defaultPath: "project.zip",
    });
    if (savePath) {
      const arrayBuffer = await zip.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      await fs.create_binary(savePath, uint8Array);
    }
  };

  // Helper to determine parent path for creation
  function getCreateParentPath(): string {
    if (currentNode) {
      if (currentNode.type === "directory") {
        return currentNode.path;
      } else {
        const idx = currentNode.path.lastIndexOf("/");
        return idx > 0 ? currentNode.path.slice(0, idx) : "/";
      }
    }
    return "/";
  }

  // Handlers for FileTreeNode
  const handleInputBlur = (
    e: React.FocusEvent<HTMLInputElement>,
    node: WebcontainerFileNode
  ) => {
    if (renamingNode && renamingNode.path === node.path)
      handleRename(e.target.value);
    if (creatingNode) handleCreate(e.target.value);
  };
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
    if (e.key === "Escape") {
      setRenamingNode(null);
      setCreatingNode(null);
    }
  };

  const handleCreateNode = async () => {
    if (!webcontainerInstance || !creatingNode || !creatingNode.name) return;
    const path = `${creatingNode.parentPath}/${creatingNode.name}`.replace(
      /\/+/g,
      "/"
    );
    await createNode(
      webcontainerInstance,
      path,
      creatingNode.type === "directory",
      creatingNode.type === "file" ? creatingNode.content ?? "" : undefined
    );
    setCreatingNode(null);
    await refreshFileTree();
  };

  return (
    <div className="w-full flex flex-col h-full text-stone-300">
      {/* Action Bar */}
      <ActionBar
        creatingNode={creatingNode}
        setCreatingNode={setCreatingNode}
        getCreateParentPath={getCreateParentPath}
        handleCreateNode={handleCreateNode}
        handleImportFolder={handleImportFolder}
        handleImportZip={handleImportZip}
        handleCloneRepo={handleCloneRepo}
        handleExportZip={handleExportZip}
        refreshFileTree={refreshFileTree}
      />

      {/* File Tree */}
      <div className="p-2 flex-grow overflow-auto">
        {fileTree && fileTree.length > 0 ? (
          <ul>
            {fileTree.map((node) => (
              <FileTreeNode
                key={node.path}
                node={node}
                level={0}
                expandedNodes={expandedNodes}
                currentNode={currentNode}
                renamingNode={renamingNode}
                creatingNode={creatingNode}
                inputRef={inputRef}
                handleNodeClick={handleNodeClick}
                handleContextMenu={handleContextMenu}
                handleInputBlur={handleInputBlur}
                handleInputKeyDown={handleInputKeyDown}
                setRenamingNode={setRenamingNode}
                setCreatingNode={setCreatingNode}
              />
            ))}
          </ul>
        ) : (
          <div className="text-stone-400 text-sm px-2">
            No files or folders.
          </div>
        )}
      </div>

      <FileTreeContextMenu
        contextMenu={contextMenu}
        setCreatingNode={setCreatingNode}
        setRenamingNode={setRenamingNode}
        handleDelete={handleDelete}
        setContextMenu={setContextMenu}
      />

      {/* --- Modals (Extracted) --- */}
      <ZipModal
        show={showZipModal}
        zipFilePath={zipFilePath}
        zipFolderName={zipFolderName}
        setZipFolderName={setZipFolderName}
        isDownloading={isDownloading}
        onClose={() => setShowZipModal(false)}
        onExtract={handleExtractZip}
      />
      <CloneModal
        show={showCloneModal}
        cloneRepoUrl={cloneRepoUrl}
        setCloneRepoUrl={setCloneRepoUrl}
        cloneFolderName={cloneFolderName}
        setCloneFolderName={setCloneFolderName}
        isDownloading={isDownloading}
        onClose={() => setShowCloneModal(false)}
        onDownload={handleDownloadRepo}
      />
    </div>
  );
};

export default FileTreeWithActionBar;
