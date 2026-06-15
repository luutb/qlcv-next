import { apiRequest } from "./client";
import type { Actions, ListQuery, MessageResponse, PaginatedResponse } from "./types";

export const USER_ROLES = ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export type ManagedUser = {
  id: string;
  organization_id: string;
  username: string;
  email: string;
  role: UserRole | string;
  is_active: boolean;
  mfa_enabled: boolean;
  version: number;
  tenant_plan?: string;
  enabled_feature_flags?: string[];
  created_at?: string;
  actions?: Actions;
};

export type UserSummary = ManagedUser;

export type UserListQuery = ListQuery & {
  role?: UserRole;
  is_active?: boolean;
  q?: string;
};

export type UserListResponse = PaginatedResponse<ManagedUser>;

export type UpdateCurrentUserRequest = {
  username?: string;
  email?: string;
  version: number;
};

export type CreateUserRequest = {
  username: string;
  email: string;
  role: UserRole;
  password: string;
  send_invite?: boolean;
};

export type UpdateUserRequest = {
  username?: string;
  email?: string;
  role?: UserRole;
  is_active?: boolean;
  version: number;
};

export type VersionedRequest = {
  version: number;
};

export type ResetPasswordRequest = {
  temporary_password: string;
};

export function listUsers(query: UserListQuery = {}, signal?: AbortSignal) {
  return apiRequest<UserListResponse>("/api/v1/users", { query, signal });
}

export function getCurrentUser(signal?: AbortSignal) {
  return apiRequest<ManagedUser>("/api/v1/users/me", { signal });
}

export function updateCurrentUser(payload: UpdateCurrentUserRequest) {
  return apiRequest<ManagedUser, UpdateCurrentUserRequest>("/api/v1/users/me", {
    method: "PUT",
    body: payload,
  });
}

export function getUser(id: string, signal?: AbortSignal) {
  return apiRequest<ManagedUser>(`/api/v1/users/${id}`, { signal });
}

export function createUser(payload: CreateUserRequest) {
  return apiRequest<ManagedUser, CreateUserRequest>("/api/v1/users", {
    method: "POST",
    body: payload,
  });
}

export function updateUser(id: string, payload: UpdateUserRequest) {
  return apiRequest<ManagedUser, UpdateUserRequest>(`/api/v1/users/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function activateUser(id: string, payload: VersionedRequest) {
  return apiRequest<ManagedUser, VersionedRequest>(`/api/v1/users/${id}/activate`, {
    method: "POST",
    body: payload,
  });
}

export function deactivateUser(id: string, payload: VersionedRequest) {
  return apiRequest<ManagedUser, VersionedRequest>(`/api/v1/users/${id}/deactivate`, {
    method: "POST",
    body: payload,
  });
}

export function resetUserPassword(id: string, payload: ResetPasswordRequest) {
  return apiRequest<MessageResponse, ResetPasswordRequest>(`/api/v1/users/${id}/reset-password`, {
    method: "POST",
    body: payload,
  });
}

export function resetUserMfa(id: string) {
  return apiRequest<MessageResponse>(`/api/v1/users/${id}/mfa/reset`, {
    method: "POST",
  });
}
