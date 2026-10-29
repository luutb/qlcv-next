import { createIdempotencyKey, parseApiResponse } from "@/services/http";
import { authorizedRequest } from "@/features/auth/api/authorized-request";
import { AUTHORIZATION_ACTIONS, type AuthorizationAction } from "@/features/auth/model/current-user";

export type CanonicalRole = "ADMIN" | "SUPER_ADMIN" | "PARTNER" | "LAWYER" | "ACCOUNTANT";
export type RolePermission = {
  id: number;
  role: string;
  resource: string;
  actions: Record<string, boolean>;
  field_level: boolean;
  conditions: Record<string, unknown>;
};

export class RolePermissionFormatError extends Error {}

function isRolePermission(value: unknown): value is RolePermission {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "number"
    && typeof record.role === "string"
    && typeof record.resource === "string"
    && record.actions !== null
    && typeof record.actions === "object"
    && !Array.isArray(record.actions)
    && Object.values(record.actions).every((flag) => typeof flag === "boolean")
    && typeof record.field_level === "boolean"
    && record.conditions !== null
    && typeof record.conditions === "object"
    && !Array.isArray(record.conditions);
}

export async function getRolePermissions(role: CanonicalRole, signal?: AbortSignal): Promise<RolePermission[]> {
  const response = await authorizedRequest({ path: `/roles/${role}/permissions`, method: "GET", signal });
  const payload = await parseApiResponse<{ data: unknown }>(response);
  if (payload.data === null) return [];
  if (!Array.isArray(payload.data) || !payload.data.every(isRolePermission)) {
    throw new RolePermissionFormatError("Phản hồi cấu hình quyền không đúng định dạng.");
  }
  return payload.data;
}

export async function updateRolePermissions(role: CanonicalRole, actions: Partial<Record<AuthorizationAction, boolean>>) {
  const response = await authorizedRequest({
    path: `/roles/${role}/permissions`,
    method: "PUT",
    headers: { "Content-Type": "application/json", "Idempotency-Key": createIdempotencyKey() },
    body: JSON.stringify({ actions, field_level: false, conditions: {} }),
  });
  const payload = await parseApiResponse<{ data: unknown }>(response);
  if (!isRolePermission(payload.data)) throw new Error("Phản hồi lưu quyền không đúng định dạng.");
  return payload.data;
}

export const rolePermissionKeys = {
  all: ["role-permissions"] as const,
  byRole: (role: CanonicalRole, token: string | null) => ["role-permissions", role, token] as const,
};

export const permissionActions = AUTHORIZATION_ACTIONS;
