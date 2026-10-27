import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';
const compile = (source) => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText).toString('base64')}`;
const authUrl = compile(await readFile(new URL('../../src/features/auth/model/current-user.ts', import.meta.url), 'utf8'));
const policySource = await readFile(new URL('../../src/features/authorization/model/role-policy.ts', import.meta.url), 'utf8');
const { getEffectiveActions } = await import(compile(policySource.replace('@/features/auth/model/current-user', authUrl)));
const { isValidEmployeePassword, isValidEmployeeUsername, localDateInputMax } = await import(compile(await readFile(new URL('../../src/features/employees/model/account-validation.ts', import.meta.url), 'utf8')));

test('passwords match Go character limits and bcrypt bytes including Unicode', () => {
  assert.equal(isValidEmployeePassword('12345'), false);
  assert.equal(isValidEmployeePassword('123456'), true);
  assert.equal(isValidEmployeePassword('😀😀😀'), false);
  assert.equal(isValidEmployeePassword('😀😀😀😀😀😀'), true);
  assert.equal(isValidEmployeePassword('ế'.repeat(24)), true);
  assert.equal(isValidEmployeePassword('ế'.repeat(25)), false);
  assert.equal(isValidEmployeePassword('a'.repeat(73)), false);
  assert.equal(isValidEmployeeUsername(' ab '), false);
  assert.equal(isValidEmployeeUsername(' abc '), true);
  assert.equal(localDateInputMax(new Date(2026, 0, 2)), '2026-01-02');
});

test('resource denies cannot be restored by a default grant in either order', () => {
  const grant = { resource: 'default', actions: { 'tasks.assign': true } };
  const deny = { resource: 'tasks', actions: { assign: false } };
  for (const rows of [[grant, deny], [deny, grant]]) {
    assert.equal(getEffectiveActions('SUPER_ADMIN', rows)['tasks.assign'], false);
  }
  assert.equal(getEffectiveActions('LAWYER', [grant])['tasks.assign'], false);
});

test('denying access cascades to dependent writes and finance', () => {
  const flags = getEffectiveActions('SUPER_ADMIN', [{ resource: 'default', actions: { 'tasks.access': false, 'projects.read': false, 'customers.read': false } }]);
  for (const key of ['tasks.create','tasks.assign','tasks.finance.read','tasks.update-amount','tasks.complete-deposit','labels.assign-normal','labels.assign-financial','time-entries.read','reports.read','projects.create','projects.assign-team','customers.manage']) assert.equal(flags[key], false, key);
});

test('unsupported field and conditional policies fail closed for every capability', () => {
  for (const options of [{field_level:true},{conditions:{owner:true}}]) {
    const flags = getEffectiveActions('SUPER_ADMIN', [{ resource:'default', actions:{}, ...options }]);
    assert.equal(Object.keys(flags).length, 34);
    assert.equal(Object.values(flags).every((flag) => flag === false), true);
  }
});
