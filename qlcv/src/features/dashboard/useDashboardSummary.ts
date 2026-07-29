"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "@/api/dashboard.api";
import type { DashboardQuery } from "@/api/dashboard.types";

export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  summary: (query: DashboardQuery) => [...dashboardQueryKeys.all, "summary", query] as const,
};

export function useDashboardSummary(query: DashboardQuery) {
  return useQuery({
    queryKey: dashboardQueryKeys.summary(query),
    queryFn: ({ signal }) => getDashboardSummary(query, signal),
    staleTime: 60_000,
  });
}
