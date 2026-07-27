import { AlertCircle, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownContent } from "@/features/chat/markdown-content";
import { SourcesList } from "@/features/chat/sources-list";
import type { ChatMessage } from "@/types/chat";

interface AssistantMessageProps {
  message: Extract<ChatMessage, { role: "assistant" }>;
  onRetry?: () => void;
}

export function AssistantMessage({ message, onRetry }: AssistantMessageProps) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-card">
        <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
      </div>

      {message.status === "error" ? (
        <div className="flex max-w-[85%] flex-col gap-2 rounded-2xl rounded-tl-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm sm:max-w-[75%]">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            <span className="font-medium">Couldn&apos;t get an answer</span>
          </div>
          <p className="text-muted-foreground">{message.errorMessage}</p>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-1 w-fit gap-1.5"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Retry
            </Button>
          )}
        </div>
      ) : (
        <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 sm:max-w-[75%]">
          <MarkdownContent content={message.content} />
          <SourcesList citations={message.citations} />
        </div>
      )}
    </div>
  );
}
