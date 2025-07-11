import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { WebContainer } from "@webcontainer/api";
import { WebcontainerFileNode } from "@/types/webcontainer";
import { executeFileOperation } from "@/utils/file-tree-util";

interface CodeEditorProps {
  filePath: string;
  webcontainerInstance: WebContainer;
  fileTree: WebcontainerFileNode[];
}

// Lazy load Monaco Editor
const loadMonacoEditor = async () => {
  const monaco = await import("monaco-editor");
  
  // Configure Monaco environment for workers - use a simpler configuration
  if (typeof window !== 'undefined' && !window.MonacoEnvironment) {
    window.MonacoEnvironment = {
      getWorker: function (_workerId, _label) {
        // Use a simpler fallback worker for all cases
        const workerUrl = URL.createObjectURL(new Blob([
          `
          importScripts('https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/base/worker/workerMain.js');
          `
        ], { type: 'application/javascript' }));
        return new Worker(workerUrl);
      }
    };
  }
  
  return monaco;
};

function getFileContentByPath(
  nodes: WebcontainerFileNode[],
  path: string
): string | undefined {
  for (const node of nodes) {
    if (node.path === path && node.type === "file") return node.content;
    if (node.type === "directory" && node.children) {
      const found = getFileContentByPath(node.children, path);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

function getLanguageFromFileName(fileName: string): string {
  const extensionMap: Record<string, string> = {
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".json": "json",
    ".css": "css",
    ".scss": "scss",
    ".less": "less",
    ".html": "html",
    ".htm": "html",
    ".xml": "xml",
    ".md": "markdown",
    ".py": "python",
    ".java": "java",
    ".c": "c",
    ".cpp": "cpp",
    ".h": "c",
    ".hpp": "cpp",
    ".cs": "csharp",
    ".php": "php",
    ".rb": "ruby",
    ".go": "go",
    ".rs": "rust",
    ".sql": "sql",
    ".sh": "shell",
    ".bash": "shell",
    ".yml": "yaml",
    ".yaml": "yaml",
  };
  const extension = Object.keys(extensionMap).find((ext) =>
    fileName.endsWith(ext)
  );
  return extension ? extensionMap[extension] : "plaintext";
}

// Optimized Monaco Editor wrapper with lazy loading
function MonacoEditor({ 
  value, 
  language, 
  onChange 
}: { 
  value: string; 
  language: string; 
  onChange?: (value: string) => void 
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const ignoreFirstChange = useRef(true);

  // Initialize Monaco Editor
  useEffect(() => {
    let cancelled = false;
    
    const initMonaco = async () => {
      if (!containerRef.current) return;
      
      try {
        const monaco = await loadMonacoEditor();
        if (cancelled) return;
        
        monacoRef.current = monaco;
        
        // Create editor instance
        editorRef.current = monaco.editor.create(containerRef.current, {
          value,
          language,
          theme: "vs-dark",
          automaticLayout: true,
          fontSize: 14,
          minimap: { enabled: false },
          wordWrap: "on",
          scrollBeyondLastLine: false,
          fontFamily: 'Fira Mono, Menlo, Monaco, "Liberation Mono", "Courier New", monospace',
          lineNumbers: "on",
          readOnly: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          renderLineHighlight: "gutter",
          selectionHighlight: false,
          // Performance optimizations
          renderValidationDecorations: "off",
          scrollbar: {
            alwaysConsumeMouseWheel: false,
          },
          suggest: {
            showMethods: false,
            showFunctions: false,
            showConstructors: false,
            showFields: false,
            showVariables: false,
            showClasses: false,
            showStructs: false,
            showInterfaces: false,
            showModules: false,
            showProperties: false,
            showEvents: false,
            showOperators: false,
            showUnits: false,
            showValues: false,
            showConstants: false,
            showEnums: false,
            showEnumMembers: false,
            showKeywords: false,
            showWords: false,
            showColors: false,
            showFiles: false,
            showReferences: false,
            showFolders: false,
            showTypeParameters: false,
            showSnippets: false,
          },
        });
        
        // Add change listener
        editorRef.current.onDidChangeModelContent(() => {
          if (ignoreFirstChange.current) {
            ignoreFirstChange.current = false;
            return;
          }
          onChange?.(editorRef.current.getValue());
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load Monaco Editor:", error);
        setLoadError("Failed to load editor");
        setIsLoading(false);
      }
    };
    
    initMonaco();
    
    return () => {
      cancelled = true;
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []);

  // Update value when prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  // Update language when prop changes
  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full text-red-400">
        <div className="text-center">
          <p>{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-2 text-stone-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-400"></div>
          <span>Loading editor...</span>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

const CodeEditor = ({
  filePath,
  webcontainerInstance,
  fileTree,
}: CodeEditorProps) => {
  const [editorValue, setEditorValue] = useState<string>("");
  const [lastSavedValue, setLastSavedValue] = useState<string>("");
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load file content on filePath or fileTree change
  useEffect(() => {
    if (filePath) {
      const content = getFileContentByPath(fileTree, filePath) ?? "";
      setEditorValue(content);
      setLastSavedValue(content);
      setIsDirty(false);
    } else {
      setEditorValue("");
      setLastSavedValue("");
      setIsDirty(false);
    }
  }, [filePath, fileTree]);

  // Track dirty state
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      const newValue = value ?? "";
      setEditorValue(newValue);
      setIsDirty(newValue !== lastSavedValue);
    },
    [lastSavedValue]
  );

  // Undo changes
  const handleUndo = useCallback(() => {
    setEditorValue(lastSavedValue);
    setIsDirty(false);
  }, [lastSavedValue]);

  // Save file
  const handleSave = useCallback(async () => {
    if (!webcontainerInstance || !filePath || !isDirty) return;
    setIsSaving(true);
    try {
      const fileFullPath = filePath.startsWith("/") ? filePath : `/${filePath}`;

      await executeFileOperation(webcontainerInstance, {
        type: "update",
        sourcePath: fileFullPath,
        content: editorValue,
      });
      setLastSavedValue(editorValue);
      setIsDirty(false);
      toast.success("File saved successfully");
    } catch (error) {
      console.error("Failed to save file:", error);
      toast.error("Failed to save file");
    } finally {
      setIsSaving(false);
    }
  }, [webcontainerInstance, filePath, editorValue, isDirty]);

  // Keyboard shortcut: Ctrl+S
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        if (isDirty && !isSaving) {
          handleSave();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDirty, isSaving, handleSave]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-stone-700/30 bg-stone-900/80">
        <span className="truncate max-w-48 text-stone-400 text-xs">
          {filePath.split("/").pop()}
        </span>
        {isDirty && (
          <span
            className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
            title="Unsaved changes"
          />
        )}
        <button
          className="ml-auto px-2 py-1 text-xs rounded bg-blue-700 text-white disabled:opacity-50"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
        >
          {isSaving ? "Saving..." : "Save (Ctrl+S)"}
        </button>
        {isDirty && (
          <button
            className="ml-2 px-2 py-1 text-xs rounded bg-yellow-600 text-white"
            onClick={handleUndo}
            disabled={isSaving}
          >
            Undo
          </button>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <MonacoEditor
          value={editorValue}
          language={getLanguageFromFileName(filePath)}
          onChange={handleEditorChange}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
