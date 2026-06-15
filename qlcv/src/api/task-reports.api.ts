import { apiRequest } from "./client";
import type { ProjectTask } from "./tasks.api";

export type TaskSummaryReport = {
  total_tasks: number;
  open_tasks: number;
  overdue_tasks: number;
  completed_tasks: number;
  completion_rate: number;
};

export type TaskGroupReportItem = {
  id?: string | null;
  name?: string | null;
  status?: string;
  count: number;
};

export type TaskGroupReportResponse = {
  data: TaskGroupReportItem[];
};

export type OverdueTasksResponse = {
  data: ProjectTask[];
};

export function getTaskSummaryReport(signal?: AbortSignal) {
  return apiRequest<TaskSummaryReport>("/api/v1/reports/tasks/summary", { signal });
}

export function getTasksByAssigneeReport(signal?: AbortSignal) {
  return apiRequest<TaskGroupReportResponse>("/api/v1/reports/tasks/by-assignee", { signal });
}

export function getTasksByStatusReport(signal?: AbortSignal) {
  return apiRequest<TaskGroupReportResponse>("/api/v1/reports/tasks/by-status", { signal });
}

export function getOverdueTasksReport(limit?: number, signal?: AbortSignal) {
  return apiRequest<OverdueTasksResponse>("/api/v1/reports/tasks/overdue", {
    query: { limit },
    signal,
  });
}

export function getWorkloadReport(signal?: AbortSignal) {
  return apiRequest<TaskGroupReportResponse>("/api/v1/reports/workload", { signal });
}
