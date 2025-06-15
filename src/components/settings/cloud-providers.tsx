import { Switch } from "@/components/ui/switch";
import BackBtn from "./back-btn";
import { setApiKey, getApiKey } from "@/utils/localStorage";
import { useState } from "react";
import { EyeIcon } from "lucide-react";

const PROVIDERS = [
  "AmazonBedrock",
  "Anthropic",
  "Cohere",
  "Deepseek",
  "Github",
  "Google",
  "Groq",
  "HuggingFace",
  "Hyperbolic",
  "Mistral",
  "OpenAI",
  "OpenRouter",
  "Perplexity",
  "Together",
];

const CloudProviders = () => {
  const [apiKeys, setApiKeys] = useState(() => {
    const keys: Record<string, string> = {};
    PROVIDERS.forEach((provider) => {
      keys[provider] = getApiKey(provider);
    });
    return keys;
  });
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKey(provider, value);
    setApiKeys((prev) => ({ ...prev, [provider]: value }));
  };

  const toggleApiKeyVisibility = (provider: string) => {
    setShowApiKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <BackBtn />
          <h2 className="text-xl font-semibold text -white mb-1">
            Cloud Providers
          </h2>
          <p className="text-stone-400 text-sm">
            Connect to cloud-based AI models and services
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white">Enable All Cloud</span>
          <Switch defaultChecked />
        </div>
      </div>
      {/* Providers List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {PROVIDERS.map((provider) => (
          <div
            key={provider}
            className="flex flex-col gap-2 bg-stone-900/80 rounded-xl p-5 shadow hover:shadow-lg transition"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <span className="font-medium text-white">{provider}</span>
                <span className="text-stone-400 text-xs">
                  Standard AI provider integration
                </span>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                id={`api-key-${provider}`}
                type={showApiKeys[provider] ? "text" : "password"}
                placeholder="Enter API Key"
                className="flex-1 px-3 py-1 rounded bg-stone-800 text-white border border-stone-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs"
                value={apiKeys[provider] || ""}
                onChange={e => handleApiKeyChange(provider, e.target.value)}
              />
              <EyeIcon
                className="w-4 h-4"
                onClick={() => toggleApiKeyVisibility(provider)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CloudProviders;
