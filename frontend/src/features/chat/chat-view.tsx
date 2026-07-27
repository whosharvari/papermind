"use client";

import { History, SearchCode } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useConversations } from "@/contexts/conversations-context";
import { useSettings } from "@/contexts/settings-context";
import { ChatInput } from "@/features/chat/chat-input";
import { ConversationSidebar } from "@/features/chat/conversation-sidebar";
import { MessageList } from "@/features/chat/message-list";
import { SourcePanel } from "@/features/chat/source-panel";
import { useChat } from "@/hooks/use-chat";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { PdfTarget } from "@/types/pdf";

// Matches the `lg` breakpoint used below to keep both side panels
// permanently visible -- below it, they live in a Sheet instead.
const DESKTOP_QUERY = "(min-width: 1024px)";

interface ChatViewProps {
  conversationId: string;
}

export function ChatView({ conversationId }: ChatViewProps) {
  const { settings } = useSettings();
  const { conversations, activeConversation, selectConversation, deleteConversation, goToLanding, updateMessages } =
    useConversations();
  const { messages, isPending, sendMessage, retryLast } = useChat({
    topK: settings.topK,
    initialMessages: activeConversation?.messages,
  });
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeSource, setActiveSource] = useState<PdfTarget | null>(null);

  const hasSentInitial = useRef(false);
  useEffect(() => {
    if (hasSentInitial.current) return;
    hasSentInitial.current = true;
    if (activeConversation && activeConversation.messages.length === 0) {
      sendMessage(activeConversation.title);
    }
    // Only ever fires once, for the conversation this view mounted with --
    // page.tsx remounts ChatView (via `key`) whenever conversationId changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isFirstMessagesSync = useRef(true);
  useEffect(() => {
    // Skip the run triggered by mounting with the conversation's existing
    // history -- merely reopening a past conversation shouldn't bump its
    // "last updated" time or reorder the sidebar.
    if (isFirstMessagesSync.current) {
      isFirstMessagesSync.current = false;
      return;
    }
    updateMessages(conversationId, messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    // Both side panels are permanently visible past this breakpoint -- don't
    // leave the Sheet copies mounted underneath them (e.g. double PDF fetch).
    if (isDesktop) {
      setIsSourcePanelOpen(false);
      setIsHistoryOpen(false);
    }
  }, [isDesktop]);

  const latestChunks = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.status === "done")?.retrievedChunks;

  const openSource = (target: PdfTarget) => {
    setActiveSource(target);
    if (!isDesktop) setIsSourcePanelOpen(true);
  };
  const closeSource = () => setActiveSource(null);

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <aside className="hidden w-64 shrink-0 border-r border-border lg:block">
        <ConversationSidebar
          conversations={conversations}
          activeId={conversationId}
          onSelect={selectConversation}
          onDelete={deleteConversation}
          onNewChat={goToLanding}
        />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2 lg:hidden">
          <Button variant="ghost" size="icon-sm" onClick={() => setIsHistoryOpen(true)} aria-label="Conversation history">
            <History className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSourcePanelOpen(true)}
            className="gap-1.5"
          >
            <SearchCode className="size-3.5" aria-hidden="true" />
            Retrieved passages
            {latestChunks && latestChunks.length > 0 && (
              <span className="text-muted-foreground">({latestChunks.length})</span>
            )}
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <MessageList
            messages={messages}
            isPending={isPending}
            onRetry={retryLast}
            onOpenSource={(citation) =>
              openSource({ filename: citation.source_file, page: citation.page_number })
            }
          />
        </div>

        <div className="shrink-0 border-t border-border bg-background/80 px-4 py-4 backdrop-blur-sm sm:px-6">
          <ChatInput onSubmit={sendMessage} disabled={isPending} />
        </div>
      </div>

      <aside className="hidden w-80 shrink-0 border-l border-border lg:block">
        <SourcePanel
          chunks={latestChunks}
          isPending={isPending}
          activeSource={activeSource}
          onOpenSource={openSource}
          onCloseSource={closeSource}
        />
      </aside>

      <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <SheetContent side="left" className="w-64 p-0 sm:max-w-64" showCloseButton>
          <SheetTitle className="sr-only">Conversation history</SheetTitle>
          <ConversationSidebar
            conversations={conversations}
            activeId={conversationId}
            onSelect={(id) => {
              selectConversation(id);
              setIsHistoryOpen(false);
            }}
            onDelete={deleteConversation}
            onNewChat={goToLanding}
          />
        </SheetContent>
      </Sheet>

      <Sheet open={isSourcePanelOpen} onOpenChange={setIsSourcePanelOpen}>
        <SheetContent className="w-80 p-0 sm:max-w-80" showCloseButton>
          <SheetTitle className="sr-only">
            {activeSource ? activeSource.filename : "Retrieved passages"}
          </SheetTitle>
          <SourcePanel
            chunks={latestChunks}
            isPending={isPending}
            activeSource={activeSource}
            onOpenSource={openSource}
            onCloseSource={closeSource}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
