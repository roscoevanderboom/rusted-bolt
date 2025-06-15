import type React from "react";
import { useRef, useState } from "react";
import {
  Send,
  Paperclip,
  Square,
  FileImage,
  FileAudio,
  FileCode2,
  Camera,
  FileText,
} from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { open } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { readTextFile } from "@tauri-apps/plugin-fs";
import type { TextPart, ImagePart, FilePart } from "ai";
import { toast } from "sonner";
import { modelSupports, getFilenameFromPath } from "@/utils/chat-util";
import type { Model } from "@/types/chat";

interface ChatInputProps {
  model: Model;
  inputValue: string;
  isStreaming: boolean;
  attachments: Array<TextPart | ImagePart | FilePart>;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onAddAttachment: (attachment: TextPart | ImagePart | FilePart) => void;
  onRemoveAttachment: (index: number) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  model,
  inputValue,
  isStreaming,
  attachments,
  onInputChange,
  onSend,
  onStop,
  onAddAttachment,
  onRemoveAttachment,
}) => {
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachMenuHover, setAttachMenuHover] = useState(false);
  const attachMenuTimeout = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle input key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Handle file uploads
  const handleFileUpload = async (type: "image" | "pdf" | "audio", filePath: string) => {
    if (type !== "pdf" && !modelSupports(type as any, model)) {
      toast.error(`This model does not support ${type} attachments.`);
      return;
    }
    if (!filePath) return;
    let attachment: ImagePart | FilePart | TextPart | null = null;
    if (type === "image") {
      const ext = getFilenameFromPath(filePath).split(".").pop() || "png";
      const base64 = await invoke<string>("read_file_base64", {
        path: filePath,
      });
      attachment = {
        type: "image",
        image: `data:image/${ext};base64,${base64}`,
        mimeType: `image/${ext}`,
      };
    } else if (type === "pdf") {
      if (model.capabilities.includes("pdf")) {
        const base64 = await invoke<string>("read_file_base64", {
          path: filePath,
        });
        const filename = getFilenameFromPath(filePath) || "document.pdf";
        attachment = {
          type: "file",
          data: `data:application/pdf;base64,${base64}`,
          filename,
          mimeType: "application/pdf",
        };
      } else {
        const text = await invoke<string>("extract_pdf_text", {
          path: filePath,
        });
        attachment = {
          type: "text",
          text,
        };
      }
    } else if (type === "audio") {
      const ext = getFilenameFromPath(filePath).split(".").pop() || "mp3";
      const base = getFilenameFromPath(filePath) || "audio";
      const base64 = await invoke<string>("read_file_base64", {
        path: filePath,
      });
      attachment = {
        type: "file",
        data: base64,
        filename: base,
        mimeType: `audio/${ext}`,
      };
    }
    if (attachment) {
      onAddAttachment(attachment);
    }
  };

  return (
    <div className="border rounded-2xl border-stone-800 bg-[#141414] p-3 w-full max-w-5xl">
      {/* Input Container */}
      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          {/* Paperclip icon triggers menu on hover */}
          <button
            type="button"
            className="text-stone-500 hover:text-stone-300 transition-colors p-2"
            disabled={isStreaming}
            title="Attach files"
            onMouseEnter={() => {
              if (attachMenuTimeout.current)
                clearTimeout(attachMenuTimeout.current);
              setShowAttachMenu(true);
            }}
            onMouseLeave={() => {
              attachMenuTimeout.current = setTimeout(() => {
                if (!attachMenuHover) setShowAttachMenu(false);
              }, 100);
            }}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          {/* Custom Attach Menu */}
          {showAttachMenu && (
            <div
              className="absolute bottom-full left-0 mb-2 w-56 bg-[#181818] border border-stone-700 rounded-lg shadow-xl z-50 flex flex-col py-2 animate-fade-in"
              style={{ minWidth: 180 }}
              onMouseEnter={() => {
                if (attachMenuTimeout.current)
                  clearTimeout(attachMenuTimeout.current);
                setAttachMenuHover(true);
              }}
              onMouseLeave={() => {
                setAttachMenuHover(false);
                attachMenuTimeout.current = setTimeout(
                  () => setShowAttachMenu(false),
                  100
                );
              }}
            >
              {modelSupports("image", model) && (
                <button
                  className="flex items-center gap-2 px-4 py-2 hover:bg-stone-800 transition-colors"
                  onClick={async () => {
                    const selected = await open({
                      multiple: false,
                      filters: [
                        {
                          name: "Images",
                          extensions: [
                            "png",
                            "jpg",
                            "jpeg",
                            "gif",
                            "bmp",
                            "webp",
                          ],
                        },
                      ],
                    });
                    if (selected) {
                      const filePath = Array.isArray(selected)
                        ? selected[0]
                        : selected;
                      await handleFileUpload("image", filePath);
                    }
                  }}
                >
                  <FileImage className="w-4 h-4" /> Upload Image
                </button>
              )}
              <button
                className="flex items-center gap-2 px-4 py-2 hover:bg-stone-800 transition-colors"
                onClick={async () => {
                  const selected = await open({
                    multiple: false,
                    filters: [{ name: "PDF", extensions: ["pdf"] }],
                  });
                  if (selected) {
                    const filePath = Array.isArray(selected)
                      ? selected[0]
                      : selected;
                    await handleFileUpload("pdf", filePath);
                  }
                }}
              >
                <FileText className="w-4 h-4" /> Upload PDF
              </button>
              {modelSupports("audio", model) && (
                <button
                  className="flex items-center gap-2 px-4 py-2 hover:bg-stone-800 transition-colors"
                  onClick={async () => {
                    const selected = await open({
                      multiple: false,
                      filters: [
                        {
                          name: "Audio",
                          extensions: ["mp3", "wav", "ogg", "m4a"],
                        },
                      ],
                    });
                    if (selected) {
                      const filePath = Array.isArray(selected)
                        ? selected[0]
                        : selected;
                      await handleFileUpload("audio", filePath);
                    }
                  }}
                >
                  <FileAudio className="w-4 h-4" /> Upload Audio
                </button>
              )}
              <button
                className="flex items-center gap-2 px-4 py-2 hover:bg-stone-800 transition-colors"
                onClick={() => {
                  /* TODO: implement screenshot */
                }}
              >
                <Camera className="w-4 h-4" /> Take Screenshot
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 hover:bg-stone-800 transition-colors"
                onClick={async () => {
                  setShowAttachMenu(false);
                  const codeExtensions = [
                    "js", "ts", "jsx", "tsx", "py", "java", "c", "cpp", "cs",
                    "go", "rs", "rb", "php", "swift", "kt", "scala", "sh",
                    "bat", "pl", "lua", "json", "yaml", "yml", "toml", "ini",
                    "md", "html", "css", "scss", "less", "xml", "sql", "dart",
                    "h", "hpp", "m", "mm", "vue", "svelte", "lock", "env",
                  ];
                  const selected = await open({
                    multiple: false,
                    filters: [{ name: "Code", extensions: codeExtensions }],
                  });
                  if (selected) {
                    const filePath = Array.isArray(selected)
                      ? selected[0]
                      : selected;
                    const text = await readTextFile(filePath);
                    onAddAttachment({
                      type: "text",
                      text,
                    });
                  }
                }}
              >
                <FileCode2 className="w-4 h-4" /> Add Code Snippet
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 relative">
          <TextareaAutosize
            ref={inputRef}
            maxRows={10}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="w-full mb-[-6px] px-4 py-2.5 bg-[#0c0c0c] rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-stone-700 min-h-[44px] max-h-32 text-stone-200 placeholder-stone-600"
            rows={1}
            disabled={isStreaming}
          />
        </div>

        {isStreaming ? (
          <button
            onClick={onStop}
            className="text-red-400 hover:text-red-300 transition-colors"
            title="Stop generation"
          >
            <Square className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onSend}
            disabled={(!inputValue.trim() && attachments.length === 0) || isStreaming}
            className="text-blue-400 hover:text-blue-300 disabled:text-stone-700 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        )}
      </div>
      {/* Attachments Bar (below input) */}
      {attachments.length > 0 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
          {attachments.map((file, index) => {
            let displayName = "";
            let preview: React.ReactNode = null;
            let typeLabel = "";
            if (file.type === "image") {
              displayName = "Image";
              typeLabel = "IMG";
              preview = (
                <div className="absolute left-0 top-full mt-2 z-50 bg-black border border-stone-700 rounded shadow-lg p-2">
                  <img
                    src={typeof file.image === "string" ? file.image : ""}
                    alt="Preview"
                    className="max-w-xs max-h-48 rounded"
                  />
                </div>
              );
            } else if (
              file.type === "file" &&
              file.mimeType === "application/pdf"
            ) {
              displayName = file.filename || "PDF";
              typeLabel = "PDF";
              preview = (
                <div className="absolute left-0 top-full mt-2 z-50 bg-black border border-stone-700 rounded shadow-lg p-2 max-w-xs max-h-48 overflow-auto text-xs text-stone-200">
                  {typeof file.data === "string"
                    ? file.data.slice(0, 500) +
                      (file.data.length > 500 ? "…" : "")
                    : "[binary]"}
                </div>
              );
            } else if (file.type === "text") {
              const words = file.text.trim().split(/\s+/);
              displayName = words.slice(0, 8).join(" ");
              if (displayName.length > 40)
                displayName = displayName.slice(0, 40) + "…";
              typeLabel = "TEXT";
              preview = (
                <div className="absolute left-0 top-full mt-2 z-50 bg-black border border-stone-700 rounded shadow-lg p-2 max-w-xs max-h-48 overflow-auto text-xs text-stone-200">
                  {file.text.slice(0, 500) +
                    (file.text.length > 500 ? "…" : "")}
                </div>
              );
            } else if (file.type === "file") {
              displayName = file.filename || "File";
              typeLabel = "FILE";
            }
            return (
              <div key={index} className="relative group">
                <div className="flex items-center space-x-2 px-3 py-1 bg-stone-800/70 rounded-full text-sm cursor-pointer group-hover:bg-stone-700 transition-colors">
                  <span className="truncate max-w-32 text-stone-300">
                    {displayName}
                  </span>
                  <span className="text-xs bg-stone-900 px-1.5 py-0.5 rounded ml-1">
                    {typeLabel}
                  </span>
                  <button
                    onClick={() => onRemoveAttachment(index)}
                    className="text-stone-400 hover:text-stone-200 ml-1"
                    title="Remove attachment"
                  >
                    ×
                  </button>
                </div>
                {/* Preview on hover */}
                <div className="hidden group-hover:block">{preview}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatInput;
