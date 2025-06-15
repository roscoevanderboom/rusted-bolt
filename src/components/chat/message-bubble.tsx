import { parseMarkdown } from "@/lib/parse-markdown";
import { UIMessage } from "@/types/chat";
import { FilePart, ImagePart, TextPart } from "ai";

// Message bubble component
const MessageBubble: React.FC<{ message: UIMessage }> = ({ message }) => {
  const isUser = message.role === "user";
  let mainText = "";
  let attachments: (TextPart | ImagePart | FilePart)[] = [];
  if (Array.isArray(message.content) && message.content.length > 1) {
    const [first, ...rest] = message.content;
    mainText = first.type === "text" ? first.text : "";
    attachments = rest as (TextPart | ImagePart | FilePart)[];
  } else if (Array.isArray(message.content) && message.content.length === 1) {
    mainText =
      message.content[0].type === "text" ? message.content[0].text : "";
  } else if (typeof message.content === "string") {
    mainText = message.content;
  }
  return (
    <div className={`flex px-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex items-start space-x-3 max-w-3xl w-full ${
          isUser ? "flex-row-reverse space-x-reverse" : ""
        }`}
      >
        <div
          className={`rounded-lg px-4 py-2 max-w-full break-words overflow-x-auto ${
            isUser
              ? "bg-blue-500/20 text-stone-200"
              : "bg-stone-800/50 text-stone-200"
          }`}
        >
          {/* Main content */}
          <div className="whitespace-pre-wrap break-words overflow-x-auto max-w-full">
            {parseMarkdown(mainText, { enhanced: true })}
          </div>
          {/* Attachments Bar (below message text) */}
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
                  // Show first 8 words or 40 chars as displayName
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
                    </div>
                    {/* Preview on hover */}
                    <div className="hidden group-hover:block">{preview}</div>
                  </div>
                );
              })}
            </div>
          )}
          {/* Reasoning (if available) */}
          {message.reasoning && (
            <details className="mt-2 text-sm text-stone-400">
              <summary className="cursor-pointer hover:text-stone-300">
                Reasoning
              </summary>
              <div className="mt-1 whitespace-pre-wrap">
                {message.reasoning}
              </div>
            </details>
          )}
          {/* Tool calls (if available) */}
          {message.toolCalls && message.toolCalls.length > 0 && (
            <div className="mt-2 text-sm text-stone-400">
              <details>
                <summary className="cursor-pointer hover:text-stone-300">
                  Tool Calls
                </summary>
                <div className="mt-1">
                  {message.toolCalls.map((call, index) => {
                    const result = call.result;
                    if (result && (result.error || result.details)) {
                      return (
                        <div key={index} className="mb-1">
                          <span className="font-mono">{call.toolName}</span>
                          <div className="mt-1 p-2 bg-red-900/30 rounded text-xs overflow-x-auto text-red-300">
                            <strong>Error:</strong>{" "}
                            {result.error || "Unknown error"}
                            <br />
                            {result.details && (
                              <>
                                <strong>Details:</strong> {result.details}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={index} className="mb-1">
                        <span className="font-mono">{call.toolName}</span>
                        <pre className="mt-1 p-2 bg-stone-800/50 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
