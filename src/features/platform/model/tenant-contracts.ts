import { readPlanFeatures, type PlanFeature } from "./plan-features";
import type { PlatformPage } from "./platform-contracts";

export type PlanLimits = { members: number | null; projects: number | null; storage_bytes: number | null };
export type PlatformPlan = { features: PlanFeature[]; features_configured: boolean; id: string; code: string; name: string; description: string; is_active: boolean; price_amount: string | null; currency: string | null; billing_interval: "MONTHLY" | "YEARLY" | null; limits: PlanLimits; version: string; created_at: string; updated_at: string };
export type PlanInput = Omit<PlatformPlan, "id" | "version" | "created_at" | "updated_at" | "features_configured">;
export const subscriptionStatuses = ["TRIALING", "ACTIVE", "PAUSED", "CANCELLED", "EXPIRED"] as const;
export type SubscriptionStatus = typeof subscriptionStatuses[number];
export type TenantSubscription = { id: string; tenant_id: string; plan: PlatformPlan; status: SubscriptionStatus; configured_status: SubscriptionStatus; starts_at: string | null; ends_at: string | null; version: string; created_at: string; updated_at: string };
export type SubscriptionInput = { version: string; plan_version?: string; plan_id: string; status: SubscriptionStatus; starts_at: string | null; ends_at: string | null };
export type PlatformTenant = { id: string; name: string; slug: string; status: "ACTIVE"; data_scope: "LEGACY_SINGLE_ORGANIZATION" | "SCHEMA_ISOLATED"; version: string; created_at: string; updated_at: string; admin_count: number; member_count: number; subscription: TenantSubscription | null };
export type TenantMember = { id: string; username: string; display_name: string; email: string | null; role: "ADMIN" | "PARTNER" | "LAWYER" | "ACCOUNTANT"; is_active: boolean; is_locked: boolean; created_at: string; last_login_at: string | null };
export type TenantUsage = { tenant_id: string; measured_at: string; members_total: number | null; members_active: number | null; admins_total: number | null; projects_total: number | null; projects_active: number | null; tasks_total: number | null; customers_total: number | null; teams_total: number | null; documents_total: number | null; unavailable_resources: string[]; storage: { recorded_bytes: number | null; object_count: number | null; measurement: "DATABASE_REFERENCED_OBJECTS"; key_size_conflicts: number; unknown_size_objects: number; is_complete: boolean; unavailable_sources: string[] }; quota_enforcement: "ENFORCED" };
export type TenantDetail = PlatformTenant & { contact: { email: string; phone: string; address: string }; admins: TenantMember[]; usage: TenantUsage };
export type TenantFilters = { page: number; limit: number; q: string };
export type PlanFilters = TenantFilters & { is_active: "" | "true" | "false" };
export type MemberFilters = TenantFilters & { role: "" | TenantMember["role"]; is_active: "" | "true" | "false" };

