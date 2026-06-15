"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProject,
  getProjectBoard,
  moveProjectWorkflowStep,
  overrideProjectConflict,
  type CreateProjectRequest,
  type MoveProjectWorkflowStepRequest,
  type OverrideConflictRequest,
} from "@/api/projects.api";
import {
  createWorkflowTemplate,
  getWorkflowTemplate,
  listWorkflowTemplates,
  type CreateWorkflowTemplateRequest,
} from "@/api/workflow.api";

export const workflowBoardQueryKeys = {
  all: ["workflow-board"] as const,
  templates: () => [...workflowBoardQueryKeys.all, "templates"] as const,
  template: (id: string) => [...workflowBoardQueryKeys.templates(), id] as const,
  board: (workflowTemplateId: string) =>
    [...workflowBoardQueryKeys.all, "board", workflowTemplateId] as const,
};

export function useWorkflowTemplates() {
  return useQuery({
    queryKey: workflowBoardQueryKeys.templates(),
    queryFn: ({ signal }) => listWorkflowTemplates(true, signal),
  });
}

export function useWorkflowTemplate(id?: string | null) {
  return useQuery({
    queryKey: workflowBoardQueryKeys.template(id ?? ""),
    queryFn: ({ signal }) => getWorkflowTemplate(id as string, signal),
    enabled: Boolean(id),
  });
}

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

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectRequest) => createProject(payload),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: workflowBoardQueryKeys.all });

      if (project.workflow_template_id) {
        queryClient.invalidateQueries({
          queryKey: workflowBoardQueryKeys.board(project.workflow_template_id),
        });
      }
    },
  });
}

export function useCreateWorkflowTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWorkflowTemplateRequest) => createWorkflowTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowBoardQueryKeys.templates() });
    },
  });
}
