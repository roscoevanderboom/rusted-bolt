import { ChevronDown } from "lucide-react";
import { Wrench } from "lucide-react";

import WebSearchResults from "./WebSearchResults";
import GoogleSearchResults from "./GoogleSearchResults";
import DuckDuckGoSearchResults from "./DuckDuckGoSearchResult";
import AggregateSearchResults from "./AggregateSearchResults";
import { UIMessage } from "@/types/chat";

const Tools = ({ message }: { message: UIMessage }) => {
  if (!message.toolCalls) return null;

  const toggleContentVisibility = (index: number) => {
    const elementId = `tool-content-${message.id}-${index}`;
    document.getElementById(elementId)?.classList.toggle("hidden");
  };

  const renderToolContent = (toolCall: any) => {
    const { toolName, result } = toolCall;

    switch (toolName) {
      case "web_search":
        return <WebSearchResults {...result} />;
      case "google_search":
        return <GoogleSearchResults {...result} />;
      case "duck_duck_go_search":
        return <DuckDuckGoSearchResults {...result} />;
      case "aggregate_search":
        return (
          <AggregateSearchResults
            webSearch={result.web_search}
            duckDuckGoSearch={result.duck_duck_go_search}
            googleSearch={result.google_search}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      id={`tools-${message.id}`}
      className="mb-2 space-y-1 text-xs break-words whitespace-pre-wrap"
    >
      {message.toolCalls.map((toolCall, index) => (
        <div
          key={index}
          className="border rounded text-xs overflow-hidden break-words whitespace-pre-wrap"
        >
          <div
            className="flex items-center justify-between p-1 bg-gray-50 dark:bg-gray-800 cursor-pointer text-xs break-words whitespace-pre-wrap"
            onClick={() => toggleContentVisibility(index)}
          >
            <div className="flex items-center gap-1 text-xs break-words whitespace-pre-wrap">
              <Wrench size={12} className="text-amber-500" />
              <span className="font-medium break-words whitespace-pre-wrap">
                {toolCall.toolName}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-gray-500" />
          </div>
          <div
            id={`tool-content-${message.id}-${index}`}
            className="hidden p-2 text-xs break-words whitespace-pre-wrap"
          >
            {renderToolContent(toolCall)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Tools;
