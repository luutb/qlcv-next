import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import ts from "typescript";
const source = await readFile(new URL("../../src/features/platform/model/platform-contracts.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { readPlatformSummary, readPlatformAccount, readPlatformOrganization, readPlatformPage, readPlatformAudit, platformAccountValidation } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const account = { id:"12",username:"admin.one",display_name:"Admin One",email:null,role:"ADMIN",is_active:true,is_locked:false,version:"1782500000000001",created_at:"2026-10-23T00:00:00Z",updated_at:"2026-10-23T00:00:00Z",last_login_at:null };
test("account decoding keeps version precise and strips unsupported sensitive fields", () => {
  const decoded = readPlatformAccount({ ...account, password:"should-not-reach-the-view" });
  assert.equal(decoded.version, account.version);
  assert.equal(Object.hasOwn(decoded,"password"), false);
  for (const invalid of [{role:"admin"},{is_active:"true"},{version:1782500000000001},{updated_at:"bad"},{email:undefined},{id:12}]) assert.throws(()=>readPlatformAccount({...account,...invalid}));
});
test("aggregate and pagination reject invalid or misleading data", () => {
  const summary={organization_count:1,admin_count:2,super_admin_count:1,active_admin_count:3,audit_event_count:10};
  assert.deepEqual(readPlatformSummary(summary),summary);
  for(const value of [-1,NaN,Infinity,"1",1.5]) assert.throws(()=>readPlatformSummary({...summary,admin_count:value}));
  assert.equal(readPlatformPage({items:[account],pagination:{page:1,limit:15,total:1}},readPlatformAccount).items.length,1);
  for(const pagination of [{page:0,limit:15,total:1},{page:1,limit:0,total:1},{page:1,limit:101,total:1},{page:1,limit:15,total:-1}]) assert.throws(()=>readPlatformPage({items:[account],pagination},readPlatformAccount));
});
test("single organization contract never advertises multi-tenant support", () => {
  const org={id:"legacy",name:"QLCV",email:"",phone:"",address:"",version:1,updated_at:account.updated_at,tenancy_mode:"single_organization"};
  assert.deepEqual(readPlatformOrganization(org),org);
  assert.throws(()=>readPlatformOrganization({...org,tenancy_mode:"multi_tenant"}));
  const event={id:"1",actor_id:"12",actor_name:"Admin",action:"PATCH",route:"/api/v1/platform/admin-accounts/:id",entity_id:"20",created_at:account.created_at};
  assert.deepEqual(readPlatformAudit(event),event);
  assert.throws(()=>readPlatformAudit({...event,created_at:null}));
});
test("provisioning validates Unicode passwords, bcrypt byte limit and profile inputs", () => {
  const input={username:"super.admin",display_name:"Quản trị",email:"admin@example.test",password:"a-secure-passphrase"};
  assert.deepEqual(platformAccountValidation(input,true),{});
  assert.equal(Boolean(platformAccountValidation({...input,password:"short"},true).password),true);
  assert.equal(Boolean(platformAccountValidation({...input,password:"😀".repeat(12)},true).password),false);
  assert.equal(Boolean(platformAccountValidation({...input,password:"😀".repeat(19)},true).password),true);
  assert.equal(Boolean(platformAccountValidation({...input,username:"bad username"},true).username),true);
  assert.equal(Boolean(platformAccountValidation({...input,email:"bad",display_name:" "},true).email),true);
  assert.deepEqual(platformAccountValidation({...input,username:"",password:""},false),{});
});
