import { apiUrl, createIdempotencyKey, parseApiResponse } from "@/services/http";

export type ApiCredentials = { accessToken: string; signal?: AbortSignal };
export type Pagination = { limit: number; offset: number; count: number; total: number };
export type Customer = {
  id: string; name: string; tax_code?: string | null; contact_name?: string | null;
  contact_email?: string | null; contact_phone?: string | null; address?: string | null;
  company_name?: string | null; id_number?: string | null; note?: string | null;
  is_deleted?: boolean; created_at: string; updated_at: string; actions?: Record<string, boolean>;
};
export type CustomerRequest = Pick<Customer, "name" | "tax_code" | "contact_email" | "contact_phone" | "address" | "company_name" | "id_number" | "note">;
export type CustomerListFilters = { limit?: number; offset?: number; search?: string; include_deleted?: boolean };
export type CustomerConflict = { id: string; customer_id: string; opposing_party_name?: string | null; opposing_party_tax_code?: string | null; status?: string; created_at: string; updated_at?: string };
export type CreateCustomerConflictInput = { opposing_party_name: string; opposing_party_tax_code?: string | null; notes?: string | null };
type CustomerWire = Omit<Customer, "id" | "name"> & { id: number | string; full_name: string; email?: string | null; phone?: string | null };
type ListEnvelope = { data: { data: CustomerWire[] | null; pagination: { page: number; limit: number; total: number } } };

async function request<T>(path: string, credentials: ApiCredentials, method = "GET", body?: unknown): Promise<T> {
  return parseApiResponse<T>(await fetch(apiUrl(path as `/${string}`), {
    method, signal: credentials.signal,
    headers: { Accept: "application/json", Authorization: `Bearer ${credentials.accessToken}`, ...(method === "GET" ? {} : { "Idempotency-Key": createIdempotencyKey() }), ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }));
}
function normalize(customer: CustomerWire): Customer {
  return { ...customer, id: String(customer.id), name: customer.full_name, contact_email: customer.email, contact_phone: customer.phone };
}
function payload(input: CustomerRequest) {
  return { full_name: input.name.trim(), email: input.contact_email ?? null, phone: input.contact_phone ?? null, tax_code: input.tax_code ?? null, address: input.address ?? null, company_name: input.company_name ?? null, id_number: input.id_number ?? null, note: input.note ?? null };
}
export const customerQueryKeys = {
  all: ["customers"] as const,
  lists: () => ["customers", "list"] as const,
  list: (filters: CustomerListFilters = {}) => ["customers", "list", filters] as const,
  details: () => ["customers", "detail"] as const,
  detail: (id: string) => ["customers", "detail", id] as const,
  conflicts: (id: string) => ["customers", "detail", id, "conflicts"] as const,
};
export async function listCustomers(credentials: ApiCredentials, filters: CustomerListFilters = {}) {
  const limit = filters.limit ?? 25; const offset = filters.offset ?? 0;
  const query = new URLSearchParams({ page: String(Math.floor(offset / limit) + 1), limit: String(limit), search: filters.search ?? "", include_deleted: String(filters.include_deleted ?? false) });
  const result = await request<ListEnvelope>(`/customers?${query}`, credentials);
  const customers = (result.data.data ?? []).map(normalize);
  return { customers, pagination: { ...result.data.pagination, offset, count: customers.length } };
}
export async function getCustomer(credentials: ApiCredentials, id: string): Promise<Customer> { return normalize((await request<{ data: CustomerWire }>(`/customers/${encodeURIComponent(id)}`, credentials)).data); }
export async function createCustomer(credentials: ApiCredentials, input: CustomerRequest): Promise<Customer> { return normalize((await request<{ data: CustomerWire }>("/customers", credentials, "POST", payload(input))).data); }
export async function updateCustomer(credentials: ApiCredentials, id: string, input: CustomerRequest): Promise<Customer> { return normalize((await request<{ data: CustomerWire }>(`/customers/${encodeURIComponent(id)}`, credentials, "PUT", payload(input))).data); }
export async function archiveCustomer(credentials: ApiCredentials, id: string) { await request(`/customers/${encodeURIComponent(id)}`, credentials, "DELETE"); }
export async function restoreCustomer(credentials: ApiCredentials, id: string) { await request(`/customers/${encodeURIComponent(id)}/restore`, credentials, "POST"); }
// Retained transport for compatibility; the current local BE does not expose conflicts yet.
export async function listCustomerConflicts(credentials: ApiCredentials, id: string): Promise<CustomerConflict[]> { return (await request<{ data: CustomerConflict[] }>(`/customers/${encodeURIComponent(id)}/conflicts`, credentials)).data; }
export async function createCustomerConflict(credentials: ApiCredentials, id: string, input: CreateCustomerConflictInput): Promise<CustomerConflict | string | undefined> { const result = await request<{ data?: CustomerConflict; message?: string }>(`/customers/${encodeURIComponent(id)}/conflicts`, credentials, "POST", input); return result.data ?? result.message; }
