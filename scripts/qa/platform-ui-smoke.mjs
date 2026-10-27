// Synthetic API fixtures only. Requires Next :3000, Chrome CDP :9222, Node WebSocket.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const targets = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const target = targets.find((item) => item.type === "page");
if (!target) throw new Error("No Chrome test page");
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve) => ws.addEventListener("open", resolve, { once:true }));
let seq=0; const pending=new Map(); const calls=[]; let failure;
const capabilities=Object.fromEntries(["access","overview.read","organizations.read","admins.read","admins.manage","audit.read","tenants.read","tenants.manage","plans.read","plans.manage"].map(action=>[`platform.${action}`,true]));
let identity={id:"1",organization_id:"legacy",username:"qa.admin",email:"qa@example.test",role:"ADMIN",account_scope:"organization",is_active:true,mfa_enabled:false,version:1,actions:{}};
const date="2026-10-23T08:00:00Z";
let accounts=Array.from({length:18},(_,i)=>({id:String(i+1),username:i===0?"qa.root":`admin.${i+1}`,display_name:i===0?"QA Super Admin":`Quản trị viên ${i+1}`,email:`admin${i+1}@example.test`,role:i===0?"SUPER_ADMIN":"ADMIN",is_active:true,is_locked:false,version:String(1782500000000000+i),created_at:date,updated_at:date,last_login_at:i%2?null:date}));
let accountError=0, conflict=false; const writes=[];
function send(method,params={}) { return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));}); }
ws.addEventListener("message",async({data})=>{
 const message=JSON.parse(data);
 if(message.id){const task=pending.get(message.id);pending.delete(message.id);if(message.error)task?.reject(new Error(JSON.stringify(message.error)));else task?.resolve(message.result);}
 if(message.method!=="Fetch.requestPaused")return;
 try {
  const {requestId,request}=message.params;const url=new URL(request.url);const path=url.pathname.replace(/^.*\/api\/v1/,"");calls.push({path,method:request.method});
  let result={},status=200;
  if(request.method==="OPTIONS")result={};
  else if(path==="/users/me")result=identity;
  else if(path==="/platform/summary") result={organization_count:1,admin_count:17,super_admin_count:1,active_admin_count:18,audit_event_count:writes.length};
  else if(path==="/platform/tenants")result={items:[{id:"legacy",slug:"legacy",name:"Đơn vị kiểm thử",status:"ACTIVE",data_scope:"LEGACY_SINGLE_ORGANIZATION",version:"1",created_at:date,updated_at:date,admin_count:17,member_count:17,subscription:null}],pagination:{page:1,limit:15,total:1}};
  else if(path==="/organization")result={name:"Đơn vị kiểm thử"};
  else if(path==="/platform/organization")result={id:"legacy",name:"Đơn vị kiểm thử",email:"contact@example.test",phone:"0123456789",address:"Hà Nội",version:1,updated_at:date,tenancy_mode:"single_organization"};
  else if(path==="/platform/admin-accounts"&&request.method==="GET") {
   status=accountError||200;let list=accounts;const q=url.searchParams.get("q")?.toLowerCase();const role=url.searchParams.get("role"),active=url.searchParams.get("is_active");if(q)list=list.filter(x=>`${x.username} ${x.display_name} ${x.email}`.toLowerCase().includes(q));if(role)list=list.filter(x=>x.role===role);if(active)list=list.filter(x=>String(x.is_active)===active);const page=Number(url.searchParams.get("page")||1),limit=Number(url.searchParams.get("limit")||15);result={items:list.slice((page-1)*limit,page*limit),pagination:{page,limit,total:list.length}};
  } else if(path==="/platform/admin-accounts"&&request.method==="POST") {
   const body=JSON.parse(request.postData);assert.ok(Object.keys(request.headers).some(key=>key.toLowerCase()==="idempotency-key"));writes.push({method:"POST",role:body.role});const created={...accounts[1],...body,id:"100",version:"1782500000001000",last_login_at:null};delete created.password;accounts.push(created);result=created;status=201;
  } else if(path.startsWith("/platform/admin-accounts/")&&request.method==="PATCH") {
   if(conflict){status=409;result={status:409,code:"VERSION_CONFLICT",title:"Version conflict"};}
   else {const body=JSON.parse(request.postData);const account=accounts.find(x=>x.id===path.split("/").at(-1));assert.equal(body.version,account.version);Object.assign(account,body,{version:String(BigInt(account.version)+1n)});writes.push({method:"PATCH"});result=account;}
  } else if(path==="/platform/audit-logs")result={items:[{id:"1",actor_id:"1",actor_name:"QA Super Admin",action:"POST",route:"/api/v1/platform/admin-accounts",entity_id:"100",created_at:date}],pagination:{page:1,limit:20,total:1}};
  else throw new Error(`Unexpected API call ${request.method} ${path}`);
  await send("Fetch.fulfillRequest",{requestId,responseCode:status,responseHeaders:[{name:"Content-Type",value:"application/json"},{name:"Access-Control-Allow-Origin",value:"*"},{name:"Access-Control-Allow-Headers",value:"Authorization,Content-Type,Idempotency-Key"},{name:"Access-Control-Allow-Methods",value:"GET,POST,PATCH,OPTIONS"}],body:Buffer.from(JSON.stringify(status>=400?(result.code?result:{title:"Forbidden",status,code:"FORBIDDEN"}):{data:result})).toString("base64")}).catch(error=>{if(!error.message.includes("Invalid InterceptionId"))throw error;});
 } catch(error){failure=error;}
});
async function evaluate(expression){const r=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
async function until(expression){for(let i=0;i<200;i++){if(failure)throw failure;if(await evaluate(expression))return;await new Promise(r=>setTimeout(r,100));}throw new Error(`Timeout: ${expression}`);}
async function visit(path,expected=path.split("?")[0]){await send("Page.navigate",{url:`http://localhost:3000${path}`});await until(`location.pathname===${JSON.stringify(expected)} && document.readyState==='complete'`);}
async function click(text,root="document"){await evaluate(`[...${root}.querySelectorAll('button')].find(x=>x.textContent.trim()===${JSON.stringify(text)}).click()`);}
async function fill(label,value){await evaluate(`(()=>{const label=[...document.querySelectorAll('label')].find(x=>x.textContent.startsWith(${JSON.stringify(label)}));const input=document.getElementById(label.htmlFor);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(value)});input.dispatchEvent(new Event('input',{bubbles:true}));})()`);}
async function screenshot(path){const {data}=await send("Page.captureScreenshot",{format:"png"});await fs.writeFile(path,Buffer.from(data,"base64"));}
try {
 await send("Page.enable");await send("Runtime.enable");await send("Fetch.enable",{patterns:[{urlPattern:"*/api/v1/*"}]});
 await send("Page.setInterceptFileChooserDialog",{enabled:true});
 await visit("/login");const token=`e30.${Buffer.from(JSON.stringify({exp:Date.now()/1000+3600})).toString("base64url")}.synthetic`;
 await evaluate(`sessionStorage.setItem('qlcv.access-token',${JSON.stringify(token)})`);await send("Page.addScriptToEvaluateOnNewDocument",{source:`sessionStorage.setItem('qlcv.access-token',${JSON.stringify(token)})`});
 await send("Emulation.setDeviceMetricsOverride",{width:1500,height:1100,deviceScaleFactor:1,mobile:false});
 await visit("/admin/platform-preview");await until("!!document.querySelector('.platform-shell')");
 for(const [section,title] of [["tenants","Tenant"],["plans","Gói cước"],["system","Hệ thống"]]) {await evaluate(`document.querySelector('.platform-sidebar nav a[href$="section=${section}"]').click()`);await until(`document.querySelector('h1')?.textContent===${JSON.stringify(title)}`);}
 assert.equal(calls.some(x=>x.path!=="/users/me"),false,"Preview must not call business/platform APIs");
 await visit("/platform");await until("document.body.innerText.includes('Bạn chưa được cấp quyền truy cập')");
 identity={...identity,role:"SUPER_ADMIN",account_scope:"platform",organization_id:null,username:"qa.root",actions:capabilities};
 await visit("/","/platform");await until("document.querySelectorAll('.platform-metrics article').length===4 && !!document.querySelector('.platform-account-ring')");
 await screenshot("/private/tmp/qlcv-platform-functional-overview.png");
 await visit("/platform?section=accounts");await until("document.querySelectorAll('tbody tr').length===15");
 await click("Sau");await until("document.querySelectorAll('tbody tr').length===3");await click("Trước");await until("document.querySelectorAll('tbody tr').length===15");
 assert.equal(await evaluate("[...document.querySelectorAll('tbody tr')][0].querySelectorAll('button')[3].disabled"),true,"Self deactivation disabled");
 await fill("Tìm tài khoản","admin2@example.test");await click("Tìm kiếm");await until("document.querySelectorAll('tbody tr').length===1");await click("Xóa bộ lọc");await until("document.querySelectorAll('tbody tr').length===15");
 await click("Tạo tài khoản");await until("!!document.querySelector('[role=dialog]')");
 await fill("Tên đăng nhập","invalid username");await click("Tạo tài khoản","document.querySelector('[role=dialog]')");await until("document.body.innerText.includes('Nhập tên hiển thị')");assert.equal(writes.length,0);
 await fill("Tên đăng nhập","new.admin");await fill("Tên hiển thị","Quản trị mới");await fill("Email","new@example.test");await fill("Mật khẩu ban đầu","Synthetic-safe-password-23");await click("Tạo tài khoản","document.querySelector('[role=dialog]')");await until("!document.querySelector('[role=dialog]') && document.body.innerText.includes('Đã tạo tài khoản quản trị')");assert.equal(writes.length,1);
 await screenshot("/private/tmp/qlcv-platform-functional-accounts.png");
 // A version conflict preserves draft and does not permit silent overwrite.
 conflict=true;await evaluate("[...document.querySelectorAll('tbody tr')][1].querySelectorAll('button')[2].click()");await until("document.querySelector('[role=dialog]')?.innerText.includes('Chỉnh sửa')");await fill("Tên hiển thị","Tên thay đổi");await click("Lưu thay đổi");await until("document.body.innerText.includes('Tài khoản đã thay đổi ở phiên khác')");await fill("Tên hiển thị","Bản nháp giữ lại");assert.equal(await evaluate("[...document.querySelectorAll('[role=dialog] button')].find(x=>x.textContent==='Lưu thay đổi').disabled"),true);
 await click("Hủy","document.querySelector('[role=dialog]')");await until("document.body.innerText.includes('Bỏ các thay đổi đang nhập?')");await click("Bỏ thay đổi");await until("!document.querySelector('[role=dialog]')");conflict=false;
 await evaluate("[...document.querySelectorAll('tbody tr')][1].querySelectorAll('button')[3].click()");await until("document.body.innerText.includes('Vô hiệu hóa tài khoản?')");await click("Vô hiệu hóa","document.querySelector('[role=dialog]')");await until("!document.querySelector('[role=dialog]') && document.body.innerText.includes('Đã vô hiệu hóa tài khoản')");assert.equal(writes.length,2);
 await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});
 assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth"),true,"Mobile page must not overflow");await screenshot("/private/tmp/qlcv-platform-functional-mobile.png");
 await visit("/platform?section=organizations");await until("document.body.innerText.includes('Đơn vị kiểm thử') && document.body.innerText.includes('Chưa gán gói')");
 await visit("/platform?section=audit");await until("document.querySelector('tbody')?.innerText.includes('QA Super Admin')");await click("Xem chi tiết");await until("document.body.innerText.includes('Chi tiết thao tác quản trị')");await click("Đóng");
 accountError=403;await visit("/platform?section=accounts");await until("document.body.innerText.includes('Bạn chưa được cấp quyền thực hiện thao tác này')");assert.equal(await evaluate("document.querySelectorAll('tbody tr').length"),0);accountError=0;
 identity={...identity,actions:{...capabilities,"platform.admins.manage":false}};
 await visit("/platform?section=accounts");await until("document.querySelectorAll('tbody tr').length>0");assert.equal(await evaluate("[...document.querySelectorAll('button')].find(x=>x.textContent==='Tạo tài khoản').disabled"),true);assert.equal(await evaluate("[...document.querySelectorAll('tbody button')].some(x=>x.textContent==='Sửa')"),false);
 const before=calls.filter(x=>x.path.startsWith('/platform/admin-accounts')).length;
 identity={...identity,actions:{...identity.actions,"platform.admins.read":false}};
 await visit("/platform?section=accounts");await until("document.body.innerText.includes('Bạn chưa được cấp quyền xem hạng mục này')");assert.equal(calls.filter(x=>x.path.startsWith('/platform/admin-accounts')).length,before);
 await visit("/users");await until("document.body.innerText.includes('Bạn chưa được cấp quyền truy cập')");
 console.log("PASS synthetic platform UI: preview isolation, URL navigation, summary/chart, pagination, search, validation/create, conflict/draft protection, status confirmation, mobile layout, organization, audit detail, 403 and role/capability denials");
} finally {await send("Fetch.disable");ws.close();}
