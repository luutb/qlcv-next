import { apiRequest } from "./client";
import type { MessageResponse } from "./types";

export type PurgeResponse = {
  customers_deleted: number;
  documents_deleted: number;
  files_deleted: number;
  retention_days: number;
  errors: string[];
};

export type TenantSettings = {
  tier_plan: string;
  feature_flags: string[];
};

export function purgeAdminData() {
  return apiRequest<PurgeResponse>("/api/v1/admin/purge", {
    method: "POST",
  });
}

export function getTenantSettings(signal?: AbortSignal) {
  return apiRequest<TenantSettings>("/api/v1/admin/tenant-settings", { signal });
}

export function updateTenantSettings(payload: TenantSettings) {
  return apiRequest<MessageResponse, TenantSettings>("/api/v1/admin/tenant-settings", {
    method: "PUT",
    body: payload,
  });
}
