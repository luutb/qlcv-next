// Read-only live UI verification after explicit local account provisioning.
// Requires PLATFORM_LIVE_CREDENTIALS_FILE pointing to an operator-owned0600 JSON file.
// Credentials/tokens never appear in test output or screenshots.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const path=process.env.PLATFORM_LIVE_CREDENTIALS_FILE;
if(!path)throw new Error("Set PLATFORM_LIVE_CREDENTIALS_FILE for local-only live verification");
const apiBase=process.env.PLATFORM_LIVE_API_BASE_URL ?? "http://localhost:8083/api/v1";
const credentials=JSON.parse(await fs.readFile(path,"utf8"));
const root=credentials.accounts.find(x=>x.role==="SUPER_ADMIN"),admin=credentials.accounts.find(x=>x.role==="ADMIN");
if(!root||!admin)throw new Error("Both local roles are required");
async function tokenFor(account){const response=await fetch(`${apiBase}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:account.username,password:account.password})});assert.equal(response.status,200,"Local login must succeed");return(await response.json()).data.token;}
const rootToken=await tokenFor(root),adminToken=await tokenFor(admin);
const targets=await(await fetch("http://127.0.0.1:9222/json/list")).json();const target=targets.find(x=>x.type==="page");if(!target)throw new Error("No Chrome test page");
const ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(resolve=>ws.addEventListener("open",resolve,{once:true}));let seq=0;const pending=new Map();
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
ws.addEventListener("message",({data})=>{const message=JSON.parse(data);if(message.id){const task=pending.get(message.id);pending.delete(message.id);if(message.error)task?.reject(new Error(JSON.stringify(message.error)));else task?.resolve(message.result);}});
async function evaluate(expression){const result=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw new Error("Browser evaluation failed");return result.result.value;}
async function until(expression){for(let i=0;i<150;i++){if(await evaluate(expression))return;await new Promise(resolve=>setTimeout(resolve,100));}throw new Error(`Timeout: ${expression}`);}
let bootstrap;
async function setToken(token){if(bootstrap)await send("Page.removeScriptToEvaluateOnNewDocument",{identifier:bootstrap});bootstrap=(await send("Page.addScriptToEvaluateOnNewDocument",{source:`sessionStorage.setItem('qlcv.access-token',${JSON.stringify(token)});`})).identifier;}
async function visit(url){await send("Page.navigate",{url:`http://localhost:3000${url}`});}
try{
 await send("Page.enable");await send("Runtime.enable");await send("Fetch.disable");await send("Emulation.setDeviceMetricsOverride",{width:1500,height:1100,deviceScaleFactor:1,mobile:false});
 await setToken(rootToken);await visit("/platform");await until("location.pathname==='/platform' && !!document.querySelector('.platform-account-ring')");
 assert.equal(await evaluate("document.querySelectorAll('.platform-metrics article').length"),4);
 await visit("/platform?section=accounts");await until("!!document.querySelector('tbody tr')");
 await evaluate("(()=>{const label=[...document.querySelectorAll('label')].find(x=>x.textContent==='Tìm tài khoản');const input=document.getElementById(label.htmlFor);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'admin.local');input.dispatchEvent(new Event('input',{bubbles:true}));})()");
 await evaluate("[...document.querySelectorAll('button')].find(x=>x.textContent==='Tìm kiếm').click()");await until("document.querySelector('tbody')?.innerText.includes('Admin Local')");
 assert.equal(await evaluate("document.querySelector('tbody').innerText.includes('Super Admin')"),true);
 await visit("/platform?section=tenants");await until("!!document.querySelector('.tenant-name-link')");
 await evaluate("document.querySelector('.tenant-name-link').click()");await until("!!document.querySelector('.tenant-detail-tabs')");
 await evaluate("[...document.querySelectorAll('.tenant-detail-tabs a')].find(x=>x.textContent==='Tài nguyên').click()");await until("!!document.querySelector('.tenant-resource-grid')");
 assert.equal(await evaluate("document.querySelector('.tenant-resource-grid').innerText.includes('Dung lượng đã ghi nhận')"),true);
 await evaluate("[...document.querySelectorAll('.tenant-detail-tabs a')].find(x=>x.textContent==='Gói cước').click()");await until("document.body.innerText.includes('Tenant chưa được gán gói cước')");
 await visit("/platform?section=plans");await until("document.body.innerText.includes('0 gói cước')");
 await visit("/platform?section=audit");await until("!!document.querySelector('tbody tr')");
 await visit("/platform?section=settings");await until("document.querySelectorAll('.platform-rights .platform-badge.active').length===10");
 await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:true});assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth"),true);
 await setToken(adminToken);await visit("/platform");await until("document.body.innerText.includes('Bạn chưa được cấp quyền truy cập')");
 await visit("/admin");await until("document.querySelector('h1')?.textContent==='Quản trị nghiệp vụ'");
 await setToken(rootToken);await visit("/admin");await until("document.body.innerText.includes('Bạn chưa được cấp quyền truy cập')");
 await visit("/platform");await until("!!document.querySelector('.platform-account-ring')");
 console.log("PASS live backend + browser: real role logins, platform landing, summary, account search, tenant list/detail/resources/unassigned plan, empty plan catalog, audit,10 effective rights, mobile and bidirectional role denial");
}finally{if(bootstrap)await send("Page.removeScriptToEvaluateOnNewDocument",{identifier:bootstrap});await evaluate("sessionStorage.removeItem('qlcv.access-token')").catch(()=>{});ws.close();}
