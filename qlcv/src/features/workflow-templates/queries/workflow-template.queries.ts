"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workflowQueryKeys } from "@/api/query-keys";
import {
  createWorkflowTemplate,
  getWorkflowTemplate,
  listWorkflowTemplates,
  type CreateWorkflowTemplateRequest,
} from "@/api/workflow.api";

export function useWorkflowTemplates() {
  return useQuery({
    queryKey: workflowQueryKeys.templates(),
    queryFn: ({ signal }) => listWorkflowTemplates(true, signal),
  });
}

export function useWorkflowTemplate(id?: string | null) {
  return useQuery({
    queryKey: workflowQueryKeys.template(id ?? ""),
    queryFn: ({ signal }) => getWorkflowTemplate(id as string, signal),
    enabled: Boolean(id),
  });
}

export function useCreateWorkflowTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWorkflowTemplateRequest) => createWorkflowTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workflowQueryKeys.templates() });
    },
  });
}
