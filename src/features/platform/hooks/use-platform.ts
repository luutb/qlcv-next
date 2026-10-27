"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authorizationCacheScope, useCurrentUserQuery } from "@/features/auth";
import { isPlatformAdministrator } from "@/features/auth/model/current-user";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import type { PlatformCapability } from "../model/platform-contracts";

export function usePlatformAccess(preview: boolean) {
  const user = useCurrentUserQuery();
  const token = useAccessToken();
  const can = (action: PlatformCapability) => !preview && !user.isError && isPlatformAdministrator(user.data) && user.data?.actions?.[action] === true;
  return { user, token, scope: authorizationCacheScope(user.data), can, preview };
}
export function usePlatformQuery<T>(key: readonly unknown[], action: PlatformCapability, read: (signal: AbortSignal) => Promise<T>, preview: boolean, options?: { gcTime?: number }) {
  const access = usePlatformAccess(preview);
  const allowed = access.can(action);
  const query = useQuery({ queryKey: ["platform", ...key, access.scope, access.token], queryFn: ({ signal }) => read(signal), enabled: Boolean(access.token && allowed), staleTime: 15_000, gcTime: options?.gcTime, retry: false });
  return { ...query, access, allowed };
}
export function useRefreshPlatform() {
  const client = useQueryClient();
  return () => Promise.all([client.invalidateQueries({ queryKey: ["platform"] }), client.invalidateQueries({ queryKey: ["auth", "current-user"] })]);
}
