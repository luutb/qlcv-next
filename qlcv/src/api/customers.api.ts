import { apiRequest } from "./client";
import type { Actions, ListQuery, MessageResponse, PaginatedResponse } from "./types";

export type Customer = {
  id: string;
  organization_id: string;
  name: string;
  tax_code?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  representative_name?: string | null;
  notes?: string | null;
  deleted_at?: string | null;
  created_at: string;
  actions?: Actions;
};

export type CustomerListResponse = PaginatedResponse<Customer>;

export type CustomerRequest = {
  name: string;
  tax_code?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  representative_name?: string | null;
  notes?: string | null;
};

export type CustomerListQuery = ListQuery & {
  q?: string;
  include_deleted?: boolean;
};

export type CustomerConflict = {
  id: string;
  customer_id: string;
  conflict_name: string;
};

export type CustomerConflictListResponse = {
  data: CustomerConflict[];
};

export type CreateCustomerConflictRequest = {
  conflict_name: string;
};

export function listCustomers(query: CustomerListQuery = {}, signal?: AbortSignal) {
  return apiRequest<CustomerListResponse>("/api/v1/customers", { query, signal });
}

export function getCustomer(id: string, signal?: AbortSignal) {
  return apiRequest<Customer>(`/api/v1/customers/${id}`, { signal });
}

export function createCustomer(payload: CustomerRequest) {
  return apiRequest<Customer, CustomerRequest>("/api/v1/customers", {
    method: "POST",
    body: payload,
  });
}

export function updateCustomer(id: string, payload: CustomerRequest) {
  return apiRequest<Customer, CustomerRequest>(`/api/v1/customers/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export function deleteCustomer(id: string) {
  return apiRequest<MessageResponse>(`/api/v1/customers/${id}`, {
    method: "DELETE",
  });
}

export function restoreCustomer(id: string) {
  return apiRequest<MessageResponse>(`/api/v1/customers/${id}/restore`, {
    method: "POST",
  });
}

export function listCustomerConflicts(id: string, signal?: AbortSignal) {
  return apiRequest<CustomerConflictListResponse>(`/api/v1/customers/${id}/conflicts`, { signal });
}

export function createCustomerConflict(id: string, payload: CreateCustomerConflictRequest) {
  return apiRequest<MessageResponse, CreateCustomerConflictRequest>(
    `/api/v1/customers/${id}/conflicts`,
    {
      method: "POST",
      body: payload,
    },
  );
}
