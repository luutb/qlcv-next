import { apiRequest } from "./client";
import type { MessageResponse } from "./types";

export const MACRO_COLUMNS = ["INTAKE", "IN_PROGRESS", "BILLING", "ARCHIVED"] as const;

export type MacroColumnKey = (typeof MACRO_COLUMNS)[number];

export type PaymentType = "NONE" | "FIXED_AMOUNT" | "PERCENTAGE" | "REMAINING";

export type FinancialTagType = "FREE" | "FIXED_AMOUNT" | "PERCENTAGE" | "CALCULATED" | "MANUAL";

export type WorkflowFinancialTag = {
  type: FinancialTagType;
  key: string;
  custom_key?: string;
  amount?: number;
  value?: number;
  base?: "fee" | "deposit" | "total_contract_value";
};

export type WorkflowFinancialTrigger = {
  requires_payment?: boolean;
  payment_type?: PaymentType;
  value_threshold?: number | null;
  payment_label?: string;
  allow_overpayment?: boolean;
  financial_tags?: WorkflowFinancialTag[];
};

export type WorkflowStep = {
  id?: string;
  organization_id?: string;
  template_id?: string;
  step_key: string;
  step_name: string;
  macro_column: MacroColumnKey;
  sort_order: number;
  financial_trigger?: WorkflowFinancialTrigger | Record<string, unknown> | null;
  security_trigger?: Record<string, unknown> | null;
  task_trigger?: Record<string, unknown> | null;
  is_terminal?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type WorkflowTemplate = {
  id: string;
  organization_id?: string;
  template_name: string;
  description?: string | null;
  is_default: boolean;
  is_active: boolean;
  active?: boolean;
  steps?: WorkflowStep[];
  steps_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type WorkflowTemplateListResponse = {
  data: WorkflowTemplate[];
};

export type CreateWorkflowTemplateRequest = {
  template_name: string;
  description?: string;
  is_default?: boolean;
  steps: WorkflowStep[];
};

export type UpdateWorkflowTemplateRequest = {
  template_name?: string;
  description?: string | null;
  is_default?: boolean;
  is_active?: boolean;
};

export type WorkflowFinancialPaymentPayload = {
  incoming_payment_confirmation?: number;
  payment_method?: string;
  payment_note?: string;
  payment_type?: string;
};

export function listWorkflowTemplates(active = true, signal?: AbortSignal) {
  return apiRequest<WorkflowTemplateListResponse>("/api/v1/workflow-templates", {
    query: { active },
    signal,
  });
}

export function getWorkflowTemplate(id: string, signal?: AbortSignal) {
  return apiRequest<WorkflowTemplate>(`/api/v1/workflow-templates/${id}`, { signal });
}

export function createWorkflowTemplate(payload: CreateWorkflowTemplateRequest) {
  return apiRequest<WorkflowTemplate, CreateWorkflowTemplateRequest>(
    "/api/v1/workflow-templates",
    {
      method: "POST",
      body: payload,
    },
  );
}

export function updateWorkflowTemplate(id: string, payload: UpdateWorkflowTemplateRequest) {
  return apiRequest<WorkflowTemplate, UpdateWorkflowTemplateRequest>(
    `/api/v1/workflow-templates/${id}`,
    {
      method: "PUT",
      body: payload,
    },
  );
}

export function archiveWorkflowTemplate(id: string) {
  return apiRequest<MessageResponse>(`/api/v1/workflow-templates/${id}`, {
    method: "DELETE",
  });
}
