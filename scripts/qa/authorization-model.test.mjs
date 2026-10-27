import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../../src/features/auth/model/current-user.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { hasAuthorizedAction, isCurrentUser } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const user = { id: "1", organization_id: "legacy", username: "admin", email: "", role: "SUPER_ADMIN", is_active: true, mfa_enabled: false, version: 1 };

test("explicit backend denial overrides role; explicit grant permits another active role", () => {
  for (const action of ["users.manage", "customers.manage", "teams.manage"]) {
    assert.equal(hasAuthorizedAction({ ...user, actions: { [action]: false } }, action), false);
    assert.equal(hasAuthorizedAction({ ...user, role: "LAWYER", actions: { [action]: true } }, action), true);
    assert.equal(hasAuthorizedAction({ ...user, is_active: false, actions: { [action]: true } }, action), false);
    assert.equal(hasAuthorizedAction(undefined, action), false);
  }
});

test("legacy fallback preserves private employee access and directory management", () => {
  assert.equal(hasAuthorizedAction({ ...user, role: "PARTNER", actions: {} }, "users.manage"), false);
  assert.equal(hasAuthorizedAction(user, "users.manage"), true);
  for (const action of ["customers.manage", "teams.manage"]) {
    assert.equal(hasAuthorizedAction({ ...user, role: "PARTNER", actions: {} }, action), true);
    assert.equal(hasAuthorizedAction({ ...user, role: "LAWYER" }, action), false);
  }
});

test("admin policy editor exposes only capabilities the current backend supports", async () => {
  const { getRoleActionCeiling, USER_ROLES } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
  for (const role of USER_ROLES) {
    const ceiling = getRoleActionCeiling(role);
    assert.equal(Object.keys(ceiling).length, 34);
    for (const key of ["tenant-data.purge", "invoices.read", "projects.complete"]) {
      assert.equal(ceiling[key], false, `${role}: ${key} has no supported endpoint`);
    }
  }
  assert.equal(getRoleActionCeiling("SUPER_ADMIN")["users.manage"], true);
  assert.equal(getRoleActionCeiling("SUPER_ADMIN")["tenant-settings.manage"], true);
  assert.equal(getRoleActionCeiling("PARTNER")["audit.read"], false);
  assert.equal(getRoleActionCeiling("LAWYER")["reports.read"], false);
  assert.equal(getRoleActionCeiling("LAWYER")["time-entries.read"], true);
  assert.equal(getRoleActionCeiling("LAWYER")["tasks.assign"], false);
  assert.equal(getRoleActionCeiling("ACCOUNTANT")["tasks.complete-deposit"], true);
});

test("current user rejects malformed permission maps instead of granting fallback access", () => {
  for (const actions of [null, [], true, "all", { "users.manage": "true" }, { "teams.manage": null }]) {
    assert.equal(isCurrentUser({ ...user, actions }), false);
  }
  for (const actions of [undefined, {}, { "users.manage": false, "future.action": true }]) {
    assert.equal(isCurrentUser({ ...user, actions }), true);
  }
});

test("every registered action honors explicit grants and denials across all roles", async () => {
  const { AUTHORIZATION_ACTIONS, USER_ROLES } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
  for (const role of USER_ROLES) {
    for (const action of AUTHORIZATION_ACTIONS) {
      assert.equal(hasAuthorizedAction({ ...user, role, actions: { [action]: false } }, action), false, `${role} denied ${action}`);
      assert.equal(hasAuthorizedAction({ ...user, role, actions: { [action]: true } }, action), true, `${role} granted ${action}`);
    }
  }
});

const modelUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`;
const routeSource = await readFile(new URL("../../src/features/auth/model/route-access.ts", import.meta.url), "utf8");
const routeCompiled = ts.transpileModule(routeSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText.replace('"./current-user"', JSON.stringify(modelUrl));
const { canAccessRoute } = await import(`data:text/javascript;base64,${Buffer.from(routeCompiled).toString("base64")}`);

test("policy management remains reachable for active admin recovery only", () => {
  assert.equal(canAccessRoute({ ...user, actions: { "tenant-settings.manage": false } }, "/admin/permissions"), true);
  assert.equal(canAccessRoute({ ...user, is_active: false }, "/admin/permissions"), false);
  assert.equal(canAccessRoute({ ...user, role: "LAWYER" }, "/admin/permissions"), false);
});

test("direct routes and nested routes apply read/create permissions", () => {
  for (const role of ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"]) {
    const identity = { ...user, role };
    assert.equal(canAccessRoute(identity, "/users/123"), role === "SUPER_ADMIN");
    assert.equal(canAccessRoute(identity, "/projects/new"), ["SUPER_ADMIN", "PARTNER"].includes(role));
    assert.equal(canAccessRoute(identity, "/projects/123"), true);
    assert.equal(canAccessRoute(identity, "/admin/tenant-settings"), role === "SUPER_ADMIN");
  }
  assert.equal(canAccessRoute({ ...user, actions: { "projects.read": false } }, "/projects/123"), false);
  assert.equal(canAccessRoute({ ...user, role: "LAWYER", actions: { "users.manage": true } }, "/users"), true);
  assert.equal(canAccessRoute({ ...user, is_active: false }, "/"), false);
});

test("resource denial restricts a global grant and cannot override a global denial", async () => {
  const { hasResourceAction } = await import(modelUrl);
  assert.equal(hasResourceAction(user, "projects.assign-team", { "assign-team": false }, "assign-team"), false);
  assert.equal(hasResourceAction({ ...user, actions: { "projects.assign-team": false } }, "projects.assign-team", { "assign-team": true }, "assign-team"), false);
  assert.equal(hasResourceAction(user, "projects.assign-team", undefined, "assign-team"), true);
});

test("dashboard accepts explicitly redacted finance without treating it as zero", async () => {
  const dashboardSource = await readFile(new URL("../../src/features/dashboard/api/dashboard.api.ts", import.meta.url), "utf8");
  const dashboardCompiled = ts.transpileModule(dashboardSource, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText.replace(/import .* from "@\/services\/http";/, "");
  const { normalizeDashboardSummary } = await import(`data:text/javascript;base64,${Buffer.from(dashboardCompiled).toString("base64")}`);
  const summary = {
    range: { from: "2026-10-01", to: "2026-10-31" },
    kpis: { total_tasks: 0, in_progress_tasks: 0, completed_tasks: 0, open_issues: 0, overdue_issues: 0, active_projects: 0, revenue_collected: null },
    billing: null, task_status: [], issue_status: [], issue_type: [], project_workflow: [], due_items: [], projects_need_attention: [], workload: [], recent_activity: [],
  };
  const normalized = normalizeDashboardSummary(summary);
  assert.equal(normalized.billing, null);
  assert.equal(normalized.kpis.revenue_collected, null);
  assert.throws(() => normalizeDashboardSummary({ ...summary, billing: "restricted" }));
  assert.throws(() => normalizeDashboardSummary({ ...summary, kpis: { ...summary.kpis, total_tasks: "0" } }));
});

test("authorization changes cannot reuse a broader identity cache", async () => {
  const { authorizationCacheScope } = await import(modelUrl);
  const admin = { ...user, actions: { "documents.read": true, "users.manage": true } };
  assert.notEqual(authorizationCacheScope(admin), authorizationCacheScope({ ...admin, role: "LAWYER" }));
  assert.notEqual(authorizationCacheScope(admin), authorizationCacheScope({ ...admin, actions: { ...admin.actions, "users.manage": false } }));
  assert.notEqual(authorizationCacheScope(admin), authorizationCacheScope({ ...admin, id: "2" }));
  assert.equal(authorizationCacheScope(admin), authorizationCacheScope({ ...admin, actions: { "users.manage": true, "documents.read": true } }));
  assert.equal(isCurrentUser({ ...user, authorization_unavailable: "true" }), false);
});

test("platform access requires an explicit scoped identity and grant", async () => {
  const { isPlatformAdministrator } = await import(modelUrl);
  const platform = { ...user, account_scope: "platform", actions: { "platform.access": true } };
  assert.equal(isPlatformAdministrator(platform), true);
  assert.equal(canAccessRoute(platform, "/platform"), true);
  assert.equal(canAccessRoute(platform, "/platform/organizations"), true);
  for (const identity of [user, { ...platform, role: "ADMIN" }, { ...platform, account_scope: "organization" }, { ...platform, is_active: false }, { ...platform, authorization_unavailable: true }, { ...platform, actions: {} }, { ...platform, actions: { "platform.access": false } }]) {
    assert.equal(isPlatformAdministrator(identity), false);
    assert.equal(canAccessRoute(identity, "/platform"), false);
  }
});

test("platform identity cannot inherit tenant capabilities or tenant routes", () => {
  const platform = { ...user, account_scope: "platform", actions: { "platform.access": true, "users.manage": true, "tasks.access": true } };
  assert.equal(hasAuthorizedAction(platform, "users.manage"), false);
  assert.equal(hasAuthorizedAction(platform, "tasks.access"), false);
  for (const route of ["/admin", "/admin/permissions", "/admin/platform-preview", "/users", "/projects", "/work"]) assert.equal(canAccessRoute(platform, route), false);
});

test("organization Admin is supported without becoming a platform administrator", () => {
  const admin = { ...user, role: "ADMIN", account_scope: "organization", actions: { "users.manage": true } };
  assert.equal(isCurrentUser(admin), true);
  assert.equal(hasAuthorizedAction(admin, "users.manage"), true);
  assert.equal(canAccessRoute(admin, "/admin"), true);
  assert.equal(canAccessRoute(admin, "/admin/platform-preview"), true);
  assert.equal(canAccessRoute(admin, "/platform"), false);
  assert.equal(canAccessRoute({ ...admin, role: "LAWYER" }, "/admin/platform-preview"), false);
  assert.equal(isCurrentUser({ ...admin, account_scope: "anything" }), false);
});

test("scope changes invalidate identity cache even when role stays the same", async () => {
  const { authorizationCacheScope } = await import(modelUrl);
  assert.notEqual(authorizationCacheScope(user), authorizationCacheScope({ ...user, account_scope: "platform" }));
});

test("platform canonical identity is tenantless and malformed scopes are rejected", () => {
  const platform = { ...user, role: "SUPER_ADMIN", account_scope: "platform", organization_id: null };
  assert.equal(isCurrentUser(platform), true);
  assert.equal(isCurrentUser({ ...platform, organization_id: "legacy" }), false);
  assert.equal(isCurrentUser({ ...platform, role: "ADMIN" }), false);
  assert.equal(isCurrentUser({ ...user, organization_id: null }), false);
  assert.equal(hasAuthorizedAction({ ...user, authorization_unavailable: true, actions: { "users.manage": true } }, "users.manage"), false);
});

test("scoped identities deny omitted capabilities instead of inferring from role", () => {
  for (const actions of [undefined, {}, { "teams.manage": true }]) {
    assert.equal(hasAuthorizedAction({ ...user, role: "ADMIN", account_scope: "organization", actions }, "users.manage"), false);
  }
});
