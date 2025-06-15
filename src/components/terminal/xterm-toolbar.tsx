import React from "react";
import {
  RotateCcw,
  Square,
  Copy,
  Download,
  Search,
  Settings,
  Maximize2,
  Minimize2,
  Monitor,
} from "lucide-react";

// Types for props
export interface XtermToolbarProps {
  title: string;
  isConnected: boolean;
  isFullscreen: boolean;
  onRestart: () => void;
  onClear: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onToggleSearch: () => void;
  onToggleSettings: () => void;
  onToggleFullscreen: () => void;
  showSearch: boolean;
  showSettings: boolean;
}

const XtermToolbar: React.FC<XtermToolbarProps> = ({
  title,
  isConnected,
  isFullscreen,
  onRestart,
  onClear,
  onCopy,
  onDownload,
  onToggleSearch,
  onToggleSettings,
  onToggleFullscreen,
}) => (
  <div className="flex items-center justify-between px-4 py-2 bg-stone-900 border-b border-stone-700/40">
    <div className="flex items-center gap-2">
      <Monitor className="w-4 h-4 text-stone-400" />
      <span className="text-sm font-medium text-stone-300">{title}</span>
      {isConnected && (
        <div className="flex items-center gap-1 text-xs text-green-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Connected
        </div>
      )}
    </div>
    <div className="flex items-center gap-1">
      {/* Process controls */}
      <button
        onClick={onRestart}
        className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded transition-colors"
        title="Restart terminal"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      <button
        onClick={onClear}
        className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded transition-colors"
        title="Clear terminal"
      >
        <Square className="w-4 h-4" />
      </button>
      <div className="w-px h-4 bg-stone-700 mx-1" />
      {/* Utility actions */}
      <button
        onClick={onCopy}
        className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded transition-colors"
        title="Copy selection"
      >
        <Copy className="w-4 h-4" />
      </button>
      <button
        onClick={onDownload}
        className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded transition-colors"
        title="Download session"
      >
        <Download className="w-4 h-4" />
      </button>
      <button
        onClick={onToggleSearch}
        className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded transition-colors"
        title="Search"
      >
        <Search className="w-4 h-4" />
      </button>
      <div className="w-px h-4 bg-stone-700 mx-1" />
      {/* Settings */}
      <button
        onClick={onToggleSettings}
        className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded transition-colors"
        title="Settings"
      >
        <Settings className="w-4 h-4" />
      </button>
      <button
        onClick={onToggleFullscreen}
        className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded transition-colors"
        title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      >
        {isFullscreen ? (
          <Minimize2 className="w-4 h-4" />
        ) : (
          <Maximize2 className="w-4 h-4" />
        )}
      </button>
    </div>
  </div>
);

export default XtermToolbar;
