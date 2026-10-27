"use client";

import { useQueryClient } from "@tanstack/react-query";
import { teamQueryKeys } from "../api/teams.api";

export function useRefreshTeamData() {
  const client = useQueryClient();
  return async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: teamQueryKeys.all }),
      // Membership/roles also determine project assignee choices.
      client.invalidateQueries({ queryKey: ["projects"] }),
    ]);
  };
}
