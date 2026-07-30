import type { Actions } from "@/api/types";
import type { ManagedUser } from "@/api/users.api";

type UserManagementAction = "edit" | "delete" | "restore";

/**
 * User action DTOs are authoritative when they contain the requested key.
 * Older responses may omit a key; that fallback must retain the backend's
 * target rule that a PARTNER cannot administer a SUPER_ADMIN.
 */
export function canManageUserAction(
  actions: Actions | undefined,
  action: UserManagementAction,
  actorRole: string,
  targetRole: ManagedUser["role"],
): boolean {
  const explicitDecision = actions?.[action];
  if (typeof explicitDecision === "boolean") return explicitDecision;

  if (actorRole !== "SUPER_ADMIN" && actorRole !== "PARTNER") return false;
  return !(actorRole === "PARTNER" && targetRole === "SUPER_ADMIN");
}
