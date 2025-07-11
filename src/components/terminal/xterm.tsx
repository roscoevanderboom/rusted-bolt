import React, { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { Terminal as TerminalIcon } from "lucide-react";
import { WebContainer } from "@webcontainer/api";

type ThemeName = "dark" | "light" | "monokai" | "github";

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

// Lazy load the actual terminal component
const LazyXtermTerminal = React.lazy(() => import("./xterm-core"));

// Terminal loading component
const TerminalLoader = ({ 
  onLoad, 
  error 
}: { 
  onLoad: () => void; 
  error: string | null; 
}) => (
  <div className="flex flex-col items-center justify-center h-full bg-stone-950 border border-stone-700/40">
    {error ? (
      <div className="text-center text-red-400">
        <div className="mb-4">
          <TerminalIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Failed to load terminal</p>
          <p className="text-xs text-stone-500 mt-1">{error}</p>
        </div>
        <button
          onClick={onLoad}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    ) : (
      <div className="text-center text-stone-400">
        <div className="mb-4">
          <TerminalIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-400"></div>
            <span className="text-sm">Loading terminal...</span>
          </div>
        </div>
        <button
          onClick={onLoad}
          className="px-4 py-2 bg-stone-700 text-white rounded hover:bg-stone-600 transition-colors"
        >
          Load Terminal
        </button>
      </div>
    )}
  </div>
);

const XtermTerminal: React.FC<XtermTerminalProps> = (props) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const loadAttemptRef = useRef(0);

  const handleLoad = useCallback(() => {
    loadAttemptRef.current += 1;
    setLoadError(null);
    setIsLoaded(true);
  }, []);

  const handleError = useCallback((error: any) => {
    console.error("Terminal loading error:", error);
    setLoadError(error.message || "Unknown error occurred");
    setIsLoaded(false);
  }, []);

  // Auto-load on mount for better UX (but keep manual loading option)
  useEffect(() => {
    // Auto-load after a short delay to allow other components to load first
    const timer = setTimeout(() => {
      if (!isLoaded && loadAttemptRef.current === 0) {
        handleLoad();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isLoaded, handleLoad]);

  if (!isLoaded) {
    return <TerminalLoader onLoad={handleLoad} error={loadError} />;
  }

  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-full bg-stone-950 border border-stone-700/40">
          <div className="flex items-center gap-2 text-stone-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-400"></div>
            <span className="text-sm">Initializing terminal...</span>
          </div>
        </div>
      }
    >
      <LazyXtermTerminal 
        {...props} 
        onError={handleError}
        key={loadAttemptRef.current} // Force re-mount on retry
      />
    </Suspense>
  );
};

export default XtermTerminal;
