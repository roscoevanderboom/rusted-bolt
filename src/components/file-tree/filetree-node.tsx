import React, { RefObject } from "react";
import { WebcontainerFileNode } from "@/types/webcontainer";
import { ChevronRight, ChevronDown, Folder as FolderIcon, File as FileIcon } from "lucide-react";

interface FileTreeNodeProps {
  node: WebcontainerFileNode;
  level: number;
  expandedNodes: Set<string>;
  currentNode: WebcontainerFileNode | null;
  renamingNode: WebcontainerFileNode | null;
  creatingNode: { parentPath: string; type: "file" | "directory"; name?: string; content?: string } | null;
  inputRef: RefObject<HTMLInputElement>;
  handleNodeClick: (node: WebcontainerFileNode) => void;
  handleContextMenu: (event: React.MouseEvent, node: WebcontainerFileNode) => void;
  handleInputBlur: (e: React.FocusEvent<HTMLInputElement>, node: WebcontainerFileNode) => void;
  handleInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  setRenamingNode: (node: WebcontainerFileNode | null) => void;
  setCreatingNode: (node: { parentPath: string; type: "file" | "directory"; name?: string; content?: string } | null) => void;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  node,
  level,
  expandedNodes,
  currentNode,
  renamingNode,
  creatingNode,
  inputRef,
  handleNodeClick,
  handleContextMenu,
  handleInputBlur,
  handleInputKeyDown,
  setRenamingNode,
  setCreatingNode,
}) => {
  const isExpanded = expandedNodes.has(node.path);
  const isSelected = currentNode?.path === node.path;
  const isRenaming = renamingNode?.path === node.path;
  const showCreator = creatingNode && creatingNode.parentPath === node.path && isExpanded;

  return (
    <li key={node.path} className="select-none flex flex-col">
      <div
        className={`flex items-center rounded-md cursor-pointer hover:bg-stone-700 ${isSelected ? "bg-stone-700" : ""}`}
        style={{ paddingLeft: `${level * 1}rem` }}
        onClick={() => handleNodeClick(node)}
        onContextMenu={(e) => handleContextMenu(e, node)}
      >
        {node.type === "directory" ? (
          <span className="w-4 mr-1">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        ) : (
          <span className="w-4 mr-1" />
        )}
        {node.type === "directory" ? (
          <FolderIcon className="w-4 h-4 mr-2 text-yellow-400 flex-shrink-0" />
        ) : (
          <FileIcon className="w-4 h-4 mr-2 text-blue-400 flex-shrink-0" />
        )}
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            defaultValue={node.name}
            onBlur={(e) => handleInputBlur(e, node)}
            onKeyDown={handleInputKeyDown}
            className="bg-stone-900 text-white outline-none border border-blue-500 rounded-sm px-1 flex-grow"
          />
        ) : (
          <span className="truncate py-1">{node.name}</span>
        )}
      </div>
      {isExpanded && node.children && (
        <ul>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              level={level + 1}
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
      )}
      {showCreator && (
        <div className="flex items-center" style={{ paddingLeft: `${(level + 1) * 1}rem` }}>
          <span className="w-4 mr-1" />
          {creatingNode.type === "directory" ? (
            <FolderIcon className="w-4 h-4 mr-2 text-yellow-400" />
          ) : (
            <FileIcon className="w-4 h-4 mr-2 text-blue-400" />
          )}
          <input
            ref={inputRef}
            type="text"
            onBlur={(e) => handleInputBlur(e, node)}
            onKeyDown={handleInputKeyDown}
            className="bg-stone-900 text-white outline-none border border-blue-500 rounded-sm px-1 flex-grow"
          />
        </div>
      )}
    </li>
  );
};

export default FileTreeNode; 