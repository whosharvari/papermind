import { apiFetch, API_BASE_URL } from "@/services/api-client";
import type { HealthResponse, QueryRequest, QueryResponse, StatsResponse } from "@/types/api";

export function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/health", { timeoutMs: 5_000, signal });
}

export function getStats(signal?: AbortSignal): Promise<StatsResponse> {
  return apiFetch<StatsResponse>("/stats", { timeoutMs: 5_000, signal });
}

export function postQuery(request: QueryRequest, signal?: AbortSignal): Promise<QueryResponse> {
  return apiFetch<QueryResponse>("/query", {
    method: "POST",
    body: request,
    timeoutMs: 60_000,
    signal,
  });
}

export function getPaperUrl(filename: string): string {
  return `${API_BASE_URL}/papers/${encodeURIComponent(filename)}`;
}
