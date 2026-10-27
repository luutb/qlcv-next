"use client";

import { useCurrentUserQuery } from "@/features/auth/hooks/use-current-user";
import { authorizationCacheScope, hasAuthorizedAction } from "@/features/auth/model/current-user";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { listProjects, projectQueryKeys } from "@/features/projects/api/projects.api";
import type { ProjectListFilters } from "@/features/projects/api/projects.api";
import { useQuery } from "@tanstack/react-query";

export function useProjectsQuery(filters: ProjectListFilters = {}) {
  const accessToken = useAccessToken();
  const user = useCurrentUserQuery();
  return useQuery({
    queryKey: [...projectQueryKeys.list(filters), accessToken, authorizationCacheScope(user.data)],
    queryFn: ({ signal }) => listProjects({ accessToken: accessToken!, signal }, filters),
    enabled: Boolean(accessToken && hasAuthorizedAction(user.data, "projects.read")),
  });
}
