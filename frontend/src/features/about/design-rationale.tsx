interface RationaleItem {
  question: string;
  answer: string;
}

const ITEMS: RationaleItem[] = [
  {
    question: "Why embeddings instead of keyword search?",
    answer:
      "Research papers describe the same idea in many different words across sections and papers. Embeddings capture semantic similarity, so a question can retrieve a passage that never uses the question's exact wording -- keyword search can't do that.",
  },
  {
    question: "Why FAISS with an exact index?",
    answer:
      "The corpus is a few thousand chunks, small enough that brute-force search (IndexFlatIP) is fast and exact -- no recall loss from an approximate index like IVF or HNSW. Chunk embeddings are L2-normalized, so inner product is mathematically equivalent to cosine similarity.",
  },
  {
    question: "Why retrieval-augmented generation at all?",
    answer:
      "Asking an LLM directly relies on what it memorized during training, with no way to verify the answer or point back to a source. RAG grounds every answer in text retrieved from the actual papers at query time, which is what makes citations possible in the first place.",
  },
  {
    question: "Why are citations deterministic?",
    answer:
      "Citations are built directly from the retrieved chunks' metadata (filename, page number) -- never parsed out of the LLM's generated text. A citation is guaranteed to point at something that was actually retrieved, not a plausible-looking fabrication.",
  },
];

export function DesignRationale() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {ITEMS.map((item) => (
        <div key={item.question} className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground">{item.question}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
        </div>
      ))}
    </div>
  );
}
