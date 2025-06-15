import React, { useState } from "react";
import { FolderOpen, GitBranch, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebContainer } from "@webcontainer/api";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { downloadRepo, importFolder, importZip } from "@/utils/file-tree-util";
import { STARTER_TEMPLATES } from "@/constants/starter-templates";

interface NewChatProps {
  webcontainerInstance: WebContainer;
  setInputValue: (value: string) => void;
}

const quickStarts = [
  "Create a mobile app about bolt.diy",
  "Build a todo app in React using Tailwind",
  "Build a simple blog using Astro",
  "Create a cookie consent form using Material UI",
  "Make a space invaders game",
  "Make a Tic Tac Toe game in html, css and js only",
];

const NewChat: React.FC<NewChatProps> = ({
  webcontainerInstance,
  setInputValue,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showZipModal, setShowZipModal] = useState(false);
  const [zipFilePath, setZipFilePath] = useState("");
  const [zipFolderName, setZipFolderName] = useState("repo");
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneRepoUrl, setCloneRepoUrl] = useState("");
  const [cloneFolderName, setCloneFolderName] = useState("repo");

  const handleImportChat = async () => {
    const selectedFile = await open({
      multiple: false,
      directory: false,
      filters: [{ name: "Chat files", extensions: ["json"] }],
    });
    if (selectedFile) {
      const fileContent = await readTextFile(selectedFile as string);
      console.log("Imported chat JSON:", fileContent);
    }
  };

  const handleImportFolder = async () => {
    if (webcontainerInstance) await importFolder(webcontainerInstance);
  };

  const handleImportZip = async () => {
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
      await importZip(webcontainerInstance, zipFilePath, zipFolderName);
      setShowZipModal(false);
      setZipFilePath("");
      setZipFolderName("repo");
    }
  };

  const handleCloneRepo = () => {
    setShowCloneModal(true);
  };

  const handleDownloadRepo = async () => {
    if (webcontainerInstance && cloneRepoUrl && cloneFolderName) {
      await downloadRepo(webcontainerInstance, cloneRepoUrl, cloneFolderName);
      setShowCloneModal(false);
      setCloneRepoUrl("");
      setCloneFolderName("repo");
      setIsDownloading(false);
    }
  };

  // Handler for starter template selection
  const handleStarterTemplate = async (template: typeof STARTER_TEMPLATES[number]) => {
    if (!webcontainerInstance) return;
    setIsDownloading(true);
    try {
      // Convert githubRepo to full GitHub URL
      const repoUrl = `https://github.com/${template.githubRepo}`;
      // Use label as folder name, sanitized
      const folderName = template.label.replace(/[^a-zA-Z0-9-_]/g, "_");
      await downloadRepo(webcontainerInstance, repoUrl, folderName);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-[100%] h-[100%] py-8 select-none">
      <div className="flex flex-col flex-wrap items-center w-full gap-4 max-w-5xl">
        <div className="flex gap-4 mb-2">
          <Button
            onClick={handleImportChat}
            variant="outline"
            className="flex items-center gap-2 px-6 py-2 text-base font-semibold"
          >
            <Upload className="w-4 h-4" /> Import Chat
          </Button>
          <Button
            onClick={handleImportFolder}
            variant="outline"
            className="flex items-center gap-2 px-6 py-2 text-base font-semibold"
          >
            <FolderOpen className="w-4 h-4" /> Import Folder
          </Button>
          <Button
            onClick={handleImportZip}
            variant="outline"
            className="flex items-center gap-2 px-6 py-2 text-base font-semibold"
          >
            <Upload className="w-4 h-4" /> Import ZIP
          </Button>
          <Button
            onClick={handleCloneRepo}
            variant="outline"
            className="flex items-center gap-2 px-6 py-2 text-base font-semibold"
          >
            <GitBranch className="w-4 h-4" /> Clone a Git Repo
          </Button>
        </div>
        {/* Modal for ZIP file import */}
        {showZipModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-stone-900 p-6 rounded-lg shadow-lg w-96 flex flex-col gap-4">
              <div className="text-lg font-semibold mb-2 text-stone-100">
                Extract ZIP to folder
              </div>
              <div className="text-stone-300 text-xs break-all mb-2">
                {zipFilePath}
              </div>
              <input
                type="text"
                className="border border-stone-700 rounded px-3 py-2 bg-stone-800 text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Folder name (e.g. repo)"
                value={zipFolderName}
                onChange={(e) => setZipFolderName(e.target.value)}
                disabled={isDownloading}
                autoFocus
              />
              <div className="flex gap-2 justify-end mt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowZipModal(false);
                    setZipFilePath("");
                    setZipFolderName("repo");
                  }}
                  disabled={isDownloading}
                  className="px-4"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExtractZip}
                  disabled={!zipFilePath || !zipFolderName || isDownloading}
                  className="px-4"
                >
                  {isDownloading ? "Extracting..." : "Extract & Mount"}
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Modal for Clone Repo */}
        {showCloneModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-stone-900 p-6 rounded-lg shadow-lg w-96 flex flex-col gap-4">
              <div className="text-lg font-semibold mb-2 text-stone-100">
                Clone GitHub Repo
              </div>
              <input
                type="text"
                className="border border-stone-700 rounded px-3 py-2 bg-stone-800 text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://github.com/user/repo or direct .zip"
                value={cloneRepoUrl}
                onChange={(e) => setCloneRepoUrl(e.target.value)}
                disabled={isDownloading}
                autoFocus
              />
              <input
                type="text"
                className="border border-stone-700 rounded px-3 py-2 bg-stone-800 text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Folder name (e.g. repo)"
                value={cloneFolderName}
                onChange={(e) => setCloneFolderName(e.target.value)}
                disabled={isDownloading}
              />
              <div className="flex gap-2 justify-end mt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowCloneModal(false);
                    setCloneRepoUrl("");
                    setCloneFolderName("repo");
                  }}
                  disabled={isDownloading}
                  className="px-4"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDownloadRepo}
                  disabled={!cloneRepoUrl || !cloneFolderName || isDownloading}
                  className="px-4"
                >
                  {isDownloading ? "Downloading..." : "Download & Mount"}
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {quickStarts.map((q) => (
            <Button
              key={q}
              variant="ghost"
              className="rounded-full px-4 py-1 text-xs border border-stone-700/40 text-stone-300 hover:bg-stone-800/60"
              onClick={() => setInputValue(q)}
            >
              {q}
            </Button>
          ))}
        </div>
        <div className="text-stone-400 text-sm my-2">
          or start a blank app with your favorite stack
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 w-full mt-2">
          {STARTER_TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.name}
                type="button"
                onClick={() => handleStarterTemplate(template)}
                className="flex items-center gap-4 p-4 bg-stone-800/80 rounded-lg border border-stone-700 shadow hover:shadow-lg hover:border-blue-500 transition w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={isDownloading}
              >
                {Icon && <Icon className="w-8 h-8 text-blue-400 flex-shrink-0" />}
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-white text-base truncate">{template.label}</span>
                  <span className="text-xs text-stone-400 mt-1 line-clamp-2">{template.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NewChat;
