"use client";

import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy } from "pdfjs-dist";
import { useEffect, useState } from "react";
import { getPaperUrl } from "@/services/papermind-api";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface UsePdfDocumentResult {
  pdf: PDFDocumentProxy | null;
  isLoading: boolean;
  error: string | null;
}

export function usePdfDocument(filename: string): UsePdfDocumentResult {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setPdf(null);
    setIsLoading(true);
    setError(null);

    const loadingTask = getDocument({ url: getPaperUrl(filename) });
    loadingTask.promise
      .then((doc) => {
        if (cancelled) return;
        setPdf(doc);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Couldn't load this PDF. It may have been removed from the index.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      void loadingTask.destroy();
    };
  }, [filename]);

  return { pdf, isLoading, error };
}
