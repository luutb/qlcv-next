import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';

const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const http = moduleUrl(compile(await readFile(new URL('../../src/services/http/api-client.ts', import.meta.url), 'utf8')) + '\nexport const apiUrl = path => "http://api.test" + path;');
const api = await import(moduleUrl(compile(await readFile(new URL('../../src/features/teams/api/teams.api.ts', import.meta.url), 'utf8')).replace('"@/services/http"', JSON.stringify(http))));
const credentials = { accessToken: 'test-only', signal: new AbortController().signal };

test('member and leader IDs use numeric JSON while domain IDs remain strings', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, init) => { calls.push({ url, init, body: JSON.parse(init.body) }); return Response.json({ data: { id: '11' } }); });
  await api.upsertTeamMember(credentials, '11', { user_id: '42', team_role: 'MEMBER' });
  await api.createTeam(credentials, { name: 'Nhóm', leader_id: '42' });
  await api.updateTeam(credentials, '11', { is_active: true });
  assert.equal(calls[0].body.user_id, 42);
  assert.equal(calls[1].body.leader_id, 42);
  assert.deepEqual(calls[2].body, { is_active: true });
  assert.equal(calls[0].init.headers.Authorization, 'Bearer test-only');
  assert.equal(calls[0].init.signal, credentials.signal);
  assert.ok(calls[0].init.headers['Idempotency-Key']);
  assert.notEqual(calls[0].init.headers['Idempotency-Key'], calls[1].init.headers['Idempotency-Key']);
});

test('invalid IDs are rejected before sending any write', async t => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => { throw Error('Unexpected request'); });
  for (const id of ['', '0', '-1', '1.5', 'NaN', '1e2', '4294967296']) {
    await assert.rejects(api.upsertTeamMember(credentials, '11', { user_id: id, team_role: 'MEMBER' }), /ID không hợp lệ/);
    await assert.rejects(api.createTeam(credentials, { name: 'Nhóm', leader_id: id }), /ID không hợp lệ/);
  }
  assert.equal(fetch.mock.callCount(), 0);
});

test('active user selector reads actual nested envelope and fetches all pages', async t => {
  const urls = [];
  t.mock.method(globalThis, 'fetch', async url => {
    urls.push(new URL(url)); const page = Number(urls.at(-1).searchParams.get('page'));
    const users = Array.from({ length: page === 1 ? 100 : 1 }, (_, index) => ({ id: (page - 1) * 100 + index + 1, username: 'qa', full_name: '', email: null }));
    return Response.json({ data: { success: true, data: { users, total: 101 } } });
  });
  const options = await api.listTeamUserOptions(credentials);
  assert.equal(options.length, 101);
  assert.equal(options.at(-1).id, '101');
  assert.equal(options[0].email, null);
  assert.deepEqual(urls.map(url => url.searchParams.get('page')), ['1', '2']);
  assert.ok(urls.every(url => url.searchParams.get('active') === 'true' && url.searchParams.get('limit') === '100'));
});

test('null user lists terminate pagination and server conflicts reach callers', async t => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ data: { data: { users: null, total: 0 } } }));
  assert.deepEqual(await api.listTeamUserOptions(credentials), []);
  t.mock.method(globalThis, 'fetch', async () => Response.json({ status: 409, code: 'TEAM_HAS_OPEN_PROJECTS', title: 'Conflict' }, { status: 409 }));
  await assert.rejects(api.archiveTeam(credentials, '11'), error => error.problem.status === 409 && error.problem.code === 'TEAM_HAS_OPEN_PROJECTS');
});
