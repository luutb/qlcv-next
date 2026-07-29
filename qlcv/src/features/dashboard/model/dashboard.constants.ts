import type { DashboardIssueStatus, DashboardMacroColumn, DashboardRange } from "@/api/dashboard.types";

export const RANGE_OPTIONS: Array<{ value: DashboardRange; label: string }> = [
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "90d", label: "90 ngày" },
  { value: "custom", label: "Tùy chọn" },
];

export const ISSUE_STATUS_LABELS: Record<DashboardIssueStatus, string> = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  DOING: "DOING",
  REVIEW: "REVIEW",
  DONE: "DONE",
};

export const ISSUE_STATUS_TONE: Record<DashboardIssueStatus, string> = {
  BACKLOG: "todo",
  TODO: "todo",
  DOING: "doing",
  REVIEW: "review",
  DONE: "done",
};

export const MACRO_LABELS: Record<DashboardMacroColumn, string> = {
  INTAKE: "Tiếp nhận",
  IN_PROGRESS: "Đang xử lý",
  BILLING: "Billing",
  ARCHIVED: "Lưu trữ",
};
