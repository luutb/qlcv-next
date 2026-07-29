export type KnownRole = "SUPER_ADMIN" | "PARTNER" | "LAWYER" | "ACCOUNTANT";

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  PARTNER: "Partner",
  LAWYER: "Lawyer",
  ACCOUNTANT: "Accountant",
};

export function isKnownRole(role: string): role is KnownRole {
  return role === "SUPER_ADMIN" || role === "PARTNER" || role === "LAWYER" || role === "ACCOUNTANT";
}
