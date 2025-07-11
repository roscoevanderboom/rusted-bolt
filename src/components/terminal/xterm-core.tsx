import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Zap } from "lucide-react";
import { WebContainer } from "@webcontainer/api";

type ThemeName = "dark" | "light" | "monokai" | "github";

interface XtermCoreProps {
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
  onError?: (error: any) => void;
}

// Terminal themes
const TERMINAL_THEMES = {
  dark: {
    background: "#0c0c0c",
    foreground: "#cccccc",
    cursor: "#cccccc",
    cursorAccent: "#000000",
    selection: "#3e3e3e",
    black: "#000000",
    red: "#cd3131",
    green: "#0dbc79",
    yellow: "#e5e510",
    blue: "#2472c8",
    magenta: "#bc3fbc",
    cyan: "#11a8cd",
    white: "#e5e5e5",
    brightBlack: "#666666",
    brightRed: "#f14c4c",
    brightGreen: "#23d18b",
    brightYellow: "#f5f543",
    brightBlue: "#3b8eea",
    brightMagenta: "#d670d6",
    brightCyan: "#29b8db",
    brightWhite: "#ffffff",
  },
  light: {
    background: "#ffffff",
    foreground: "#333333",
    cursor: "#333333",
    cursorAccent: "#ffffff",
    selection: "#add6ff",
    black: "#000000",
    red: "#cd3131",
    green: "#008000",
    yellow: "#ffff00",
    blue: "#0000ff",
    magenta: "#ff00ff",
    cyan: "#00ffff",
    white: "#ffffff",
    brightBlack: "#808080",
    brightRed: "#ff0000",
    brightGreen: "#00ff00",
    brightYellow: "#ffff00",
    brightBlue: "#0000ff",
    brightMagenta: "#ff00ff",
    brightCyan: "#00ffff",
    brightWhite: "#ffffff",
  },
  monokai: {
    background: "#272822",
    foreground: "#f8f8f2",
    cursor: "#f8f8f2",
    cursorAccent: "#272822",
    selection: "#49483e",
    black: "#272822",
    red: "#f92672",
    green: "#a6e22e",
    yellow: "#f4bf75",
    blue: "#66d9ef",
    magenta: "#ae81ff",
    cyan: "#a1efe4",
    white: "#f8f8f2",
    brightBlack: "#75715e",
    brightRed: "#f92672",
    brightGreen: "#a6e22e",
    brightYellow: "#f4bf75",
    brightBlue: "#66d9ef",
    brightMagenta: "#ae81ff",
    brightCyan: "#a1efe4",
    brightWhite: "#f9f8f5",
  },
  github: {
    background: "#f6f8fa",
    foreground: "#24292e",
    cursor: "#24292e",
    cursorAccent: "#f6f8fa",
    selection: "#c8e1ff",
    black: "#586069",
    red: "#d73a49",
    green: "#28a745",
    yellow: "#ffd33d",
    blue: "#0366d6",
    magenta: "#ea4aaa",
    cyan: "#17e5e6",
    white: "#fafbfc",
    brightBlack: "#959da5",
    brightRed: "#cb2431",
    brightGreen: "#28a745",
    brightYellow: "#ffd33d",
    brightBlue: "#0366d6",
    brightMagenta: "#ea4aaa",
    brightCyan: "#17e5e6",
    brightWhite: "#ffffff",
  },
};

// Lazy load XTerm and addons
const loadXTermPackages = async () => {
  const [
    { Terminal },
    { FitAddon },
    { WebLinksAddon },
    { SearchAddon },
    { Unicode11Addon },
    { SerializeAddon },
  ] = await Promise.all([
    import("@xterm/xterm"),
    import("@xterm/addon-fit"),
    import("@xterm/addon-web-links"),
    import("@xterm/addon-search"),
    import("@xterm/addon-unicode11"),
    import("@xterm/addon-serialize"),
  ]);

  // Import CSS
  await import("@xterm/xterm/css/xterm.css");

  return {
    Terminal,
    FitAddon,
    WebLinksAddon,
    SearchAddon,
    Unicode11Addon,
    SerializeAddon,
  };
};

