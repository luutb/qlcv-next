import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
const port=9347,origin='http://localhost:3102';
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--no-first-run','--no-default-browser-check','--disable-background-networking',`--remote-debugging-port=${port}`,`--user-data-dir=/private/tmp/qlcv-entitlement-chrome-${Date.now()}`,'about:blank'],{stdio:'ignore'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
let ws,seq=0;const pending=new Map();let profile,createdPlan,posted;
const errors=[];
const token=`e30.${Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600})).toString('base64url')}.test-only`;
function subscription(status='ACTIVE',ends=Date.now()+3600000){return {plan_id:'00000000-0000-0000-0000-000000000001',plan_code:'QA_PLAN',plan_name:'Gói kiểm thử',status,features:['projects','tasks'],starts_at:new Date(Date.now()-60000).toISOString(),ends_at:new Date(ends).toISOString(),members_limit:10,projects_limit:20,storage_bytes_limit:1024**3,version:'1:1'};}
function tenant(status='ACTIVE',ends){return {id:'900',organization_id:'legacy',account_scope:'organization',username:'qa.fixture',email:'',role:'ADMIN',is_active:true,mfa_enabled:false,version:1,subscription:subscription(status,ends),actions:{'projects.read':true,'tasks.access':true}};}
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(result.exceptionDetails.text);return result.result.value;}
async function until(expression){for(let i=0;i<120;i++){if(await evaluate(`Boolean(${expression})`))return;await pause(100);}throw Error(`Timed out: ${expression}`);}
async function screenshot(name){const {data}=await send('Page.captureScreenshot',{format:'png'});await writeFile(`/private/tmp/${name}.png`,Buffer.from(data,'base64'));}
try{
 let target;
 for(let i=0;i<150;i++){try{target=await(await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();break;}catch{await pause(100);}}
 assert.ok(target,'Chrome did not start');ws=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 ws.addEventListener('message',async({data})=>{
  const m=JSON.parse(data);if(m.id){const task=pending.get(m.id);pending.delete(m.id);if(m.error){task?.reject(Error(m.error.message));}else{task?.resolve(m.result);}}
  if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);
  if(m.method!=='Fetch.requestPaused')return;
  const {requestId,request}=m.params;const url=new URL(request.url);
  try{
   if(url.origin===origin && !url.pathname.includes('/api/')){await send('Fetch.continueRequest',{requestId});return;}
   const path=url.pathname.replace(/^.*\/api\/v1/,'');let result={data:[]};
   if(path==='/users/me')result={data:profile};
   if(path==='/platform/plans' && request.method==='POST'){
    posted=JSON.parse(request.postData);createdPlan={...posted,id:'00000000-0000-0000-0000-000000000002',features_configured:true,version:'1',created_at:new Date().toISOString(),updated_at:new Date().toISOString()};result={data:createdPlan};
   }else if(path==='/platform/plans')result={data:{items:createdPlan?[createdPlan]:[],pagination:{page:1,limit:25,total:createdPlan?1:0}}};
   await send('Fetch.fulfillRequest',{requestId,responseCode:request.method==='OPTIONS'?204:200,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:origin},{name:'Access-Control-Allow-Headers',value:'Authorization,Content-Type,Accept,Idempotency-Key'},{name:'Access-Control-Allow-Methods',value:'GET,POST,PUT,PATCH,DELETE,OPTIONS'}],body:Buffer.from(JSON.stringify(result)).toString('base64')});
  }catch(error){errors.push(error.message);}
 });
 await send('Page.enable');await send('Runtime.enable');await send('Fetch.enable',{patterns:[{urlPattern:'http*://*/*',requestStage:'Request'}]});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`if(location.origin===${JSON.stringify(origin)})sessionStorage.setItem('qlcv.access-token',${JSON.stringify(token)});`});
 profile=tenant('EXPIRED',Date.now()-1000);
 await send('Page.navigate',{url:origin+'/work'});await until(`location.pathname==='/subscription' && document.body.innerText.includes('Nghiệp vụ đang bị chặn')`);console.log('PASS: expired plan redirects work to subscription status');
 profile=tenant();await send('Page.navigate',{url:origin+'/subscription'});await until(`document.body.innerText.includes('Gói đang có hiệu lực')`);
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await until(`document.documentElement.scrollWidth <= document.documentElement.clientWidth`);await screenshot('qlcv-subscription-mobile');console.log('PASS: active subscription renders on mobile without horizontal overflow');
 profile=tenant('ACTIVE',Date.now()+2000);await send('Page.navigate',{url:origin+'/subscription'});await until(`document.body.innerText.includes('Gói đang có hiệu lực')`);await until(`document.body.innerText.includes('Nghiệp vụ đang bị chặn')`);console.log('PASS: local expiry boundary blocks stale capability state');
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});
 profile={...tenant(),organization_id:null,account_scope:'platform',role:'SUPER_ADMIN',subscription:null,actions:Object.fromEntries(['access','plans.read','plans.manage'].map(k=>['platform.'+k,true]))};
 await send('Page.navigate',{url:origin+'/platform?section=plans'});await until(`Array.from(document.querySelectorAll('button')).some(b=>b.textContent.includes('Tạo gói cước'))`);
 await evaluate(`Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Tạo gói cước')).click()`);
 await until(`document.querySelector('[role="dialog"] input')`);
 await evaluate(`(()=>{const dialog=document.querySelector('[role="dialog"]');for(const [label,value] of [['Mã gói','QA_PLAN'],['Tên gói','Gói kiểm thử']]){const l=Array.from(dialog.querySelectorAll('label')).find(l=>l.textContent.includes(label));const input=document.getElementById(l.htmlFor);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));}Array.from(dialog.querySelectorAll('label')).find(l=>l.textContent.includes('Dự án và mốc')).querySelector('input').click();})()`);
 await screenshot('qlcv-plan-features');
 await evaluate(`document.querySelector('[role="dialog"] button[type="submit"]').click()`);
 for(let i=0;i<60 && !posted;i++)await pause(100);
 assert.deepEqual(posted?.features,['projects']);assert.equal(posted?.limits.members,null);assert.equal(Object.hasOwn(posted,'features_configured'),false);
 assert.deepEqual(errors,[]);console.log('PASS: plan editor sends selected features and preserves unset quotas');
 console.log('Screenshots: /private/tmp/qlcv-subscription-mobile.png, /private/tmp/qlcv-plan-features.png');
}finally{ws?.close();chrome.kill('SIGTERM');}
