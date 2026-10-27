/**
 * The frontend may use this information only to make a conservative UI choice.
 * Every route and mutation remains authorized by the backend.
 */
export const USER_ROLES = ["ADMIN", "SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"] as const;

export type UserRole = (typeof USER_ROLES)[number];

/**
 * Stable UI capability names. `actions` returned by the API wins whenever it
 * includes the requested key; this fallback is intentionally restrictive.
 */
export const AUTHORIZATION_ACTIONS = [
  "dashboard.finance.read",
  "dashboard.people.read",
  "projects.finance.read",
  "projects.read",
  "projects.create",
  "customers.read",
  "teams.read",
  "labels.read",
  "labels.manage",
  "labels.assign-normal",
  "labels.assign-financial",
  "tasks.create",
  "tasks.assign",
  "tasks.finance.read",
  "tasks.update-amount",
  "tasks.complete-deposit",
  "invoices.read",
  "documents.read",
  "time-entries.read",
  "reports.read",

  "users.manage",
  "customers.manage",
  "teams.manage",
  "projects.assign-team",
  "projects.override-conflict",
  "projects.complete",
  "tasks.access",
  "invoices.generate",
  "invoices.update-status",
  "audit.read",
  "audit.verify",
  "documents.lock",
  "tenant-settings.manage",
  "tenant-data.purge",
] as const;

export type AuthorizationAction = (typeof AUTHORIZATION_ACTIONS)[number];
export type BackendActionFlags = Readonly<Record<string, boolean>>;

export type SubscriptionAccess = {
  plan_id: string; plan_code: string; plan_name: string;
  status: "ACTIVE" | "TRIALING" | "PAUSED" | "CANCELLED" | "EXPIRED" | "SCHEDULED" | "NO_SUBSCRIPTION" | "CONFIGURATION_REQUIRED";
  features: readonly string[]; starts_at: string | null; ends_at: string | null;
  members_limit: number | null; projects_limit: number | null; storage_bytes_limit: number | null; version: string;
};
export function hasActiveSubscription(user: { subscription?: SubscriptionAccess | null } | null | undefined): boolean {
  const subscription = user?.subscription;
  // Unversioned fixtures/legacy identities retain their existing role policy.
  if (subscription === undefined) return true;
  if (!subscription || !["ACTIVE", "TRIALING"].includes(subscription.status)) return false;
  const now = Date.now();
  return subscription.starts_at !== null && Date.parse(subscription.starts_at) <= now
    && (subscription.ends_at === null || Date.parse(subscription.ends_at) > now);
}
function validSubscription(value: unknown): boolean {
  if (value === null) return true;
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  const nullableDate = (item: unknown) => item === null || (typeof item === "string" && Number.isFinite(Date.parse(item)));
  const limit = (item: unknown) => item === null || (typeof item === "number" && Number.isSafeInteger(item) && item >= 0);
  return ["plan_id", "plan_code", "plan_name", "version"].every((key) => typeof data[key] === "string")
    && typeof data.status === "string" && ["ACTIVE", "TRIALING", "PAUSED", "CANCELLED", "EXPIRED", "SCHEDULED", "NO_SUBSCRIPTION", "CONFIGURATION_REQUIRED"].includes(data.status)
    && Array.isArray(data.features) && data.features.every((item) => typeof item === "string")
    && nullableDate(data.starts_at) && nullableDate(data.ends_at)
    && limit(data.members_limit) && limit(data.projects_limit) && limit(data.storage_bytes_limit);
}

export type CurrentUser = {
  id: string;
  organization_id: string | null;
  /** Explicit server scope; legacy SUPER_ADMIN is not a platform identity. */
  account_scope?: "organization" | "platform";
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  mfa_enabled: boolean;
  version: number;
  tenant_plan?: string;
  subscription?: SubscriptionAccess | null;
  enabled_feature_flags?: readonly string[];
  actions?: BackendActionFlags;
  authorization_unavailable?: boolean;
};

