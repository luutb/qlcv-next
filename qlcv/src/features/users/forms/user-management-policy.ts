import { USER_ROLES, type ManagedUser, type UserRole } from "@/api/users.api";

export function canEditManagedUser(target: ManagedUser, actorRole: string): boolean {
  const explicitDecision = target.actions?.edit;
  if (typeof explicitDecision === "boolean") return explicitDecision;

  if (actorRole === "SUPER_ADMIN") return true;
  return (
    actorRole === "PARTNER" &&
    USER_ROLES.some((role) => role === target.role) &&
    target.role !== "SUPER_ADMIN"
  );
}

export function canCreateManagedUser(actorRole: string): boolean {
  return actorRole === "SUPER_ADMIN" || actorRole === "PARTNER";
}

export function getCreatableUserRoles(actorRole: string): readonly UserRole[] {
  if (actorRole === "SUPER_ADMIN") return USER_ROLES;
  if (actorRole === "PARTNER") return USER_ROLES.filter((role) => role !== "SUPER_ADMIN");
  return [];
}
