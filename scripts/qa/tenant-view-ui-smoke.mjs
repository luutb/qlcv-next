// Synthetic API fixtures. Requires local frontend :3000 and Chrome CDP :9222.
import assert from "node:assert/strict";
const target = await (await fetch("http://127.0.0.1:9222/json/new?about:blank", { method: "PUT" })).json();
if (!target) throw new Error("No Chrome test page");
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));
let seq = 0, failure, bootstrap, plan, subscription, session, closed = false, shortSession = false;
const pending = new Map(), writes = [], calls = [];
const capabilities = Object.fromEntries(["access", "overview.read", "organizations.read", "admins.read", "admins.manage", "audit.read", "tenants.read", "tenants.manage", "plans.read", "plans.manage"].map((action) => [`platform.${action}`, true]));
const date = "2026-10-26T08:00:00Z";
const usage = { tenant_id: "legacy", measured_at: date, members_total: 3, members_active: 2, admins_total: 1, projects_total: 1, projects_active: 1, tasks_total: 1, customers_total: 1, teams_total: 1, documents_total: 0, unavailable_resources: [], storage: { recorded_bytes: 0, object_count: 0, measurement: "DATABASE_REFERENCED_OBJECTS", key_size_conflicts: 0, unknown_size_objects: 0, is_complete: true, unavailable_sources: [] }, quota_enforcement: "ENFORCED" };
const tenant = () => ({ id: "legacy", slug: "legacy", name: "Đơn vị kiểm thử", status: "ACTIVE", data_scope: "LEGACY_SINGLE_ORGANIZATION", version: "1", created_at: date, updated_at: date, admin_count: 1, member_count: 3, subscription: subscription ?? null });
function send(method, params = {}) { return new Promise((resolve, reject) => { const id = ++seq; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); }); }
ws.addEventListener("message", async ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) { const task = pending.get(message.id); pending.delete(message.id); if (message.error) task?.reject(new Error(JSON.stringify(message.error))); else task?.resolve(message.result); }
  if (message.method !== "Fetch.requestPaused") return;
  const { requestId, request } = message.params;
  try {
    const url = new URL(request.url), path = url.pathname.replace(/^.*\/api\/v1/, "");
    calls.push(`${request.method} ${path}`);
    let result, status = 200;
    if (request.method === "OPTIONS") result = {};
    else if (path === "/users/me") result = { id: "1", username: "qa.root", email: "qa@example.test", role: "SUPER_ADMIN", account_scope: "platform", organization_id: null, is_active: true, mfa_enabled: false, version: 1, actions: capabilities };
    else if (path === "/platform/summary") result = { organization_count: 1, admin_count: 1, super_admin_count: 1, active_admin_count: 2, audit_event_count: 2 };
    else if (path === "/platform/tenants") result = { items: [tenant()], pagination: { page: 1, limit: Number(url.searchParams.get("limit")), total: 1 } };
    else if (path === "/platform/tenants/legacy") result = { ...tenant(), contact: { email: "qa@example.test", phone: "", address: "" }, admins: [], usage };
    else if (path === "/platform/audit-logs") result = { items: [], pagination: { page: 1, limit: Number(url.searchParams.get("limit")), total: 0 } };
    else if (path === "/platform/plans" && request.method === "GET") { const items = plan && url.searchParams.get("is_active") !== "false" ? [plan] : []; result = { items, pagination: { page: 1, limit: Number(url.searchParams.get("limit")), total: items.length } }; }
    else if (path === "/platform/plans" && request.method === "POST") { writes.push("plan"); plan = { ...JSON.parse(request.postData), features_configured: true, id: "ad23bc7a-8b15-41ce-a5bc-cdffcc5fb717", version: "1", created_at: date, updated_at: date }; result = plan; }
    else if (path === "/platform/tenants/legacy/subscription" && request.method === "PUT") { writes.push("subscription"); const body = JSON.parse(request.postData); assert.equal(body.plan_id, plan.id); result = subscription = { ...body, id: "sub", tenant_id: "legacy", plan, configured_status: body.status, version: "1", created_at: date, updated_at: date }; }
    else if (path === "/platform/tenants/legacy/view-sessions" && request.method === "POST") { writes.push("open"); closed = false; result = session = { id: crypto.randomUUID(), tenant_id: "legacy", created_at: new Date().toISOString(), expires_at: new Date(Date.now() + (shortSession ? 10000 : 900000)).toISOString() }; }
    else if (path.endsWith(`/view-sessions/${session?.id}`) && request.method === "DELETE") { closed = true; writes.push("close"); result = { closed: true }; }
    else if (path.includes("/view-sessions/") && request.method === "GET") { const resource = path.split("/").at(-1); assert.equal(closed, false); result = { tenant_id: "legacy", session_id: session.id, resource, columns: [{ key: "id", label: "ID" }, { key: "name", label: "Tên" }, { key: "description", label: "Mô tả" }], items: [{ id: "1", name: `QA ${resource}`, description: "<img src=x onerror=window.xss=true>" }], pagination: { page: 1, limit: 15, total: 1 }, unavailable_fields: [] }; }
    else throw new Error(`Unexpected API: ${request.method} ${path}`);
    await send("Fetch.fulfillRequest", { requestId, responseCode: status, responseHeaders: [{ name: "Content-Type", value: "application/json" }, { name: "Access-Control-Allow-Origin", value: "*" }, { name: "Access-Control-Allow-Headers", value: "Authorization,Content-Type,Idempotency-Key" }, { name: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" }], body: Buffer.from(JSON.stringify({ data: result })).toString("base64") });
  } catch (error) { if (error.message.includes("Invalid InterceptionId")) return; failure = error; await send("Fetch.failRequest", { requestId, errorReason: "Failed" }).catch(() => {}); }
});
async function evaluate(expression) { const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails)); return result.result.value; }
async function until(expression) { for (let i = 0; i < 150; i++) { if (failure) throw failure; if (await evaluate(expression)) return; await new Promise((resolve) => setTimeout(resolve, 100)); } throw new Error(`Timeout: ${expression}`); }
async function click(text) { await evaluate(`[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===${JSON.stringify(text)}).click()`); }
async function visit(path) { await send("Page.navigate", { url: `http://localhost:3000${path}` }); }
async function fill(label, value) { await evaluate(`(()=>{const label=[...document.querySelectorAll('label')].find(x=>x.textContent.startsWith(${JSON.stringify(label)}));const input=document.getElementById(label.htmlFor);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(value)});input.dispatchEvent(new Event('input',{bubbles:true}));})()`); }
try {
  await send("Page.enable"); await send("Runtime.enable"); await send("Fetch.enable", { patterns: [{ urlPattern: "*/api/v1/*" }] });
  const token = `e30.${Buffer.from(JSON.stringify({ exp: Date.now() / 1000 + 3600 })).toString("base64url")}.synthetic`;
  bootstrap = (await send("Page.addScriptToEvaluateOnNewDocument", { source: `sessionStorage.setItem('qlcv.access-token',${JSON.stringify(token)})` })).identifier;
  await visit("/platform"); await until("document.body.innerText.includes('Báo cáo tenant và đăng ký') && document.body.innerText.includes('Chưa thiết lập gói cước')");
  await visit("/platform?section=tenants&tenant=legacy&tab=subscription"); await until("document.body.innerText.includes('Gán gói cước')");
  await click("Gán gói cước"); await until("document.body.innerText.includes('Tạo gói cước mới')"); await click("Tạo gói cước mới"); await until("!!document.querySelector('#platform-plan-editor-title')");
  await fill("Mã gói", "QA_TEAM"); await fill("Tên gói", "Gói QA"); await click("Tạo gói");
  await until("document.body.innerText.includes('Đã tạo và chọn gói mới')"); assert.deepEqual(writes, ["plan"], "Creating plan must not assign subscription yet");
  await click("Lưu đăng ký"); await until("document.body.innerText.includes('Đã cập nhật đăng ký gói cho tenant')"); assert.deepEqual(writes, ["plan", "subscription"]);
  await click("Truy cập tenant"); await until("document.body.innerText.includes('QA projects')");
  await evaluate("document.querySelector('summary').click()"); assert.equal(await evaluate("document.body.innerText.includes('<img src=x onerror=window.xss=true>') && !window.xss"), true);
  await click("Công việc"); await until("document.body.innerText.includes('QA tasks')");
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  assert.equal(await evaluate("document.documentElement.scrollWidth <= innerWidth"), true, "Mobile page overflow");
  await click("Thoát về quản trị tenant"); await until("document.body.innerText.includes('Truy cập tenant') && !document.body.innerText.includes('QA tasks')"); assert.equal(closed, true);
  shortSession = true; await click("Truy cập tenant"); await until("document.body.innerText.includes('QA projects')"); await until("document.body.innerText.includes('Phiên xem đã hết hạn') && !document.body.innerText.includes('QA projects')"); await click("Thoát về quản trị tenant"); await until("document.body.innerText.includes('Truy cập tenant')");
  console.log("PASS browser fixtures: detailed dashboard, inline create/select/assign plan, viewer open/read/switch/expiry/exit, XSS text rendering, mobile layout");
} catch (error) { console.log(await evaluate("document.body.innerText")); console.log(writes, calls); throw error;
} finally {
  if (bootstrap) await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: bootstrap });
  await send("Fetch.disable"); await evaluate("sessionStorage.removeItem('qlcv.access-token')").catch(() => {}); ws.close(); await fetch(`http://127.0.0.1:9222/json/close/${target.id}`);
}
