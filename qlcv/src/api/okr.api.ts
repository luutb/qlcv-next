import { apiRequest } from "./client";
import type { MessageResponse } from "./types";
import type { UserRole } from "./users.api";

export const OKR_STATUSES = ["ON_TRACK", "AT_RISK", "OFF_TRACK", "DONE", "CANCELLED"] as const;

export type OkrStatus = (typeof OKR_STATUSES)[number];

export type OkrCycle = {
  id: string;
  name: string;
  period_type: string;
  starts_at: string;
  ends_at: string;
  status: string;
  created_at?: string;
  updated_at?: string;
};

export type OkrObjective = {
  id: string;
  cycle_id: string;
  owner_user_id?: string | null;
  owner_role?: UserRole | string | null;
  title: string;
  description?: string | null;
  progress: number;
  status: OkrStatus;
  weight: number;
  created_at?: string;
  updated_at?: string;
};

export type OkrKeyResult = {
  id: string;
  objective_id: string;
  title: string;
  target_value: number;
  current_value: number;
  unit?: string | null;
  progress: number;
  status: OkrStatus;
  linked_entity_type?: string | null;
  linked_entity_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type OkrCycleRequest = {
  name: string;
  period_type: string;
  starts_at: string;
  ends_at: string;
  status: string;
};

export type OkrObjectiveRequest = {
  cycle_id: string;
  owner_user_id?: string | null;
  owner_role?: UserRole | string | null;
  title: string;
  description?: string | null;
  progress?: number;
  status?: OkrStatus;
  weight?: number;
};

export type OkrKeyResultRequest = {
  title: string;
  target_value: number;
  current_value: number;
  unit?: string | null;
  progress?: number;
  status?: OkrStatus;
  linked_entity_type?: string | null;
  linked_entity_id?: string | null;
};

export type OkrListResponse<T> = {
  data: T[];
};

export function listOkrCycles(status?: string, signal?: AbortSignal) {
  return apiRequest<OkrListResponse<OkrCycle>>("/api/v1/okr/cycles", {
    query: { status },
    signal,
  });
}

export function createOkrCycle(payload: OkrCycleRequest) {
  return apiRequest<OkrCycle, OkrCycleRequest>("/api/v1/okr/cycles", {
    method: "POST",
    body: payload,
  });
}

export function listOkrObjectives(cycleId?: string, signal?: AbortSignal) {
  return apiRequest<OkrListResponse<OkrObjective>>("/api/v1/okr/objectives", {
    query: { cycle_id: cycleId },
    signal,
  });
}

export function createOkrObjective(payload: OkrObjectiveRequest) {
  return apiRequest<OkrObjective, OkrObjectiveRequest>("/api/v1/okr/objectives", {
    method: "POST",
    body: payload,
  });
}

export function updateOkrObjective(id: string, payload: OkrObjectiveRequest) {
  return apiRequest<OkrObjective, OkrObjectiveRequest>(`/api/v1/okr/objectives/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteOkrObjective(id: string) {
  return apiRequest<MessageResponse>(`/api/v1/okr/objectives/${id}`, {
    method: "DELETE",
  });
}

export function createOkrKeyResult(objectiveId: string, payload: OkrKeyResultRequest) {
  return apiRequest<OkrKeyResult, OkrKeyResultRequest>(
    `/api/v1/okr/objectives/${objectiveId}/key-results`,
    {
      method: "POST",
      body: payload,
    },
  );
}

export function updateOkrKeyResult(id: string, payload: OkrKeyResultRequest) {
  return apiRequest<OkrKeyResult, OkrKeyResultRequest>(`/api/v1/okr/key-results/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function getOkrSummaryReport(signal?: AbortSignal) {
  return apiRequest<unknown>("/api/v1/reports/okr/summary", { signal });
}
