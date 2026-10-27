import { AUTHORIZATION_ACTIONS, getRoleActionCeiling, type AuthorizationAction, type UserRole } from "@/features/auth/model/current-user";

export const permissionDependencies: ReadonlyArray<readonly [AuthorizationAction, AuthorizationAction]> = [
  ["customers.manage", "customers.read"], ["teams.manage", "teams.read"], ["labels.manage", "labels.read"],
  ["labels.assign-normal", "tasks.access"], ["labels.assign-financial", "tasks.access"],
  ["projects.finance.read", "projects.read"], ["projects.create", "projects.read"], ["projects.assign-team", "projects.read"],
  ["reports.read", "tasks.access"], ["time-entries.read", "tasks.access"], ["tasks.create", "tasks.access"], ["tasks.assign", "tasks.access"], ["tasks.finance.read", "tasks.access"],
  ["tasks.update-amount", "tasks.finance.read"], ["tasks.complete-deposit", "tasks.finance.read"],
];

export function getEffectiveActions(role: UserRole, rows: ReadonlyArray<{ resource: string; actions: Record<string, boolean>; field_level?: boolean; conditions?: Record<string, unknown> }>): Record<AuthorizationAction, boolean> {
  const result = { ...getRoleActionCeiling(role) };
  if (rows.some((row) => row.field_level || Object.keys(row.conditions ?? {}).length > 0)) return Object.fromEntries(AUTHORIZATION_ACTIONS.map((action) => [action, false])) as Record<AuthorizationAction, boolean>;
  for (const row of rows) for (const [action, allowed] of Object.entries(row.actions)) {
    const key = row.resource !== "default" && !action.startsWith(`${row.resource}.`) ? `${row.resource}.${action}` : action;
    if (!allowed && AUTHORIZATION_ACTIONS.includes(key as AuthorizationAction)) result[key as AuthorizationAction] = false;
  }
  for (const [write, read] of permissionDependencies) result[write] = result[write] && result[read];
  return result;
}

