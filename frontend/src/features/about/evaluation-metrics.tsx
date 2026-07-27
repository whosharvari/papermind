interface MetricRow {
  metric: string;
  atK5: string;
  atK8: string;
  meaning: string;
}

const RETRIEVAL_ROWS: MetricRow[] = [
  {
    metric: "Document Hit Rate",
    atK5: "0.98",
    atK8: "0.98",
    meaning: "Did the correct paper appear anywhere in the top-k results?",
  },
  {
    metric: "Page Hit Rate",
    atK5: "0.63",
    atK8: "0.78",
    meaning: "Did the correct page appear in the top-k results?",
  },
  {
    metric: "Page MRR",
    atK5: "0.428",
    atK8: "0.450",
    meaning: "How close to rank 1 was the first correct page, on average?",
  },
];

const LATENCY_ROWS: { stage: string; median: string }[] = [
  { stage: "Retrieval (FAISS)", median: "17 ms" },
  { stage: "Generation (Groq)", median: "398 ms" },
  { stage: "Total", median: "415 ms" },
];

export function EvaluationMetrics() {
  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground uppercase">
              <th className="px-4 py-2.5 font-medium">Metric</th>
              <th className="px-4 py-2.5 font-medium">k = 5</th>
              <th className="px-4 py-2.5 font-medium">k = 8</th>
              <th className="px-4 py-2.5 font-medium">What it measures</th>
            </tr>
          </thead>
          <tbody>
            {RETRIEVAL_ROWS.map((row) => (
              <tr key={row.metric} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 font-medium text-foreground">{row.metric}</td>
                <td className="px-4 py-2.5 font-mono text-muted-foreground">{row.atK5}</td>
                <td className="px-4 py-2.5 font-mono text-muted-foreground">{row.atK8}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{row.meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Retrieval metrics from a 49-question hand-authored eval set across all 13 indexed papers.
        Groundedness (LLM-judged, 1-5 scale) and citation accuracy were both perfect on the small
        sample that completed before hitting Groq&apos;s free-tier daily quota mid-run -- honestly too
        small a sample (n=1) to generalize, not padded out to look more complete than it is.
      </p>

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs text-muted-foreground uppercase">
              <th className="px-4 py-2.5 font-medium">Stage</th>
              <th className="px-4 py-2.5 font-medium">Median latency</th>
            </tr>
          </thead>
          <tbody>
            {LATENCY_ROWS.map((row) => (
              <tr key={row.stage} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 font-medium text-foreground">{row.stage}</td>
                <td className="px-4 py-2.5 font-mono text-muted-foreground">{row.median}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4">
        <h3 className="text-sm font-medium text-foreground">A finding worth keeping: chunk-level Hit Rate wasn&apos;t trustworthy</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          Switching to section-aware chunking made chunk-level Hit Rate look like it collapsed
          (0.22 to 0.00 at k=5). Investigating the actual rankings -- not just trusting the
          aggregate -- found two distinct, unrelated causes: one chunk became purer but harder to
          match on this specific question&apos;s wording (a real, predicted trade-off), and one
          eval annotation turned out to point at a paper&apos;s title block instead of its methods
          section, a pre-existing labeling issue the finer chunking exposed rather than caused.
          Page-level Hit Rate, which doesn&apos;t depend on picking one exact chunk, improved at
          every k and is the more reliable signal here.
        </p>
      </div>
    </div>
  );
}
