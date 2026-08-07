export type WorkStatus = "TODO" | "DOING" | "DONE" | "CANCELLED";
export type WorkPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type WorkStepId = "intake" | "drafting" | "customer" | "signing" | "billing" | "done" | "unassigned";
export type ViewMode = "board" | "list";
export type DueFilter = "all" | "overdue" | "today" | "week";
export type SettingsField = "project" | "assignee" | "labels" | "due" | "status" | "created";

export type WorkStep = {
  id: WorkStepId;
  name: string;
  macro: string;
};

export type WorkProject = {
  id: string;
  name: string;
  customer: string;
};

export type WorkIssue = {
  id: string;
  title: string;
  projectId: string;
  step: WorkStepId;
  status: WorkStatus;
  assignee: string;
  due: string;
  labels: string[];
  description: string;
  created: string;
  updated: string;
  priority: WorkPriority;
  workflowStepId?: string | null;
};

export type WorkDraft = {
  title: string;
  projectId: string;
  step: WorkStepId;
  status: WorkStatus;
  assignee: string;
  due: string;
  labels: string;
  description: string;
};

export type CreateDraft = WorkDraft;

export type Settings = {
  density: "comfortable" | "compact";
  fields: Record<SettingsField, boolean>;
};
