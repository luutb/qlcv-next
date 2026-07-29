import type { Actions } from "@/api/types";
import { isKnownRole, type KnownRole } from "./roles";

const PRIVILEGED_ROUTE_RULES: ReadonlyArray<{
  prefix: string;
  roles: readonly KnownRole[];
}> = [
  { prefix: "/admin", roles: ["SUPER_ADMIN"] },
  { prefix: "/users", roles: ["SUPER_ADMIN", "PARTNER"] },
  { prefix: "/settings/users", roles: ["SUPER_ADMIN", "PARTNER"] },
  { prefix: "/settings/workflow-templates", roles: ["SUPER_ADMIN", "PARTNER"] },
  { prefix: "/labels", roles: ["SUPER_ADMIN", "PARTNER"] },
];

const ACTION_FALLBACK_ROLES: Record<keyof Actions, readonly KnownRole[]> = {
  view: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  download: ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  edit: ["SUPER_ADMIN", "PARTNER"],
  delete: ["SUPER_ADMIN", "PARTNER"],
  restore: ["SUPER_ADMIN", "PARTNER"],
  move: ["SUPER_ADMIN", "PARTNER", "LAWYER"],
  assign: ["SUPER_ADMIN", "PARTNER", "LAWYER"],
  override_conflict: ["SUPER_ADMIN", "PARTNER"],
  lock: ["PARTNER"],
};

export function canAccessPath(pathname: string, role: string): boolean {
  if (pathname === "/login") return true;
  if (!role || !isKnownRole(role)) return false;

  const rule = PRIVILEGED_ROUTE_RULES.find(({ prefix }) => pathMatchesPrefix(pathname, prefix));
  return rule ? rule.roles.includes(role) : true;
}

export function canPerformAction(
  actions: Actions | undefined,
  action: keyof Actions,
  role: string,
): boolean {
  const explicitDecision = actions?.[action];
  if (typeof explicitDecision === "boolean") return explicitDecision;
  if (!isKnownRole(role)) return false;
  return ACTION_FALLBACK_ROLES[action].includes(role);
}

function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}
