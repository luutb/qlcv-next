import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import ts from "typescript";
const source = await readFile(new URL("../../src/features/platform/model/tenant-view.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { readTenantViewData, readTenantViewSession } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const session = { id: "09adfc9e-e02f-4be1-a192-e565ab8215ea", tenant_id: "legacy", created_at: "2026-10-26T08:00:00Z", expires_at: "2026-10-26T08:15:00Z" };
const payload = { tenant_id: "legacy", session_id: session.id, resource: "projects", columns: [{ key: "id", label: "ID" }, { key: "name", label: "Tên" }], items: [{ id: "1", name: "<script>unsafe()</script>", password: "never-forward" }], pagination: { page: 1, limit: 15, total: 1 }, unavailable_fields: [] };
test("session decoder binds tenant and validates expiry interval", () => {
  assert.deepEqual(readTenantViewSession(session, "legacy"), session);
  assert.throws(() => readTenantViewSession(session, "other"));
  for (const invalid of [{ id: "invalid" }, { expires_at: session.created_at }, { expires_at: "bad" }]) assert.throws(() => readTenantViewSession({ ...session, ...invalid }, "legacy"));
});
test("viewer decoding rejects crossed tenant, session and resource responses", () => {
  for (const change of [{ tenant_id: "other" }, { session_id: "other" }, { resource: "customers" }]) assert.throws(() => readTenantViewData({ ...payload, ...change }, "legacy", session.id, "projects"));
  const data = readTenantViewData(payload, "legacy", session.id, "projects");
  assert.equal(data.items[0].name, "<script>unsafe()</script>");
  assert.equal(Object.hasOwn(data.items[0], "password"), false);
});
test("viewer decoding rejects malformed columns, missing IDs and pagination", () => {
  for (const change of [{ columns: [] }, { columns: [{ key: "__proto__", label: "x" }] }, { columns: [payload.columns[0], payload.columns[0]] }, { items: [{ name: "x" }] }, { pagination: { page: 1, limit: 101, total: 1 } }, { pagination: { page: 0, limit: 15, total: 1 } }, { unavailable_fields: [false] }]) assert.throws(() => readTenantViewData({ ...payload, ...change }, "legacy", session.id, "projects"));
});
