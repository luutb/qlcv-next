import { apiUrl, createIdempotencyKey, parseApiResponse } from "@/services/http";

import type {
  ApiList,
  CreateCommentInput,
  CreateDependencyInput,
  CreateReviewInput,
  CreateReviewRequestInput,
  CreateTaskInput,
  MoveTaskInput,
  ReorderTasksInput,
  Task,
  TaskBoardFilters,
  TaskBoardColumn,
  TaskBoardResponse,
  UpdateTaskInput,
  TaskComment,
  TaskDependency,
  TaskListFilters,
  TaskPagingParams,
  TaskReview,
  TaskReviewListResponse,
  TaskHistoryListResponse,
  UpdateCommentInput,
  UpdateTaskAssigneeInput,
  UpdateTaskStatusInput,
  UpdateTaskWorkflowStepInput,
} from "./task.types";

export type TaskRequestOptions = { accessToken?: string; signal?: AbortSignal };
type QueryValue = string | number | boolean | undefined | null;
type EntityEnvelope<T> = { data: T };
type BoardWireTask = Omit<Task, "labels"> & {
  labels?: Array<{ id: string; title?: string; name?: string; color: string; label_type?: string }>;
};
type BoardWireColumn = Omit<TaskBoardColumn, "id" | "name" | "tasks"> & {
  id?: string;
  name?: string;
  tasks?: BoardWireTask[];
  workflow_step_id?: string;
  step_key?: string;
  step_name?: string;
};
type BoardWireResponse = Omit<TaskBoardResponse, "columns"> & { columns: BoardWireColumn[] };

function taskUrl(path = ""): string {
  return apiUrl(`/tasks${path}` as `/${string}`);
}

function withQuery(path: string, query: Record<string, QueryValue>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) params.set(key, String(value));
  }
  const search = params.toString();
  return search ? `${path}?${search}` : path;
}

function headers(options: TaskRequestOptions, isWrite = false): HeadersInit {
  return {
    ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {}),
    ...(isWrite ? { "Content-Type": "application/json", "Idempotency-Key": createIdempotencyKey() } : {}),
  };
}

async function get<T>(path: string, options: TaskRequestOptions = {}): Promise<T> {
  return parseApiResponse<T>(await fetch(taskUrl(path), { headers: headers(options), signal: options.signal }));
}

async function post<T>(path: string, body: unknown, options: TaskRequestOptions = {}): Promise<T> {
  return parseApiResponse<T>(await fetch(taskUrl(path), {
    method: "POST",
    headers: headers(options, true),
    body: JSON.stringify(body), signal: options.signal,
  }));
}

async function patch<T>(path: string, body: unknown, options: TaskRequestOptions = {}): Promise<T> {
  return parseApiResponse<T>(await fetch(taskUrl(path), {
    method: "PATCH",
    headers: headers(options, true),
    body: JSON.stringify(body), signal: options.signal,
  }));
}

async function put<T>(path: string, body: unknown, options: TaskRequestOptions = {}): Promise<T> {
  return parseApiResponse<T>(await fetch(taskUrl(path), {
    method: "PUT",
    headers: headers(options, true),
    body: JSON.stringify(body), signal: options.signal,
  }));
}

function entity<T>(response: EntityEnvelope<T>): T {
  return response.data;
}

/**
 * Keep the browser contract stable while deployments roll from the original
 * Workhub field names to the public Issue Board contract. This is a transport
 * adapter, not a UI fallback: consumers always receive id/name/title fields.
 */
function normalizeBoard(response: BoardWireResponse): TaskBoardResponse {
  return {
    ...response,
    columns: response.columns.map((column) => ({
      ...column,
      id: column.id ?? column.workflow_step_id ?? "",
      key: column.key ?? column.step_key,
      name: column.name ?? column.step_name ?? column.workflow_step_id ?? "Untitled",
      tasks: (column.tasks ?? []).map((task) => ({
        ...task,
        labels: task.labels?.map((label) => ({
          ...label,
          title: label.title ?? label.name ?? "",
        })),
      })),
    })),
  };
}

