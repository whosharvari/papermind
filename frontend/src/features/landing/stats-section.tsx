"use client";

import { Boxes, Brain, Cpu, Database, FileText } from "lucide-react";
import { useStats } from "@/hooks/use-stats";
import { StatCard } from "@/features/landing/stat-card";
import { shortModelName } from "@/lib/format";

// FAISS is a fixed architectural fact of this system, not something the
// backend needs to report -- there's no /stats field for it because it
// never varies.
const VECTOR_STORE_LABEL = "FAISS";

export function StatsSection() {
  const { data, isLoading, isError } = useStats();

  if (isError) {
    return (
      <p className="text-center text-xs text-muted-foreground">
        Live stats are unavailable right now.
      </p>
    );
  }

  const notReady = data?.status === "not_ready";

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          icon={FileText}
          label="Papers"
          value={data?.paper_count ?? 0}
          isLoading={isLoading}
        />
        <StatCard
          icon={Boxes}
          label="Chunks"
          value={data?.chunk_count ?? 0}
          isLoading={isLoading}
        />
        <StatCard
          icon={Brain}
          label="Embedding model"
          value={data ? shortModelName(data.embedding_model) : ""}
          isLoading={isLoading}
        />
        <StatCard
          icon={Cpu}
          label="LLM"
          value={data ? shortModelName(data.groq_model) : ""}
          isLoading={isLoading}
        />
        <StatCard
          icon={Database}
          label="Vector store"
          value={VECTOR_STORE_LABEL}
          isLoading={isLoading}
        />
      </div>
      {notReady && (
        <p className="mt-3 text-center text-xs text-warning">
          The index hasn&apos;t been built yet — run ingestion on the backend to populate it.
        </p>
      )}
    </div>
  );
}
