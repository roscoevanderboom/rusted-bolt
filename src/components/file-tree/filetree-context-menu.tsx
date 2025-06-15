import React from "react";
import { FilePlus, FolderPlus } from "lucide-react";
import { WebcontainerFileNode } from "@/types/webcontainer";

interface FileTreeContextMenuProps {
  contextMenu: { x: number; y: number; node: WebcontainerFileNode } | null;
  setCreatingNode: (node: { parentPath: string; type: "file" | "directory" }) => void;
  setRenamingNode: (node: WebcontainerFileNode) => void;
  handleDelete: (node: WebcontainerFileNode) => void;
  setContextMenu: (menu: null) => void;
}

const FileTreeContextMenu: React.FC<FileTreeContextMenuProps> = ({
  contextMenu,
  setCreatingNode,
  setRenamingNode,
  handleDelete,
  setContextMenu,
}) => {
  if (!contextMenu) return null;
  const node = contextMenu.node;
  const isDirectory = node.type === "directory";

  return (
    <div
      className="fixed z-50 bg-stone-900 border border-stone-700 rounded-md shadow-lg text-sm text-white"
      style={{ top: contextMenu.y, left: contextMenu.x }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="py-1">
        {isDirectory && (
          <>
            <div
              className="px-3 py-1 hover:bg-stone-700 cursor-pointer flex items-center"
              onClick={() => {
                setCreatingNode({ parentPath: node.path, type: "file" });
                setContextMenu(null);
              }}
            >
              <FilePlus className="w-4 h-4 mr-2" /> New File
            </div>
            <div
              className="px-3 py-1 hover:bg-stone-700 cursor-pointer flex items-center"
              onClick={() => {
                setCreatingNode({ parentPath: node.path, type: "directory" });
                setContextMenu(null);
              }}
            >
              <FolderPlus className="w-4 h-4 mr-2" /> New Folder
            </div>
            <div className="border-t border-stone-700 my-1" />
          </>
        )}
        <div
          className="px-3 py-1 hover:bg-stone-700 cursor-pointer"
          onClick={() => {
            setRenamingNode(node);
            setContextMenu(null);
          }}
        >
          Rename
        </div>
        <div
          className="px-3 py-1 hover:bg-red-500/20 text-red-400 cursor-pointer"
          onClick={() => {
            handleDelete(node);
            setContextMenu(null);
          }}
        >
          Delete
        </div>
      </div>
    </div>
  );
};

export default FileTreeContextMenu; 