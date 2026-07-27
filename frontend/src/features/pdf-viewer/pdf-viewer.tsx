"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MAX_SCALE, MIN_SCALE } from "@/features/pdf-viewer/constants";
import { PdfPageCanvas } from "@/features/pdf-viewer/pdf-page-canvas";
import { PdfToolbar } from "@/features/pdf-viewer/pdf-toolbar";
import { usePdfDocument } from "@/hooks/use-pdf-document";

interface PdfViewerProps {
  filename: string;
  initialPage: number;
  highlightText?: string;
}

const CONTAINER_PADDING_PX = 32;

export function PdfViewer({ filename, initialPage, highlightText }: PdfViewerProps) {
  const { pdf, isLoading, error } = usePdfDocument(filename);
  const [page, setPage] = useState(initialPage);
  const [scale, setScale] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPage(initialPage);
    setScale(null);
  }, [filename, initialPage]);

  useEffect(() => {
    if (!pdf) return;
    let cancelled = false;

    pdf.getPage(initialPage).then((initialPageProxy) => {
      if (cancelled) return;
      const nativeWidth = initialPageProxy.getViewport({ scale: 1 }).width;
      const containerWidth = containerRef.current?.clientWidth ?? 320;
      const fitScale = (containerWidth - CONTAINER_PADDING_PX) / nativeWidth;
      setScale(Math.min(Math.max(fitScale, MIN_SCALE), MAX_SCALE));
    });

    return () => {
      cancelled = true;
    };
  }, [pdf, initialPage]);

  if (isLoading || scale === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" aria-hidden="true" />
        <p className="text-sm">Loading PDF…</p>
      </div>
    );
  }

  if (error || !pdf) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
        <AlertCircle className="size-5 text-destructive" aria-hidden="true" />
        <p className="text-sm">{error ?? "Couldn't load this PDF."}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <PdfToolbar
        page={page}
        pageCount={pdf.numPages}
        onPageChange={(next) => setPage(Math.min(Math.max(next, 1), pdf.numPages))}
        scale={scale}
        onScaleChange={setScale}
      />
      <div ref={containerRef} className="flex-1 overflow-auto bg-muted/30 p-4">
        <PdfPageCanvas
          pdf={pdf}
          pageNumber={page}
          scale={scale}
          highlightText={page === initialPage ? highlightText : undefined}
        />
      </div>
    </div>
  );
}
