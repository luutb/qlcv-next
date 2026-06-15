import { ApiError, apiRequest, getAccessToken } from "./client";
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

export type DownloadResponse = {
  blob: Blob;
  filename?: string;
};

export function listDocuments(query: DocumentListQuery = {}, signal?: AbortSignal) {
  return apiRequest<DocumentListResponse>("/api/v1/documents", { query, signal });
}

export function getDocument(id: string, signal?: AbortSignal) {
  return apiRequest<DocumentRecord>(`/api/v1/documents/${id}`, { signal });
}

export async function downloadDocument(id: string, signal?: AbortSignal): Promise<DownloadResponse> {
  const response = await fetchDocumentDownload(`/api/v1/documents/${id}/download`, signal);
  return response;
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

export async function fetchDocumentDownload(
  path: string,
  signal?: AbortSignal,
): Promise<DownloadResponse> {
  const response = await fetch(buildDownloadUrl(path), {
    headers: buildDownloadHeaders(),
    signal,
  });

  if (!response.ok) {
    const payload = await parseDownloadError(response);
    throw new ApiError(getDownloadErrorMessage(payload, response.status), response.status, payload);
  }

  return {
    blob: await response.blob(),
    filename: parseContentDispositionFilename(response.headers.get("content-disposition")),
  };
}

function buildDownloadUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost";
  return new URL(`${baseUrl}${normalizedPath}`, origin).toString();
}

function buildDownloadHeaders(): Headers {
  const headers = new Headers();
  headers.set("Accept", "application/octet-stream");

  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function parseDownloadError(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function getDownloadErrorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === "object" && "detail" in payload) {
    return String((payload as { detail: unknown }).detail);
  }

  return `Download failed with status ${status}`;
}

function parseContentDispositionFilename(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }

  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const asciiMatch = value.match(/filename="?([^";]+)"?/i);
  return asciiMatch?.[1];
}
