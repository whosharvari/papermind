"use client";

import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SearchBoxProps {
  onSubmit: (question: string) => void;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function SearchBox({ onSubmit, value, onValueChange }: SearchBoxProps) {
  const [internalValue, setInternalValue] = useState("");
  const question = value ?? internalValue;
  const setQuestion = onValueChange ?? setInternalValue;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <label htmlFor="landing-search" className="sr-only">
        Ask a question about the indexed research papers
      </label>
      <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg shadow-black/5 transition-colors focus-within:border-primary/50">
        <textarea
          id="landing-search"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Ask a question about the indexed papers…"
          rows={1}
          autoFocus
          className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2 text-base outline-none placeholder:text-muted-foreground"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!question.trim()}
          aria-label="Submit question"
          className="mb-1 shrink-0 rounded-xl"
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>
    </form>
  );
}
