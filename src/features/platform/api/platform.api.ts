import { authorizedRequest } from "@/features/auth/api/authorized-request";
import { readTenantViewData, readTenantViewSession, type TenantViewResource } from "../model/tenant-view";
import { createIdempotencyKey, parseApiResponse } from "@/services/http";
import { readPlatformAccount, readPlatformAudit, readPlatformOrganization, readPlatformPage, readPlatformSummary, type AccountFilters, type AuditFilters, type CreatePlatformAccount, type UpdatePlatformAccount } from "../model/platform-contracts";

import { readTenant, readTenantDetail, readTenantMember, readTenantUsage, readTenantPage, readPlatformPlan, readSubscription, type TenantFilters, type PlanFilters, type MemberFilters, type PlanInput, type SubscriptionInput, type CreateTenantInput } from "../model/tenant-contracts";

async function request(path: `/${string}`, signal?: AbortSignal, method = "GET", input?: unknown, idempotencyKey?: string): Promise<unknown> {
  const response = await authorizedRequest({ path, signal, method, headers: { Accept: "application/json", ...(input === undefined ? {} : { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey ?? createIdempotencyKey() }) }, ...(input === undefined ? {} : { body: JSON.stringify(input) }) });
  const payload = await parseApiResponse<unknown>(response);
  if (!payload || typeof payload !== "object" || !("data" in payload)) throw new Error("Phản hồi quản trị hệ thống thiếu dữ liệu.");
  return payload.data;
}
function query(filters: AccountFilters | AuditFilters | TenantFilters | PlanFilters | MemberFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value !== "") params.set(key, String(value));
  return params.toString();
}
export const platformApi = {
  startTenantView: (id: string) => request(`/platform/tenants/${encodeURIComponent(id)}/view-sessions`, undefined, "POST", {}).then((value) => readTenantViewSession(value, id)),
  closeTenantView: (id: string, session: string) => request(`/platform/tenants/${encodeURIComponent(id)}/view-sessions/${encodeURIComponent(session)}`, undefined, "DELETE"),
  tenantViewData: (id: string, session: string, resource: TenantViewResource, filters: TenantFilters, signal?: AbortSignal) => request(`/platform/tenants/${encodeURIComponent(id)}/view-sessions/${encodeURIComponent(session)}/${resource}?${query(filters)}`, signal).then((value) => readTenantViewData(value, id, session, resource)),
  createTenant: (input: CreateTenantInput, key: string) => request("/platform/tenants", undefined, "POST", input, key).then(readTenantDetail),
  tenants: (filters: TenantFilters, signal?: AbortSignal) => request(`/platform/tenants?${query(filters)}`, signal).then((value) => readTenantPage(value, readTenant)),
  tenant: (id: string, signal?: AbortSignal) => request(`/platform/tenants/${encodeURIComponent(id)}`, signal).then(readTenantDetail),
  tenantUsage: (id: string, signal?: AbortSignal) => request(`/platform/tenants/${encodeURIComponent(id)}/usage`, signal).then(readTenantUsage),
  tenantMembers: (id: string, filters: MemberFilters, signal?: AbortSignal) => request(`/platform/tenants/${encodeURIComponent(id)}/members?${query(filters)}`, signal).then((value) => readTenantPage(value, readTenantMember)),
  tenantActivity: (id: string, filters: TenantFilters, signal?: AbortSignal) => request(`/platform/tenants/${encodeURIComponent(id)}/activity?${query(filters)}`, signal).then((value) => readTenantPage(value, readPlatformAudit)),
  plans: (filters: PlanFilters, signal?: AbortSignal) => request(`/platform/plans?${query(filters)}`, signal).then((value) => readTenantPage(value, readPlatformPlan)),
  createPlan: (input: PlanInput, key: string) => request("/platform/plans", undefined, "POST", input, key).then(readPlatformPlan),
  updatePlan: (id: string, input: PlanInput & { version: string }) => request(`/platform/plans/${encodeURIComponent(id)}`, undefined, "PATCH", input).then(readPlatformPlan),
  assignSubscription: (id: string, input: SubscriptionInput) => request(`/platform/tenants/${encodeURIComponent(id)}/subscription`, undefined, "PUT", input).then(readSubscription),
  summary: (signal?: AbortSignal) => request("/platform/summary", signal).then(readPlatformSummary),
  organization: (signal?: AbortSignal) => request("/platform/organization", signal).then(readPlatformOrganization),
  accounts: (filters: AccountFilters, signal?: AbortSignal) => request(`/platform/admin-accounts?${query(filters)}`, signal).then((value) => readPlatformPage(value, readPlatformAccount)),
  createAccount: (input: CreatePlatformAccount, key: string) => request("/platform/admin-accounts", undefined, "POST", input, key).then(readPlatformAccount),
  updateAccount: (id: string, input: UpdatePlatformAccount) => request(`/platform/admin-accounts/${encodeURIComponent(id)}`, undefined, "PATCH", input).then(readPlatformAccount),
  audit: (filters: AuditFilters, signal?: AbortSignal) => request(`/platform/audit-logs?${query(filters)}`, signal).then((value) => readPlatformPage(value, readPlatformAudit)),
};
