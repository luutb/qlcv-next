import type { TaskListFilters, TaskPagingParams } from "./task.types";

/** Resource-centric keys; no duplicate `issue` key family is permitted. */
export const taskQueryKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskQueryKeys.all, "list"] as const,
  list: (filters: TaskListFilters = {}) => [...taskQueryKeys.lists(), filters] as const,
  details: () => [...taskQueryKeys.all, "detail"] as const,
  task: (id: string) => [...taskQueryKeys.details(), id] as const,
  board: (filters: Record<string, string | number | boolean | undefined> = {}) =>
    [...taskQueryKeys.all, "board", filters] as const,
  dependencies: (taskId: string) => [...taskQueryKeys.task(taskId), "dependencies"] as const,
  comments: (taskId: string, paging: TaskPagingParams = { limit: 0, offset: 0 }) =>
    [...taskQueryKeys.task(taskId), "comments", paging] as const,
  reviews: (taskId: string, paging: TaskPagingParams = { limit: 0, offset: 0 }) =>
    [...taskQueryKeys.task(taskId), "reviews", paging] as const,
  history: (taskId: string, paging: TaskPagingParams = { limit: 0, offset: 0 }) =>
    [...taskQueryKeys.task(taskId), "history", paging] as const,
};
