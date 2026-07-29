"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProject, type CreateProjectRequest } from "@/api/projects.api";
import { workflowQueryKeys } from "@/api/query-keys";
import { listWorkflowTemplates } from "@/api/workflow.api";

export function useProjectWorkflowTemplates() {
  return useQuery({
    queryKey: workflowQueryKeys.templates(),
    queryFn: ({ signal }) => listWorkflowTemplates(true, signal),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectRequest) => createProject(payload),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: workflowQueryKeys.all });

      if (project.workflow_template_id) {
        queryClient.invalidateQueries({
          queryKey: workflowQueryKeys.board(project.workflow_template_id),
        });
      }
    },
  });
}
