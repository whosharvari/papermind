import { SearchCode } from "lucide-react";
import { ChunkCard } from "@/features/retrieval/chunk-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RetrievedChunk } from "@/types/api";

interface RetrievalInspectorProps {
  chunks: RetrievedChunk[] | undefined;
  isPending: boolean;
}

export function RetrievalInspector({ chunks, isPending }: RetrievalInspectorProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Retrieved passages</h2>
        <p className="text-xs text-muted-foreground">
          The chunks the model grounded its last answer in.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isPending ? (
          <div className="flex flex-col gap-3" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : chunks && chunks.length > 0 ? (
          <div className="flex flex-col gap-3">
            {chunks.map((chunk, index) => (
              <ChunkCard key={`${chunk.source_file}-${chunk.page_number}-${index}`} chunk={chunk} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 pt-12 text-center">
            <SearchCode className="size-6 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Ask a question to see the passages it&apos;s grounded in.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
