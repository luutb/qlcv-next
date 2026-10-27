export const tenantViewResources = [
  { id: "projects", label: "Dự án" }, { id: "tasks", label: "Công việc" },
  { id: "customers", label: "Khách hàng" }, { id: "teams", label: "Đội nhóm" },
  { id: "members", label: "Thành viên" }, { id: "documents", label: "Tài liệu nghiệp vụ" },
  { id: "task-documents", label: "Tài liệu công việc" },
] as const;
export type TenantViewResource = typeof tenantViewResources[number]["id"];
export type TenantViewSession = { id: string; tenant_id: string; created_at: string; expires_at: string };
export type TenantViewData = { columns: { key: string; label: string }[]; items: Record<string, string | null>[]; pagination: { page: number; limit: number; total: number }; unavailable_fields: string[] };
function row(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Dữ liệu phiên xem không hợp lệ.");
  return value as Record<string, unknown>;
}
function text(value: unknown): string { if (typeof value !== "string") throw new Error("Thiếu dữ liệu phiên xem."); return value; }
function date(value: unknown): string { const result = text(value); if (!Number.isFinite(Date.parse(result))) throw new Error("Thời gian phiên xem không hợp lệ."); return result; }
export function readTenantViewSession(value: unknown, tenantId: string): TenantViewSession {
  const data = row(value);
  const result = { id: text(data.id), tenant_id: text(data.tenant_id), created_at: date(data.created_at), expires_at: date(data.expires_at) };
  if (!/^[0-9a-f-]{36}$/i.test(result.id) || result.tenant_id !== tenantId || Date.parse(result.expires_at) <= Date.parse(result.created_at)) throw new Error("Phiên xem không thuộc tenant hoặc không hợp lệ.");
  return result;
}
export function readTenantViewData(value: unknown, tenantId: string, sessionId: string, resource: TenantViewResource): TenantViewData {
  const data = row(value), pagination = row(data.pagination);
  if (data.tenant_id !== tenantId || data.session_id !== sessionId || data.resource !== resource) throw new Error("Dữ liệu không thuộc phạm vi phiên xem.");
  if (!Array.isArray(data.columns) || !data.columns.length || data.columns.length > 40 || !Array.isArray(data.items) || !Array.isArray(data.unavailable_fields)) throw new Error("Dữ liệu không gian tenant không hợp lệ.");
  const columns = data.columns.map((value) => { const column = row(value); const key = text(column.key); if (!/^[a-z][a-z0-9_]*$/.test(key)) throw new Error("Trường dữ liệu không hợp lệ."); return { key, label: text(column.label) }; });
  if (new Set(columns.map((column) => column.key)).size !== columns.length || !columns.some((column) => column.key === "id")) throw new Error("Danh sách trường dữ liệu không hợp lệ.");
  const page = pagination.page, limit = pagination.limit, total = pagination.total;
  if (typeof page !== "number" || !Number.isSafeInteger(page) || page < 1 || typeof limit !== "number" || !Number.isSafeInteger(limit) || limit < 1 || limit > 100 || typeof total !== "number" || !Number.isSafeInteger(total) || total < 0 || data.items.length > limit) throw new Error("Phân trang không hợp lệ.");
  const items = data.items.map((value) => { const item = row(value); const result: Record<string, string | null> = {}; for (const column of columns) result[column.key] = item[column.key] === null ? null : text(item[column.key]); if (!result.id) throw new Error("Thiếu ID dữ liệu."); return result; });
  return { columns, items, pagination: { page, limit, total }, unavailable_fields: data.unavailable_fields.map(text) };
}
