import type { IssueListFilters } from "@/api/issues.api";
import {
  createIssue,
  deleteIssue,
  getIssue,
  getIssueBoard,
  listIssues,
  moveIssue,
  updateIssue,
} from "@/api/issues.api";

export const issueBoardQueryKeys = {
  all: ["issues"] as const,
  lists: () => [...issueBoardQueryKeys.all, "list"] as const,
  list: (filters: IssueListFilters) => [...issueBoardQueryKeys.lists(), filters] as const,
  board: (filters: IssueListFilters) => [...issueBoardQueryKeys.all, "board", filters] as const,
  detail: (id: string) => [...issueBoardQueryKeys.all, "detail", id] as const,
};

export const issueBoardApi = {
  listIssues,
  getIssueBoard,
  createIssue,
  getIssue,
  updateIssue,
  moveIssue,
  deleteIssue,
};
