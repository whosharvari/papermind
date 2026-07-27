import { FileText } from "lucide-react";
import type { Citation } from "@/types/api";

interface SourcesListProps {
  citations: Citation[];
  onSourceClick?: (citation: Citation) => void;
}

export function SourcesList({ citations, onSourceClick }: SourcesListProps) {
  if (citations.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
      <span className="text-xs font-medium text-muted-foreground">Sources</span>
      {citations.map((citation) => {
        const label = `${citation.source_file} · p.${citation.page_number}`;
        const content = (
          <>
            <FileText className="size-3 shrink-0" aria-hidden="true" />
            <span className="max-w-40 truncate">{citation.source_file}</span>
            <span className="text-muted-foreground/70">p.{citation.page_number}</span>
          </>
        );

        if (!onSourceClick) {
          return (
            <span
              key={`${citation.source_file}-${citation.page_number}`}
              title={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground"
            >
              {content}
            </span>
          );
        }

        return (
          <button
            key={`${citation.source_file}-${citation.page_number}`}
            type="button"
            title={label}
            onClick={() => onSourceClick(citation)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
