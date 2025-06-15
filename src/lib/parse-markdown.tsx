import React, { useState } from "react";
import { Copy, Check, Download, Eye, EyeOff } from "lucide-react";
import { save } from "@tauri-apps/plugin-dialog";
import { fs } from "@/services/tauri/fs";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

// Enhanced CodeBlock with more features
function CodeBlock({
  code,
  lang,
  enhanced = true,
}: {
  code: string;
  lang: string;
  enhanced?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [localFileName, setLocalFileName] = useState<string | undefined>(
    undefined
  );

  const lines = code.split("\n");
  const shouldShowControls =
    enhanced && (lines.length > 10 || code.length > 500);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  // Updated handleDownload with Tauri
  const handleDownload = async () => {
    try {
      setDownloading(true);

      // Determine file extension based on language
      let extension = "txt";
      const fileExtensions: { [key: string]: string } = {
        javascript: "js",
        js: "js",
        typescript: "ts",
        ts: "ts",
        jsx: "jsx",
        tsx: "tsx",
        python: "py",
        py: "py",
        rust: "rs",
        rs: "rs",
        html: "html",
        css: "css",
        scss: "scss",
        sass: "sass",
        json: "json",
        xml: "xml",
        yaml: "yml",
        yml: "yml",
        sql: "sql",
        sh: "sh",
        bash: "sh",
        powershell: "ps1",
        c: "c",
        cpp: "cpp",
        java: "java",
        go: "go",
        php: "php",
        ruby: "rb",
        swift: "swift",
        kotlin: "kt",
      };

      if (lang && fileExtensions[lang.toLowerCase()]) {
        extension = fileExtensions[lang.toLowerCase()];
      }

      // Use provided fileName or generate default
      const defaultFileName = localFileName || `code.${extension}`;

      // Show save dialog
      const filePath = await save({
        filters: [
          {
            name: "Code Files",
            extensions: [extension],
          },
          {
            name: "All Files",
            extensions: ["*"],
          },
        ],
        defaultPath: defaultFileName,
      });

      // If user cancelled the dialog, filePath will be null
      if (filePath) {
        // Write the file using Tauri's fs API
        await fs.write_text_file(filePath, code);
        // Extract just the filename from the path
        const name = filePath.split(/[\\/]/).pop();
        setLocalFileName(name);
        console.log("File saved successfully to:", filePath);
      }
    } catch (error) {
      console.error("Error saving file:", error);
      // You might want to show a user-friendly error message here
    } finally {
      setDownloading(false);
    }
  };

  // Simple mode (original behavior)
  if (!enhanced) {
    return (
      <div
        className="relative w-full"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <pre className="my-4 w-full bg-stone-900 border border-stone-700 rounded-lg overflow-x-auto">
          <code className="block p-4 text-sm leading-relaxed font-mono text-stone-100 whitespace-pre-wrap break-words">
            {/* {highlightCode(code, lang)} */}
            <SyntaxHighlighter language={lang} style={atomOneDark}>
              {code}
            </SyntaxHighlighter>
          </code>
        </pre>
        {hovered && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 bg-stone-800 text-stone-200 p-1 rounded border border-stone-600 hover:bg-stone-700 transition-colors z-10 flex items-center justify-center"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative w-full my-6 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-stone-800 px-4 py-2 rounded-t-lg border border-stone-700 border-b-0">
        <div className="flex items-center gap-2">
          {lang && (
            <span className="text-xs font-medium text-stone-400 uppercase bg-stone-700 px-2 py-1 rounded">
              {lang}
            </span>
          )}
          {localFileName && (
            <span className="text-sm text-stone-300 font-mono">
              {localFileName}
            </span>
          )}
          <span className="text-xs text-stone-500">{lines.length} lines</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {shouldShowControls && (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-stone-400 hover:text-stone-200 p-1 rounded"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? (
                  <EyeOff className="w-3 h-3" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
              </button>
            </>
          )}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="text-stone-400 hover:text-stone-200 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download code"
          >
            <Download
              className={`w-3 h-3 ${downloading ? "animate-pulse" : ""}`}
            />
          </button>
          <button
            onClick={handleCopy}
            className="text-stone-400 hover:text-stone-200 p-1 rounded flex items-center gap-1"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Code content */}
      <div
        className={`bg-stone-900 border border-stone-700 rounded-b-lg overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-none" : "max-h-40"
        }`}
      >
        <div className="w-full overflow-x-auto">
          <SyntaxHighlighter
            language={lang}
            style={atomOneDark}
            customStyle={{
              background: "transparent",
              color: "inherit",
              margin: 0,
              padding: "0.5rem 1rem", // less padding
              fontSize: "0.95rem",
              lineHeight: "1.6",
              border: "none",
              borderRadius: 0,
            }}
            codeTagProps={{
              style: {
                fontFamily: "inherit",
                background: "transparent",
                color: "inherit",
              },
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>

        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-stone-900 to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  );
}

// Enhanced markdown parsing with more features
export function parseMarkdown(
  text: string,
  options?: { enhanced?: boolean }
): React.ReactNode[] {
  const enhanced = options?.enhanced ?? true;
  const parts: React.ReactNode[] = [];
  let key = 0;

  // Enhanced regex to capture filename and language
  const codeBlockRegex = /```(\w+)?(?:\s+(.+?))?\n([\s\S]*?)\n?```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      const beforeText = text.slice(lastIndex, match.index);
      if (enhanced) {
        parts.push(...parseTextContent(beforeText, key));
        key += 100; // Leave space for text parsing keys
      } else {
        // Simple mode - just paragraphs like original
        beforeText.split(/\n\n+/).forEach((para) => {
          if (para.trim()) parts.push(<p key={key++}>{para}</p>);
        });
      }
    }

    // Add code block
    const lang = match[1]?.toLowerCase() || "";
    const code = match[3];

    parts.push(
      <CodeBlock key={key++} code={code} lang={lang} enhanced={enhanced} />
    );

    lastIndex = codeBlockRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    if (enhanced) {
      parts.push(...parseTextContent(remainingText, key));
    } else {
      // Simple mode - just paragraphs like original
      remainingText.split(/\n\n+/).forEach((para) => {
        if (para.trim()) parts.push(<p key={key++}>{para}</p>);
      });
    }
  }

  return parts;
}

// Enhanced text parsing with more markdown features
function parseTextContent(text: string, startKey: number): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let key = startKey;

  // Split by double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/);

  paragraphs.forEach((para) => {
    const trimmed = para.trim();
    if (!trimmed) return;

    // Check for headers
    if (trimmed.startsWith("#")) {
      const headerMatch = trimmed.match(/^(#+)\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const headerText = headerMatch[2];
        const HeaderTag = `h${Math.min(
          level,
          6
        )}` as keyof JSX.IntrinsicElements;
        const textSize =
          level === 1
            ? "text-3xl"
            : level === 2
            ? "text-2xl"
            : level === 3
            ? "text-xl"
            : "text-lg";

        parts.push(
          <HeaderTag
            key={key++}
            className={`${textSize} font-bold text-stone-100 mb-4 mt-6`}
          >
            {parseInlineMarkdown(headerText)}
          </HeaderTag>
        );
        return;
      }
    }

    // Check for lists
    if (trimmed.match(/^[\s]*[-*+]\s+/) || trimmed.match(/^[\s]*\d+\.\s+/)) {
      const listItems = trimmed.split("\n").filter((line) => line.trim());
      const isOrdered = listItems[0].match(/^\s*\d+\.\s+/);
      const ListTag = isOrdered ? "ol" : "ul";

      parts.push(
        <ListTag
          key={key++}
          className={`ml-6 mb-4 space-y-1 ${
            isOrdered ? "list-decimal" : "list-disc"
          }`}
        >
          {listItems.map((item, index) => {
            const cleanItem = item.replace(/^[\s]*(?:[-*+]|\d+\.)\s+/, "");
            return (
              <li key={index} className="text-stone-300">
                {parseInlineMarkdown(cleanItem)}
              </li>
            );
          })}
        </ListTag>
      );
      return;
    }

    // Regular paragraph
    parts.push(
      <p key={key++} className="mb-4 text-stone-300 leading-relaxed">
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  });

  return parts;
}

// Parse inline markdown (bold, italic, links, code)
function parseInlineMarkdown(text: string): React.ReactNode {
  // Simple inline parsing - in a real implementation, you'd want a more robust parser
  let result: React.ReactNode = text;

  // This is a simplified version - you'd want to handle overlapping cases better
  const parts: React.ReactNode[] = [];
  let key = 0;

  // Split by inline code first
  const codeRegex = /`([^`]+)`/g;
  let lastIndex = 0;
  let match;

  while ((match = codeRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const beforeCode = text.slice(lastIndex, match.index);
      parts.push(<span key={key++}>{beforeCode}</span>);
    }

    parts.push(
      <code
        key={key++}
        className="bg-stone-800 text-stone-200 px-1.5 py-0.5 rounded text-sm font-mono"
      >
        {match[1]}
      </code>
    );

    lastIndex = codeRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 1 ? <>{parts}</> : result;
}
