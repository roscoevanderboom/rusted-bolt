import { useState, useRef, useCallback } from "react";
import { AIService, type ChatEvent } from "@/services/vercel/ai";
import type { Model, ModelParameters, UIMessage } from "@/types/chat";
import type { TextPart, ImagePart, FilePart } from "ai";
import { toast } from "sonner";
import { filterAttachmentsByModel } from "@/utils/chat-util";
import { models } from "@/constants/models";
import { DEFAULT_PROMPT } from "@/constants/prompt-templates";

interface ChatState {
  messages: UIMessage[];
  isStreaming: boolean;
  inputValue: string;
  attachments: Array<TextPart | ImagePart | FilePart>;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export function useChat(webcontainerInstance: any) {
  const [model, setModel] = useState<Model>(models[0]);
  const [modelParams, setModelParams] = useState<ModelParameters>({
    systemPrompt: DEFAULT_PROMPT,
    presencePenalty: 0,
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    maxTokens: 32000,
  });
  const [state, setState] = useState<ChatState>({
    messages: [],
    isStreaming: false,
    inputValue: "",
    attachments: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleChatEvent = useCallback((event: ChatEvent) => {
    switch (event.type) {
      case "message":
        setState((prev) => {
          const messageData = event.data;
          const existingIndex = prev.messages.findIndex(
            (m) => m.id === messageData.id
          );

          if (existingIndex >= 0) {
            const updatedMessages = [...prev.messages];
            updatedMessages[existingIndex] = messageData;
            return { ...prev, messages: updatedMessages };
          } else {
            return { ...prev, messages: [...prev.messages, messageData] };
          }
        });
        break;

      case "streaming":
        setState((prev) => ({ ...prev, isStreaming: event.data }));
        break;

      case "usage":
        setState((prev) => ({ ...prev, usage: event.data }));
        break;

      case "error":
        setState((prev) => ({ ...prev, isStreaming: false }));
        break;

      case "finish":
        setState((prev) => ({ ...prev, isStreaming: false }));
        break;
    }
  }, []);

  const handleAIError = useCallback(async (error: any) => {
    setState((prev) => ({ ...prev, isStreaming: false }));
    console.error("AI Service Error:", error);
    toast.error("Error: " + error.message);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!state.inputValue.trim() && state.attachments.length === 0) return;
    let inputValue = state.inputValue;
    if (!inputValue.trim() && state.attachments.length > 0) {
      inputValue = "Describe content. Consider its context in the current conversation.";
    }
    if (state.isStreaming) return;

    const filteredAttachments = filterAttachmentsByModel(state.attachments, model);
    if (filteredAttachments.length < state.attachments.length) {
      toast("Due to current model limitations, some content was removed and context may be lost.");
    }

    abortControllerRef.current = new AbortController();

    setState((prev) => ({
      ...prev,
      inputValue: "",
      attachments: [],
      isStreaming: true,
    }));

    try {
      await AIService.streamChatResponse({
        inputValue,
        attachments: filteredAttachments,
        messages: state.messages,
        model,
        modelParams,
        webcontainerInstance,
        onEvent: handleChatEvent,
        abortSignal: abortControllerRef.current.signal,
        onError: handleAIError,
      });
    } catch (error) {
      await handleAIError(error);
    }
  }, [state, model, modelParams, webcontainerInstance, handleChatEvent, handleAIError]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
      abortControllerRef.current.abort();
    }
    setState((prev) => ({ ...prev, isStreaming: false }));
  }, []);

  const clearChat = useCallback(() => {
    if (state.isStreaming) {
      stopStreaming();
    }
    setState((prev) => ({ ...prev, messages: [], usage: undefined }));
  }, [state.isStreaming, stopStreaming]);

  const addAttachment = useCallback((attachment: TextPart | ImagePart | FilePart) => {
    setState((prev) => ({
      ...prev,
      attachments: [...prev.attachments, attachment],
    }));
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  }, []);

  return {
    state,
    model,
    setModel,
    modelParams,
    setModelParams,
    sendMessage,
    stopStreaming,
    clearChat,
    addAttachment,
    removeAttachment,
    setInputValue: (value: string) => setState(prev => ({ ...prev, inputValue: value })),
  };
}
