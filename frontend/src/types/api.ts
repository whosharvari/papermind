// Mirrors src/papermind/api/schemas/{query,stats}.py exactly. Keep in sync by
// hand -- there is no shared schema generation between the two projects.

export interface HealthResponse {
  status: "ok";
}

export type StatsStatus = "ready" | "not_ready";

export interface StatsResponse {
  status: StatsStatus;
  paper_count: number;
  chunk_count: number;
  embedding_model: string;
  groq_model: string;
}

export interface QueryRequest {
  question: string;
  k?: number;
}

export interface Citation {
  source_file: string;
  page_number: number;
}

export interface RetrievedChunk {
  text: string;
  source_file: string;
  page_number: number;
  score: number;
}

export interface QueryResponse {
  question: string;
  answer: string;
  citations: Citation[];
  retrieved_chunks: RetrievedChunk[];
}

// FastAPI's default error body shape (HTTPException and our global handler
// both return { detail: ... }).
export interface ApiErrorBody {
  detail: string | { msg: string }[];
}
