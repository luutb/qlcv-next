import { apiUrl, createIdempotencyKey, parseApiResponse } from "@/services/http";

export type ApiCredentials = { accessToken: string; signal?: AbortSignal };

export type Team = {
  id: string;
  name: string;
  description?: string | null;
  leader_id?: string | null;
  is_active: boolean;
  member_count: number;
  created_at: string;
  updated_at: string;
};

export type TeamMemberRole = "LEADER" | "MEMBER" | "VIEWER";

export type TeamMember = {
  user_id: string;
  username: string;
  display_name?: string;
  email: string;
  role: string;
  team_role: TeamMemberRole;
  is_active: boolean;
  joined_at: string;
};

export type TeamDetail = Team & { members?: TeamMember[] };
export type TeamRequest = { name: string; description?: string | null; leader_id?: string | null; is_active?: boolean };
export type UpsertTeamMemberInput = { user_id: string; team_role: TeamMemberRole };

type EntityEnvelope<T> = { data: T };
type ListEnvelope<T> = { data: T[] };
type MessageEnvelope = { message?: string };

async function request<T>(path: string, credentials: ApiCredentials, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path as `/${string}`), {
    ...init,
    signal: credentials.signal,
    headers: { Accept: "application/json", Authorization: `Bearer ${credentials.accessToken}`, ...init?.headers },
  });
  return parseApiResponse<T>(response);
}

function writeRequest(method: "POST" | "PUT", body?: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json", "Idempotency-Key": createIdempotencyKey() },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  };
}

export const teamQueryKeys = {
  all: ["teams"] as const,
  list: (includeInactive = false) => [...teamQueryKeys.all, "list", { includeInactive }] as const,
  details: () => [...teamQueryKeys.all, "detail"] as const,
  detail: (teamId: string) => [...teamQueryKeys.details(), teamId] as const,
  members: (teamId: string) => [...teamQueryKeys.detail(teamId), "members"] as const,
};

export async function listTeams(credentials: ApiCredentials, includeInactive = false): Promise<Team[]> {
  return (await request<ListEnvelope<Team>>(`/teams?include_inactive=${includeInactive}`, credentials)).data;
}

export async function getTeam(credentials: ApiCredentials, teamId: string): Promise<TeamDetail> {
  return (await request<EntityEnvelope<TeamDetail>>(`/teams/${teamId}`, credentials)).data;
}

export async function createTeam(credentials: ApiCredentials, input: TeamRequest): Promise<Team> {
  return (await request<EntityEnvelope<Team>>("/teams", credentials, writeRequest("POST", teamPayload(input)))).data;
}

export async function updateTeam(credentials: ApiCredentials, teamId: string, input: Partial<TeamRequest>): Promise<Team> {
  return (await request<EntityEnvelope<Team>>(`/teams/${teamId}`, credentials, writeRequest("PUT", teamPayload(input)))).data;
}

export async function archiveTeam(credentials: ApiCredentials, teamId: string): Promise<string | undefined> {
  return (await request<MessageEnvelope>(`/teams/${teamId}`, credentials, { method: "DELETE", headers: { "Idempotency-Key": createIdempotencyKey() } })).message;
}

export async function listTeamMembers(credentials: ApiCredentials, teamId: string): Promise<TeamMember[]> {
  return (await request<ListEnvelope<TeamMember>>(`/teams/${teamId}/members`, credentials)).data;
}

export async function upsertTeamMember(credentials: ApiCredentials, teamId: string, input: UpsertTeamMemberInput): Promise<TeamMember> {
  return (await request<EntityEnvelope<TeamMember>>(`/teams/${teamId}/members`, credentials, writeRequest("POST", { ...input, user_id: numericId(input.user_id) }))).data;
}

// Domain IDs are strings; the Go API binds JSON IDs to uint fields.
function numericId(id: string): number {
  const value = Number(id);
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(value) || value <= 0 || value > 4294967295) throw new Error("ID không hợp lệ.");
  return value;
}

function teamPayload(input: Partial<TeamRequest>) {
  return { ...input, ...(input.leader_id !== undefined ? { leader_id: input.leader_id === null ? null : numericId(input.leader_id) } : {}) };
}

export type TeamUserOption = { id: string; username: string; full_name: string; email: string | null };
type SimpleUsersEnvelope = { data: { data: { users: Array<Omit<TeamUserOption, "id"> & { id: number } > | null; total: number } } };

export async function listTeamUserOptions(credentials: ApiCredentials): Promise<TeamUserOption[]> {
  const users: TeamUserOption[] = [];
  for (let page = 1; ; page++) {
    const payload = await request<SimpleUsersEnvelope>(`/users/simple?active=true&limit=100&page=${page}`, credentials);
    const batch = payload.data.data.users ?? [];
    users.push(...batch.map((user) => ({ ...user, id: String(user.id) })));
    if (!batch.length || users.length >= payload.data.data.total) return users;
  }
}

export async function removeTeamMember(credentials: ApiCredentials, teamId: string, userId: string): Promise<string | undefined> {
  return (await request<MessageEnvelope>(`/teams/${teamId}/members/${userId}`, credentials, { method: "DELETE", headers: { "Idempotency-Key": createIdempotencyKey() } })).message;
}
