import { isKnownRole } from "./roles";

export function canAccessPath(pathname: string, role: string): boolean {
  if (pathname === "/login") return true;
  if (!role || !isKnownRole(role)) return false;
  if (role === "SUPER_ADMIN") return true;
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/users") || pathname.startsWith("/settings/users") || pathname.startsWith("/settings/workflow-templates")) {
    return role === "PARTNER";
  }
  if (pathname.startsWith("/labels")) return role === "PARTNER";
  return true;
}
