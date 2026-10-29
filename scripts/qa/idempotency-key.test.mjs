import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';
import { browserUuid } from './browser-uuid.mjs';

const root = new URL('../../', import.meta.url).pathname;
const source = await readFile(`${root}/src/services/http/api-client.ts`, 'utf8');
const teamSource = await readFile(`${root}/src/features/teams/api/teams.api.ts`, 'utf8');
function load(source, globals = {}) {
  const exports = {};
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(compiled, { exports, Uint8Array, require: name => { assert.equal(name, 'uuid'); return browserUuid(globals.crypto); }, ...globals });
  return exports;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const httpCrypto = { getRandomValues: (bytes) => webcrypto.getRandomValues(bytes) };
test('native UUID remains supported', () => {
  const expected = '788bd5db-5347-4d90-b5e2-69da752e2a17';
  assert.equal(load(source, { crypto: { randomUUID: () => expected } }).createIdempotencyKey(), expected);
});
test('HTTP without randomUUID generates unique UUID v4 keys', () => {
  const client = load(source, { crypto: httpCrypto });
  const keys = Array.from({ length: 1000 }, () => client.createIdempotencyKey());
  assert.equal(new Set(keys).size, 1000);
  keys.forEach((key) => assert.match(key, uuid));
});
test('does not use weak randomness when Web Crypto is absent', () => {
  assert.throws(() => load(source, { crypto: undefined }).createIdempotencyKey());
});
test('team creation reaches fetch over HTTP with the expected body and headers', async () => {
  const calls = [];
  const client = load(source, { crypto: httpCrypto });
  const teams = load(teamSource, {
    require: (name) => { assert.equal(name, '@/services/http'); return { ...client, apiUrl: (path) => `http://test/api/v1${path}` }; },
    fetch: async (url, init) => { calls.push({ url, init }); return { ok: true, json: async () => ({ data: { id: '1', name: 'QA team' } }) }; },
  });
  assert.equal((await teams.createTeam({ accessToken: 'test-token' }, { name: 'QA team', leader_id: '2' })).id, '1');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'http://test/api/v1/teams');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer test-token');
  assert.match(calls[0].init.headers['Idempotency-Key'], uuid);
  assert.deepEqual(JSON.parse(calls[0].init.body), { name: 'QA team', leader_id: 2 });
});
