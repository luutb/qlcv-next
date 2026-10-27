import { apiUrl, createIdempotencyKey, parseApiResponse } from "@/services/http";
export type EmployeeRole = "admin" | "manager" | "staff" | "accountant";
export type Employee = { id: string; username: string; full_name: string; email: string | null; phone: string | null; department: string | null; position: string | null; address: string | null; date_of_birth: string | null; gender: "male" | "female" | "other" | null; role: EmployeeRole; is_active: boolean; created_at: string; last_login_at: string | null };
export type EmployeeInput = Omit<Employee, "id" | "is_active" | "created_at" | "last_login_at" | "username" | "role">;
export type CreateEmployeeInput = EmployeeInput & { username: string; password: string; role: EmployeeRole };
export type EmployeeFilters = { page: number; limit: number; search: string; role?: EmployeeRole; is_active?: boolean; department?: string };
export type EmployeeRecord = { id: string; user_id: string; kind: "contract" | "degree" | "certificate" | "identity" | "other"; title: string; issuer: string; reference: string; issue_date: string | null; expiry_date: string | null; note: string; file_name: string; file_size: number; created_at: string };
export type EmployeeRecordInput = Pick<EmployeeRecord, "kind" | "title" | "issuer" | "reference" | "issue_date" | "expiry_date" | "note">;
type Credentials = { accessToken: string; signal?: AbortSignal };
export async function employeeRequest<T>(credentials: Credentials, path: string, method = "GET", body?: unknown): Promise<T> {
  const multipart = body instanceof FormData;
  return parseApiResponse<T>(await fetch(apiUrl(path as `/${string}`), { method, signal: credentials.signal, headers: { Accept: "application/json", Authorization: `Bearer ${credentials.accessToken}`, ...(method === "GET" ? {} : { "Idempotency-Key": createIdempotencyKey() }), ...(body === undefined || multipart ? {} : { "Content-Type": "application/json" }) }, ...(body === undefined ? {} : { body: multipart ? body : JSON.stringify(body) }) }));
}
function normalize(employee: Omit<Employee, "id"> & { id: string | number }): Employee { return { ...employee, id: String(employee.id) }; }
export const employeeKeys = { all: ["employees"] as const, list: (filters: EmployeeFilters, token: string | null) => ["employees", "list", filters, token] as const, detail: (id: string, token: string | null) => ["employees", "detail", id, token] as const, records: (id: string, token: string | null) => ["employees", "records", id, token] as const };
export async function listEmployees(credentials: Credentials, filters: EmployeeFilters) {
  const query = new URLSearchParams(); for (const [key,value] of Object.entries(filters)) if (value !== undefined && value !== "") query.set(key,String(value));
  const result = await employeeRequest<{ data: { data: Array<Omit<Employee,"id"> & {id:number}> | null; pagination: { page: number; limit: number; total: number } } }>(credentials, `/users?${query}`);
  return { employees: (result.data.data ?? []).map(normalize), pagination: result.data.pagination };
}
export async function getEmployee(credentials: Credentials, id: string) { return normalize((await employeeRequest<{data:Employee}>(credentials,`/users/${encodeURIComponent(id)}`)).data); }
export async function createEmployee(credentials: Credentials, input: CreateEmployeeInput) { return normalize((await employeeRequest<{data:Employee}>(credentials,"/users","POST",input)).data); }
export async function updateEmployee(credentials: Credentials, id: string, input: EmployeeInput) { return normalize((await employeeRequest<{data:Employee}>(credentials,`/users/${encodeURIComponent(id)}`,"PUT",input)).data); }
export async function setEmployeeStatus(credentials: Credentials, id: string, active: boolean) { await employeeRequest(credentials,`/users/${encodeURIComponent(id)}/status`,"PUT",{is_active:active}); }
export async function setEmployeeRole(credentials: Credentials, id: string, role: EmployeeRole) { await employeeRequest(credentials,`/users/${encodeURIComponent(id)}/role`,"PUT",{role}); }
export async function resetEmployeePassword(credentials: Credentials, id: string, password: string) { await employeeRequest(credentials,`/users/${encodeURIComponent(id)}/reset-password`,"PUT",{new_password:password}); }
export async function listEmployeeRecords(credentials: Credentials, id: string) { return (await employeeRequest<{data:EmployeeRecord[]}>(credentials,`/users/${encodeURIComponent(id)}/records`)).data; }
export async function saveEmployeeRecord(credentials: Credentials, userId: string, input: EmployeeRecordInput, recordId?: string) { return (await employeeRequest<{data:EmployeeRecord}>(credentials,`/users/${encodeURIComponent(userId)}/records${recordId ? `/${encodeURIComponent(recordId)}` : ""}`,recordId ? "PUT" : "POST",input)).data; }
export async function uploadEmployeeRecord(credentials: Credentials, userId: string, recordId: string, file: File) { const body=new FormData();body.set("file",file);await employeeRequest(credentials,`/users/${encodeURIComponent(userId)}/records/${encodeURIComponent(recordId)}/file`,"POST",body); }
export async function deleteEmployeeRecord(credentials: Credentials, userId: string, recordId: string) { await employeeRequest(credentials,`/users/${encodeURIComponent(userId)}/records/${encodeURIComponent(recordId)}`,"DELETE"); }
export async function downloadEmployeeRecord(credentials: Credentials, userId: string, recordId: string) { return (await employeeRequest<{data:{url:string}}>(credentials,`/users/${encodeURIComponent(userId)}/records/${encodeURIComponent(recordId)}/file`)).data.url; }
