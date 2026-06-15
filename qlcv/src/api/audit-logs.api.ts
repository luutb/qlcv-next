import { apiRequest } from "./client";
import type { ListQuery, PaginatedResponse } from "./types";

export type AuditLog = {
  id: string;
  organization_id: string;
  user_id?: string | null;
  action: string;
  metadata?: Record<string, unknown>;
  previous_hash: string;
  current_hash: string;
  created_at: string;
};

export type AuditLogListQuery = ListQuery & {
  user_id?: string;
  action?: string;
};

export type AuditLogListResponse = PaginatedResponse<AuditLog>;

export type VerifyAuditChainResponse = {
  valid: boolean;
  broken_at: string | null;
  message: string;
};

export function listAuditLogs(query: AuditLogListQuery = {}, signal?: AbortSignal) {
  return apiRequest<AuditLogListResponse>("/api/v1/audit-logs", { query, signal });
}

export function getAuditLog(id: string, signal?: AbortSignal) {
  return apiRequest<AuditLog>(`/api/v1/audit-logs/${id}`, { signal });
}

export function verifyAuditChain() {
  return apiRequest<VerifyAuditChainResponse>("/api/v1/audit-logs/verify", {
    method: "POST",
  });
}
