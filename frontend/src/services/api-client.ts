import type { ApiErrorBody } from "@/types/api";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

const DEFAULT_TIMEOUT_MS = 30_000;

export type ApiErrorKind = "network" | "timeout" | "not_ready" | "upstream" | "http";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(message: string, kind: ApiErrorKind, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

function detailToMessage(body: ApiErrorBody | undefined, fallback: string): string {
  if (!body?.detail) return fallback;
  if (typeof body.detail === "string") return body.detail;
  return body.detail.map((d) => d.msg).join(", ") || fallback;
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, timeoutMs = DEFAULT_TIMEOUT_MS, signal } = options;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  // Let an externally-passed signal (e.g. React Query's) abort us too.
  signal?.addEventListener("abort", () => controller.abort());

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(
        "The request took too long to respond. The backend may be slow or unreachable.",
        "timeout",
      );
    }
    throw new ApiError(
      "Could not reach the PaperMind API. Is the backend running?",
      "network",
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    let parsedBody: ApiErrorBody | undefined;
    try {
      parsedBody = await response.json();
    } catch {
      // non-JSON error body; fall through with no parsed detail
    }

    if (response.status === 503) {
      throw new ApiError(
        detailToMessage(parsedBody, "The index isn't loaded yet. Run ingestion first."),
        "not_ready",
        503,
      );
    }
    if (response.status === 502) {
      throw new ApiError(
        detailToMessage(parsedBody, "The language model service is unavailable."),
        "upstream",
        502,
      );
    }
    throw new ApiError(
      detailToMessage(parsedBody, `Request failed with status ${response.status}.`),
      "http",
      response.status,
    );
  }

  return (await response.json()) as T;
}
