import { models } from "@/constants/models";
import { Model } from "@/types/chat";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ModelSelectProps {
  model: Model;
  handleModelSelect: (model: Model) => void;
  isStreaming: boolean;
}

const ModelSelect = ({
  handleModelSelect,
  model,
  isStreaming,
}: ModelSelectProps) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  // Get provider color
  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "openai":
        return "text-green-400";
      case "groq":
        return "text-orange-400";
      case "google":
        return "text-blue-400";
      case "lmstudio":
        return "text-purple-400";
      default:
        return "text-stone-400";
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modelDropdownRef.current &&
        !modelDropdownRef.current.contains(event.target as Node)
      ) {
        setIsModelDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={modelDropdownRef}>
      <button
        onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 bg-stone-800/50 hover:bg-stone-800 rounded-lg transition-colors group"
        disabled={isStreaming}
      >
        <span className="font-medium text-stone-200">
          {model.name || model.id}
        </span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full bg-stone-900/50 ${getProviderColor(
            model.provider
          )}`}
        >
          {model.provider}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-stone-400 transition-transform ${
            isModelDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isModelDropdownOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-[#1a1a1a] border border-stone-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-stone-400 px-2 py-1 mb-2 font-medium">
              Select Model
            </div>
            {models.map((modelOption) => (
              <button
                key={modelOption.id}
                onClick={() => handleModelSelect(modelOption)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-stone-800/50 rounded-lg transition-colors group"
              >
                <div className="flex flex-col items-start">
                  <div className="flex items-center space-x-2">
                    <span className="text-stone-200 font-medium">
                      {modelOption.name || modelOption.id}
                    </span>
                    {model.id === modelOption.id && (
                      <Check className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full bg-stone-900/50 ${getProviderColor(
                        modelOption.provider
                      )}`}
                    >
                      {modelOption.provider}
                    </span>
                    <div className="flex space-x-1">
                      {modelOption.capabilities.includes("text") && (
                        <span className="text-xs px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                          T
                        </span>
                      )}
                      {modelOption.capabilities.includes("image") && (
                        <span className="text-xs px-1 py-0.5 bg-green-500/20 text-green-400 rounded">
                          I
                        </span>
                      )}
                      {modelOption.capabilities.includes("audio") && (
                        <span className="text-xs px-1 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                          A
                        </span>
                      )}
                      {modelOption.toolUse && (
                        <span className="text-xs px-1 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                          🔧
                        </span>
                      )}
                      {modelOption.reasoning && (
                        <span className="text-xs px-1 py-0.5 bg-pink-500/20 text-pink-400 rounded">
                          🧠
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelect;
