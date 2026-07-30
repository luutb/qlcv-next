import { USER_ROLES, type UserListQuery, type UserRole } from "@/api/users.api";

export const USER_LIST_PAGE_SIZE = 20;

export type UserListUrlQuery = UserListQuery & {
  limit: number;
  offset: number;
};

export function parseUserListQuery(searchParams: URLSearchParams): UserListUrlQuery {
  const q = searchParams.get("q")?.trim();
  const role = searchParams.get("role");
  const active = searchParams.get("is_active");

  return {
    q: q || undefined,
    role: isUserRole(role) ? role : undefined,
    is_active: active === "true" ? true : active === "false" ? false : undefined,
    limit: USER_LIST_PAGE_SIZE,
    offset: parseOffset(searchParams.get("offset")),
  };
}

export function applyUserListQuery(
  searchParams: URLSearchParams,
  query: UserListUrlQuery,
  next: Partial<Pick<UserListUrlQuery, "q" | "role" | "is_active" | "offset">>,
): URLSearchParams {
  const merged = { ...query, ...next };

  setOptionalParam(searchParams, "q", merged.q?.trim());
  setOptionalParam(searchParams, "role", merged.role);

  if (typeof merged.is_active === "boolean") {
    searchParams.set("is_active", String(merged.is_active));
  } else {
    searchParams.delete("is_active");
  }

  if (merged.offset > 0) {
    searchParams.set("offset", String(merged.offset));
  } else {
    searchParams.delete("offset");
  }

  return searchParams;
}

function isUserRole(value: string | null): value is UserRole {
  return USER_ROLES.some((role) => role === value);
}

function parseOffset(value: string | null): number {
  const offset = Number(value);
  return Number.isInteger(offset) && offset > 0 ? offset : 0;
}

function setOptionalParam(searchParams: URLSearchParams, key: string, value?: string) {
  if (value) searchParams.set(key, value);
  else searchParams.delete(key);
}
