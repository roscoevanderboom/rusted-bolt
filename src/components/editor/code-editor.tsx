import { useCallback, useEffect, useRef, useState } from "react";
// import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { toast } from "sonner";
// import { Code } from "lucide-react";
import type { WebContainer } from "@webcontainer/api";
import { WebcontainerFileNode } from "@/types/webcontainer";
import { executeFileOperation } from "@/utils/file-tree-util";
import 'monaco-editor/esm/vs/editor/editor.worker?worker';
import 'monaco-editor/esm/vs/language/json/json.worker?worker';
import 'monaco-editor/esm/vs/language/css/css.worker?worker';
import 'monaco-editor/esm/vs/language/html/html.worker?worker';
import 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

interface CodeEditorProps {
  filePath: string;
  webcontainerInstance: WebContainer;
  fileTree: WebcontainerFileNode[];
}

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
    ".html": "html",
    ".md": "markdown",
  };
  const extension = Object.keys(extensionMap).find((ext) =>
    fileName.endsWith(ext)
  );
  return extension ? extensionMap[extension] : "plaintext";
}

// MonacoEditor wrapper for standard Monaco usage
function MonacoEditor({ value, language, onChange }: { value: string; language: string; onChange?: (value: string) => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const ignoreFirstChange = useRef(true);

  useEffect(() => {
    if (containerRef.current) {
      editorRef.current = monaco.editor.create(containerRef.current, {
        value,
        language,
        theme: "vs-dark",
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false },
        wordWrap: "on",
        scrollBeyondLastLine: false,
        fontFamily:
          'Fira Mono, Menlo, Monaco, "Liberation Mono", "Courier New", monospace',
        lineNumbers: "on",
        readOnly: false,
        smoothScrolling: true,
        cursorBlinking: "smooth",
        renderLineHighlight: "gutter",
        selectionHighlight: false,
      });
      editorRef.current.onDidChangeModelContent(() => {
        if (ignoreFirstChange.current) {
          ignoreFirstChange.current = false;
          return;
        }
        onChange?.(editorRef.current!.getValue());
      });
    }
    return () => {
      editorRef.current?.dispose();
    };
    // Only run on mount/unmount
    // eslint-disable-next-line
  }, []);

  // Update value if prop changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  // Update language if prop changes
  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.setModelLanguage(editorRef.current.getModel()!, language);
    }
  }, [language]);

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
