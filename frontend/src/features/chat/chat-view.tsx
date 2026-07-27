"use client";

import { useEffect, useRef } from "react";
import { useSettings } from "@/contexts/settings-context";
import { ChatInput } from "@/features/chat/chat-input";
import { MessageList } from "@/features/chat/message-list";
import { useChat } from "@/hooks/use-chat";

interface ChatViewProps {
  initialQuestion: string;
}

export function ChatView({ initialQuestion }: ChatViewProps) {
  const { settings } = useSettings();
  const { messages, isPending, sendMessage, retryLast } = useChat({ topK: settings.topK });

  const hasSentInitial = useRef(false);
  useEffect(() => {
    if (hasSentInitial.current) return;
    hasSentInitial.current = true;
    sendMessage(initialQuestion);
    // Only ever fires once, for the question that triggered the landing -> chat transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <MessageList messages={messages} isPending={isPending} onRetry={retryLast} />
      <div className="sticky bottom-0 border-t border-border bg-background/80 px-4 py-4 backdrop-blur-sm sm:px-6">
        <ChatInput onSubmit={sendMessage} disabled={isPending} />
      </div>
    </div>
  );
}
