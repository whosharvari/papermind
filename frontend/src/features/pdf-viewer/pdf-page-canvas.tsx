"use client";

import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import { useEffect, useRef, useState } from "react";
import { findTextMatch } from "@/lib/pdf-text-match";

interface HighlightRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface PdfPageCanvasProps {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  highlightText?: string;
}

export function PdfPageCanvas({ pdf, pageNumber, scale, highlightText }: PdfPageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [highlights, setHighlights] = useState<HighlightRect[]>([]);

  useEffect(() => {
    let cancelled = false;
    const renderTaskRef: { current: RenderTask | null } = { current: null };

    async function renderPage() {
      try {
        const page = await pdf.getPage(pageNumber);
        if (cancelled) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!canvas || !context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        setSize({ width: viewport.width, height: viewport.height });
        setHighlights([]);

        const renderTask = page.render({ canvas, canvasContext: context, viewport });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        if (cancelled) return;

        if (!highlightText) return;

        const textContent = await page.getTextContent();
        if (cancelled) return;

        const items: { str: string; transform: number[]; width: number; height: number }[] = [];
        for (const item of textContent.items) {
          if ("transform" in item) {
            items.push({ str: item.str, transform: item.transform, width: item.width, height: item.height });
          }
        }
        const matchIndices = findTextMatch(items, highlightText);
        if (!matchIndices) return;

        setHighlights(
          matchIndices.map((index) => {
            const item = items[index];
            const [x0, y0] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
            const [x1, y1] = viewport.convertToViewportPoint(
              item.transform[4] + item.width,
              item.transform[5] + item.height,
            );
            return {
              left: Math.min(x0, x1),
              top: Math.min(y0, y1),
              width: Math.abs(x1 - x0),
              height: Math.abs(y1 - y0),
            };
          }),
        );
      } catch (err) {
        // A superseded render (rapid zoom/page changes) rejects its promise by
        // design -- pdf.js's own documented cancellation signal, not a real error.
        if (!cancelled && !(err instanceof Error && err.name === "RenderingCancelledException")) {
          throw err;
        }
      }
    }

    void renderPage();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [pdf, pageNumber, scale, highlightText]);

  return (
    <div className="relative" style={{ width: size.width, height: size.height }}>
      <canvas ref={canvasRef} className="block rounded-lg shadow-lg" />
      {highlights.map((rect, index) => (
        <div
          key={index}
          className="absolute rounded-sm bg-warning/40 mix-blend-multiply"
          style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
        />
      ))}
    </div>
  );
}
