"use client";

import { useCallback, useRef, useState } from "react";
import { ApiError } from "@/services/api-client";
import { postQuery } from "@/services/papermind-api";
import type { ChatMessage } from "@/types/chat";

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface UseChatOptions {
  topK: number;
  initialMessages?: ChatMessage[];
}

export function useChat({ topK, initialMessages }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
  const [isPending, setIsPending] = useState(false);
  // Read inside async callbacks without retriggering them on every keystroke elsewhere.
  const topKRef = useRef(topK);
  topKRef.current = topK;

  const runQuery = useCallback(async (question: string) => {
    setIsPending(true);
    try {
      const response = await postQuery({ question, k: topKRef.current });
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          status: "done",
          content: response.answer,
          citations: response.citations,
          retrievedChunks: response.retrieved_chunks,
          createdAt: Date.now(),
        },
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          status: "error",
          errorMessage,
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setIsPending(false);
    }
  }, []);

  const sendMessage = useCallback(
    (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || isPending) return;
      setMessages((prev) => [
        ...prev,
        { id: createId(), role: "user", content: trimmed, createdAt: Date.now() },
      ]);
      void runQuery(trimmed);
    },
    [isPending, runQuery],
  );

  const retryLast = useCallback(() => {
    if (isPending) return;
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setMessages((prev) => {
      const last = prev.at(-1);
      return last?.role === "assistant" && last.status === "error" ? prev.slice(0, -1) : prev;
    });
    void runQuery(lastUser.content);
  }, [isPending, messages, runQuery]);

  return { messages, isPending, sendMessage, retryLast };
}
