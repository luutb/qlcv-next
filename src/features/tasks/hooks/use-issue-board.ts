"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authorizationCacheScope, hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { ApiProblem } from "@/services/http";
import { tasksApi, taskQueryKeys, type Task, type TaskBoardResponse } from "../api";
import { invalidateTaskQueries } from "../api/task.invalidation";
import { planMove, taskStatuses, type BoardColumn, type IssueBoardData } from "../model/board";

function workflowTone(macroColumn?: string): string {
  switch (macroColumn?.toUpperCase()) {
    case "INTAKE": return "todo";
    case "IN_PROGRESS": return "progress";
    case "BILLING": return "review";
    case "ARCHIVED": return "done";
    default: return "todo";
  }
}

function workflowColumns(board: TaskBoardResponse): BoardColumn[] {
  if (!Array.isArray(board.columns)) throw new Error("Board workflow không trả danh sách cột hợp lệ.");
  return [...board.columns]
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((column) => ({
      id: column.id,
      name: column.name,
      tone: workflowTone(column.macro_column),
      tasks: [...(column.tasks ?? [])].sort((left, right) => left.position - right.position),
    }));
}

async function statusFallback(projectId: string, accessToken: string, signal: AbortSignal, filters: { q?: string; assignee_id?: string }): Promise<IssueBoardData> {
  const tasks: Task[] = [];
  for (let offset = 0; ; ) {
    const page = await tasksApi.list({ project_id: projectId, ...filters, limit: 100, offset }, { accessToken, signal });
    tasks.push(...page.data);
    offset += page.data.length;
    if (!page.data.length || (page.pagination ? offset >= page.pagination.total : page.data.length < 100)) break;
  }
  return {
    source: "status-fallback",
    columns: taskStatuses.map((column) => ({ ...column, status: column.id, tasks: tasks.filter((task) => task.status === column.id).sort((left, right) => left.position - right.position) })),
  };
}

export function useIssueBoard(projectId: string, workflowTemplateId?: string | null, filters: { q?: string; assignee_id?: string; status?: Task["status"] } = {}) {
  const accessToken = useAccessToken();
  const user = useCurrentUserQuery();
  const canAccess = hasAuthorizedAction(user.data, "tasks.access");
  const client = useQueryClient();
  const query = useQuery({
    queryKey: [...taskQueryKeys.board({ project_id: projectId, workflow_template_id: workflowTemplateId ?? undefined, ...filters }), accessToken, authorizationCacheScope(user.data)],
    enabled: Boolean(accessToken && projectId && canAccess),
    queryFn: async ({ signal }): Promise<IssueBoardData> => {
      if (!workflowTemplateId) return statusFallback(projectId, accessToken!, signal, filters);
      try {
        const board = await tasksApi.board({ project_id: projectId, workflow_template_id: workflowTemplateId, include_unassigned: true, ...filters }, { accessToken: accessToken!, signal });
        return { source: "workflow", columns: workflowColumns(board) };
      } catch (error) {
        // Compatibility mode is deliberately narrow: permission, contract and server errors
        // remain visible instead of silently presenting an inaccurate status board.
        if (!(error instanceof ApiProblem) || ![404, 405].includes(error.problem.status)) throw error;
        return statusFallback(projectId, accessToken!, signal, filters);
      }
    },
  });
  const move = useMutation({
    mutationFn: async ({ taskId, targetId, beforeId, placement, depositAmount }: { taskId: string; targetId: string; beforeId?: string; placement?: "first"; depositAmount?: number }) => {
      if (!accessToken || !canAccess) throw new Error("Bạn không có quyền truy cập công việc.");
      if (depositAmount !== undefined && !hasAuthorizedAction(user.data, "tasks.complete-deposit")) throw new Error("Bạn không có quyền xác nhận tiền cọc.");
      if (depositAmount !== undefined) { await tasksApi.completeDeposit(taskId, depositAmount, { accessToken: accessToken! }); return; }
      const board = query.data;
      // Some board implementations apply query filters server-side; refetch without
      // those filters before calculating persisted positions.
      const columns = board?.source === "workflow" && (filters.q || filters.assignee_id || filters.status)
        ? workflowColumns(await tasksApi.board({ project_id: projectId, workflow_template_id: workflowTemplateId!, include_unassigned: true }, { accessToken: accessToken! }))
        : board?.columns ?? [];
      const resolvedBeforeId = placement === "first" ? columns.find((column) => column.id === targetId)?.tasks.find((task) => task.id !== taskId)?.id : beforeId;
      const plan = planMove(columns, taskId, targetId, resolvedBeforeId);
      if (!plan) return;
      const options = { accessToken: accessToken! };
      if (plan.task.actions?.move !== true) throw new Error("Bạn không có quyền di chuyển công việc này.");
      if (board?.source === "workflow") {
        if (plan.source.id === plan.target.id) {
          await tasksApi.reorder({ items: plan.items }, options);
          return;
        }
        const targetTasks = plan.target.tasks.filter((item) => item.id !== taskId);
        const beforeTaskId = resolvedBeforeId && targetTasks.some((item) => item.id === resolvedBeforeId) ? resolvedBeforeId : undefined;
        await tasksApi.move(taskId, { workflow_step_id: plan.target.id, before_task_id: beforeTaskId }, options);
      } else if (plan.source.id !== plan.target.id && plan.target.status) {
        await tasksApi.updateStatus(taskId, { status: plan.target.status }, options);
      }
    },
    // Refetch even after failure: the move can succeed before reorder fails.
    onSettled: () => invalidateTaskQueries(client),
  });
  return { query, move, accessToken };
}
