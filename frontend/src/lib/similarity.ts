export type SimilarityTier = "high" | "medium" | "low";

// retrieved_chunks.score is a cosine similarity from a FAISS IndexFlatIP over
// L2-normalized embeddings, so it's effectively bounded to roughly 0-1 for
// semantically related text. These cutoffs are a UX judgment call, not a
// property of the embedding model.
export function similarityTier(score: number): SimilarityTier {
  if (score >= 0.55) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}

export function formatSimilarity(score: number): string {
  return `${Math.round(score * 100)}%`;
}
