import { apiRequest } from "./client";

export type ProjectPayment = {
  id: string;
  organization_id: string;
  project_id: string;
  workflow_step_id: string;
  amount: number;
  payment_type: string;
  payment_method?: string | null;
  paid_at: string;
  note?: string | null;
  created_by: string;
  created_at: string;
};

export type ProjectPaymentListResponse = {
  data: ProjectPayment[];
};

export type ProjectPaymentListQuery = {
  project_id?: string;
};

export function listProjectPayments(query: ProjectPaymentListQuery = {}, signal?: AbortSignal) {
  return apiRequest<ProjectPaymentListResponse>("/api/v1/project-payments", { query, signal });
}

export function getProjectPayment(id: string, signal?: AbortSignal) {
  return apiRequest<ProjectPayment>(`/api/v1/project-payments/${id}`, { signal });
}
