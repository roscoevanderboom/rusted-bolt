import { useEffect, useRef, useState, useCallback } from "react";
import { WebContainer } from "@webcontainer/api";
import { emit } from "@tauri-apps/api/event";
import { isIgnored, findNodeByPath } from "@/utils/webcontainer-utils";
import { buildFileTreeFromFS } from "@/utils/file-tree-util";
import { WebcontainerFileNode } from "@/types/webcontainer";
import {
  executeFileOperation,
  FileOperation,
  FileOperationResult,
} from "@/utils/file-tree-util";
import { toast } from "sonner";

export interface WebContainerServerState {
  connected: boolean;
  port: number | null;
  url: string | null;
}

export function useWebContainer(webcontainerInstance: WebContainer | null) {
  const unsubscribersRef = useRef<(() => void)[]>([]);
  const watcherRefs = useRef<{ [path: string]: { close: () => void } }>({});

  // State
  const [fileTree, setFileTree] = useState<WebcontainerFileNode[]>([]);
  const [currentNode, setCurrentNode] = useState<WebcontainerFileNode | null>(
    null
  );
  const [createMode, setCreateMode] = useState<{
    type: "file" | "directory";
    cwd: string;
    value: string;
  } | null>(null);
  const [filePath, setFilePath] = useState<string>("");
  const [connected, setConnected] = useState(false);
  const [server, setServer] = useState<WebContainerServerState>({
    connected: false,
    port: null,
    url: null,
  });
  const [error, setError] = useState<Error | null>(null);

  // File tree operations
  const performFileOperation = useCallback(
    async (operation: FileOperation): Promise<FileOperationResult> => {
      if (!webcontainerInstance) {
        return { success: false, error: "WebContainer not initialized" };
      }

      const result = await executeFileOperation(
        webcontainerInstance,
        operation
      );

      if (result.success) {
        await buildFileTree(); // Refresh the file tree
        toast.success(`${operation.type} operation successful`);
      } else {
        toast.error(`${operation.type} operation failed: ${result.error}`);
      }

      return result;
    },
    [webcontainerInstance]
  );

  // File tree logic
  const buildFileTree = useCallback(
    async (basePath = "/") => {
      if (!webcontainerInstance) return [];
      return buildFileTreeFromFS({
        fs: webcontainerInstance.fs,
        rootPath: basePath,
        basePath: "/",
        isWebContainer: true,
        setFileTree,
        withContent: true,
      });
    },
    [webcontainerInstance, setFileTree]
  );

  const cleanupWatchers = useCallback(() => {
    Object.values(watcherRefs.current).forEach((w) => {
      try {
        w.close();
      } catch {}
    });
    watcherRefs.current = {};
  }, []);

  const setupRecursiveWatchers = useCallback(
    async (basePath = "/") => {
      if (!webcontainerInstance) return;
      if (!watcherRefs.current[basePath]) {
        try {
          const watcher = webcontainerInstance.fs.watch(basePath, async () => {
            cleanupWatchers();
            await buildFileTree();
            await setupRecursiveWatchers();
          });
          watcherRefs.current[basePath] = watcher;
        } catch {}
      }
      let entries: string[] = [];
      try {
        entries = await webcontainerInstance.fs.readdir(basePath);
      } catch {
        return;
      }
      for (const entry of entries) {
        const fullPath =
          basePath === "/" ? `/${entry}` : `${basePath}/${entry}`;
        const relativePath = fullPath.replace(/^\//, "");
        if (isIgnored(relativePath) || isIgnored(relativePath + "/")) continue;
        try {
          await webcontainerInstance.fs.readdir(fullPath);
          await setupRecursiveWatchers(fullPath);
        } catch {}
      }
    },
    [webcontainerInstance, buildFileTree, cleanupWatchers]
  );

  // WebContainer event listeners
  useEffect(() => {
    if (!webcontainerInstance) return;
    unsubscribersRef.current.forEach((unsub) => unsub());
    unsubscribersRef.current = [];

    const handleServerReady = (port: number, url: string) => {
      setServer({ connected: true, port, url });
      setConnected(true);
      emit("webcontainer-ready", { port, url });
    };
    const handlePortChange = (
      port: number,
      type: "open" | "close",
      url?: string
    ) => {
      if (type === "open") {
        setServer((s) => ({ ...s, connected: true, port, url: url ?? s.url }));
        setConnected(true);
      } else {
        setServer((s) => ({ ...s, connected: false, port: null, url: null }));
        setConnected(false);
      }
    };
    const handlePreviewMessage = (_: any) => {
      // Optionally update state based on preview messages
    };
    const handleError = (err: Error) => {
      setError(err);
    };
    const handleXdgOpen = (_: string) => {
      // Optionally update state
    };
    const handleCode = (path: string) => {
      setFilePath(path);
    };

    unsubscribersRef.current.push(
      webcontainerInstance.on("server-ready", handleServerReady)
    );
    unsubscribersRef.current.push(
      webcontainerInstance.on("port", handlePortChange)
    );
    unsubscribersRef.current.push(
      webcontainerInstance.on("preview-message", handlePreviewMessage)
    );
    unsubscribersRef.current.push(
      (webcontainerInstance.on as any)("error", handleError)
    );
    unsubscribersRef.current.push(
      webcontainerInstance.on("xdg-open", handleXdgOpen)
    );
    unsubscribersRef.current.push(webcontainerInstance.on("code", handleCode));

    return () => {
      unsubscribersRef.current.forEach((unsub) => unsub());
      unsubscribersRef.current = [];
    };
  }, [webcontainerInstance]);

  // File tree setup on instance change
  useEffect(() => {
    if (!webcontainerInstance) return;
    let cancelled = false;
    (async () => {
      await buildFileTree();
      if (!cancelled) {
        cleanupWatchers();
        await setupRecursiveWatchers();
      }
    })();
    return () => {
      cancelled = true;
      cleanupWatchers();
    };
  }, [
    webcontainerInstance,
    buildFileTree,
    setupRecursiveWatchers,
    cleanupWatchers,
  ]);

  // --- WebContainer fs and spawn helpers ---
  const fs = webcontainerInstance?.fs;
  const spawn = webcontainerInstance?.spawn?.bind(webcontainerInstance);

  return {
    // State
    fileTree,
    setFileTree,
    currentNode,
    setCurrentNode,
    createMode,
    setCreateMode,
    filePath,
    setFilePath,
    connected,
    server,
    error,
    // File tree operations
    performFileOperation,
    // File tree helpers
    buildFileTree,
    setupRecursiveWatchers,
    cleanupWatchers,
    // WebContainer fs and spawn
    fs,
    spawn,
    // Expose findNodeByPath for convenience
    findNodeByPath,
  };
}
