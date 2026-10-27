import { apiUrl, createIdempotencyKey, parseApiResponse } from "@/services/http";
import { projectEndpoints } from "@/services/endpoints";

export type ApiCredentials = { accessToken: string; signal?: AbortSignal };
export type ProjectStatus = "OPEN" | "DONE";

export type Project = {
  id: string;
  key?: string;
  description?: string;
  customer_id: string;
  team_id?: string | null;
  team?: { id: string; name: string; is_active: boolean } | null;
  name: string;
  hourly_rate: number;
  status: ProjectStatus;
  workflow_template_id?: string | null;
  current_workflow_step_id?: string | null;
  total_contract_value: number | null;
  total_paid: number | null;
  remaining_amount: number | null;
  conflict_status?: string | null;
  opposing_party_name?: string | null;
  opposing_party_tax_code?: string | null;
  created_at: string;
  updated_at: string;
  actions?: Record<string, boolean>;
};

export type ProjectRequest = {
  customer_id: string;
  team_id?: string | null;
  name: string;
  hourly_rate: number;
  total_contract_value: number;
  opposing_party_name?: string | null;
  opposing_party_tax_code?: string | null;
};

export type ProjectUpdateRequest = { key: string; name: string; description: string };
/** POST /projects uses the current project schema, not commercial metadata. */
export type CreateProjectInput = { key: string; name: string; customer_id: string; description?: string; team_id?: string | null };
export type ProjectListFilters = { customer_id?: string; status?: ProjectStatus; active_only?: "true" | "false"; limit?: number; offset?: number };
export type Pagination = { limit: number; offset: number; count: number; total: number };
export type AssignableUser = { id: string; username: string; email: string; role: string; team_role: "LEADER" | "MEMBER" | "VIEWER" };
export type AuditHistoryItem = { id: string; action: string; created_at: string; actor?: { id: string; username: string } | null; before?: unknown; after?: unknown };
export type ProjectTask = {
  id: string;
  project_id: string;
  parent_task_id?: string | null;
  title: string;
  description?: string | null;
  status: "TODO" | "DOING" | "DONE" | "CANCELLED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  assignee_id?: string | null;
  due_date?: string | null;
  position: number;
  is_required: boolean;
  created_at: string;
  updated_at: string;
};
export type ProjectTasksFilters = { limit?: number; offset?: number; status?: ProjectTask["status"] };

type EntityEnvelope<T> = { data: T };
type ListEnvelope<T> = { data: T[]; pagination?: Pagination };
type MessageEnvelope = { message?: string };

function entityOrDirect<T>(payload: T | EntityEnvelope<T>): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as EntityEnvelope<T>).data;
  }
  return payload as T;
}

/** The current backend returns numeric IDs; UI/domain IDs are strings. */
function normalizeProject(project: Project): Project {
  return { ...project, id: String(project.id), customer_id: String(project.customer_id ?? ""), team_id: project.team_id == null ? null : String(project.team_id), team: project.team ? { ...project.team, id: String(project.team.id) } : null };
}

function queryString(values: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value !== undefined) query.set(key, String(value));
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

async function request<T>(path: string, credentials: ApiCredentials, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path as `/${string}`), {
    ...init,
    signal: credentials.signal,
    headers: { Accept: "application/json", Authorization: `Bearer ${credentials.accessToken}`, ...init?.headers },
  });
  return parseApiResponse<T>(response);
}

function writeRequest(method: "POST" | "PUT" | "PATCH", body: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json", "Idempotency-Key": createIdempotencyKey() }, body: JSON.stringify(body) };
}

export const projectQueryKeys = {
  all: ["projects"] as const,
  lists: () => [...projectQueryKeys.all, "list"] as const,
  list: (filters: ProjectListFilters = {}) => [...projectQueryKeys.lists(), filters] as const,
  details: () => [...projectQueryKeys.all, "detail"] as const,
  detail: (projectId: string) => [...projectQueryKeys.details(), projectId] as const,
  assignableUsers: (projectId: string) => [...projectQueryKeys.detail(projectId), "assignable-users"] as const,
  tasks: (projectId: string) => [...projectQueryKeys.detail(projectId), "tasks"] as const,
  history: (projectId: string, limit?: number, offset?: number) => [...projectQueryKeys.detail(projectId), "history", { limit, offset }] as const,
};

export async function listProjects(credentials: ApiCredentials, filters: ProjectListFilters = {}) {
  const envelope = await request<ListEnvelope<Project>>(`${projectEndpoints.collection}${queryString(filters)}` as `/${string}`, credentials);
  return { projects: Array.isArray(envelope.data) ? envelope.data.map(normalizeProject) : [], pagination: envelope.pagination };
}

export async function getProject(credentials: ApiCredentials, projectId: string): Promise<Project> {
  return normalizeProject(entityOrDirect(await request<Project | EntityEnvelope<Project>>(projectEndpoints.byId(projectId), credentials)));
}

export async function createProject(credentials: ApiCredentials, input: CreateProjectInput): Promise<Project> {
  const project = entityOrDirect(await request<Project | EntityEnvelope<Project>>("/projects", credentials, writeRequest("POST", { ...input, customer_id: Number(input.customer_id), team_id: input.team_id ? Number(input.team_id) : null })));
  return normalizeProject(project);
}

export async function updateProject(credentials: ApiCredentials, projectId: string, input: ProjectUpdateRequest): Promise<Project> {
  return normalizeProject(entityOrDirect(await request<Project | EntityEnvelope<Project>>(`/projects/${projectId}`, credentials, writeRequest("PUT", input))));
}

export async function completeProject(credentials: ApiCredentials, projectId: string): Promise<Project | string | undefined> {
  const result = await request<Project | EntityEnvelope<Project> & MessageEnvelope>(`/projects/${projectId}/complete`, credentials, writeRequest("POST", {}));
  if (typeof result === "object" && result !== null && "message" in result && typeof result.message === "string") return result.message;
  return entityOrDirect(result);
}

export async function assignProjectTeam(credentials: ApiCredentials, projectId: string, teamId: string | null): Promise<Project> {
  return normalizeProject(entityOrDirect(await request<Project | EntityEnvelope<Project>>(`/projects/${projectId}/team`, credentials, writeRequest("PATCH", { team_id: teamId ? Number(teamId) : null }))));
}

export async function listProjectAssignableUsers(credentials: ApiCredentials, projectId: string): Promise<AssignableUser[]> {
  return (await request<ListEnvelope<AssignableUser>>(`/projects/${projectId}/assignable-users`, credentials)).data;
}

export async function listProjectTasks(credentials: ApiCredentials, projectId: string, filters: ProjectTasksFilters = {}) {
  const envelope = await request<ListEnvelope<ProjectTask>>(`/projects/${projectId}/tasks${queryString(filters)}`, credentials);
  return { tasks: envelope.data, pagination: envelope.pagination };
}

export async function listProjectHistory(credentials: ApiCredentials, projectId: string, pagination: Pick<Pagination, "limit" | "offset"> = { limit: 20, offset: 0 }) {
  const envelope = await request<ListEnvelope<AuditHistoryItem>>(`/projects/${projectId}/history${queryString(pagination)}`, credentials);
  return { history: envelope.data, pagination: envelope.pagination };
}

export async function overrideProjectConflict(credentials: ApiCredentials, projectId: string, overrideJustification: string): Promise<Project | string | undefined> {
  const result = await request<EntityEnvelope<Project> & MessageEnvelope>(`/projects/${projectId}/override-conflict`, credentials, writeRequest("POST", { override_justification: overrideJustification }));
  return result.data ?? result.message;
}
