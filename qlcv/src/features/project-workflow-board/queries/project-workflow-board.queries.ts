"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProjectBoard,
  moveProjectWorkflowStep,
  overrideProjectConflict,
  type MoveProjectWorkflowStepRequest,
  type OverrideConflictRequest,
} from "@/api/projects.api";

export const workflowBoardQueryKeys = {
  all: ["workflow-board"] as const,
  board: (workflowTemplateId: string) =>
    [...workflowBoardQueryKeys.all, "board", workflowTemplateId] as const,
};

export function useProjectBoard(workflowTemplateId?: string | null) {
  return useQuery({
    queryKey: workflowBoardQueryKeys.board(workflowTemplateId ?? ""),
    queryFn: ({ signal }) => getProjectBoard(workflowTemplateId as string, signal),
    enabled: Boolean(workflowTemplateId),
  });
}

export function useMoveProjectWorkflowStep(projectId: string, workflowTemplateId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MoveProjectWorkflowStepRequest) =>
      moveProjectWorkflowStep(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workflowBoardQueryKeys.board(workflowTemplateId),
      });
    },
  });
}

export function useOverrideProjectConflict(workflowTemplateId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: OverrideConflictRequest;
    }) => overrideProjectConflict(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workflowBoardQueryKeys.board(workflowTemplateId),
      });
    },
  });
}
