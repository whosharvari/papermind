"use client";

import { useHealth } from "@/hooks/use-health";
import { useStats } from "@/hooks/use-stats";
import { shortModelName } from "@/lib/format";

interface DevPanelProps {
  topK: number;
  latencyMs: number;
  chunkCount: number;
}

export function DevPanel({ topK, latencyMs, chunkCount }: DevPanelProps) {
  const { status } = useHealth();
  const { data: stats } = useStats();

  const rows: [string, string][] = [
    ["Backend", status],
    ["Top-K", String(topK)],
    ["Chunks retrieved", String(chunkCount)],
    ["Latency", `${latencyMs} ms`],
  ];
  if (stats?.status === "ready") {
    rows.push(
      ["Embedding model", shortModelName(stats.embedding_model)],
      ["LLM", shortModelName(stats.groq_model)],
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-2">
      <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        Developer info
      </p>
      <dl className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-2">
            <dt>{label}</dt>
            <dd className="text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
