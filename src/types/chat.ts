import { FilePart, ImagePart, TextPart } from "ai";
import React from "react";

export const THINK_BLOCK = {
  OPEN: "<think>",
  CLOSE: "</think>",
} as const;

export type UIMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string | Array<TextPart | ImagePart | FilePart>;
  timeStamp: string;
  reasoning?: string;
  toolCalls?: Array<{ toolName: string; result: any }>;
};

export type SelectedProvider =
  | "openai"
  | "groq"
  | "google"
  | "mistral"
  | "lmstudio";

export type ModelParameters = {
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
};

export type Model = {
  id: string;
  name: string;
  provider: SelectedProvider;
  capabilities: ("text" | "image" | "audio" | "pdf")[];
  toolUse: boolean;
  reasoning: boolean;
};

export interface RepoTemplate {
  name: string;
  label: string;
  description: string;
  githubRepo: string;
  tags?: string[];
  icon?: React.ComponentType<any>;
}