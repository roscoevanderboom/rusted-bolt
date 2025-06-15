import React from "react";
import { Zap } from "lucide-react";
import XtermToolbar from "./xterm-toolbar";
import useXterm from "@/hooks/use-xterm";
import { TERMINAL_THEMES } from "@/constants/terminal-themes";
import { WebContainer } from "@webcontainer/api";
import XtermSearchBar from "./xterm-search-bar";
import XtermSettingsPanel from "./xterm-settings-panel";

type ThemeName = keyof typeof TERMINAL_THEMES;

interface XtermTerminalProps {
  webcontainerInstance: WebContainer;
  initialCommand?: string;
  className?: string;
  title?: string;
  showToolbar?: boolean;
  theme?: ThemeName;
  fontSize?: number;
  fontFamily?: string;
  onProcessStart?: (process: any) => void;
  onProcessEnd?: () => void;
  onOutput?: (data: string) => void;
}

const XtermTerminal: React.FC<XtermTerminalProps> = ({
  webcontainerInstance,
  initialCommand,
  className = "",
  title = "Terminal",
  showToolbar = true,
  theme = "dark",
  fontSize = 14,
  fontFamily = "monospace",
  onProcessStart,
  onProcessEnd,
  onOutput,
}) => {
  const {
    state,
    actions,
    terminalRef,
    terminalContainerRef,
    searchAddon,
  } = useXterm({
    webcontainerInstance,
    initialCommand,
    theme,
    fontSize,
    fontFamily,
    onProcessStart,
    onProcessEnd,
    onOutput,
  });

  const [searchValue, setSearchValue] = React.useState("");

  return (
    <div
      ref={terminalContainerRef}
      className={`flex flex-col h-full bg-stone-950 border border-stone-700/40 overflow-hidden ${
        state.isFullscreen ? "fixed inset-0 z-50" : ""
      } ${className}`}
    >
      {/* Toolbar */}
      {showToolbar && (
        <XtermToolbar
          title={title}
          isConnected={state.isConnected}
          isFullscreen={state.isFullscreen}
          onRestart={actions.restart}
          onClear={actions.clear}
          onCopy={actions.copy}
          onDownload={actions.download}
          onToggleSearch={() =>
            actions && actions.toggleSearch
              ? actions.toggleSearch()
              : null
          }
          onToggleSettings={() =>
            actions && actions.toggleSettings
              ? actions.toggleSettings()
              : null
          }
          onToggleFullscreen={actions.toggleFullscreen}
          showSearch={state.showSearch}
          showSettings={state.showSettings}
        />
      )}

      {/* Search bar */}
      {state.showSearch && (
        <XtermSearchBar
          value={searchValue}
          onChange={val => {
            setSearchValue(val);
            if (searchAddon) searchAddon.findNext(val);
          }}
          onClose={() => actions && actions.toggleSearch ? actions.toggleSearch() : null}
        />
      )}

      {/* Settings panel */}
      {state.showSettings && (
        <XtermSettingsPanel
          currentTheme={state.currentTheme}
          fontSize={state.fontSize}
          onThemeChange={actions.updateTheme}
          onFontSizeChange={actions.updateFontSize}
        />
      )}

      {/* Terminal */}
      <div
        ref={terminalRef}
        className="flex-1 min-h-0"
        style={{
          background: TERMINAL_THEMES[state.currentTheme].background,
        }}
      />

      {/* Status bar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-4 py-1 bg-stone-900 border-t border-stone-700/40 text-xs text-stone-500">
          <div className="flex items-center gap-4">
            <span>Shell: jsh</span>
            <span>Theme: {state.currentTheme}</span>
            <span>Font: {state.fontSize}px</span>
          </div>
          <div className="flex items-center gap-2">
            {state.isProcessRunning && (
              <div className="flex items-center gap-1 text-green-400">
                <Zap className="w-3 h-3" />
                <span>Running</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default XtermTerminal;
