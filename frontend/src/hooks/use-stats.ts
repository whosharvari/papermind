"use client";

import { useQuery } from "@tanstack/react-query";
import { getStats } from "@/services/papermind-api";

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: ({ signal }) => getStats(signal),
    staleTime: 60_000,
  });
}
