import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { message } from "@tauri-apps/plugin-dialog";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  APICallError,
  CoreMessage,
  FilePart,
  ImagePart,
  NoSuchToolError,
  streamText,
  TextPart,
  ToolExecutionError,
  smoothStream,
} from "ai";
import { Model, ModelParameters, UIMessage } from "@/types/chat";
import { webTools } from "./tools";
import { WebContainer } from "@webcontainer/api";
import { getWebContainerTools } from "./tools/webContainerTools";
import { getApiKey } from "@/utils/localStorage";

// Types
export type ChatEvent = {
  type: "message" | "streaming" | "error" | "finish" | "usage" | "source";
  data: any;
};

export type StreamChatResponseParams = {
  inputValue: string;
  attachments: Array<ImagePart | FilePart | TextPart>;
  messages: UIMessage[];
  model: Model;
  modelParams: ModelParameters;
  webcontainerInstance: WebContainer;
  onEvent: (event: ChatEvent) => void;
  abortSignal: AbortSignal;
  onError: (err: any) => Promise<void>;
};

// Constants
const DEFAULT_TEMPERATURE = 0.5;
const MAX_STEPS = 10;
const MAX_RETRIES = 3;
const DEFAULT_REASONING_EFFORT = "low";

// Logging utility
class Logger {
  private static log(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [AI Service] [${level}] ${message}`;

    if (data !== undefined) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }

  static info(message: string, data?: any) {
    this.log("INFO", message, data);
  }

  static error(message: string, data?: any) {
    this.log("ERROR", message, data);
  }

  static debug(message: string, data?: any) {
    this.log("DEBUG", message, data);
  }
}

// Provider factory
class ProviderFactory {
  static createProvider(selectedModel: Model) {
    Logger.info("Creating provider for model", selectedModel);

    const providers = {
      openai: () =>
        createOpenAI({
          apiKey: getApiKey("OpenAI"),
          compatibility: "strict",
        })(selectedModel.id),

      google: () =>
        createGoogleGenerativeAI({
          apiKey: getApiKey("Google"),
        })(selectedModel.id, { useSearchGrounding: true }),

      groq: () =>
        createGroq({
          apiKey: getApiKey("Groq"),
        })(selectedModel.id),

      default: () =>
        createOpenAICompatible({
          apiKey: "not_needed",
          baseURL: "http://127.0.0.1:1234/v1",
          name: "lmstudio",
        })(selectedModel.id),
    };

    const providerCreator =
      providers[selectedModel.provider as keyof typeof providers] ||
      providers.default;
    return providerCreator();
  }
}

// Error handling utilities
class ErrorHandler {
  static formatError(error: unknown): string {
    if (error instanceof APICallError) {
      let msg = `API Error: ${error.message}`;
      if (error.cause) {
        msg += `\nCause: ${error.cause}`;
      }
      if (typeof error.isRetryable === "boolean") {
        msg += `\n${
          error.isRetryable
            ? "This error may be temporary. Please try again."
            : "This error is not retryable."
        }`;
      }
      return msg;
    }

    if (error instanceof NoSuchToolError) {
      return "Tool Error: The tool you tried to use is not available. Please try again.";
    }

    if (error instanceof ToolExecutionError) {
      return `Tool Error: ${error.message}`;
    }

    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }

    return "An unknown error occurred.";
  }

  static async showErrorDialog(err: unknown) {
    Logger.error("Showing error dialog", err);
    await message(this.formatError(err), { title: "Error", kind: "error" });
  }
}

// Message utilities
class MessageUtils {
  static createSystemMessage(availableTools: string[]): CoreMessage {
    return {
      role: "system",
      content: `
        You are a senior software developer and you are working in a webcontainer.
        ###IMPORTANT:
        This is a safe, sandboxed environment. 
        You have free access to the following tools without any permission required.
        You have access to the following tools:
        ${availableTools.map((tool) => `- ${tool}`).join("\n")}

        Use the tools effectively to solve the user's problem. Always determine the current working directory and use the tools to solve the user's problem.
        If the user asks for a file, check if it exists, if it does not exist, always use the tools to create the file.
      `,
    };
  }

  static createUserMessage(
    inputValue: string,
    attachments: Array<ImagePart | FilePart | TextPart>
  ): UIMessage {
    return {
      id: crypto.randomUUID(),
      role: "user",
      content: [{ type: "text", text: inputValue }, ...attachments],
      timeStamp: new Date().toISOString(),
    };
  }

  static createAssistantPlaceholder(): UIMessage {
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timeStamp: new Date().toISOString(),
      reasoning: "",
      toolCalls: [],
    };
  }
}

// Stream processing utilities
class StreamProcessor {
  private assistantMessage: UIMessage;
  private onEventCallback: (event: ChatEvent) => void;
  private inThinkBlock = false;

  constructor(
    assistantMessage: UIMessage,
    onEvent: (event: ChatEvent) => void
  ) {
    this.assistantMessage = assistantMessage;
    this.onEventCallback = onEvent;
  }

  processTextDelta(textDelta: string) {
    // Handle think block boundaries
    if (textDelta.includes("<think>") && textDelta.length === 8) {
      this.inThinkBlock = true;
      return;
    }

    if (textDelta.includes("</think>") && textDelta.length === 10) {
      this.inThinkBlock = false;
      return;
    }

    // Update appropriate content based on think block state
    if (this.inThinkBlock) {
      this.assistantMessage.reasoning =
        (this.assistantMessage.reasoning || "") + textDelta;
    } else {
      this.assistantMessage.content =
        (this.assistantMessage.content || "") + textDelta;
    }

    this.emitMessageUpdate();
  }

  processReasoning(textDelta: string) {
    this.assistantMessage.reasoning =
      (this.assistantMessage.reasoning || "") + textDelta;
    this.emitMessageUpdate();
  }

  processToolResult(toolName: string, result: any) {
    this.assistantMessage.toolCalls = [
      ...(this.assistantMessage.toolCalls || []),
      { toolName, result },
    ];
    this.emitMessageUpdate();
  }

  processFinish(usage: any) {
    this.emitMessageUpdate();
    this.onEventCallback({ type: "usage", data: usage });
    this.onEventCallback({ type: "finish", data: null });
  }

  private emitMessageUpdate() {
    this.onEventCallback({
      type: "message",
      data: { ...this.assistantMessage },
    });
  }
}

// Configuration utilities
class StreamConfigUtils {
  static getToolChoice(model: Model): "auto" | "none" | "required" {
    return model.toolUse ? "auto" : "none";
  }
}

// Main AI service class
export class AIService {
  static validateInput(inputValue: string, attachments: Array<any>): boolean {
    const hasInput = inputValue.trim().length > 0;
    const hasAttachments = attachments.length > 0;
    return hasInput || hasAttachments;
  }

  static async streamChatResponse(params: StreamChatResponseParams) {
    const {
      inputValue,
      attachments,
      messages,
      model,
      modelParams,
      webcontainerInstance,
      onEvent,
      abortSignal,
      onError,
    } = params;

    // Logger.info("Starting chat stream", { inputValue, model, modelParams });

    // Validate input
    if (!this.validateInput(inputValue, attachments)) {
      Logger.info("No input or attachments provided");
      return;
    }

    try {
      // Prepare tools and messages
      const aiTools = {
        ...webTools,
        ...getWebContainerTools(webcontainerInstance),
      };
      const systemMessage = MessageUtils.createSystemMessage(
        Object.keys(aiTools)
      );
      const userMessage = MessageUtils.createUserMessage(
        inputValue,
        attachments
      );
      const updatedMessages = [...messages, userMessage];

      // Emit user message
      onEvent({ type: "message", data: userMessage });

      // Start streaming
      onEvent({ type: "streaming", data: true });

      const provider = ProviderFactory.createProvider(model);
      if (!provider) {
        Logger.error("No provider found for model", model);
        onEvent({ type: "streaming", data: false });
        return;
      }

      // Create assistant placeholder
      const assistantMessage = MessageUtils.createAssistantPlaceholder();
      onEvent({ type: "message", data: assistantMessage });

      console.log(updatedMessages);
      // Configure and start stream
      const { fullStream } = streamText({
        messages: [systemMessage, ...(updatedMessages as CoreMessage[])],
        model: provider,
        abortSignal,
        maxSteps: MAX_STEPS,
        maxRetries: MAX_RETRIES,
        toolCallStreaming: true,
        experimental_continueSteps: true,
        temperature: modelParams.temperature || DEFAULT_TEMPERATURE,
        tools: model.toolUse ? aiTools : undefined,
        toolChoice: StreamConfigUtils.getToolChoice(model),
        experimental_generateMessageId: () => crypto.randomUUID(),
        experimental_transform: smoothStream({
          delayInMs: 40,
          chunking: "word",
        }),
        providerOptions: {
          groq: model.reasoning ? { reasoningFormat: "parsed" } : {},
          openai: model.reasoning
            ? { reasoningEffort: DEFAULT_REASONING_EFFORT }
            : {},
        },
      });
      const streamProcessor = new StreamProcessor(assistantMessage, onEvent);

      // Process stream
      for await (const part of fullStream) {
        switch (part.type) {
          case "text-delta":
            streamProcessor.processTextDelta(part.textDelta);
            break;
          case "reasoning":
            streamProcessor.processReasoning(part.textDelta);
            break;
          case "tool-call":
            // TODO: handle tool call if needed
            break;
          case "tool-result":
            streamProcessor.processToolResult(part.toolName, part.result);
            break;
          case "finish":
            streamProcessor.processFinish(part.usage);
            onEvent({ type: "streaming", data: false });
            break;
          case "error":
            Logger.error("Stream error", part.error);
            onEvent({ type: "streaming", data: false });
            await onError(part.error);
            break;
          case "source":
            Logger.info("Stream source", part.source);
            onEvent({ type: "source", data: part.source });
            break;
        }
      }
    } catch (error) {
      Logger.error("Stream chat response error", error);
      onEvent({ type: "streaming", data: false });
      await onError(error);
    }
  }
}

// Export legacy functions for backward compatibility
export const getProviderForModel = ProviderFactory.createProvider;
export const formatDialogError = ErrorHandler.formatError;
export const showErrorDialog = ErrorHandler.showErrorDialog;
export const streamChatResponse = AIService.streamChatResponse;
