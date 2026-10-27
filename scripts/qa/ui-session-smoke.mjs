// Browser smoke with synthetic API responses; never uses production credentials.
// Requires Chrome CDP on :9222 and Next dev on http://localhost:3000.
import fs from 'node:fs/promises';
const targets = await (await fetch('http://127.0.0.1:9222/json/list')).json();
const target = targets.find(t => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, {once:true}));
let seq=0; const pending=new Map();
ws.addEventListener('message', async event => {
 const m=JSON.parse(event.data);
 if(m.id){const p=pending.get(m.id); if(p){pending.delete(m.id); if(m.error) p.reject(m.error); else p.resolve(m.result);} }
 if(m.method==='Fetch.requestPaused') {
  const {requestId,request}=m.params; const url=new URL(request.url);
  let payload={data:[]},status=200;
  if(url.pathname.endsWith('/users/me')) payload={data:{id:'u1',organization_id:'o1',username:'Nguyễn Minh Anh',email:'anh@example.test',role:'PARTNER',is_active:true,mfa_enabled:false,version:1}};
  else if(url.pathname.endsWith('/projects'))payload={data:[],pagination:{total:0,limit:5,offset:0,count:0}};
  else if(url.pathname.endsWith('/auth/login'))payload={access_token:token(Date.now()/1000+3600)};
  else if(url.pathname.endsWith('/teams'))payload={data:[{id:'t1',name:'Tư vấn doanh nghiệp',description:'Đồng hành cùng doanh nghiệp trong các vấn đề pháp lý và vận hành.',is_active:true,member_count:8},{id:'t2',name:'Hồ sơ & hợp đồng',description:'Rà soát hợp đồng, quản lý hồ sơ và phối hợp xử lý công việc.',is_active:true,member_count:5},{id:'t3',name:'Tranh tụng',description:'Phối hợp giải quyết tranh chấp và chuẩn bị hồ sơ tố tụng.',is_active:false,member_count:4}]};
  else if(url.pathname.endsWith('/members'))payload={data:[{user_id:'u1',username:'Nguyễn Minh Anh',email:'anh@example.test',team_role:'LEADER',is_active:true}]};
  if(globalThis.force401 && !url.pathname.endsWith('/auth/login')){status=401;payload={title:'Unauthorized',status:401};}
  await send('Fetch.fulfillRequest',{requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:'*'},{name:'Access-Control-Allow-Headers',value:'Authorization,Content-Type,Idempotency-Key'},{name:'Access-Control-Allow-Methods',value:'GET,POST,PUT,PATCH,DELETE,OPTIONS'}],body:Buffer.from(JSON.stringify(payload)).toString('base64')});
 }
});
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(expression){for(let i=0;i<100;i++){if(await evaluate(expression))return;await pause(150);}throw Error('Timeout '+expression);}
function token(exp){return 'e30.'+Buffer.from(JSON.stringify({exp})).toString('base64url')+'.signature';}
async function navigate(path){await send('Page.navigate',{url:'http://localhost:3000'+path});await pause(600);}
async function screenshot(name){await evaluate('document.fonts.ready');const r=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile('/private/tmp/'+name+'.png',Buffer.from(r.data,'base64'));}
await send('Page.enable');await send('Runtime.enable');
await navigate('/login');await until('!!document.querySelector("#username")');
await evaluate('sessionStorage.clear()');await navigate('/teams?x=1');
await until('location.pathname === "/login" && !!document.querySelector("#username")');
console.log('PASS missing session redirects to login',await evaluate('location.search'));
await screenshot('qlcv-login-desktop');
await send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});
await screenshot('qlcv-login-mobile');
if(await evaluate('document.documentElement.scrollWidth > innerWidth'))throw Error('Mobile login overflow');
await evaluate(`sessionStorage.setItem('qlcv.access-token',${JSON.stringify(token(Date.now()/1000-60))})`);
await navigate('/teams');await until('location.pathname === "/login" && document.body.innerText.includes("Phiên đăng nhập đã hết hạn")');
console.log('PASS expired JWT redirects with notice');
await send('Fetch.enable',{patterns:[{urlPattern:'*/api/v1/*'}]});
await evaluate(`document.querySelector('#username').value = 'demo'; document.querySelector('#password').value = 'demo'; document.querySelector('.auth-password-toggle').click();`);
if (await evaluate(`document.querySelector('#password').type`) !== 'text') throw Error('Password reveal failed');
await evaluate(`document.querySelector('.login-form').requestSubmit()`);
await until('location.pathname === "/teams"');
console.log('PASS login restores requested page and password reveal');
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await navigate('/teams');await until('document.querySelectorAll(".team-card").length === 3 && document.body.innerText.includes("Tư vấn doanh nghiệp")');
await screenshot('qlcv-teams-desktop');console.log('PASS authenticated team cards (mock API)');
await evaluate('document.querySelector(".team-card h2 button").click()');await until('document.querySelector("[role=dialog]")?.innerText.includes("Nguyễn Minh Anh")');
await evaluate('[...document.querySelectorAll("[role=dialog] button")].find(b=>b.innerText==="Đóng").click()');
await send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await pause(200);await screenshot('qlcv-teams-mobile');
await evaluate('document.querySelector(".workspace-nav-toggle").click()');
if (!await evaluate('document.querySelector(".workspace-nav-toggle").getAttribute("aria-expanded") === "true" && getComputedStyle(document.querySelector(".workhub-nav")).display === "grid"')) throw Error('Mobile navigation failed');
await evaluate('document.querySelector(".workspace-nav-toggle").click()');
if(await evaluate('document.documentElement.scrollWidth > innerWidth'))throw Error('Mobile teams overflow');
console.log('PASS members dialog and mobile overflow');
globalThis.force401=true;
await evaluate('[...document.querySelectorAll("button")].find(b=>b.innerText==="Tải lại").click()');
await until('location.pathname === "/login" && !!document.querySelector("#username")');console.log('PASS API 401 redirects to login');
globalThis.force401=false;
await evaluate(`sessionStorage.setItem('qlcv.access-token',${JSON.stringify(token(Date.now()/1000+4))})`);
await navigate('/teams');await until('location.pathname === "/login"');console.log('PASS automatic expiry during use');
await send('Fetch.disable');await send('Emulation.clearDeviceMetricsOverride');ws.close();
