import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import vm from 'node:vm';
import { test } from 'node:test';
import ts from 'typescript';
import { browserUuid } from './browser-uuid.mjs';

const root = new URL('../../', import.meta.url);
const httpSource = await readFile(new URL('src/services/http/api-client.ts', root), 'utf8');
const customerSource = await readFile(new URL('src/features/customers/api/customers.api.ts', root), 'utf8');
function load(source, globals) {
  const exports = {};
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(compiled, { exports, Uint8Array, URLSearchParams, ...globals });
  return exports;
}
function setup(fetch, crypto = { getRandomValues: bytes => webcrypto.getRandomValues(bytes) }) {
  const http = load(httpSource, { crypto, require: name => { assert.equal(name, 'uuid'); return browserUuid(crypto); } });
  const api = load(customerSource, {
    require: name => { assert.equal(name, '@/services/http'); return { ...http, apiUrl: path => `http://api.test${path}` }; },
    fetch,
  });
  return { api, http };
}
const credentials = { accessToken: 'test-only', signal: new AbortController().signal };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test('missing Web Crypto fails before fetch without weak randomness', async () => {
  let calls = 0;
  const { api } = setup(async () => { calls++; throw Error('Unexpected fetch'); }, {});
  await assert.rejects(api.createCustomer(credentials, { name: 'QA' }), error => {
    assert.match(error.message, /getRandomValues/);
    return true;
  });
  assert.equal(calls, 0);
});

test('customer creation reaches POST without randomUUID and matches the backend contract', async () => {
  const calls = [];
  const { api } = setup(async (url, init) => {
    calls.push({ url, init });
    return Response.json({ data: { id: 17, full_name: 'Khách QA', email: null, phone: null } }, { status: 201 });
  });
  const result = await api.createCustomer(credentials, { name: '  Khách QA  ' });
  assert.equal(calls.length, 1);
  const { url, init } = calls[0];
  assert.equal(url, 'http://api.test/customers');
  assert.equal(init.method, 'POST');
  assert.equal(init.signal, credentials.signal);
  assert.equal(init.headers.Authorization, 'Bearer test-only');
  assert.equal(init.headers['Content-Type'], 'application/json');
  assert.match(init.headers['Idempotency-Key'], uuid);
  assert.deepEqual(JSON.parse(init.body), {
    full_name: 'Khách QA', email: null, phone: null, tax_code: null,
    address: null, company_name: null, id_number: null, note: null,
  });
  assert.equal(result.id, '17');
  assert.equal(result.name, 'Khách QA');
});

test('customer details use backend field names and separate writes get distinct keys', async () => {
  const calls = [];
  const { api } = setup(async (_url, init) => {
    calls.push(init);
    return Response.json({ data: { id: 18, ...JSON.parse(init.body) } }, { status: 201 });
  });
  const input = { name: 'QA', contact_email: 'qa@example.test', contact_phone: '0901234567', company_name: 'Công ty QA', tax_code: '123', id_number: '456', address: 'Hà Nội', note: 'Ghi chú' };
  const result = await api.createCustomer(credentials, input);
  await api.createCustomer(credentials, input);
  const body = JSON.parse(calls[0].body);
  assert.equal(body.email, input.contact_email);
  assert.equal(body.phone, input.contact_phone);
  for (const key of ['company_name', 'tax_code', 'id_number', 'address', 'note']) assert.equal(body[key], input[key]);
  assert.equal(result.contact_email, input.contact_email);
  assert.equal(result.contact_phone, input.contact_phone);
  assert.notEqual(calls[0].headers['Idempotency-Key'], calls[1].headers['Idempotency-Key']);
});

test('customer creation preserves nested backend errors without retrying the write', async () => {
  for (const [status, code] of [[400, 'BAD_REQUEST'], [401, 'UNAUTHORIZED'], [403, 'FORBIDDEN'], [409, 'CONFLICT'], [500, 'INTERNAL_ERROR']]) {
    let calls = 0;
    const { api, http } = setup(async () => {
      calls++;
      return Response.json({ error: { code, message: 'Backend error' } }, { status });
    });
    await assert.rejects(api.createCustomer(credentials, { name: 'QA' }), error => error instanceof http.ApiProblem && error.problem.status === status && error.problem.code === code);
    assert.equal(calls, 1);
  }
});
