import { apiRequest, downloadRequest, type DownloadResult } from "./client";
import type { MessageResponse } from "./types";

export type ProfileDocumentEntityType = "user" | "customer";

export type ProfileDocumentRowActions = {
  download?: boolean;
  delete?: boolean;
};

export type ProfileDocumentListActions = {
  upload?: boolean;
};

/**
 * Profile-document DTOs intentionally remain separate from project documents.
 * Their authorization actions and entity ownership have a different contract.
 */
export type ProfileDocument = {
  id: string;
  organization_id: string;
  entity_type: ProfileDocumentEntityType;
  entity_id: string;
  title: string;
  file_name: string;
  file_size: number;
  uploaded_by?: string | null;
  created_at: string;
  actions?: ProfileDocumentRowActions;
};

export type ProfileDocumentListQuery = {
  entity_type: ProfileDocumentEntityType;
  entity_id: string;
};

export type ProfileDocumentListResponse = {
  data: ProfileDocument[];
  actions?: ProfileDocumentListActions;
};

export type CreateProfileDocumentRequest = ProfileDocumentListQuery & {
  file: File | Blob;
  title?: string;
};

export function listProfileDocuments(query: ProfileDocumentListQuery, signal?: AbortSignal) {
  return apiRequest<ProfileDocumentListResponse>("/api/v1/profile-documents", {
    query,
    signal,
  });
}

export function createProfileDocument(payload: CreateProfileDocumentRequest) {
  const formData = new FormData();
  formData.set("entity_type", payload.entity_type);
  formData.set("entity_id", payload.entity_id);
  formData.set("file", payload.file);

  const title = payload.title?.trim();
  if (title) {
    formData.set("title", title);
  }

  return apiRequest<ProfileDocument, FormData>("/api/v1/profile-documents", {
    method: "POST",
    body: formData,
  });
}

export function downloadProfileDocument(
  id: string,
  signal?: AbortSignal,
): Promise<DownloadResult> {
  return downloadRequest(`/api/v1/profile-documents/${id}/download`, { signal });
}

export function deleteProfileDocument(id: string) {
  return apiRequest<MessageResponse>(`/api/v1/profile-documents/${id}`, {
    method: "DELETE",
  });
}
