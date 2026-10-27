import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../../src/features/auth/model/session.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const session = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const makeToken = (exp) => `e30.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.signature`;

test("return paths preserve local destinations and reject external/login paths", () => {
  for (const value of [null, "https://evil.test", "//evil.test", "/\\evil.test", "/login", "/login?next=/teams", "/teams\n"]) {
    assert.equal(session.safeReturnPath(value), "/");
  }
  assert.equal(session.safeReturnPath("/projects/board?project_id=123#tasks"), "/projects/board?project_id=123#tasks");
});

test("JWT expiry decoding tolerates opaque tokens and rejects invalid expiration", () => {
  assert.equal(session.getTokenExpiresAt(makeToken(1000)), 1_000_000);
  assert.equal(session.getTokenExpiresAt("opaque-token"), null);
  assert.equal(session.getTokenExpiresAt(makeToken("1000")), null);
});

test("session changes notify subscribers; expired tokens are unavailable", () => {
  const store = new Map();
  globalThis.window = new EventTarget();
  globalThis.sessionStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  };
  let notifications = 0;
  const unsubscribe = session.subscribeToSession(() => notifications++);
  const valid = makeToken(Date.now() / 1000 + 3600);
  session.saveAccessToken(valid);
  assert.equal(session.getAccessToken(), valid);
  session.saveAccessToken(makeToken(Date.now() / 1000 - 1));
  assert.equal(session.getAccessToken(), null);
  assert.ok(session.getStoredAccessToken());
  session.clearSession();
  assert.equal(session.getStoredAccessToken(), null);
  assert.equal(notifications, 3);
  unsubscribe();
  session.saveAccessToken(valid);
  assert.equal(notifications, 3);
  delete globalThis.window;
  delete globalThis.sessionStorage;
});
