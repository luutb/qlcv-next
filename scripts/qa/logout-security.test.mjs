import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import ts from "typescript";

const compile = (source) => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const dataModule = (source) => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const sessionSource = await readFile(new URL("../../src/features/auth/model/session.ts", import.meta.url), "utf8");
const sessionUrl = dataModule(compile(sessionSource));
const session = await import(sessionUrl);
const authSource = await readFile(new URL("../../src/features/auth/api/auth.api.ts", import.meta.url), "utf8");
const compiled = compile(authSource)
  .replace(/from "@\/services\/endpoints"/g, `from "${dataModule('export const authEndpoints = { login: "/auth/login", logout: "/auth/logout" };')}"`)
  .replace(/from "@\/services\/http"/g, `from "${dataModule('export class ApiProblem extends Error {} export const parseApiResponse = () => {};')}"`)
  .replace(/from "@\/services\/http\/request"/g, `from "${dataModule('export const requestJson = (options) => globalThis.logoutRequest(options);')}"`)
  .replace(/from "\.\.\/model\/session"/g, `from "${sessionUrl}"`);
const auth = await import(dataModule(compiled));

test("logout revokes the bearer session and always clears local state", async () => {
  const store = new Map();
  globalThis.window = new EventTarget();
  globalThis.sessionStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  };
  try {
    for (const status of [200, 401, 403, 500]) {
      session.saveAccessToken("test-only-token");
      globalThis.logoutRequest = async (options) => {
        assert.equal(session.getStoredAccessToken(), "test-only-token");
        assert.equal(options.path, "/auth/logout");
        assert.equal(options.method, "POST");
        assert.equal(options.headers.Authorization, "Bearer test-only-token");
        assert.ok(options.signal instanceof AbortSignal);
        return new Response(null, { status });
      };
      assert.equal(await auth.logout(), status === 200 || status === 401);
      assert.equal(session.getStoredAccessToken(), null);
    }
    for (const failure of [new Error("offline"), new DOMException("timed out", "TimeoutError")]) {
      session.saveAccessToken("test-only-token");
      globalThis.logoutRequest = async () => { throw failure; };
      assert.equal(await auth.logout(), false);
      assert.equal(session.getStoredAccessToken(), null);
    }
    globalThis.logoutRequest = () => { assert.fail("anonymous logout must not send request"); };
    assert.equal(await auth.logout(), true);
  } finally {
    delete globalThis.logoutRequest;
    delete globalThis.window;
    delete globalThis.sessionStorage;
  }
});
