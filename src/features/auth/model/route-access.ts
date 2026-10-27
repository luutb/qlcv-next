import { hasAuthorizedAction, hasActiveSubscription, isPlatformAdministrator, type AuthorizationAction, type CurrentUser } from "./current-user";

const routeActions: ReadonlyArray<readonly [string, AuthorizationAction]> = [
  ["/projects/new", "projects.create"], ["/projects", "projects.read"],
  ["/users", "users.manage"], ["/settings/users", "users.manage"],
  ["/customers", "customers.read"], ["/teams", "teams.read"], ["/labels", "labels.read"],
  ["/work", "tasks.access"], ["/tasks", "tasks.access"],
  ["/invoices", "invoices.read"], ["/documents", "documents.read"],
  ["/time-entries", "time-entries.read"], ["/reports", "reports.read"],
  ["/audit", "audit.read"], ["/admin/permissions", "tenant-settings.manage"], ["/admin/tenant-settings", "tenant-settings.manage"], ["/admin/contract-types", "tenant-settings.manage"],
];

export function requiredRouteAction(pathname: string): AuthorizationAction | undefined {
  return routeActions.find(([path]) => pathname === path || pathname.startsWith(`${path}/`))?.[1];
}

export function canAccessRoute(user: CurrentUser | null | undefined, pathname: string): boolean {
  if (!user?.is_active) return false;
  if (pathname === "/platform" || pathname.startsWith("/platform/")) return isPlatformAdministrator(user);
  if (user.account_scope === "platform") return false;
  if (pathname === "/subscription") return true;
  if (!hasActiveSubscription(user)) return false;
  if (pathname === "/admin") return user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  if (pathname.startsWith("/admin/") && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") return false;
  // The BE protects policy editing by the actual admin role, so keep its repair UI reachable even if a policy denies an admin capability.
  if ((pathname === "/admin/permissions" || pathname.startsWith("/admin/permissions/")) && (user.role === "ADMIN" || user.role === "SUPER_ADMIN")) return user.subscription === undefined || Boolean(user.subscription?.features.includes("settings"));
  const action = requiredRouteAction(pathname);
  return action === undefined || hasAuthorizedAction(user, action);
}
