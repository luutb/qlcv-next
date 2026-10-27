"use client";

import { useCurrentUserQuery } from "@/features/auth/hooks/use-current-user";
import { authorizationCacheScope, hasAuthorizedAction } from "@/features/auth/model/current-user";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { useQuery } from "@tanstack/react-query";
import { getProject, listProjectTasks, projectQueryKeys, type Project } from "../api/projects.api";

export function useProjectQuery(projectId: string) {
  const accessToken = useAccessToken();
  const user = useCurrentUserQuery();
  return useQuery<Project>({
    queryKey: [...projectQueryKeys.detail(projectId), accessToken, authorizationCacheScope(user.data)],
    queryFn: ({ signal }) => getProject({ accessToken: accessToken!, signal }, projectId),
    enabled: Boolean(accessToken && projectId && hasAuthorizedAction(user.data, "projects.read")),
  });
}

export function useProjectTasksQuery(projectId: string) {
  const accessToken = useAccessToken();
  const user = useCurrentUserQuery();
  return useQuery({
    queryKey: [...projectQueryKeys.tasks(projectId), accessToken, authorizationCacheScope(user.data)],
    queryFn: ({ signal }) => listProjectTasks({ accessToken: accessToken!, signal }, projectId, { limit: 100, offset: 0 }),
    enabled: Boolean(accessToken && projectId && hasAuthorizedAction(user.data, "projects.read") && hasAuthorizedAction(user.data, "tasks.access")),
  });
}
