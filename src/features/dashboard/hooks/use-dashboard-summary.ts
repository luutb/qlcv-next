"use client";

import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { useQuery } from "@tanstack/react-query";
import { authorizationCacheScope, hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import { dashboardQueryKeys, getDashboardSummary, type DashboardSummaryQuery } from "../api/dashboard.api";

export function useDashboardSummaryQuery(query: DashboardSummaryQuery = {}) {
  const accessToken = useAccessToken();
  const user = useCurrentUserQuery();
  return useQuery({
    queryKey: [...dashboardQueryKeys.summary(query), accessToken, authorizationCacheScope(user.data)],
    queryFn: ({ signal }) => getDashboardSummary(accessToken!, query, signal),
    enabled: Boolean(accessToken && !user.isError && hasAuthorizedAction(user.data, "tasks.access")),
    staleTime: 30_000,
  });
}
