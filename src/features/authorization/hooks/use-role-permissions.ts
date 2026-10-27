"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { useCurrentUserQuery } from "@/features/auth/hooks/use-current-user";
import { getRolePermissions, rolePermissionKeys, updateRolePermissions, type CanonicalRole } from "../api/role-permissions.api";
import type { AuthorizationAction } from "@/features/auth/model/current-user";

export function useRolePermissions(role: CanonicalRole) {
  const token = useAccessToken();
  const user = useCurrentUserQuery();
  const allowed = Boolean(!user.isError && user.data?.is_active && user.data.account_scope !== "platform" && (user.data.role === "ADMIN" || user.data.role === "SUPER_ADMIN"));
  const query = useQuery({
    queryKey: rolePermissionKeys.byRole(role, token),
    queryFn: ({ signal }) => getRolePermissions(role, signal),
    enabled: Boolean(token && allowed),
    staleTime: 0,
  });
  return { ...query, token, user, allowed };
}

export function useSaveRolePermissions(role: CanonicalRole) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (actions: Partial<Record<AuthorizationAction, boolean>>) => updateRolePermissions(role, actions),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: rolePermissionKeys.all }),
        client.invalidateQueries({ queryKey: ["auth", "current-user"] }),
      ]);
    },
  });
}
