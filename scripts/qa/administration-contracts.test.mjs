import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';
const source = await readFile(new URL('../../src/features/administration/model/contracts.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const model = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
test('settings reject malformed versions and preserve blank contact fields', () => {
 const value = { name:'Company', email:'', phone:'', address:'', version:1, updated_at:'2026-10-22T00:00:00Z' };
 assert.deepEqual(model.readSettings(value),value);
 for (const version of [0, -1, '1', null]) assert.throws(()=>model.readSettings({...value,version}));
});
test('collections reject bad pagination and malformed permission-sensitive records', () => {
 const event={id:'9007199254740993',actor_id:'1',actor_name:'Admin',action:'PUT',route:'/api/v1/roles/:role/permissions',entity_id:'staff',created_at:'2026-10-22T00:00:00Z'};
 const payload={items:[event],pagination:{page:1,limit:25,total:1}};
 assert.equal(model.readPage(payload,model.isJournalEvent).items[0].id,'9007199254740993');
 assert.throws(()=>model.readPage({...payload,pagination:{...payload.pagination,total:-1}},model.isJournalEvent));
 assert.throws(()=>model.readPage({...payload,items:[{...event,actor_id:1}]},model.isJournalEvent));
 assert.throws(()=>model.readContractTypes([{id:1,name:'Type',is_active:'true'}]));
 assert.deepEqual(model.readContractTypes(null),[]);
 assert.throws(()=>model.readContractTypes([{id:1,name:'Type',is_active:true,version:0}]));
 assert.equal(model.readContractTypes([{id:1,name:'Type',is_active:false,version:2}])[0].version,2);
});
test('documents and time entries reject malformed identity and state fields', () => {
 const document={id:'b05cab01-ad24-435f-b315-ccbbdd725544',owner_id:'1',name:'file.pdf',size:100,mime_type:'application/pdf',is_archived:false,created_at:'2026-10-22T00:00:00Z'};
 assert.equal(model.isBusinessDocument(document),true);
 assert.equal(model.isBusinessDocument({...document,is_archived:'false'}),false);
 assert.equal(model.isBusinessDocument({...document,owner_id:1}),false);
 const entry={id:'1',task_id:'2',user_id:'3',task_title:'Task',user_name:'Staff',minutes:30,description:'Work',date:'2026-10-22'};
 assert.equal(model.isTimeEntry(entry),true);
 assert.equal(model.isTimeEntry({...entry,minutes:-1}),false);
});
