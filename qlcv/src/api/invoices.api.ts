import { apiRequest } from "./client";
import type { Actions, ListQuery, PaginatedResponse } from "./types";
import type { TimeEntry } from "./time-entries.api";

export const INVOICE_STATUSES = ["DRAFT", "UNPAID", "PAID", "VOID"] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export type Invoice = {
  id: string;
  organization_id: string;
  customer_id: string;
  total_amount: number;
  status: InvoiceStatus;
  issued_at: string;
  created_at: string;
  actions?: Actions;
};

export type InvoiceListQuery = ListQuery & {
  customer_id?: string;
  status?: InvoiceStatus;
};

export type InvoiceListResponse = PaginatedResponse<Invoice>;

export type InvoiceTimeEntriesResponse = {
  data: TimeEntry[];
};

export type GenerateInvoiceRequest = {
  project_id: string;
  customer_id: string;
  status?: InvoiceStatus;
};

export type UpdateInvoiceStatusRequest = {
  status: InvoiceStatus;
};

export function listInvoices(query: InvoiceListQuery = {}, signal?: AbortSignal) {
  return apiRequest<InvoiceListResponse>("/api/v1/invoices", { query, signal });
}

export function getInvoice(id: string, signal?: AbortSignal) {
  return apiRequest<Invoice>(`/api/v1/invoices/${id}`, { signal });
}

export function listInvoiceTimeEntries(id: string, signal?: AbortSignal) {
  return apiRequest<InvoiceTimeEntriesResponse>(`/api/v1/invoices/${id}/time-entries`, {
    signal,
  });
}

export function generateInvoice(payload: GenerateInvoiceRequest) {
  return apiRequest<Invoice, GenerateInvoiceRequest>("/api/v1/invoices/generate", {
    method: "POST",
    body: payload,
  });
}

export function updateInvoiceStatus(id: string, payload: UpdateInvoiceStatusRequest) {
  return apiRequest<Invoice | { message: string }, UpdateInvoiceStatusRequest>(
    `/api/v1/invoices/${id}/status`,
    {
      method: "PUT",
      body: payload,
    },
  );
}
