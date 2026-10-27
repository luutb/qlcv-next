"use client";

import { authorizationCacheScope, hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import { useQuery } from "@tanstack/react-query";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { listProjectAssignableUsers, projectQueryKeys } from "../api/projects.api";

export function useAssignableUsers(projectId: string) {
  const accessToken = useAccessToken();
  const user = useCurrentUserQuery();
  return useQuery({ queryKey: [...projectQueryKeys.assignableUsers(projectId), accessToken, authorizationCacheScope(user.data)], queryFn: ({ signal }) => listProjectAssignableUsers({ accessToken: accessToken!, signal }, projectId), enabled: Boolean(accessToken && projectId && hasAuthorizedAction(user.data,"projects.read") && hasAuthorizedAction(user.data,"tasks.assign")) });
}
