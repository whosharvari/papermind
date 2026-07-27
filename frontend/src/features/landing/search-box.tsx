import { MessageComposer } from "@/components/shared/message-composer";

interface SearchBoxProps {
  onSubmit: (question: string) => void;
}

export function SearchBox({ onSubmit }: SearchBoxProps) {
  return (
    <MessageComposer
      id="landing-search"
      label="Ask a question about the indexed research papers"
      placeholder="Ask a question about the indexed papers…"
      onSubmit={onSubmit}
      autoFocus
      className="max-w-2xl"
    />
  );
}
