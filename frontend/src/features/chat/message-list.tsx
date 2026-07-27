"use client";

import { useEffect, useRef } from "react";
import { useSettings } from "@/contexts/settings-context";
import { AssistantMessage } from "@/features/chat/assistant-message";
import { RagLoading } from "@/features/chat/rag-loading";
import { UserMessage } from "@/features/chat/user-message";
import { cn } from "@/lib/utils";
import type { Citation } from "@/types/api";
import type { ChatMessage } from "@/types/chat";

interface MessageListProps {
  messages: ChatMessage[];
  isPending: boolean;
  onRetry: () => void;
  onOpenSource: (citation: Citation) => void;
}

export function MessageList({ messages, isPending, onRetry, onOpenSource }: MessageListProps) {
  const { settings } = useSettings();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isPending]);

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6",
        settings.compactMode ? "gap-3 py-3" : "gap-5 py-6",
      )}
    >
      {messages.map((message) =>
        message.role === "user" ? (
          <UserMessage key={message.id} content={message.content} />
        ) : (
          <AssistantMessage
            key={message.id}
            message={message}
            onRetry={message.status === "error" ? onRetry : undefined}
            onOpenSource={onOpenSource}
          />
        ),
      )}
      {isPending && (
        <div className="flex gap-3">
          <div className="w-7 shrink-0" aria-hidden="true" />
          <div className="max-w-[85%] flex-1 sm:max-w-[75%]">
            <RagLoading />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
