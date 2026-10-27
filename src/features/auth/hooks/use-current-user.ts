"use client";

import { getCurrentUser } from "@/features/auth/api/current-user.api";
import { useAccessToken } from "./use-access-token";
import { useEffect, useReducer } from "react";
import { useQuery } from "@tanstack/react-query";

export const currentUserQueryKey = ["auth", "current-user"] as const;

export function useCurrentUserQuery() {
  const accessToken = useAccessToken();
  const [boundaryVersion, refreshBoundary] = useReducer((value: number) => value + 1, 0);
  const query = useQuery({
    queryKey: [...currentUserQueryKey, accessToken],
    queryFn: ({ signal }) => getCurrentUser(signal),
    enabled: Boolean(accessToken),
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: "always",
    gcTime: 10 * 60_000,
  });
  const startsAt = query.data?.subscription?.starts_at;
  const endsAt = query.data?.subscription?.ends_at;
  useEffect(() => {
    const boundaries = [startsAt, endsAt].filter((value): value is string => Boolean(value)).map(Date.parse).filter((value) => value > Date.now());
    if (!boundaries.length) return;
    const timer = setTimeout(refreshBoundary, Math.min(Math.min(...boundaries) - Date.now() + 1, 2_147_483_647));
    return () => clearTimeout(timer);
  }, [startsAt, endsAt, boundaryVersion]);
  return query;
}
