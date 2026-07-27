"use client";

import { ChevronDown, FileText } from "lucide-react";
import { useState } from "react";
import { SimilarityBadge } from "@/features/retrieval/similarity-badge";
import { cn } from "@/lib/utils";
import type { RetrievedChunk } from "@/types/api";

interface ChunkCardProps {
  chunk: RetrievedChunk;
  onOpenSource?: (chunk: RetrievedChunk) => void;
}

export function ChunkCard({ chunk, onOpenSource }: ChunkCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-start gap-2 px-3 pt-3">
        <FileText className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground" title={chunk.source_file}>
            {chunk.source_file}
          </p>
          <p className="text-xs text-muted-foreground">Page {chunk.page_number}</p>
        </div>
        <SimilarityBadge score={chunk.score} />
      </div>

      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="mt-2 flex w-full items-center justify-between gap-2 px-3 pb-3 text-left focus-visible:outline-none"
      >
        <p
          className={cn(
            "text-xs leading-relaxed text-muted-foreground",
            !isExpanded && "line-clamp-2",
          )}
        >
          {chunk.text}
        </p>
        <ChevronDown
          className={cn(
            "mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform",
            isExpanded && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {onOpenSource && (
        <button
          type="button"
          onClick={() => onOpenSource(chunk)}
          className="w-full border-t border-border px-3 py-2 text-left text-xs font-medium text-primary transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Open in PDF
        </button>
      )}
    </div>
  );
}