const XtermCore: React.FC<XtermCoreProps> = ({
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
  onError,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const processRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const outputBufferRef = useRef<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [state, setState] = useState({
    isConnected: false,
    isFullscreen: false,
    showSearch: false,
    showSettings: false,
    currentTheme: theme,
    fontSize,
    fontFamily,
    isProcessRunning: false,
  });

  // Memoized terminal options
  const terminalOptions = useMemo(
    () => ({
      convertEol: true,
      fontFamily: state.fontFamily,
      fontSize: state.fontSize,
      fontWeight: 400,
      fontWeightBold: 700,
      lineHeight: 1.2,
      letterSpacing: 0,
      cursorBlink: true,
      cursorStyle: "block" as const,
      scrollback: 10000,
      tabStopWidth: 4,
      theme: TERMINAL_THEMES[state.currentTheme],
      allowProposedApi: true,
      smoothScrollDuration: 150,
    }),
    [state.currentTheme, state.fontSize, state.fontFamily]
  );

  // Initialize terminal
  const initializeTerminal = useCallback(async () => {
    if (!terminalRef.current || !webcontainerInstance) return;

    try {
      setIsLoading(true);
      setLoadError(null);

      // Load XTerm packages
      const {
        Terminal,
        FitAddon,
        WebLinksAddon,
        SearchAddon,
        Unicode11Addon,
        SerializeAddon,
      } = await loadXTermPackages();

      // Clean up existing terminal
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }

      // Create new terminal instance
      const xterm = new Terminal(terminalOptions);

      // Load addons
      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();
      const searchAddon = new SearchAddon();
      const unicode11Addon = new Unicode11Addon();
      const serializeAddon = new SerializeAddon();

      xterm.loadAddon(fitAddon);
      xterm.loadAddon(webLinksAddon);
      xterm.loadAddon(searchAddon);
      xterm.loadAddon(unicode11Addon);
      xterm.loadAddon(serializeAddon);

      // Set Unicode version
      xterm.unicode.activeVersion = "11";

      // Open terminal
      xterm.open(terminalRef.current);
      fitAddon.fit();

      // Store references
      xtermRef.current = xterm;
      fitAddonRef.current = fitAddon;

      // Compact welcome message
      xterm.writeln("\x1b[1;32m→ WebContainer Shell Ready\x1b[0m");

      // Spawn shell process
      const shellProcess = await webcontainerInstance.spawn("jsh", {
        terminal: {
          cols: xterm.cols,
          rows: xterm.rows,
        },
      });

      processRef.current = shellProcess;
      onProcessStart?.(shellProcess);

      setState((prev) => ({
        ...prev,
        isConnected: true,
        isProcessRunning: true,
      }));

      // Handle process output
      const reader = shellProcess.output.getReader();
      readerRef.current = reader;

      const readOutput = async () => {
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              xterm.write(value);
              outputBufferRef.current += value;
              onOutput?.(value);
            }
          }
        } catch (error) {
          // Output stream ended
        } finally {
          setState((prev) => ({ ...prev, isProcessRunning: false }));
          onProcessEnd?.();
        }
      };

      readOutput();

      // Handle terminal input
      xterm.onData(async (data) => {
        if (processRef.current && processRef.current.input) {
          try {
            const writer = processRef.current.input.getWriter();
            await writer.write(data);
            writer.releaseLock();
          } catch (error) {
            // Failed to write to terminal input
          }
        }
      });

      // Execute initial command if provided
      if (initialCommand) {
        setTimeout(() => {
          xterm.write(initialCommand + "\r");
        }, 1000);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Terminal initialization error:", error);
      setLoadError(error instanceof Error ? error.message : "Unknown error");
      setIsLoading(false);
      onError?.(error);
      setState((prev) => ({ ...prev, isConnected: false }));
    }
  }, [webcontainerInstance, terminalOptions, initialCommand, onProcessStart, onProcessEnd, onOutput, onError]);

  // Terminal actions
  const actions = {
    restart: useCallback(async () => {
      if (processRef.current && processRef.current.kill) {
        processRef.current.kill();
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      initializeTerminal();
    }, [initializeTerminal]),

    clear: useCallback(() => {
      if (xtermRef.current) {
        xtermRef.current.clear();
        outputBufferRef.current = "";
      }
    }, []),

    copy: useCallback(async () => {
      if (xtermRef.current) {
        const selection = xtermRef.current.getSelection();
        if (selection) {
          try {
            await navigator.clipboard.writeText(selection);
          } catch (error) {
            // Failed to copy to clipboard
          }
        }
      }
    }, []),
  };

  // Handle resize
  const handleResize = useCallback(() => {
    if (fitAddonRef.current && xtermRef.current) {
      fitAddonRef.current.fit();
      if (processRef.current && processRef.current.resize) {
        processRef.current.resize({
          cols: xtermRef.current.cols,
          rows: xtermRef.current.rows,
        });
      }
    }
  }, []);

  // Effects
  useEffect(() => {
    initializeTerminal();
    return () => {
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
      if (processRef.current && processRef.current.kill) {
        processRef.current.kill();
      }
    };
  }, [initializeTerminal]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  // Update terminal when theme/font changes
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.theme = TERMINAL_THEMES[state.currentTheme];
      xtermRef.current.options.fontSize = state.fontSize;
      xtermRef.current.options.fontFamily = state.fontFamily;
      handleResize();
    }
  }, [state.currentTheme, state.fontSize, state.fontFamily, handleResize]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-stone-950 border border-stone-700/40">
        <div className="flex items-center gap-2 text-stone-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-400"></div>
          <span className="text-sm">Loading terminal packages...</span>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-stone-950 border border-stone-700/40 text-red-400">
        <div className="text-center">
          <p className="text-sm">Terminal initialization failed</p>
          <p className="text-xs text-stone-500 mt-1">{loadError}</p>
          <button
            onClick={() => initializeTerminal()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={terminalContainerRef}
      className={`flex flex-col h-full bg-stone-950 border border-stone-700/40 overflow-hidden ${
        state.isFullscreen ? "fixed inset-0 z-50" : ""
      } ${className}`}
    >
      {/* Simple toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-4 py-2 bg-stone-900 border-b border-stone-700/40">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-stone-300">{title}</h3>
            {state.isConnected && (
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={actions.restart}
              className="px-2 py-1 text-xs bg-stone-700 text-stone-300 rounded hover:bg-stone-600 transition-colors"
            >
              Restart
            </button>
            <button
              onClick={actions.clear}
              className="px-2 py-1 text-xs bg-stone-700 text-stone-300 rounded hover:bg-stone-600 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={actions.copy}
              className="px-2 py-1 text-xs bg-stone-700 text-stone-300 rounded hover:bg-stone-600 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
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

export default XtermCore;