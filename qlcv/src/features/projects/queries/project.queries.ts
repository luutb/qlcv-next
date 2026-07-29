"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProject, type CreateProjectRequest } from "@/api/projects.api";
import { listWorkflowTemplates } from "@/api/workflow.api";

const projectQueryKeys = {
  workflowBoard: ["workflow-board"] as const,
  workflowTemplates: ["workflow-board", "templates"] as const,
  workflowBoardByTemplate: (workflowTemplateId: string) =>
    ["workflow-board", "board", workflowTemplateId] as const,
};

export function useProjectWorkflowTemplates() {
  return useQuery({
    queryKey: projectQueryKeys.workflowTemplates,
    queryFn: ({ signal }) => listWorkflowTemplates(true, signal),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectRequest) => createProject(payload),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.workflowBoard });

      if (project.workflow_template_id) {
        queryClient.invalidateQueries({
          queryKey: projectQueryKeys.workflowBoardByTemplate(project.workflow_template_id),
        });
      }
    },
  });
}
