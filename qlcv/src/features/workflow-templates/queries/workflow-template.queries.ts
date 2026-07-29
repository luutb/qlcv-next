"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWorkflowTemplate,
  getWorkflowTemplate,
  listWorkflowTemplates,
  type CreateWorkflowTemplateRequest,
} from "@/api/workflow.api";

export const workflowTemplateQueryKeys = {
  all: ["workflow-board"] as const,
  templates: () => [...workflowTemplateQueryKeys.all, "templates"] as const,
  template: (id: string) => [...workflowTemplateQueryKeys.templates(), id] as const,
};

export function useWorkflowTemplates() {
  return useQuery({
    queryKey: workflowTemplateQueryKeys.templates(),
    queryFn: ({ signal }) => listWorkflowTemplates(true, signal),
  });
}

export function useWorkflowTemplate(id?: string | null) {
  return useQuery({
    queryKey: workflowTemplateQueryKeys.template(id ?? ""),
    queryFn: ({ signal }) => getWorkflowTemplate(id as string, signal),
    enabled: Boolean(id),
  });
}

export function useCreateWorkflowTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWorkflowTemplateRequest) => createWorkflowTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowTemplateQueryKeys.templates() });
    },
  });
}
