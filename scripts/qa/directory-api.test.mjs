import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';
const compile=source=>ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText.replace(/from [\"']uuid[\"']/g, 'from '+JSON.stringify(import.meta.resolve('uuid')));
const url=source=>`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const httpUrl=url(compile(await readFile(new URL('../../src/services/http/api-client.ts',import.meta.url),'utf8'))+'\nexport const apiUrl = path => "http://api.test"+path;');
const load=async file=>import(url(compile(await readFile(new URL(file,import.meta.url),'utf8')).replace('"@/services/http"',JSON.stringify(httpUrl))));
const customers=await load('../../src/features/customers/api/customers.api.ts');
const employees=await load('../../src/features/employees/api/employees.api.ts');
const http=await import(httpUrl);
const credentials={accessToken:'test-only',signal:new AbortController().signal};
test('customers normalize nested legacy response and translate offset to page',async t=>{
 const calls=[];t.mock.method(globalThis,'fetch',async(path,init)=>{calls.push({path,init});return Response.json({data:{data:[{id:42,full_name:'QA customer',email:null,phone:'123',is_deleted:false}],pagination:{page:3,limit:10,total:21}}});});
 const result=await customers.listCustomers(credentials,{offset:20,limit:10,search:'QA & tax',include_deleted:true});
 assert.equal(result.customers[0].id,'42');assert.equal(result.customers[0].name,'QA customer');assert.equal(result.customers[0].contact_email,null);assert.equal(result.customers[0].contact_phone,'123');
 const params=new URL(calls[0].path).searchParams;assert.equal(params.get('page'),'3');assert.equal(params.get('include_deleted'),'true');assert.equal(params.get('search'),'QA & tax');assert.equal(result.pagination.total,21);assert.equal(calls[0].init.signal,credentials.signal);
});
test('customer writes use actual DTO fields and retain explicit null clearing',async t=>{
 let body;t.mock.method(globalThis,'fetch',async(_,init)=>{body=JSON.parse(init.body);return Response.json({data:{id:1,...body}});});
 await customers.updateCustomer(credentials,'1',{name:' QA ',contact_email:null,note:null});
 assert.equal(body.full_name,'QA');assert.equal(body.email,null);assert.equal(body.note,null);assert.equal(body.name,undefined);assert.equal(body.contact_email,undefined);
});
test('employee filters and numeric responses are adapted without changing role vocabulary',async t=>{
 let path;t.mock.method(globalThis,'fetch',async url=>{path=url;return Response.json({data:{data:[{id:2,role:'staff',is_active:false,full_name:'QA'}],pagination:{page:2,limit:25,total:30}}});});
 const result=await employees.listEmployees(credentials,{page:2,limit:25,search:'QA',role:'staff',is_active:false,department:'Legal'});
 assert.equal(result.employees[0].id,'2');assert.equal(result.employees[0].role,'staff');const params=new URL(path).searchParams;assert.equal(params.get('is_active'),'false');assert.equal(params.get('role'),'staff');assert.equal(params.get('department'),'Legal');
});
test('employee status is explicit and attachments keep browser multipart boundary',async t=>{
 const calls=[];t.mock.method(globalThis,'fetch',async(path,init)=>{calls.push({path,init});return Response.json({data:{}});});
 await employees.setEmployeeStatus(credentials,'2',false);assert.deepEqual(JSON.parse(calls[0].init.body),{is_active:false});
 await employees.uploadEmployeeRecord(credentials,'2','21',new File(['%PDF-1.4 QA'],'contract.pdf',{type:'application/pdf'}));assert.ok(calls[1].init.body instanceof FormData);assert.equal(calls[1].init.headers['Content-Type'],undefined);assert.equal(calls[1].init.headers.Authorization,'Bearer test-only');
});
test('legacy nested errors preserve HTTP status/codes and malformed errors get a safe fallback',async()=>{
 await assert.rejects(http.parseApiResponse(Response.json({error:{code:'EMAIL_EXISTS',message:'raw sensitive backend detail'}},{status:409})),error=>error.problem.status===409&&error.problem.code==='EMAIL_EXISTS'&&!error.message.includes('sensitive'));
 await assert.rejects(http.parseApiResponse(new Response('not json',{status:503})),error=>error.problem.status===503&&error.problem.title==='Yêu cầu không thành công');
 await assert.rejects(http.parseApiResponse(Response.json({title:'Conflict',status:200,code:'VERSION_CONFLICT',meta:{version:3},detail:'Reload'},{status:409})),error=>error.problem.status===409&&error.problem.meta.version===3&&error.problem.detail==='Reload');
});
