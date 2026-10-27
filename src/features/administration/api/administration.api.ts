import { readSettings, readContractTypes, readOrganization, readPage, isJournalEvent, isBusinessDocument, isTimeEntry, isContractType } from "../model/contracts";
import { authorizedRequest } from "@/features/auth/api/authorized-request";
import { createIdempotencyKey, parseApiResponse } from "@/services/http";
import { normalizeDashboardSummary } from "@/features/dashboard/api/dashboard.api";
export type Settings = { name: string; email: string; phone: string; address: string; version: number; updated_at: string };
export type ContractType = { id: number; name: string; description?: string; is_active: boolean; version?: number };
export type JournalEvent = { id: string; actor_id: string; actor_name: string; action: string; route: string; entity_id: string; created_at: string };
export type BusinessDocument = { id: string; customer_id?: string; project_id?: string; task_id?: string; customer_name?: string; project_name?: string; task_title?: string; owner_id: string; name: string; mime_type: string; size: number; is_archived: boolean; created_at: string };
export type BusinessDocumentContext = { type: "customer" | "project" | "task"; id: string } | { type: "general" };
export type TimeEntry = { id: string; task_id: string; user_id: string; task_title: string; user_name: string; minutes: number; description: string; date: string };
export type Page<T> = { items: T[]; pagination: { total: number; page: number; limit: number } };
export async function administrationRequest<T>(path: `/${string}`, method = "GET", body?: unknown, signal?: AbortSignal): Promise<T> {
  const multipart = body instanceof FormData;
  const response = await authorizedRequest({ path, method, signal, headers: { Accept: "application/json", ...(method === "GET" ? {} : { "Idempotency-Key": createIdempotencyKey() }), ...(body === undefined || multipart ? {} : { "Content-Type": "application/json" }) }, ...(body === undefined ? {} : { body: multipart ? body : JSON.stringify(body) }) });
  return (await parseApiResponse<{ data: T }>(response)).data;
}
export const administrationApi = {
  settings: (signal?: AbortSignal) => administrationRequest<unknown>("/admin/tenant-settings", "GET", undefined, signal).then(readSettings),
  saveSettings: (input: Settings) => administrationRequest<unknown>("/admin/tenant-settings", "PUT", input).then(readSettings),
  organization: (signal?: AbortSignal) => administrationRequest<unknown>("/organization", "GET", undefined, signal).then(readOrganization),
  contractTypes: async (signal?: AbortSignal) => readContractTypes(await administrationRequest<unknown>("/admin/contract-types", "GET", undefined, signal)),
  saveContractType: (input: { name: string; description: string; is_active: boolean; version?: number }, id?: number) => administrationRequest<unknown>(id ? `/contract-types/${id}` : "/contract-types", id ? "PUT" : "POST", input).then((value) => { if (!isContractType(value)) throw Error("Invalid contract type response"); return value; }),
  events: (page: number, action: string, signal?: AbortSignal) => administrationRequest<unknown>(`/audit-logs?page=${page}&limit=25&action=${encodeURIComponent(action)}`, "GET", undefined, signal).then((value) => readPage(value, isJournalEvent)),
  documents: (page: number, q: string, archived: boolean, context?: BusinessDocumentContext, signal?: AbortSignal) => {
    const params = new URLSearchParams({ page: String(page), limit: "25", q, archived: String(archived) });
    if (context?.type === "general") params.set("context", "general");
    else if (context) params.set(`${context.type}_id`, context.id);
    return administrationRequest<unknown>(`/documents?${params}`, "GET", undefined, signal).then((value) => readPage(value, isBusinessDocument));
  },
  uploadDocument: (body: FormData) => administrationRequest<BusinessDocument>("/documents", "POST", body),
  documentStatus: (id: string, is_archived: boolean) => administrationRequest(`/documents/${encodeURIComponent(id)}/status`, "PATCH", { is_archived }),
  documentContext: (id: string, context: BusinessDocumentContext) => administrationRequest(`/documents/${encodeURIComponent(id)}/context`, "PATCH", context.type === "general" ? { context: "general" } : { [`${context.type}_id`]: context.id }),
  documentDownload: (id: string) => administrationRequest<{ url: string }>(`/documents/${encodeURIComponent(id)}/download`),
  timeEntries: (page: number, scope: string, signal?: AbortSignal) => administrationRequest<unknown>(`/time-entries?page=${page}&limit=25&scope=${scope}`, "GET", undefined, signal).then((value) => readPage(value, isTimeEntry)),
  saveTimeEntry: (input: { task_id: number; minutes: number; description: string; date: string }, id?: string) => administrationRequest(id ? `/time-entries/${encodeURIComponent(id)}` : "/time-entries", id ? "PUT" : "POST", input),
  deleteTimeEntry: (id: string) => administrationRequest(`/time-entries/${encodeURIComponent(id)}`, "DELETE"),
  reports: async (range: string, signal?: AbortSignal) => normalizeDashboardSummary(await administrationRequest<unknown>(`/reports/summary?range=${encodeURIComponent(range)}`, "GET", undefined, signal)),
};
