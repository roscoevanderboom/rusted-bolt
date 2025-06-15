import { Brain, Copy, MessageCircle, Trash2, WrenchIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { Button } from "../ui/button";
import { UIMessage } from "@/types/chat";
import { FilePart, ImagePart, TextPart } from "ai";
import Tools from "./tools";
import { parseMarkdown } from "@/lib/parse-markdown";

interface MessageProps {
  message: UIMessage;
}

const copyToClipboard = async (text: string) => {
  try {
    await writeText(text);
    toast.success("Copied to clipboard");
  } catch (error) {
    toast.error("Failed to copy to clipboard");
  }
};

export function UserMessage({ message }: MessageProps) {
  const getMessageText = () => {
    if (typeof message.content === "string") {
      return message.content;
    }
    return message.content.map((part) => part.type === "text" ? part.text : "")
      .join("");
  };

  return (
    <div className="flex w-full justify-end mb-4">
      <div className="border border-stone-300 dark:border-stone-500 rounded-xl bg-stone-200/80 dark:bg-stone-700/40 backdrop-blur-sm">
        <div className="p-2 text-stone-900 dark:text-stone-100">
          <div className="prose prose-invert prose-sm max-w-none">
            {parseMarkdown(getMessageText())}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AssistantMessage({ message }: MessageProps) {
  const handleCopy = async (
    content: string | Array<TextPart | ImagePart | FilePart>,
  ) => {
    if (typeof content === "string") {
      await copyToClipboard(content);
    } else {
      await copyToClipboard(
        content.map((part) => (part.type === "text" ? part.text : "")).join(""),
      );
    }
  };

  const getMessageText = () => {
    if (typeof message.content === "string") {
      return message.content;
    }
    return message.content.map((part) => part.type === "text" ? part.text : "")
      .join("");
  };

  return (
    <div className="flex w-full justify-start mb-4">
      <Tabs
        defaultValue="text"
        className="w-full border border-stone-600 rounded-xl bg-stone-800/30 backdrop-blur-sm"
      >
        <TabsList className="bg-stone-800/50 border-b border-stone-600 rounded-t-xl p-1">
          <TabsTrigger
            value="text"
            title="Text response"
            className="p-2 rounded-lg data-[state=active]:bg-stone-700 data-[state=active]:text-blue-400"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
          </TabsTrigger>
          <TabsTrigger
            value="reasoning"
            title="Reasoning"
            className="p-2 rounded-lg data-[state=active]:bg-stone-700 data-[state=active]:text-purple-400"
          >
            <Brain className="w-4 h-4 mr-2" />
          </TabsTrigger>
          <TabsTrigger
            value="toolCalls"
            title="Tool calls"
            className="p-2 rounded-lg data-[state=active]:bg-stone-700 data-[state=active]:text-orange-400"
          >
            <WrenchIcon className="w-4 h-4 mr-2" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="m-0">
          <div className="p-4 text-stone-100 min-h-[60px]">
            <div className="prose prose-invert prose-sm max-w-none">
              {parseMarkdown(getMessageText())}
            </div>
          </div>
          <div className="flex items-center justify-between p-1 border-t border-stone-600 bg-stone-800/40 rounded-b-xl">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-stone-400 hover:text-blue-400 h-auto p-1"
              title="Copy message"
              onClick={() => handleCopy(message.content)}
            >
              <Copy className="w-4 h-4" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-stone-400 hover:text-red-400 h-auto p-1"
              title="Delete message"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="reasoning" className="m-0">
          <div className="p-4 text-stone-100 min-h-[60px] bg-purple-900/10">
            <div className="prose prose-invert prose-sm max-w-none">
              {message.reasoning
                ? parseMarkdown(message.reasoning)
                : (
                  <p className="text-stone-400 italic">
                    No reasoning provided
                  </p>
                )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="toolCalls" className="m-0">
          <div className="p-2 bg-orange-900/10">
            <Tools message={message} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
