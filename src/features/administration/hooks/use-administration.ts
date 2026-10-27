"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authorizationCacheScope, hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import type { AuthorizationAction } from "@/features/auth/model/current-user";
import { administrationApi } from "../api/administration.api";
export function useAdministrationAccess(action: AuthorizationAction) {
  const token = useAccessToken(); const user = useCurrentUserQuery();
  return { token, user, scope: authorizationCacheScope(user.data), allowed: !user.isError && hasAuthorizedAction(user.data, action) };
}
export function useAdministrationQuery<T>(key: readonly unknown[], action: AuthorizationAction, read: (signal: AbortSignal) => Promise<T>, enabled = true) {
  const access = useAdministrationAccess(action);
  const query = useQuery({ queryKey: ["administration", ...key, access.scope, access.token], queryFn: ({ signal }) => read(signal), enabled: Boolean(enabled && access.token && access.allowed) });
  return { ...query, access };
}
export function useRefreshAdministration() {
  const client = useQueryClient();
  return async () => { await Promise.all([client.invalidateQueries({ queryKey: ["administration"] }), client.invalidateQueries({ queryKey: ["organization"] }), client.invalidateQueries({ queryKey: ["tasks"] }), client.invalidateQueries({ queryKey: ["dashboard"] })]); };
}
export function useOrganizationName() {
  const token = useAccessToken();
  return useQuery({ queryKey: ["organization", token], queryFn: ({ signal }) => administrationApi.organization(signal), enabled: Boolean(token), staleTime: 60000 });
}
