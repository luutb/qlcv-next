export const workflowQueryKeys = {
  all: ["workflow-board"] as const,
  templates: () => [...workflowQueryKeys.all, "templates"] as const,
  template: (id: string) => [...workflowQueryKeys.templates(), id] as const,
  board: (workflowTemplateId: string) =>
    [...workflowQueryKeys.all, "board", workflowTemplateId] as const,
};