const roleFallback: Readonly<Record<AuthorizationAction, readonly UserRole[]>> = {
  "dashboard.finance.read": ["ADMIN", "SUPER_ADMIN", "PARTNER", "ACCOUNTANT"],
  "dashboard.people.read": ["ADMIN", "SUPER_ADMIN", "PARTNER"],
  "projects.finance.read": ["ADMIN", "SUPER_ADMIN", "PARTNER", "ACCOUNTANT"],
  "projects.read": ["ADMIN", "SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  "projects.create": ["ADMIN", "SUPER_ADMIN", "PARTNER"],
  "customers.read": ["ADMIN", "SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  "teams.read": ["ADMIN", "SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  "labels.read": ["ADMIN", "SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  "labels.manage": ["ADMIN", "SUPER_ADMIN", "PARTNER"],
  "labels.assign-normal": ["ADMIN", "SUPER_ADMIN", "PARTNER"],
  "labels.assign-financial": ["ADMIN", "SUPER_ADMIN", "ACCOUNTANT"],
  "tasks.create": ["ADMIN", "SUPER_ADMIN", "PARTNER"],
  "tasks.assign": ["ADMIN", "SUPER_ADMIN", "PARTNER"],
  "tasks.finance.read": ["ADMIN", "SUPER_ADMIN", "PARTNER", "ACCOUNTANT"],
  "tasks.update-amount": ["ADMIN", "SUPER_ADMIN", "PARTNER"],
  "tasks.complete-deposit": ["ADMIN", "SUPER_ADMIN", "ACCOUNTANT"],
  "invoices.read": ["ADMIN", "SUPER_ADMIN", "PARTNER", "ACCOUNTANT"],
  "documents.read": ["ADMIN", "SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  "time-entries.read": ["ADMIN", "SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  "reports.read": ["ADMIN", "SUPER_ADMIN", "PARTNER", "ACCOUNTANT"],

  "users.manage": ["ADMIN", "SUPER_ADMIN"],
  "customers.manage": ["ADMIN", "SUPER_ADMIN", "PARTNER"],
  "teams.manage": ["ADMIN", "SUPER_ADMIN", "PARTNER"],
  "projects.assign-team": ["ADMIN", "SUPER_ADMIN", "PARTNER"],
  "projects.override-conflict": ["ADMIN", "SUPER_ADMIN", "PARTNER"],
  "projects.complete": ["ADMIN", "SUPER_ADMIN", "PARTNER"],
  "tasks.access": ["ADMIN", "SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  "invoices.generate": ["PARTNER", "ACCOUNTANT"],
  "invoices.update-status": ["ADMIN", "SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  "audit.read": ["ADMIN", "SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  "audit.verify": ["ADMIN", "SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"],
  "documents.lock": ["PARTNER"],
  "tenant-settings.manage": ["ADMIN", "SUPER_ADMIN"],
  "tenant-data.purge": ["ADMIN", "SUPER_ADMIN"],
};

export function hasAuthorizedAction(user: CurrentUser | null | undefined, action: AuthorizationAction): boolean {
  if (!user?.is_active || user.authorization_unavailable || user.account_scope === "platform" || !hasActiveSubscription(user)) return false;

  // An explicit server flag is authoritative, including an explicit denial.
  if (user.actions && Object.hasOwn(user.actions, action)) {
    return user.actions[action] === true;
  }

  // Scoped identities use the new contract; omitted capabilities are denied.
  // Only unscoped legacy responses retain the temporary role fallback.
  if (user.account_scope !== undefined) return false;

  return roleFallback[action].includes(user.role);
}

export function hasRole(user: CurrentUser | null | undefined, ...roles: readonly UserRole[]): boolean {
  return Boolean(user?.is_active && roles.includes(user.role));
}

/** Prevents retaining a broader cached projection after identity or policy changes. */
export function authorizationCacheScope(user: CurrentUser | null | undefined): string {
  if (!user) return "unverified";
  return JSON.stringify([user.id, user.organization_id, user.account_scope, user.role, user.is_active, user.authorization_unavailable === true, user.subscription, Object.entries(user.actions ?? {}).sort(([left], [right]) => left.localeCompare(right))]);
}

/** Matches the implemented BE registry; legacy UI fallbacks also include future modules. */
export function getRoleActionCeiling(role: UserRole): Readonly<Record<AuthorizationAction, boolean>> {
  const unavailable: readonly AuthorizationAction[] = ["invoices.read", "projects.override-conflict", "projects.complete", "invoices.generate", "invoices.update-status", "audit.verify", "documents.lock", "tenant-data.purge"];
  return Object.fromEntries(AUTHORIZATION_ACTIONS.map((action) => [action, !unavailable.includes(action) && (action === "audit.read" ? (role === "ADMIN" || role === "SUPER_ADMIN") : roleFallback[action].includes(role))])) as Record<AuthorizationAction, boolean>;
}

export function isCurrentUser(value: unknown): value is CurrentUser {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === "string"
    && (candidate.account_scope === "platform" ? candidate.organization_id === null && candidate.role === "SUPER_ADMIN" : typeof candidate.organization_id === "string")
    && (candidate.account_scope === undefined || candidate.account_scope === "organization" || candidate.account_scope === "platform")
    && typeof candidate.username === "string"
    && typeof candidate.email === "string"
    && typeof candidate.role === "string"
    && USER_ROLES.includes(candidate.role as UserRole)
    && (candidate.subscription === undefined || validSubscription(candidate.subscription))
    && typeof candidate.is_active === "boolean"
    && typeof candidate.mfa_enabled === "boolean"
    && typeof candidate.version === "number"
    && (candidate.authorization_unavailable === undefined || typeof candidate.authorization_unavailable === "boolean")
    && (candidate.actions === undefined || (
      candidate.actions !== null
      && typeof candidate.actions === "object"
      && !Array.isArray(candidate.actions)
      && Object.values(candidate.actions).every((flag) => typeof flag === "boolean")
    ));
}

export const USER_ROLE_LABELS: Readonly<Record<UserRole, string>> = {
  ADMIN: "Admin", SUPER_ADMIN: "Super Admin", PARTNER: "Đối tác", LAWYER: "Luật sư", ACCOUNTANT: "Kế toán",
};

/** Resource flags can restrict a global capability, never override its denial. */
export function hasResourceAction(user: CurrentUser | null | undefined, action: AuthorizationAction, flags: BackendActionFlags | undefined, resourceAction: string): boolean {
  return hasAuthorizedAction(user, action) && (flags && Object.hasOwn(flags, resourceAction) ? flags[resourceAction] === true : true);
}

/** A legacy SUPER_ADMIN role alone never grants platform access. */
export function isPlatformAdministrator(user: CurrentUser | null | undefined): boolean {
  return Boolean(user?.is_active && !user.authorization_unavailable && user.role === "SUPER_ADMIN" && user.account_scope === "platform" && user.actions?.["platform.access"] === true);
}
