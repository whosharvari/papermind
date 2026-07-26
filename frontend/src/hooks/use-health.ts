"use client";

import { useQuery } from "@tanstack/react-query";
import { getHealth } from "@/services/papermind-api";

export type HealthStatus = "checking" | "connected" | "disconnected";

const POLL_INTERVAL_MS = 15_000;

export function useHealth() {
  const query = useQuery({
    queryKey: ["health"],
    queryFn: ({ signal }) => getHealth(signal),
    refetchInterval: POLL_INTERVAL_MS,
    retry: 2,
    staleTime: 0,
  });

  const status: HealthStatus = query.isPending
    ? "checking"
    : query.isError
      ? "disconnected"
      : "connected";

  return { status, isFetching: query.isFetching, refetch: query.refetch };
}
