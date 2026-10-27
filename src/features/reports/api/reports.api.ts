import { apiUrl, parseApiResponse } from "@/services/http";
import type { TaskPriority, TaskStatus } from "@/features/tasks/api";

export type OverdueTask = {
  id: string;
  project_id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string | null;
  due_date: string;
  overdue: boolean;
};

export type OverdueTasksResponse = { data: OverdueTask[]; pagination?: { limit: number; offset: number; count: number; total: number } };

export async function getOverdueTasks(accessToken: string, signal?: AbortSignal): Promise<OverdueTasksResponse> {
  const response = await fetch(apiUrl("/reports/tasks/overdue"), {
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    signal,
  });
  return parseApiResponse<OverdueTasksResponse>(response);
}
