import { apiRequest } from "./client";
import type { MessageResponse } from "./types";

export type LabelEntityType = "customer" | "project" | "task" | "document";

export type Label = {
  id: string;
  organization_id?: string;
  project_id?: string | null;
  title: string;
  description?: string | null;
  color?: string | null;
  scoped_key?: string | null;
  scoped_value?: string | null;
  priority?: number | null;
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type LabelListQuery = {
  project_id?: string;
  archived?: boolean;
};

export type LabelListResponse = {
  data: Label[];
};

export type LabelRequest = {
  project_id?: string | null;
  title: string;
  description?: string | null;
  color?: string | null;
  scoped_key?: string | null;
  scoped_value?: string | null;
  priority?: number | null;
  is_archived?: boolean;
};

export type LabelAssignment = {
  id: string;
  label_id: string;
  entity_type: LabelEntityType;
  entity_id: string;
  created_at?: string;
};

export type LabelAssignmentListQuery = {
  entity_type?: LabelEntityType;
  entity_id?: string;
};

export type LabelAssignmentListResponse = {
  data: LabelAssignment[];
};

export type LabelAssignmentRequest = {
  label_id: string;
  entity_type: LabelEntityType;
  entity_id: string;
};

export function listLabels(query: LabelListQuery = {}, signal?: AbortSignal) {
  return apiRequest<LabelListResponse>("/api/v1/labels", { query, signal });
}

export function createLabel(payload: LabelRequest) {
  return apiRequest<Label, LabelRequest>("/api/v1/labels", {
    method: "POST",
    body: payload,
  });
}

export function getLabel(id: string, signal?: AbortSignal) {
  return apiRequest<Label>(`/api/v1/labels/${id}`, { signal });
}

export function updateLabel(id: string, payload: LabelRequest) {
  return apiRequest<Label, LabelRequest>(`/api/v1/labels/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function archiveLabel(id: string) {
  return apiRequest<MessageResponse>(`/api/v1/labels/${id}`, {
    method: "DELETE",
  });
}

export function listLabelAssignments(query: LabelAssignmentListQuery = {}, signal?: AbortSignal) {
  return apiRequest<LabelAssignmentListResponse>("/api/v1/label-assignments", {
    query,
    signal,
  });
}

export function createLabelAssignment(payload: LabelAssignmentRequest) {
  return apiRequest<LabelAssignment, LabelAssignmentRequest>("/api/v1/label-assignments", {
    method: "POST",
    body: payload,
  });
}

export function deleteLabelAssignment(id: string) {
  return apiRequest<MessageResponse>(`/api/v1/label-assignments/${id}`, {
    method: "DELETE",
  });
}
