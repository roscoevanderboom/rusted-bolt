import type React from "react";
import { useRef, useEffect, useState } from "react";
import { Loader2, Bot } from "lucide-react";
import { useAppContext } from "@/App";
import NewChat from "./new-chat";
import ModelSelect from "./model-select";
import MessageBubble from "./message-bubble";
import { useChat } from "@/hooks/use-chat";
import ChatInput from "./chat-input";
import ChatSettings from "./chat-settings";

const ChatComponent: React.FC = () => {
  const { webcontainerInstance } = useAppContext();
  const [modelParams, setModelParams] = useState({
    temperature: 0.7,
    systemPrompt: "",
  });
  const {
    state,
    model,
    setModel,
    sendMessage,
    stopStreaming,
    clearChat,
    addAttachment,
    removeAttachment,
    setInputValue,
  } = useChat(webcontainerInstance);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  return (
    <div className="flex flex-col pb-4 items-center h-[calc(100vh-48px)] bg-[#0c0c0c] text-stone-300">
      {/* Header */}
      <div className="flex items-center px-4 h-12 border-b border-stone-800 bg-[#141414] w-full">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-blue-400" />

          <ModelSelect
            model={model}
            handleModelSelect={setModel}
            isStreaming={state.isStreaming}
          />

          <ChatSettings 
            modelParams={modelParams}
            setModelParams={setModelParams}
          />

          {state.isStreaming && (
            <Loader2 className="w-4 h-4 animate-spin text-blue-400 ml-2" />
          )}
        </div>
        <button
          onClick={clearChat}
          className="ml-auto px-2 py-1 text-xs text-stone-400 hover:text-stone-200 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Messages or NewChat */}
      {state.messages.length === 0 ? (
        <NewChat
          setInputValue={setInputValue}
          webcontainerInstance={webcontainerInstance}
        />
      ) : (
        <div className="flex-1 overflow-y-auto py-4 space-y-4 w-full max-w-5xl">
          {state.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      <ChatInput
        model={model}
        inputValue={state.inputValue}
        isStreaming={state.isStreaming}
        attachments={state.attachments}
        onInputChange={setInputValue}
        onSend={sendMessage}
        onStop={stopStreaming}
        onAddAttachment={addAttachment}
        onRemoveAttachment={removeAttachment}
      />
    </div>
  );
};

export default ChatComponent;
