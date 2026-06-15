import { apiRequest } from "./client";
import type { MacroColumnKey, WorkflowFinancialPaymentPayload } from "./workflow.api";
import type { Actions, ListQuery, MessageResponse, PaginatedResponse } from "./types";

export type ProjectStatus = "ACTIVE" | "CLOSED";
export type ConflictStatus = "CLEARED" | "PENDING" | "CONFLICT_DETECTED" | "OVERRIDDEN_CLEARED";

export type ProjectActions = Actions;

export type Project = {
  id: string;
  organization_id: string;
  customer_id: string;
  customer_name?: string;
  name: string;
  hourly_rate: number;
  status: ProjectStatus;
  workflow_template_id?: string | null;
  current_workflow_step_id?: string | null;
  current_workflow_step_key?: string | null;
  current_workflow_step_name?: string | null;
  total_contract_value: number;
  total_paid: number;
  remaining_amount: number;
  conflict_status: ConflictStatus;
  opposing_party_name?: string | null;
  opposing_party_tax_code?: string | null;
  created_at: string;
  updated_at?: string | null;
  actions?: ProjectActions;
};

export type ProjectSummary = Project;

export type ProjectListQuery = ListQuery & {
  customer_id?: string;
  status?: ProjectStatus;
};

export type ProjectListResponse = PaginatedResponse<ProjectSummary>;

export type ProjectBoardCard = Partial<ProjectSummary> & {
  id: string;
  name: string;
  customer_id?: string;
  status?: ProjectStatus;
  workflow_step_key?: string;
};

export type ProjectBoardStep = {
  id?: string;
  step_id?: string;
  step_key: string;
  step_name: string;
  macro_column?: MacroColumnKey;
  sort_order: number;
  projects: ProjectBoardCard[];
};

export type ProjectBoardMacroColumn = {
  key?: MacroColumnKey;
  macro_column: MacroColumnKey;
  title: string;
  steps: ProjectBoardStep[];
};

export type ProjectBoardResponse = {
  workflow_template_id?: string;
  workflow_template_name?: string;
  macro_columns: ProjectBoardMacroColumn[];
};

export type CreateProjectRequest = {
  customer_id: string;
  name: string;
  hourly_rate: number;
  workflow_template_id?: string;
  total_contract_value: number;
  opposing_party_name?: string;
  opposing_party_tax_code?: string;
};

export type UpdateProjectRequest = {
  name: string;
  hourly_rate: number;
  workflow_template_id?: string | null;
  current_workflow_step_id?: string | null;
  total_contract_value?: number;
  opposing_party_name?: string | null;
  opposing_party_tax_code?: string | null;
};

export type MoveProjectWorkflowStepRequest = WorkflowFinancialPaymentPayload & {
  target_step_key: string;
};

export type OverrideConflictRequest = {
  override_justification: string;
};

export function listProjects(
  queryOrSignal: ProjectListQuery | AbortSignal = {},
  maybeSignal?: AbortSignal,
) {
  const query = isAbortSignal(queryOrSignal) ? {} : queryOrSignal;
  const signal = isAbortSignal(queryOrSignal) ? queryOrSignal : maybeSignal;
  return apiRequest<ProjectListResponse>("/api/v1/projects", { query, signal });
}

export function getProject(id: string, signal?: AbortSignal) {
  return apiRequest<ProjectSummary>(`/api/v1/projects/${id}`, { signal });
}

export function createProject(payload: CreateProjectRequest) {
  return apiRequest<ProjectSummary, CreateProjectRequest>("/api/v1/projects", {
    method: "POST",
    body: payload,
  });
}

export function updateProject(id: string, payload: UpdateProjectRequest) {
  return apiRequest<ProjectSummary, UpdateProjectRequest>(`/api/v1/projects/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function closeProject(id: string) {
  return apiRequest<ProjectSummary | MessageResponse>(`/api/v1/projects/${id}/close`, {
    method: "POST",
  });
}

export function getProjectBoard(workflowTemplateId: string, signal?: AbortSignal) {
  return apiRequest<ProjectBoardResponse>("/api/v1/projects/board", {
    query: { workflow_template_id: workflowTemplateId },
    signal,
  });
}

export function moveProjectWorkflowStep(
  projectId: string,
  payload: MoveProjectWorkflowStepRequest,
) {
  return apiRequest<ProjectSummary, MoveProjectWorkflowStepRequest>(
    `/api/v1/projects/${projectId}/workflow-step`,
    {
      method: "PATCH",
      body: payload,
    },
  );
}

export function overrideProjectConflict(projectId: string, payload: OverrideConflictRequest) {
  return apiRequest<ProjectSummary, OverrideConflictRequest>(
    `/api/v1/projects/${projectId}/override-conflict`,
    {
      method: "POST",
      body: payload,
    },
  );
}

function isAbortSignal(value: unknown): value is AbortSignal {
  return typeof AbortSignal !== "undefined" && value instanceof AbortSignal;
}
