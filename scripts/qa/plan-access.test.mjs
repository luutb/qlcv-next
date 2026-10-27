import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import ts from "typescript";
const compile = (source) => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString("base64")}`;
const authUrl = compile(await readFile(new URL("../../src/features/auth/model/current-user.ts", import.meta.url), "utf8"));
const auth = await import(authUrl);
const route = await import(compile((await readFile(new URL("../../src/features/auth/model/route-access.ts", import.meta.url), "utf8")).replace("./current-user", authUrl)));
const featureUrl = compile(await readFile(new URL("../../src/features/platform/model/plan-features.ts", import.meta.url), "utf8"));
const contracts = await import(compile((await readFile(new URL("../../src/features/platform/model/tenant-contracts.ts", import.meta.url), "utf8")).replace("./plan-features", featureUrl)));
const now = Date.now();
const subscription = { plan_id: "plan-1", plan_code: "TEAM", plan_name: "Team", status: "ACTIVE", features: ["projects", "tasks"], starts_at: new Date(now - 60_000).toISOString(), ends_at: new Date(now + 3_600_000).toISOString(), members_limit: 10, projects_limit: null, storage_bytes_limit: 0, version: "1:1" };
const user = { id: "1", organization_id: "legacy", account_scope: "organization", username: "fixture", email: "", role: "ADMIN", is_active: true, mfa_enabled: false, version: 1, subscription, actions: { "tasks.access": true, "projects.read": true, "tasks.finance.read": false } };

test("inactive or expired plans cannot retain a stale capability grant", () => {
  assert.equal(auth.hasAuthorizedAction(user, "tasks.access"), true);
  for (const status of ["NO_SUBSCRIPTION", "PAUSED", "CANCELLED", "EXPIRED", "SCHEDULED", "CONFIGURATION_REQUIRED"]) {
    const blocked = { ...user, subscription: { ...subscription, status } };
    assert.equal(auth.hasAuthorizedAction(blocked, "tasks.access"), false);
    assert.equal(route.canAccessRoute(blocked, "/work"), false);
    assert.equal(route.canAccessRoute(blocked, "/subscription"), true);
  }
  for (const changes of [{ ends_at: new Date(now - 1).toISOString() }, { starts_at: new Date(now + 60_000).toISOString() }]) {
    assert.equal(auth.hasAuthorizedAction({ ...user, subscription: { ...subscription, ...changes } }, "tasks.access"), false);
  }
  assert.equal(auth.hasAuthorizedAction(user, "tasks.finance.read"), false);
  assert.equal(route.canAccessRoute(user, "/admin/permissions"), false);
});
test("subscription changes isolate cached projections even when role is unchanged", () => {
  assert.notEqual(auth.authorizationCacheScope(user), auth.authorizationCacheScope({ ...user, subscription: { ...subscription, version: "2:1" } }));
  assert.notEqual(auth.authorizationCacheScope(user), auth.authorizationCacheScope({ ...user, subscription: { ...subscription, features: ["tasks"] } }));
  assert.equal(auth.isCurrentUser(user), true);
  for (const value of [{ ...subscription, ends_at: "bad-date" }, { ...subscription, members_limit: -1 }, { ...subscription, status: "INVALID" }]) assert.equal(auth.isCurrentUser({ ...user, subscription: value }), false);
});
test("plan decoder rejects missing, duplicate and unknown entitlement data", () => {
  const plan = { id: "plan-1", code: "TEAM", name: "Team", description: "", is_active: true, features: ["tasks"], features_configured: true, price_amount: null, currency: null, billing_interval: null, limits: { members: null, projects: 0, storage_bytes: 1024 }, version: "1", created_at: subscription.starts_at, updated_at: subscription.starts_at };
  assert.deepEqual(contracts.readPlatformPlan(plan).features, ["tasks"]);
  for (const features of [undefined, null, ["platform.access"], ["tasks", "tasks"]]) assert.throws(() => contracts.readPlatformPlan({ ...plan, features }));
  assert.throws(() => contracts.readPlatformPlan({ ...plan, features_configured: "true" }));
});
