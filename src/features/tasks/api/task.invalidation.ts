import type { QueryClient } from "@tanstack/react-query";
import { taskQueryKeys } from "./task.keys";

/** Targeted invalidation keeps board/list/detail/history consistent after a Task mutation. */
export function invalidateTaskQueries(queryClient: QueryClient, taskId?: string): Promise<void[]> {
  const invalidations = [
    queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    queryClient.invalidateQueries({ queryKey: ["projects"] }),
    queryClient.invalidateQueries({ queryKey: taskQueryKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: taskQueryKeys.all }),
  ];
  if (taskId) invalidations.push(queryClient.invalidateQueries({ queryKey: taskQueryKeys.task(taskId) }));
  return Promise.all(invalidations);
}
