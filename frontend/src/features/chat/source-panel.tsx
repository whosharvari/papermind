"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PdfViewer } from "@/features/pdf-viewer/pdf-viewer";
import { RetrievalInspector } from "@/features/retrieval/retrieval-inspector";
import type { RetrievedChunk } from "@/types/api";
import type { PdfTarget } from "@/types/pdf";

interface SourcePanelProps {
  chunks: RetrievedChunk[] | undefined;
  isPending: boolean;
  activeSource: PdfTarget | null;
  onOpenSource: (target: PdfTarget) => void;
  onCloseSource: () => void;
}

export function SourcePanel({
  chunks,
  isPending,
  activeSource,
  onOpenSource,
  onCloseSource,
}: SourcePanelProps) {
  if (activeSource) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-center gap-1.5 border-b border-border px-2 py-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onCloseSource}
            aria-label="Back to retrieved passages"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <p className="truncate text-xs font-medium text-foreground" title={activeSource.filename}>
            {activeSource.filename}
          </p>
        </div>
        <div className="min-h-0 flex-1">
          <PdfViewer
            filename={activeSource.filename}
            initialPage={activeSource.page}
            highlightText={activeSource.highlightText}
          />
        </div>
      </div>
    );
  }

  return (
    <RetrievalInspector
      chunks={chunks}
      isPending={isPending}
      onOpenSource={(chunk) =>
        onOpenSource({ filename: chunk.source_file, page: chunk.page_number, highlightText: chunk.text })
      }
    />
  );
}
