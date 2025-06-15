import "@xterm/xterm/css/xterm.css";
import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Terminal, ITerminalOptions } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { SearchAddon } from "@xterm/addon-search";
import { Unicode11Addon } from "@xterm/addon-unicode11";
import { SerializeAddon } from "@xterm/addon-serialize";
import { WebContainer, WebContainerProcess } from "@webcontainer/api";
import { TERMINAL_THEMES } from "@/constants/terminal-themes";

export interface UseXtermOptions {
  webcontainerInstance: WebContainer;
  initialCommand?: string;
  theme?: keyof typeof TERMINAL_THEMES;
  fontSize?: number;
  fontFamily?: string;
  onProcessStart?: (process: WebContainerProcess) => void;
  onProcessEnd?: () => void;
  onOutput?: (data: string) => void;
}

export interface UseXtermResult {
  xterm: Terminal | null;
  fitAddon: FitAddon | null;
  searchAddon: SearchAddon | null;
  serializeAddon: SerializeAddon | null;
  process: WebContainerProcess | null;
  state: TerminalState;
  actions: any;
  initializeTerminal: () => Promise<void>;
  terminalRef: React.RefObject<HTMLDivElement>;
  terminalContainerRef: React.RefObject<HTMLDivElement>;
}

export interface TerminalState {
  isConnected: boolean;
  isFullscreen: boolean;
  showSearch: boolean;
  showSettings: boolean;
  currentTheme: keyof typeof TERMINAL_THEMES;
  fontSize: number;
  fontFamily: string;
  isProcessRunning: boolean;
}

const useXterm = (options: UseXtermOptions): UseXtermResult => {
  const {
    webcontainerInstance,
    initialCommand,
    theme = "dark",
    fontSize = 14,
    fontFamily = "monospace",
    onProcessStart,
    onProcessEnd,
    onOutput,
  } = options;

  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const searchAddonRef = useRef<SearchAddon | null>(null);
  const serializeAddonRef = useRef<SerializeAddon | null>(null);
  const processRef = useRef<WebContainerProcess | null>(null);
  const readerRef = useRef<any>(null);
  const outputBufferRef = useRef<string>("");

  const [state, setState] = useState<TerminalState>({
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
  const terminalOptions: ITerminalOptions = useMemo(
    () => ({
      convertEol: true,
      fontFamily: state.fontFamily,
      fontSize: state.fontSize,
      fontWeight: "400",
      fontWeightBold: "700",
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
      searchAddonRef.current = searchAddon;
      serializeAddonRef.current = serializeAddon;

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
    } catch (error) {
      setState((prev) => ({ ...prev, isConnected: false }));
    }
  }, [webcontainerInstance, terminalOptions, initialCommand, onProcessStart, onProcessEnd, onOutput]);

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

    download: useCallback(() => {
      if (serializeAddonRef.current) {
        const content = serializeAddonRef.current.serialize();
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `terminal-session-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }, []),

    toggleFullscreen: useCallback(() => {
      setState((prev) => {
        const newFullscreen = !prev.isFullscreen;
        if (newFullscreen) {
          terminalContainerRef.current?.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
        return { ...prev, isFullscreen: newFullscreen };
      });
    }, []),

    updateTheme: useCallback((newTheme: keyof typeof TERMINAL_THEMES) => {
      setState((prev) => ({ ...prev, currentTheme: newTheme }));
    }, []),

    updateFontSize: useCallback((newSize: number) => {
      setState((prev) => ({
        ...prev,
        fontSize: Math.max(8, Math.min(24, newSize)),
      }));
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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setState((prev) => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement,
      }));
      setTimeout(handleResize, 100);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
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

  return {
    xterm: xtermRef.current,
    fitAddon: fitAddonRef.current,
    searchAddon: searchAddonRef.current,
    serializeAddon: serializeAddonRef.current,
    process: processRef.current,
    state,
    actions,
    initializeTerminal,
    terminalRef,
    terminalContainerRef,
  };
};

export default useXterm;
