import { apiRequest } from "./client";
import type { Actions, ListQuery, MessageResponse, PaginatedResponse } from "./types";

export type TimeEntry = {
  id: string;
  organization_id: string;
  project_id: string;
  user_id: string;
  duration_minutes: number;
  minutes?: number;
  description: string;
  note?: string;
  billable: boolean;
  invoice_id?: string | null;
  created_at: string;
  client_created_at?: string | null;
  actions?: Actions;
};

export type TimeEntryListQuery = ListQuery & {
  project_id?: string;
  user_id?: string;
  billable?: boolean;
};

export type TimeEntryListResponse = PaginatedResponse<TimeEntry>;

export type CreateTimeEntryRequest = {
  project_id: string;
  duration_minutes: number;
  description: string;
  billable: boolean;
  client_created_at?: string;
};

export type UpdateTimeEntryRequest = {
  project_id: string;
  duration_minutes: number;
  description: string;
  billable: boolean;
};

export function listTimeEntries(query: TimeEntryListQuery = {}, signal?: AbortSignal) {
  return apiRequest<TimeEntryListResponse>("/api/v1/time-entries", { query, signal });
}

export function getTimeEntry(id: string, signal?: AbortSignal) {
  return apiRequest<TimeEntry>(`/api/v1/time-entries/${id}`, { signal });
}

export function createTimeEntry(payload: CreateTimeEntryRequest) {
  return apiRequest<TimeEntry, CreateTimeEntryRequest>("/api/v1/time-entries", {
    method: "POST",
    body: {
      ...payload,
      client_created_at: payload.client_created_at ?? new Date().toISOString(),
    },
  });
}

export function updateTimeEntry(id: string, payload: UpdateTimeEntryRequest) {
  return apiRequest<TimeEntry, UpdateTimeEntryRequest>(`/api/v1/time-entries/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteTimeEntry(id: string) {
  return apiRequest<MessageResponse>(`/api/v1/time-entries/${id}`, {
    method: "DELETE",
  });
}
