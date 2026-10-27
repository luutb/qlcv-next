// Synthetic API browser regression; never uses application credentials or writes real data.
// Requires Next on localhost:3000, Node 22+ and Chrome CDP on 127.0.0.1:9222.
import fs from 'node:fs/promises';
const targets=await (await fetch('http://127.0.0.1:9222/json/list')).json();
const target=targets.find(t=>t.type==='page');
const ws=new WebSocket(target.webSocketDebuggerUrl); await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let seq=0; const pending=new Map(); let failure;
const team={id:'11',name:'QA tư vấn',description:'Nhóm kiểm thử',is_active:true,member_count:1,leader_id:'1'};
let members=[{user_id:'1',username:'qa1',display_name:'QA Một',email:'one@example.test',team_role:'LEADER',is_active:true}];
let role='PARTNER', blockArchive=false, blockRemove=false, failUsers=false, failMembers=false;
const writes=[];
const users=[{id:1,username:'qa1',full_name:'QA Một',email:'one@example.test'},{id:2,username:'qa2',full_name:'QA Hai',email:'two@example.test'}];
const token='e30.'+Buffer.from(JSON.stringify({exp:Date.now()/1000+3600})).toString('base64url')+'.test';
ws.addEventListener('message',async event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id); if(p){pending.delete(m.id); if(m.error)p.reject(m.error);else p.resolve(m.result);}}
 if(m.method==='Fetch.requestPaused')try{
 const {requestId,request}=m.params; const url=new URL(request.url);let payload={data:[]},status=200; const method=request.method;
 const body=request.postData?JSON.parse(request.postData):{};
 if(method==='OPTIONS'){}
 else if(url.pathname.endsWith('/users/me'))payload={data:{id:'1',organization_id:'o1',username:'qa1',email:'one@example.test',role,is_active:true,mfa_enabled:false,version:1}};
 else if(url.pathname.endsWith('/users/simple')){if(failUsers){status=500;payload={status:500,title:'Unavailable'};}else payload={data:{success:true,data:{users,total:2,page:1,limit:100}}};}
 else if(url.pathname.endsWith('/projects')){payload={data:[]};}
 else if(url.pathname.endsWith('/teams') && method==='GET')payload={data:team.is_active||url.searchParams.get('include_inactive')==='true'?[{...team,member_count:members.length}]:[]};
 else if(url.pathname.endsWith('/teams') && method==='POST'){writes.push({method,body});if(body.leader_id!==null && typeof body.leader_id!=='number')throw Error('leader_id must be numeric');payload={data:{...team,...body,id:'12'}};}
 else if(url.pathname.endsWith('/teams/11') && method==='DELETE'){writes.push({method,body});if(blockArchive){status=409;payload={status,code:'TEAM_HAS_OPEN_PROJECTS'};}else {team.is_active=false;payload={message:'Archived'};}}
 else if(url.pathname.endsWith('/teams/11') && method==='PUT'){writes.push({method,body});if(body.leader_id!==null && body.leader_id!==undefined && typeof body.leader_id!=='number')throw Error('leader_id must be numeric');Object.assign(team,body);payload={data:team};}
 else if(url.pathname.endsWith('/members') && method==='GET'){if(failMembers){status=500;payload={status,title:'Unavailable'};}else payload={data:members};}
 else if(url.pathname.endsWith('/members') && method==='POST'){writes.push({method,body});if(typeof body.user_id!=='number')throw Error('user_id must be numeric');const user=users.find(u=>u.id===body.user_id);const member={user_id:String(user.id),username:user.username,display_name:user.full_name,email:user.email,team_role:body.team_role,is_active:true};
 if(body.team_role==='LEADER'){members=members.map(m=>({...m,team_role:m.team_role==='LEADER'?'MEMBER':m.team_role}));team.leader_id=String(body.user_id);}
 members=members.filter(m=>m.user_id!==String(body.user_id)).concat(member);payload={data:member};}
 else if(/\/members\/\d+$/.test(url.pathname) && method==='DELETE'){writes.push({method,body});if(blockRemove){status=409;payload={status,code:'TEAM_MEMBER_HAS_OPEN_TASKS'};}else{members=members.filter(m=>m.user_id!==url.pathname.split('/').at(-1));payload={message:'Removed'};}}
 await send('Fetch.fulfillRequest',{requestId,responseCode:status,responseHeaders:[{name:'Content-Type',value:'application/json'},{name:'Access-Control-Allow-Origin',value:'*'},{name:'Access-Control-Allow-Headers',value:'Authorization,Content-Type,Idempotency-Key'},{name:'Access-Control-Allow-Methods',value:'GET,POST,PUT,DELETE,OPTIONS'}],body:Buffer.from(JSON.stringify(payload)).toString('base64')});
 }catch(err){failure=err;console.error(err);}
});
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(expression){for(let i=0;i<100;i++){if(failure)throw failure;if(await evaluate(`Boolean(${expression})`))return;await pause(100);}throw Error('Timeout: '+expression);}
const dialog='[...document.querySelectorAll("[role=dialog]")].at(-1)';
async function click(text,scope='document'){await evaluate(`(()=>{const b=[...${scope}.querySelectorAll('button')].find(b=>b.innerText.trim()===${JSON.stringify(text)});if(!b)throw Error('No button '+${JSON.stringify(text)});b.click()})()`);await pause(150);}
async function aria(label){await evaluate(`document.querySelector('button[aria-label=${JSON.stringify(label)}]').click()`);await pause(150);}
async function input(label,value){await evaluate(`(()=>{const input=[...document.querySelectorAll('input')].find(e=>e.labels?.[0]?.innerText.includes(${JSON.stringify(label)}));if(!input)throw Error('No input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(value)});input.dispatchEvent(new Event('input',{bubbles:true}));})()`);}
async function chooseUser(name){await evaluate(`${dialog}.querySelector('input[role=combobox]').focus()`);await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowDown',code:'ArrowDown',windowsVirtualKeyCode:40});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowDown',code:'ArrowDown',windowsVirtualKeyCode:40});await until('!!document.querySelector("[role=option]")');await evaluate(`[...document.querySelectorAll('[role=option]')].find(e=>e.innerText.includes(${JSON.stringify(name)})).click()`);}
async function chooseRole(label){await evaluate(`${dialog}.querySelector('[role=combobox]').dispatchEvent(new MouseEvent('mousedown',{bubbles:true,button:0}))`);await until('!!document.querySelector("[role=option]")');await evaluate(`[...document.querySelectorAll('[role=option]')].find(e=>e.innerText===${JSON.stringify(label)}).click()`);}
async function screenshot(name){const r=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile('/private/tmp/'+name+'.png',Buffer.from(r.data,'base64'));}
await send('Page.enable');await send('Runtime.enable');await send('Fetch.enable',{patterns:[{urlPattern:'*/api/v1/*'}]});
await send('Page.navigate',{url:'http://localhost:3000/login'});await until('location.pathname==="/login"');
await evaluate(`sessionStorage.setItem('qlcv.access-token',${JSON.stringify(token)})`);
await send('Page.navigate',{url:'http://localhost:3000/teams'});await until('document.querySelectorAll(".team-card").length===1');
await click('Xem nhóm');await until('document.body.innerText.includes("QA Một")');
failUsers=true;await click('Thêm thành viên');await until('document.body.innerText.includes("Máy chủ đang gặp sự cố")');
if(!await evaluate(`[...${dialog}.querySelectorAll('button')].find(b=>b.innerText==='Thêm thành viên').disabled`))throw Error('Failed user list allowed submit');
failUsers=false;await click('Thử lại',dialog);await chooseUser('QA Hai');await click('Thêm thành viên',dialog);await until('document.body.innerText.includes("Đã thêm thành viên vào nhóm")');
if(members.length!==2 || writes.at(-1).body.user_id!==2)throw Error('Add transport');console.log('PASS user loading error/retry, keyboard selector, numeric add, member list/count refresh');
await aria('Đổi vai trò qa2');await chooseRole('Trưởng nhóm');await click('Lưu vai trò',dialog);await until('document.body.innerText.includes("Đã cập nhật vai trò thành viên")');
if(team.leader_id!=='2'||members.find(m=>m.user_id==='1').team_role!=='MEMBER')throw Error('Leader state');console.log('PASS role change with leadership');
blockRemove=true;await aria('Xóa qa2 khỏi nhóm');await click('Xóa khỏi nhóm',dialog);await until('document.body.innerText.includes("Thành viên còn công việc chưa hoàn tất")');
blockRemove=false;await click('Xóa khỏi nhóm',dialog);await until('document.body.innerText.includes("Đã xóa thành viên khỏi nhóm")');console.log('PASS removal confirmation, conflict message, retry and list refresh');
await click('Đóng',dialog);await until('!document.querySelector("[role=dialog]")');
await click('Sửa');await input('Tên đội nhóm','QA tư vấn mới');await click('Lưu đội nhóm',dialog);await until('document.querySelector(".team-card h2").innerText==="QA tư vấn mới"');console.log('PASS edit name');
await click('Tạo đội nhóm');await input('Tên đội nhóm','Nhóm mới');await chooseUser('QA Một');await click('Lưu đội nhóm',dialog);await until('!document.querySelector("[role=dialog]")');if(writes.at(-1).body.leader_id!==1)throw Error('Leader numeric transport');console.log('PASS create with numeric leader');
await click('Ngừng hoạt động');const before=writes.length;await click('Hủy',dialog);if(writes.length!==before)throw Error('Cancel wrote data');
blockArchive=true;await click('Ngừng hoạt động');await click('Ngừng hoạt động',dialog);await until('document.body.innerText.includes("Nhóm còn dự án đang hoạt động")');
blockArchive=false;await click('Ngừng hoạt động',dialog);await until('!document.querySelector(".team-card")');
await evaluate('document.querySelector("input[type=checkbox]").click()');await until('document.querySelector(".team-card.is-inactive")');
await click('Xem nhóm');await until('document.body.innerText.includes("Kích hoạt lại nhóm để quản lý thành viên")');if(await evaluate(`${dialog}.innerText.includes('Thêm thành viên')`))throw Error('Inactive add exposed');await click('Đóng',dialog);
await click('Kích hoạt lại');await click('Kích hoạt lại',dialog);await until('document.querySelector(".team-card:not(.is-inactive)")');console.log('PASS archive cancel/conflict/retry/filter/inactive restrictions/reactivation');
await send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await screenshot('qlcv-team-management-mobile');
if(await evaluate('document.documentElement.scrollWidth > innerWidth'))throw Error('Mobile page overflow');
await click('Xem nhóm');await screenshot('qlcv-team-members-mobile');if(await evaluate('document.querySelector(".MuiDialog-paper").getBoundingClientRect().width > innerWidth'))throw Error('Mobile dialog overflow');if(await evaluate(`[...${dialog}.querySelectorAll('button[aria-label]')].some(b=>b.getBoundingClientRect().right>innerWidth)`))throw Error('Mobile member actions offscreen');await click('Thêm thành viên',dialog);await until('document.body.innerText.includes("Chọn thành viên")');await click('Hủy',dialog);await click('Đóng',dialog);console.log('PASS mobile width 375 page, member actions and add dialog');
role='LAWYER';await send('Page.navigate',{url:'http://localhost:3000/teams'});await until('document.querySelector(".team-card") && !document.body.innerText.includes("Tạo đội nhóm")');await click('Xem nhóm');await until('document.body.innerText.includes("Thao tác quản lý dành cho quản trị viên")');
if(await evaluate(`${dialog}.innerText.includes('Thêm thành viên') || ${dialog}.innerText.includes('Đổi vai trò')`))throw Error('Read-only management exposed');console.log('PASS read-only user hides management actions');
await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await screenshot('qlcv-team-management-readonly');
await send('Fetch.disable');ws.close();console.log('PASS all team browser smoke checks (synthetic API)');