export const tasksApi = {
  list: (filters: TaskListFilters = {}, options?: TaskRequestOptions) =>
    get<ApiList<Task>>(withQuery("", filters), options),
  get: (taskId: string, options?: TaskRequestOptions) =>
    get<EntityEnvelope<Task>>(`/${taskId}`, options).then(entity),
  create: (input: CreateTaskInput, options?: TaskRequestOptions) =>
    post<EntityEnvelope<Task>>("", {
      ...input,
      project_id: String(input.project_id),
      // The selected workflow step determines status on the current backend.
      // Omit the form's default status when a step has been selected.
      ...(input.workflow_step_id ? { status: undefined } : {}),
    }, options).then(entity),
  update: (taskId: string, input: UpdateTaskInput, options?: TaskRequestOptions) =>
    put<EntityEnvelope<Task>>(`/${taskId}`, input, options).then(entity),
  completeDeposit: (taskId: string, amount: number, options?: TaskRequestOptions) => post<EntityEnvelope<Task>>(`/${taskId}/complete-deposit`, { amount }, options).then(entity),
  updateStatus: (taskId: string, input: UpdateTaskStatusInput, options?: TaskRequestOptions) =>
    patch<EntityEnvelope<Task>>(`/${taskId}/status`, input, options).then(entity),
  board: (filters: TaskBoardFilters = {}, options?: TaskRequestOptions) =>
    get<EntityEnvelope<BoardWireResponse> | BoardWireResponse>(withQuery("/board", filters), options).then((response) =>
      normalizeBoard("data" in response ? response.data : response),
    ),
  updateWorkflowStep: (taskId: string, input: UpdateTaskWorkflowStepInput, options?: TaskRequestOptions) =>
    patch<EntityEnvelope<Task>>(`/${taskId}/workflow-step`, input, options).then(entity),
  move: (taskId: string, input: MoveTaskInput, options?: TaskRequestOptions) =>
    patch<EntityEnvelope<Task>>(`/${taskId}/move`, input, options).then(entity),
  updateAssignee: (taskId: string, input: UpdateTaskAssigneeInput, options?: TaskRequestOptions) =>
    patch<EntityEnvelope<Task>>(`/${taskId}/assignee`, input, options).then(entity),
  reorder: (input: ReorderTasksInput, options?: TaskRequestOptions) => patch<unknown>("/reorder", input, options),
  dependencies: (taskId: string, options?: TaskRequestOptions) => get<ApiList<TaskDependency>>(`/${taskId}/dependencies`, options),
  createDependency: (taskId: string, input: CreateDependencyInput, options?: TaskRequestOptions) =>
    post<EntityEnvelope<TaskDependency>>(`/${taskId}/dependencies`, input, options).then(entity),
  comments: (taskId: string, paging: Partial<TaskPagingParams> = {}, options?: TaskRequestOptions) =>
    get<ApiList<TaskComment>>(withQuery(`/${taskId}/comments`, paging), options),
  createComment: (taskId: string, input: CreateCommentInput, options?: TaskRequestOptions) =>
    post<EntityEnvelope<TaskComment>>(`/${taskId}/comments`, input, options).then(entity),
  updateComment: (taskId: string, commentId: string, input: UpdateCommentInput, options?: TaskRequestOptions) =>
    patch<EntityEnvelope<TaskComment>>(`/${taskId}/comments/${commentId}`, input, options).then(entity),
  reviews: (taskId: string, paging: Partial<TaskPagingParams> = {}, options?: TaskRequestOptions) =>
    get<TaskReviewListResponse>(withQuery(`/${taskId}/reviews`, paging), options),
  createReviewRequest: (taskId: string, input: CreateReviewRequestInput, options?: TaskRequestOptions) =>
    post<unknown>(`/${taskId}/review-requests`, input, options),
  createReview: (taskId: string, input: CreateReviewInput, options?: TaskRequestOptions) =>
    post<EntityEnvelope<TaskReview>>(`/${taskId}/reviews`, input, options).then(entity),
  history: (taskId: string, paging: Partial<TaskPagingParams> = {}, options?: TaskRequestOptions) =>
    get<TaskHistoryListResponse>(withQuery(`/${taskId}/history`, paging), options),
};
