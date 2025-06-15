import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Upload,
  FolderOpen,
  GitBranch,
  Download,
  PlusIcon,
} from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

// Define the type for creatingNode
export type CreatingNode = {
  parentPath: string;
  type: "file" | "directory";
  name?: string;
  content?: string;
} | null;

type SetCreatingNode = React.Dispatch<React.SetStateAction<CreatingNode>>;

interface ActionBarProps {
  creatingNode: CreatingNode;
  setCreatingNode: SetCreatingNode;
  getCreateParentPath: () => string;
  handleCreateNode: () => void;
  handleImportFolder: () => void;
  handleImportZip: () => void;
  handleCloneRepo: () => void;
  handleExportZip: () => void;
  refreshFileTree: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  creatingNode,
  setCreatingNode,
  getCreateParentPath,
  handleCreateNode,
  handleImportFolder,
  handleImportZip,
  handleCloneRepo,
  handleExportZip,
  refreshFileTree,
}) => (
  <div className="flex items-center gap-2 px-2 py-1 border-b border-stone-700 bg-stone-900 text-xs flex-shrink-0">
    <Dialog open={!!creatingNode} onOpenChange={open => { if (!open) setCreatingNode(null); }}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          title="New File or Folder"
          onClick={() => setCreatingNode({ parentPath: getCreateParentPath(), type: "file", name: "", content: "" })}
        >
          <PlusIcon className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New {creatingNode?.type === "directory" ? "Folder" : "File"}</DialogTitle>
        </DialogHeader>
        <div className="mb-2 text-xs text-stone-400">Parent: <span className="font-mono">{creatingNode?.parentPath || "/"}</span></div>
        <div className="flex items-center gap-2 mb-4">
          <span>Type:</span>
          <Switch
            checked={creatingNode?.type === "directory"}
            onCheckedChange={checked => setCreatingNode(cn => cn ? { ...cn, type: checked ? "directory" : "file", content: checked ? undefined : (cn.content ?? "") } : null)}
            id="type-switch"
          />
          <label htmlFor="type-switch" className="text-xs select-none cursor-pointer">Folder</label>
        </div>
        <input
          type="text"
          className="border border-stone-700 rounded px-3 py-2 bg-stone-800 text-stone-100 w-full mb-2"
          placeholder={creatingNode?.type === "directory" ? "Folder name" : "File name"}
          value={creatingNode?.name ?? ""}
          onChange={e => setCreatingNode(cn => cn ? { ...cn, name: e.target.value } : null)}
          autoFocus
        />
        {creatingNode?.type === "file" && (
          <textarea
            className="border border-stone-700 rounded px-3 py-2 bg-stone-800 text-stone-100 w-full mb-2"
            placeholder="File content (optional)"
            rows={4}
            value={creatingNode?.content ?? ""}
            onChange={e => setCreatingNode(cn => cn ? { ...cn, content: e.target.value } : null)}
          />
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleCreateNode}
            disabled={!creatingNode?.name}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" title="Import">
          <Upload className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={handleImportFolder}>
          <FolderOpen className="w-4 h-4 mr-2 text-stone-400" /> Import
          Folder
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleImportZip}>
          <Upload className="w-4 h-4 mr-2 text-green-400" /> Import ZIP
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCloneRepo}>
          <GitBranch className="w-4 h-4 mr-2 text-purple-400" /> Clone Repo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" title="Export">
          <Download className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={handleExportZip}>
          Export as ZIP
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <Button
      size="sm"
      variant="ghost"
      title="Refresh File Tree"
      onClick={refreshFileTree}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 2v6h6" />
        <path d="M21 12A9 9 0 0 0 6 5.3L3 8" />
        <path d="M21 22v-6h-6" />
        <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
      </svg>
    </Button>
  </div>
); 