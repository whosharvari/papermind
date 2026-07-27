"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ChatMessage } from "@/types/chat";
import type { Conversation } from "@/types/conversation";

const STORAGE_KEY = "papermind:conversations";
const MAX_STORED_CONVERSATIONS = 30;

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function persist(conversations: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // Storage full or unavailable (private browsing) -- history just won't persist.
  }
}

interface ConversationsContextValue {
  conversations: Conversation[];
  activeId: string | null;
  activeConversation: Conversation | null;
  startConversation: (firstQuestion: string) => string;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  goToLanding: () => void;
  updateMessages: (id: string, messages: ChatMessage[]) => void;
}

const ConversationsContext = createContext<ConversationsContextValue | null>(null);

export function ConversationsProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setConversations(JSON.parse(stored));
    } catch {
      // Corrupt or inaccessible localStorage -- start with an empty history.
    }
  }, []);

  const startConversation = useCallback((firstQuestion: string) => {
    const id = createId();
    const now = Date.now();
    const conversation: Conversation = {
      id,
      title: firstQuestion,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    setConversations((prev) => {
      const next = [conversation, ...prev].slice(0, MAX_STORED_CONVERSATIONS);
      persist(next);
      return next;
    });
    setActiveId(id);
    return id;
  }, []);

  const selectConversation = useCallback((id: string) => setActiveId(id), []);

  const goToLanding = useCallback(() => setActiveId(null), []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const next = prev.filter((c) => c.id !== id);
      persist(next);
      return next;
    });
    setActiveId((current) => (current === id ? null : current));
  }, []);

  const updateMessages = useCallback((id: string, messages: ChatMessage[]) => {
    setConversations((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, messages, updatedAt: Date.now() } : c));
      persist(next);
      return next;
    });
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        activeId,
        activeConversation,
        startConversation,
        selectConversation,
        deleteConversation,
        goToLanding,
        updateMessages,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations(): ConversationsContextValue {
  const ctx = useContext(ConversationsContext);
  if (!ctx) throw new Error("useConversations must be used within a ConversationsProvider");
  return ctx;
}