function row(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Dữ liệu tenant/gói cước không đúng định dạng.");
  return value as Record<string, unknown>;
}
function text(value: unknown): string { if (typeof value !== "string") throw new Error("Thiếu thông tin tenant/gói cước."); return value; }
function integer(value: unknown): number { if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw new Error("Số liệu tài nguyên không hợp lệ."); return value; }
function nullableCount(value: unknown) { return value === null ? null : integer(value); }
function flag(value: unknown): boolean { if (typeof value !== "boolean") throw new Error("Trạng thái gói cước không hợp lệ."); return value; }
function timestamp(value: unknown): string { const result = text(value); if (!Number.isFinite(Date.parse(result))) throw new Error("Thời gian không hợp lệ."); return result; }
function nullableDate(value: unknown) { return value === null ? null : timestamp(value); }
function version(value: unknown): string { const result = text(value); if (!/^\d+$/.test(result)) throw new Error("Phiên bản dữ liệu không hợp lệ."); return result; }
function texts(value: unknown): string[] { if (!Array.isArray(value)) throw new Error("Danh sách nguồn tài nguyên không hợp lệ."); return value.map(text); }
export function readPlatformPlan(value: unknown): PlatformPlan {
  const data = row(value), limits = row(data.limits);
  const price = data.price_amount === null ? null : text(data.price_amount);
  if (price !== null && !/^\d{1,16}(\.\d{1,2})?$/.test(price)) throw new Error("Mức phí không hợp lệ.");
  if (data.currency !== null && (typeof data.currency !== "string" || !/^[A-Z]{3}$/.test(data.currency))) throw new Error("Đơn vị tiền tệ không hợp lệ.");
  if (data.billing_interval !== null && data.billing_interval !== "MONTHLY" && data.billing_interval !== "YEARLY") throw new Error("Chu kỳ gói cước không hợp lệ.");
  if (price === null ? data.currency !== null || data.billing_interval !== null : data.currency === null || data.billing_interval === null) throw new Error("Cấu hình phí và chu kỳ không nhất quán.");
  return { features: readPlanFeatures(data.features), features_configured: flag(data.features_configured), id: text(data.id), code: text(data.code), name: text(data.name), description: text(data.description), is_active: flag(data.is_active), price_amount: price, currency: data.currency, billing_interval: data.billing_interval, limits: { members: nullableCount(limits.members), projects: nullableCount(limits.projects), storage_bytes: nullableCount(limits.storage_bytes) }, version: version(data.version), created_at: timestamp(data.created_at), updated_at: timestamp(data.updated_at) };
}
export function readSubscription(value: unknown): TenantSubscription {
  const data = row(value);
  if (!subscriptionStatuses.some((status) => status === data.status)) throw new Error("Trạng thái đăng ký gói cước không hợp lệ.");
  const status = subscriptionStatuses.find((value) => value === data.status);
  const configuredStatus = subscriptionStatuses.find((value) => value === data.configured_status);
  if (!status || !configuredStatus) throw new Error("Trạng thái đăng ký không hợp lệ.");
  return { id: text(data.id), tenant_id: text(data.tenant_id), plan: readPlatformPlan(data.plan), status, configured_status: configuredStatus, starts_at: nullableDate(data.starts_at), ends_at: nullableDate(data.ends_at), version: version(data.version), created_at: timestamp(data.created_at), updated_at: timestamp(data.updated_at) };
}
export function readTenant(value: unknown): PlatformTenant {
  const data = row(value);
  if (data.status !== "ACTIVE" || (data.data_scope !== "LEGACY_SINGLE_ORGANIZATION" && data.data_scope !== "SCHEMA_ISOLATED")) throw new Error("Phạm vi tenant chưa được phiên bản này hỗ trợ.");
  const tenant: PlatformTenant = { id: text(data.id), name: text(data.name), slug: text(data.slug), status: data.status, data_scope: data.data_scope, version: version(data.version), created_at: timestamp(data.created_at), updated_at: timestamp(data.updated_at), admin_count: integer(data.admin_count), member_count: integer(data.member_count), subscription: data.subscription === null ? null : readSubscription(data.subscription) };
  if (tenant.subscription && tenant.subscription.tenant_id !== tenant.id) throw new Error("Gói cước không thuộc tenant được yêu cầu.");
  return tenant;
}
export function readTenantMember(value: unknown): TenantMember {
  const data = row(value);
  if (data.role !== "ADMIN" && data.role !== "PARTNER" && data.role !== "LAWYER" && data.role !== "ACCOUNTANT") throw new Error("Vai trò thành viên tenant không hợp lệ.");
  return { id: text(data.id), username: text(data.username), display_name: text(data.display_name), email: data.email === null ? null : text(data.email), role: data.role, is_active: flag(data.is_active), is_locked: flag(data.is_locked), created_at: timestamp(data.created_at), last_login_at: nullableDate(data.last_login_at) };
}
export function readTenantUsage(value: unknown): TenantUsage {
  const data = row(value), storage = row(data.storage);
  if (data.quota_enforcement !== "ENFORCED" || storage.measurement !== "DATABASE_REFERENCED_OBJECTS") throw new Error("Phương pháp đo tài nguyên chưa được hỗ trợ.");
  return { tenant_id: text(data.tenant_id), measured_at: timestamp(data.measured_at), members_total: nullableCount(data.members_total), members_active: nullableCount(data.members_active), admins_total: nullableCount(data.admins_total), projects_total: nullableCount(data.projects_total), projects_active: nullableCount(data.projects_active), tasks_total: nullableCount(data.tasks_total), customers_total: nullableCount(data.customers_total), teams_total: nullableCount(data.teams_total), documents_total: nullableCount(data.documents_total), unavailable_resources: texts(data.unavailable_resources), storage: { recorded_bytes: nullableCount(storage.recorded_bytes), object_count: nullableCount(storage.object_count), measurement: storage.measurement, key_size_conflicts: integer(storage.key_size_conflicts), unknown_size_objects: integer(storage.unknown_size_objects), is_complete: flag(storage.is_complete), unavailable_sources: texts(storage.unavailable_sources) }, quota_enforcement: data.quota_enforcement };
}
export function readTenantDetail(value: unknown): TenantDetail {
  const data = row(value), contact = row(data.contact);
  if (!Array.isArray(data.admins)) throw new Error("Danh sách Admin không hợp lệ.");
  const tenant = readTenant(data), usage = readTenantUsage(data.usage);
  if (usage.tenant_id !== tenant.id) throw new Error("Tài nguyên không thuộc tenant được yêu cầu.");
  return { ...tenant, contact: { email: text(contact.email), phone: text(contact.phone), address: text(contact.address) }, admins: data.admins.map(readTenantMember), usage };
}
export function readTenantPage<T>(value: unknown, read: (value: unknown) => T): PlatformPage<T> {
  const data = row(value), page = row(data.pagination);
  if (!Array.isArray(data.items)) throw new Error("Danh sách tenant/gói cước không hợp lệ.");
  const pagination = { page: integer(page.page), limit: integer(page.limit), total: integer(page.total) };
  if (!pagination.page || !pagination.limit || pagination.limit > 100 || data.items.length > pagination.limit) throw new Error("Phân trang không hợp lệ.");
  return { items: data.items.map(read), pagination };
}

export type CreateTenantInput = { name: string; slug: string; email: string; phone: string; address: string; admin: { username: string; display_name: string; email: string | null; password: string }; plan_id: string | null; plan_version?: string };
