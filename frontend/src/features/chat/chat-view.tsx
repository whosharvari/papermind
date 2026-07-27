"use client";

import { SearchCode } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useSettings } from "@/contexts/settings-context";
import { ChatInput } from "@/features/chat/chat-input";
import { MessageList } from "@/features/chat/message-list";
import { RetrievalInspector } from "@/features/retrieval/retrieval-inspector";
import { useChat } from "@/hooks/use-chat";

interface ChatViewProps {
  initialQuestion: string;
}

export function ChatView({ initialQuestion }: ChatViewProps) {
  const { settings } = useSettings();
  const { messages, isPending, sendMessage, retryLast } = useChat({ topK: settings.topK });
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const hasSentInitial = useRef(false);
  useEffect(() => {
    if (hasSentInitial.current) return;
    hasSentInitial.current = true;
    sendMessage(initialQuestion);
    // Only ever fires once, for the question that triggered the landing -> chat transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latestChunks = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.status === "done")?.retrievedChunks;

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-end border-b border-border px-4 py-2 lg:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInspectorOpen(true)}
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
          <MessageList messages={messages} isPending={isPending} onRetry={retryLast} />
        </div>

        <div className="shrink-0 border-t border-border bg-background/80 px-4 py-4 backdrop-blur-sm sm:px-6">
          <ChatInput onSubmit={sendMessage} disabled={isPending} />
        </div>
      </div>

      <aside className="hidden w-80 shrink-0 border-l border-border lg:block">
        <RetrievalInspector chunks={latestChunks} isPending={isPending} />
      </aside>

      <Sheet open={isInspectorOpen} onOpenChange={setIsInspectorOpen}>
        <SheetContent className="w-80 p-0 sm:max-w-80" showCloseButton>
          <SheetTitle className="sr-only">Retrieved passages</SheetTitle>
          <RetrievalInspector chunks={latestChunks} isPending={isPending} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
