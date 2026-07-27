import { MessageComposer } from "@/components/shared/message-composer";

interface ChatInputProps {
  onSubmit: (question: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  return (
    <MessageComposer
      id="chat-input"
      label="Ask a follow-up question"
      placeholder="Ask a follow-up question…"
      onSubmit={onSubmit}
      disabled={disabled}
      className="max-w-3xl"
    />
  );
}
