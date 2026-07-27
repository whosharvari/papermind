"use client";

import { MessageSquarePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/conversation";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNewChat,
}: ConversationSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-border p-3">
        <Button variant="outline" size="sm" onClick={onNewChat} className="w-full justify-start gap-2">
          <MessageSquarePlus className="size-3.5" aria-hidden="true" />
          New chat
        </Button>
      </div>

      <nav aria-label="Conversation history" className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-muted-foreground">
            Your conversations will show up here.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {conversations.map((conversation) => (
              <li key={conversation.id} className="group/row relative">
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  aria-current={conversation.id === activeId ? "true" : undefined}
                  className={cn(
                    "block w-full truncate rounded-lg px-2.5 py-2 pr-8 text-left text-sm transition-colors",
                    conversation.id === activeId
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <span className="block truncate">{conversation.title}</span>
                  <span className="block truncate text-xs text-muted-foreground/70">
                    {formatRelativeTime(conversation.updatedAt)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(conversation.id)}
                  aria-label={`Delete conversation: ${conversation.title}`}
                  className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none group-hover/row:opacity-100"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </div>
  );
}
