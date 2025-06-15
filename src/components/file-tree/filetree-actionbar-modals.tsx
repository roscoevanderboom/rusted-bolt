import React from "react";

interface ZipModalProps {
  show: boolean;
  zipFilePath: string;
  zipFolderName: string;
  setZipFolderName: (name: string) => void;
  isDownloading: boolean;
  onClose: () => void;
  onExtract: () => void;
}

export const ZipModal: React.FC<ZipModalProps> = ({
  show,
  zipFilePath,
  zipFolderName,
  setZipFolderName,
  isDownloading,
  onClose,
  onExtract,
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-stone-900 p-6 rounded-lg shadow-lg w-96 flex flex-col gap-4">
        <div className="text-lg font-semibold mb-2 text-stone-100">
          Extract ZIP to folder
        </div>
        <div className="text-stone-300 text-xs break-all mb-2">{zipFilePath}</div>
        <input
          type="text"
          className="border border-stone-700 rounded px-3 py-2 bg-stone-800 text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Folder name (e.g. repo)"
          value={zipFolderName}
          onChange={e => setZipFolderName(e.target.value)}
          disabled={isDownloading}
          autoFocus
        />
        <div className="flex gap-2 justify-end mt-2">
          <button
            className="px-4 py-2 rounded bg-stone-700 text-white hover:bg-stone-600"
            onClick={onClose}
            disabled={isDownloading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500"
            onClick={onExtract}
            disabled={!zipFilePath || !zipFolderName || isDownloading}
          >
            {isDownloading ? "Extracting..." : "Extract & Mount"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface CloneModalProps {
  show: boolean;
  cloneRepoUrl: string;
  setCloneRepoUrl: (url: string) => void;
  cloneFolderName: string;
  setCloneFolderName: (name: string) => void;
  isDownloading: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export const CloneModal: React.FC<CloneModalProps> = ({
  show,
  cloneRepoUrl,
  setCloneRepoUrl,
  cloneFolderName,
  setCloneFolderName,
  isDownloading,
  onClose,
  onDownload,
}) => {
  if (!show) return null;
  return (
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
          onChange={e => setCloneRepoUrl(e.target.value)}
          disabled={isDownloading}
          autoFocus
        />
        <input
          type="text"
          className="border border-stone-700 rounded px-3 py-2 bg-stone-800 text-stone-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Folder name (e.g. repo)"
          value={cloneFolderName}
          onChange={e => setCloneFolderName(e.target.value)}
          disabled={isDownloading}
        />
        <div className="flex gap-2 justify-end mt-2">
          <button
            className="px-4 py-2 rounded bg-stone-700 text-white hover:bg-stone-600"
            onClick={onClose}
            disabled={isDownloading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-500"
            onClick={onDownload}
            disabled={!cloneRepoUrl || !cloneFolderName || isDownloading}
          >
            {isDownloading ? "Downloading..." : "Download & Mount"}
          </button>
        </div>
      </div>
    </div>
  );
}; 