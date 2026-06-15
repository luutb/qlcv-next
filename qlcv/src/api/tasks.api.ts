import { apiRequest } from "./client";
import type { ListQuery, MessageResponse, PaginatedResponse } from "./types";

export const TASK_STATUSES = ["TODO", "DOING", "DONE", "CANCELLED"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type ProjectTask = {
  id: string;
  organization_id: string;
  project_id: string;
  workflow_step_id?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  assignee_id?: string | null;
  due_date?: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type TaskListQuery = ListQuery & {
  project_id?: string;
  assignee_id?: string;
  status?: TaskStatus;
  q?: string;
};

export type TaskListResponse = PaginatedResponse<ProjectTask>;

export type TaskRequest = {
  project_id: string;
  workflow_step_id?: string | null;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  assignee_id?: string | null;
  due_date?: string | null;
  position?: number;
};

export type UpdateTaskStatusRequest = {
  status: TaskStatus;
};

export type UpdateTaskAssigneeRequest = {
  assignee_id?: string | null;
};

export type ReorderTasksRequest = {
  items: Array<{ id: string; position: number }>;
};

export function listTasks(query: TaskListQuery = {}, signal?: AbortSignal) {
  return apiRequest<TaskListResponse>("/api/v1/tasks", { query, signal });
}

export function listProjectTasks(projectId: string, signal?: AbortSignal) {
  return apiRequest<TaskListResponse>(`/api/v1/projects/${projectId}/tasks`, { signal });
}

export function getTask(id: string, signal?: AbortSignal) {
  return apiRequest<ProjectTask>(`/api/v1/tasks/${id}`, { signal });
}

export function createTask(payload: TaskRequest) {
  return apiRequest<ProjectTask, TaskRequest>("/api/v1/tasks", {
    method: "POST",
    body: payload,
  });
}

export function updateTask(id: string, payload: TaskRequest) {
  return apiRequest<ProjectTask, TaskRequest>(`/api/v1/tasks/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function updateTaskStatus(id: string, payload: UpdateTaskStatusRequest) {
  return apiRequest<ProjectTask, UpdateTaskStatusRequest>(`/api/v1/tasks/${id}/status`, {
    method: "PATCH",
    body: payload,
  });
}

export function updateTaskAssignee(id: string, payload: UpdateTaskAssigneeRequest) {
  return apiRequest<ProjectTask, UpdateTaskAssigneeRequest>(`/api/v1/tasks/${id}/assignee`, {
    method: "PATCH",
    body: payload,
  });
}

export function reorderTasks(payload: ReorderTasksRequest) {
  return apiRequest<MessageResponse, ReorderTasksRequest>("/api/v1/tasks/reorder", {
    method: "PATCH",
    body: payload,
  });
}

export function deleteTask(id: string) {
  return apiRequest<MessageResponse>(`/api/v1/tasks/${id}`, {
    method: "DELETE",
  });
}
