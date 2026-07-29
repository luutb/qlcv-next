import { apiRequest, downloadRequest } from "./client";
import type { MessageResponse } from "./types";
import type { DocumentRecord, DownloadResponse } from "./documents.api";

export type ProfileDocumentEntityType = "user" | "customer";

export type ProfileDocumentListQuery = {
  entity_type: ProfileDocumentEntityType;
  entity_id: string;
};

export type ProfileDocumentListResponse = {
  data: DocumentRecord[];
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

  if (payload.title) {
    formData.set("title", payload.title);
  }

  return apiRequest<DocumentRecord, FormData>("/api/v1/profile-documents", {
    method: "POST",
    body: formData,
  });
}

export function downloadProfileDocument(
  id: string,
  signal?: AbortSignal,
): Promise<DownloadResponse> {
  return downloadRequest(`/api/v1/profile-documents/${id}/download`, { signal });
}

export function deleteProfileDocument(id: string) {
  return apiRequest<MessageResponse>(`/api/v1/profile-documents/${id}`, {
    method: "DELETE",
  });
}
