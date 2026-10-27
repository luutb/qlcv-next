export type PlatformCapability = "platform.tenants.read" | "platform.tenants.manage" | "platform.plans.read" | "platform.plans.manage" | "platform.access" | "platform.overview.read" | "platform.organizations.read" | "platform.admins.read" | "platform.admins.manage" | "platform.audit.read";
export type PlatformSummary = { organization_count: number; admin_count: number; super_admin_count: number; active_admin_count: number; audit_event_count: number };
export type PlatformOrganization = { id: "legacy"; name: string; email: string; phone: string; address: string; version: number; updated_at: string; tenancy_mode: "schema_isolated" };
export type PlatformAccountRole = "ADMIN" | "SUPER_ADMIN";
export type PlatformAccount = { id: string; username: string; display_name: string; email: string | null; role: PlatformAccountRole; is_active: boolean; is_locked: boolean; version: string; created_at: string; updated_at: string; last_login_at: string | null };
export type PlatformAuditEvent = { id: string; actor_id: string; actor_name: string; action: string; route: string; entity_id: string; created_at: string };
export type PlatformPage<T> = { items: T[]; pagination: { page: number; limit: number; total: number } };
export type AccountFilters = { page: number; limit: number; q: string; role: "" | PlatformAccountRole; is_active: "" | "true" | "false" };
export type AuditFilters = { page: number; limit: number; q: string; action: string };
export type CreatePlatformAccount = { username: string; display_name: string; email: string | null; password: string; role: PlatformAccountRole };
export type UpdatePlatformAccount = { version: string; display_name?: string; email?: string | null; role?: PlatformAccountRole; is_active?: boolean };

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Phản hồi quản trị hệ thống không đúng định dạng.");
  return value as Record<string, unknown>;
}
function text(value: unknown): string {
  if (typeof value !== "string") throw new Error("Dữ liệu quản trị thiếu trường văn bản hợp lệ.");
  return value;
}
function nullableText(value: unknown) { return value === null ? null : text(value); }
function count(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw new Error("Số liệu quản trị hệ thống không hợp lệ.");
  return value;
}
function flag(value: unknown): boolean {
  if (typeof value !== "boolean") throw new Error("Trạng thái tài khoản không hợp lệ.");
  return value;
}
function date(value: unknown): string {
  const result = text(value);
  if (!Number.isFinite(Date.parse(result))) throw new Error("Thời gian cập nhật không hợp lệ.");
  return result;
}
export function readPlatformSummary(value: unknown): PlatformSummary {
  const row = record(value);
  return { organization_count: count(row.organization_count), admin_count: count(row.admin_count), super_admin_count: count(row.super_admin_count), active_admin_count: count(row.active_admin_count), audit_event_count: count(row.audit_event_count) };
}
export function readPlatformOrganization(value: unknown): PlatformOrganization {
  const row = record(value);
  if (row.id !== "legacy" || row.tenancy_mode !== "schema_isolated") throw new Error("Chế độ tổ chức chưa được hỗ trợ bởi phiên bản giao diện này.");
  return { id: "legacy", tenancy_mode: "schema_isolated", name: text(row.name), email: text(row.email), phone: text(row.phone), address: text(row.address), version: count(row.version), updated_at: date(row.updated_at) };
}
export function readPlatformAccount(value: unknown): PlatformAccount {
  const row = record(value);
  if (row.role !== "ADMIN" && row.role !== "SUPER_ADMIN") throw new Error("Vai trò quản trị không hợp lệ.");
  const version = text(row.version);
  if (!/^\d+$/.test(version)) throw new Error("Phiên bản tài khoản không hợp lệ.");
  return { id: text(row.id), username: text(row.username), display_name: text(row.display_name), email: nullableText(row.email), role: row.role, is_active: flag(row.is_active), is_locked: flag(row.is_locked), version, created_at: date(row.created_at), updated_at: date(row.updated_at), last_login_at: row.last_login_at === null ? null : date(row.last_login_at) };
}
export function readPlatformAudit(value: unknown): PlatformAuditEvent {
  const row = record(value);
  return { id: text(row.id), actor_id: text(row.actor_id), actor_name: text(row.actor_name), action: text(row.action), route: text(row.route), entity_id: text(row.entity_id), created_at: date(row.created_at) };
}
export function readPlatformPage<T>(value: unknown, readItem: (value: unknown) => T): PlatformPage<T> {
  const data = record(value);
  const pagination = record(data.pagination);
  if (!Array.isArray(data.items)) throw new Error("Danh sách quản trị không đúng định dạng.");
  const page = count(pagination.page), limit = count(pagination.limit), total = count(pagination.total);
  if (page < 1 || limit < 1 || limit > 100 || data.items.length > limit) throw new Error("Thông tin phân trang không hợp lệ.");
  return { items: data.items.map(readItem), pagination: { page, limit, total } };
}
export function platformAccountValidation(input: { username: string; display_name: string; email: string; password: string }, creating: boolean): Record<string, string> {
  const errors: Record<string, string> = {};
  if (creating && !/^[a-zA-Z0-9_.-]{3,100}$/.test(input.username.trim())) errors.username = "Dùng 3–100 chữ cái, chữ số hoặc dấu . _ -";
  if (!input.display_name.trim() || input.display_name.trim().length > 200) errors.display_name = "Nhập tên hiển thị từ 1 đến 200 ký tự.";
  if (input.email.trim() && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) || input.email.trim().length > 254)) errors.email = "Nhập địa chỉ email hợp lệ.";
  if (creating && ([...input.password].length < 12 || new TextEncoder().encode(input.password).length > 72)) errors.password = "Mật khẩu cần ít nhất 12 ký tự và không vượt 72 byte.";
  return errors;
}
