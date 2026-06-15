"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import type {
  CreateIssueRequest,
  IssueListFilters,
  MoveIssueRequest,
  UpdateIssueRequest,
} from "@/api/issues.api";
import { issueBoardApi, issueBoardQueryKeys } from "./issue-board.api";

export function useIssues(filters: IssueListFilters = {}) {
  return useQuery({
    queryKey: issueBoardQueryKeys.list(filters),
    queryFn: ({ signal }) => issueBoardApi.listIssues(filters, signal),
  });
}

export function useIssueBoard(filters: IssueListFilters = {}) {
  return useQuery({
    queryKey: issueBoardQueryKeys.board(filters),
    queryFn: ({ signal }) => issueBoardApi.getIssueBoard(filters, signal),
  });
}

export function useIssueDetail(id?: string | null) {
  return useQuery({
    queryKey: issueBoardQueryKeys.detail(id ?? ""),
    queryFn: ({ signal }) => issueBoardApi.getIssue(id as string, signal),
    enabled: Boolean(id),
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateIssueRequest) => issueBoardApi.createIssue(payload),
    onSuccess: () => invalidateIssueBoard(queryClient),
  });
}

export function useUpdateIssue(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateIssueRequest) => issueBoardApi.updateIssue(id, payload),
    onSuccess: (issue) => {
      queryClient.setQueryData(issueBoardQueryKeys.detail(id), issue);
      invalidateIssueBoard(queryClient);
    },
  });
}

export function useMoveIssue(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MoveIssueRequest) => issueBoardApi.moveIssue(id, payload),
    onSuccess: () => invalidateIssueBoard(queryClient),
  });
}

export function useDeleteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => issueBoardApi.deleteIssue(id),
    onSuccess: (_response, id) => {
      queryClient.removeQueries({ queryKey: issueBoardQueryKeys.detail(id) });
      invalidateIssueBoard(queryClient);
    },
  });
}

function invalidateIssueBoard(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: issueBoardQueryKeys.all });
}
