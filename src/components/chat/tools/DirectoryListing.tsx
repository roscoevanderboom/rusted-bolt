import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  ChevronRight,
  Copy,
  FolderOpen,
  Home,
  Send,
  Trash2,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

export type FileInfo = {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  modified: string;
  created: string;
  is_hidden: boolean;
  file_type: string;
  isSymlink?: boolean;
};

const BreadcrumbNav = ({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate: (path: string) => void;
}) => {
  const pathParts = currentPath.split("/").filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const path = "/" + pathParts.slice(0, index + 1).join("/");
    return { name: part, path };
  });

  return (
    <div className="flex items-center space-x-1 mb-4 text-sm">
      <button
        onClick={() => onNavigate("/")}
        className="flex items-center px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
      >
        <Home className="w-4 h-4" />
      </button>
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <button
            onClick={() =>
              onNavigate(crumb.path)}
            className={`px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
              index === breadcrumbs.length - 1
                ? "text-gray-900 dark:text-gray-100 font-medium"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {crumb.name}
          </button>
        </div>
      ))}
    </div>
  );
};

export const DirectoryListing = ({ items }: { items: FileInfo[] }) => {
  const [currentItems, setCurrentItems] = useState<FileInfo[]>(items || []);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("/");

  const handleAction = (action: string, entry: FileInfo) => {
    console.log(`Action: ${action} on ${entry.name}`);
    switch (action) {
      case "open":
        if (entry.is_dir) {
          handleOpenFolder(entry.path);
        } else {
          alert(`Opening ${entry.name}`);
        }
        break;
      case "send":
        alert(`Sending ${entry.name} to AI`);
        break;
      case "delete":
        alert(`Deleting ${entry.name}`);
        break;
      case "copy":
        alert(`Copying ${entry.name}`);
        break;
    }
  };

  const handleOpenFolder = async (dirPath: string) => {
    try {
      setError(null);
      const result = await invoke<FileInfo[]>("read_directory", {
        path: dirPath,
      });
      setCurrentItems(result || []);
      setCurrentPath(dirPath);
    } catch (error) {
      console.error("Failed to read directory:", error);
      setError(
        error instanceof Error ? error.message : "Failed to read directory",
      );
      setCurrentItems([]);
    }
  };

  const renderEntry = (
    entry: FileInfo,
    icon: JSX.Element,
    isFile: boolean = false,
  ) => (
    <ContextMenu key={entry.path}>
      <ContextMenuTrigger>
        <div
          className={`${
            isFile
              ? "bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600"
              : "bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800"
          } rounded px-3 py-2 flex items-center text-sm cursor-pointer hover:bg-opacity-75 transition-colors`}
          onClick={() => {
            if (entry.is_dir) {
              handleOpenFolder(entry.path);
            }
          }}
        >
          {icon}
          <span className="truncate text-gray-800 dark:text-gray-200">
            {entry.name}
          </span>
          {entry.isSymlink && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 ml-2 text-gray-500 dark:text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => handleAction("open", entry)}>
          <FolderOpen className="w-4 h-4 mr-2" />
          Open
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleAction("send", entry)}>
          <Send className="w-4 h-4 mr-2" />
          Send to AI
        </ContextMenuItem>
        <ContextMenuItem onClick={() => handleAction("copy", entry)}>
          <Copy className="w-4 h-4 mr-2" />
          Copy
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => handleAction("delete", entry)}
          className="text-red-600 dark:text-red-400"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "svg"].includes(ext)) {
      return (
        <svg
          className="w-4 h-4 mr-2 text-purple-500 dark:text-purple-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
        </svg>
      );
    } else if (["mp3", "wav", "ogg"].includes(ext)) {
      return (
        <svg
          className="w-4 h-4 mr-2 text-green-500 dark:text-green-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else if (["mp4", "avi", "mov"].includes(ext)) {
      return (
        <svg
          className="w-4 h-4 mr-2 text-red-500 dark:text-red-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          <path
            stroke="#fff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l-4 4m0 0l-4-4m4 4V6"
          />
        </svg>
      );
    } else if (
      [
        "js",
        "ts",
        "jsx",
        "tsx",
        "py",
        "java",
        "c",
        "cpp",
        "cs",
        "go",
        "rs",
        "php",
      ].includes(ext)
    ) {
      return (
        <svg
          className="w-4 h-4 mr-2 text-yellow-500 dark:text-yellow-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  const folders = currentItems.filter((item) => item.is_dir);
  const files = currentItems.filter((item) => !item.is_dir);

  return (
    <div className="p-4">
      <BreadcrumbNav currentPath={currentPath} onNavigate={handleOpenFolder} />

      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
          Directory Contents
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {folders.length} folders, {files.length} files
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {folders.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
            Folders
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {folders.map((folder) =>
              renderEntry(folder, getFileIcon("folder"))
            )}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div>
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
            Files
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {files.map((file) =>
              renderEntry(file, getFileIcon(file.name), true)
            )}
          </div>
        </div>
      )}
    </div>
  );
};
