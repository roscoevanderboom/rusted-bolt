import { Model } from "@/types/chat";

export const models: Model[] = [
  // Groq Preview Models
  {
    id: "meta-llama/llama-4-scout-17b-16e-instruct",
    name: "Llama 4 Scout 17B",
    provider: "groq",
    capabilities: ["text", "image"],
    toolUse: false,
    reasoning: false,
  },
  {
    id: "deepseek-r1-distill-llama-70b",
    name: "DeepSeek Distill Llama 70B",
    provider: "groq",
    capabilities: ["text"],
    toolUse: true,
    reasoning: true,
  },
  {
    id: "microsoft/phi-4-mini-reasoning",
    name: "Phi 4 Mini Reasoning",
    provider: "lmstudio",
    capabilities: ["text", "image"],
    toolUse: true,
    reasoning: true,
  },
  {
    id: "qwen3-0.6b",
    name: "Qwen3 0.6B",
    provider: "lmstudio",
    capabilities: ["text"],
    toolUse: true,
    reasoning: true,
  },
  {
    id: "qwen3-1.7b",
    name: "Qwen3 1.7B",
    provider: "lmstudio",
    capabilities: ["text"],
    toolUse: true,
    reasoning: true,
  },
  {
    id: "qwen3-4b",
    name: "Qwen3 4B",
    provider: "lmstudio",
    capabilities: ["text"],
    toolUse: true,
    reasoning: true,
  },
  {
    id: "deepseek-ai_deepseek-r1-0528-qwen3-8b",
    name: "DeepSeek R1 Qwen3 8B",
    provider: "lmstudio",
    capabilities: ["text"],
    toolUse: true,
    reasoning: true,
  },
  // OpenAI Models
  {
    id: "gpt-4.1-nano",
    name: "GPT-4.1 Nano",
    provider: "openai",
    capabilities: ["text", "image", "pdf"],
    toolUse: true,
    reasoning: false,
  },
  // Google Models
  {
    id: "gemini-2.5-pro-exp-03-25",
    name: "Gemini 2.5 Pro Exp",
    provider: "google",
    capabilities: ["text", "image"],
    toolUse: true,
    reasoning: true,
  },
];
