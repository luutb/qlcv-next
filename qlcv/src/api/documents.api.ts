import { apiRequest, downloadRequest, type DownloadResult } from "./client";
import type { Actions, ListQuery, MessageResponse, PaginatedResponse } from "./types";

export type RecordActions = Actions;

export type DocumentRecord = {
  id: string;
  organization_id?: string;
  project_id: string;
  title: string;
  file_name?: string;
  file_size: number;
  is_locked_worm: boolean;
  uploaded_by?: string | null;
  deleted_at?: string | null;
  created_at: string;
  client_created_at?: string | null;
  actions?: RecordActions;
};

export type DocumentListQuery = ListQuery & {
  project_id?: string;
};

export type DocumentListResponse = PaginatedResponse<DocumentRecord>;

export type CreateDocumentRequest = {
  project_id: string;
  title?: string;
  file: File | Blob;
  client_created_at?: string;
};

export type DownloadResponse = DownloadResult;

export function listDocuments(query: DocumentListQuery = {}, signal?: AbortSignal) {
  return apiRequest<DocumentListResponse>("/api/v1/documents", { query, signal });
}

export function getDocument(id: string, signal?: AbortSignal) {
  return apiRequest<DocumentRecord>(`/api/v1/documents/${id}`, { signal });
}

export async function downloadDocument(id: string, signal?: AbortSignal): Promise<DownloadResponse> {
  return downloadRequest(`/api/v1/documents/${id}/download`, { signal });
}

export function createDocumentRecord(payload: CreateDocumentRequest) {
  const formData = new FormData();
  formData.set("project_id", payload.project_id);
  formData.set("file", payload.file);

  if (payload.title) {
    formData.set("title", payload.title);
  }

  if (payload.client_created_at) {
    formData.set("client_created_at", payload.client_created_at);
  }

  return apiRequest<DocumentRecord, FormData>("/api/v1/documents", {
    method: "POST",
    body: formData,
  });
}

export function deleteDocument(id: string) {
  return apiRequest<MessageResponse>(`/api/v1/documents/${id}`, {
    method: "DELETE",
  });
}

export function lockDocument(id: string) {
  return apiRequest<MessageResponse>(`/api/v1/documents/${id}/lock`, {
    method: "POST",
  });
}
