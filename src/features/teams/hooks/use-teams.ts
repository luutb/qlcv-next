"use client";

import { useCurrentUserQuery } from "@/features/auth/hooks/use-current-user";
import { hasAuthorizedAction } from "@/features/auth/model/current-user";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { listTeams, listTeamMembers, listTeamUserOptions, teamQueryKeys } from "../api/teams.api";
import { useQuery } from "@tanstack/react-query";

export function useTeamsQuery(includeInactive = false) {
  const accessToken = useAccessToken();
  const user = useCurrentUserQuery();
  return useQuery({
    queryKey: [...teamQueryKeys.list(includeInactive), accessToken],
    queryFn: ({ signal }) => listTeams({ accessToken: accessToken!, signal }, includeInactive),
    enabled: Boolean(accessToken && hasAuthorizedAction(user.data, "teams.read")),
  });
}

export function useTeamUserOptions(enabled: boolean) {
  const accessToken = useAccessToken();
  return useQuery({
    queryKey: ["team-user-options", accessToken],
    queryFn: ({ signal }) => listTeamUserOptions({ accessToken: accessToken!, signal }),
    enabled: Boolean(accessToken && enabled),
  });
}

export function useTeamMembersQuery(teamId: string) {
  const accessToken = useAccessToken();
  const user = useCurrentUserQuery();
  return useQuery({
    queryKey: [...teamQueryKeys.members(teamId), accessToken],
    queryFn: ({ signal }) => listTeamMembers({ accessToken: accessToken!, signal }, teamId),
    enabled: Boolean(accessToken && teamId && hasAuthorizedAction(user.data, "teams.read")),
  });
}
