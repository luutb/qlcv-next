// Synthetic API only. Requires Next :3000, Chrome CDP :9222 and Node WebSocket.
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const targets = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const target = targets.find((item) => item.type === "page");
if (!target) throw new Error("No Chrome test page");
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));
let seq = 0;
const pending = new Map();
let role = "SUPER_ADMIN";
let actions = {};
let malformed = false;
const calls = [];
let onLoad;
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++seq; pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
ws.addEventListener("message", async ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === "Page.loadEventFired") onLoad?.();
  if (message.id) {
    const promise = pending.get(message.id); pending.delete(message.id);
    if (message.error) promise?.reject(new Error(JSON.stringify(message.error)));
    else promise?.resolve(message.result);
  }
  if (message.method === "Fetch.requestPaused") {
    const { requestId, request } = message.params;
    const path = new URL(request.url).pathname;
    calls.push({ path, method: request.method });
    let payload = path.endsWith("/users/me") ? { data: {
      id: "test-user", organization_id: "legacy", username: "Test account", email: "role@example.test",
      role, is_active: true, mfa_enabled: false, version: 1, actions: malformed ? { "teams.manage": "true" } : actions,
    } } : { data: [], pagination: { total: 0, count: 0, offset: 0, limit: 50 } };
    if (path.endsWith("/dashboard/summary")) payload = { data: {
      viewer: { name: "Test account" }, range: { from: "2026-10-01", to: "2026-10-31" },
      kpis: { total_tasks: 0, in_progress_tasks: 0, completed_tasks: 0, open_issues: 0, overdue_issues: 0, active_projects: 0, active_users: 0, revenue_collected: role === "LAWYER" ? null : 100 },
      billing: role === "LAWYER" ? null : { revenue_collected: 100, cost_total: null, outstanding_amount: 0, series: [] },
      task_status: [], issue_status: [], issue_type: [], project_workflow: [], due_items: [{ id: "qa-task", title: "Permission test task", project_id: "qa-project", project_name: "Permission test project", priority: "MEDIUM", due_date: "2026-10-22", overdue: false, status: "TODO" }], projects_need_attention: [], workload: [], recent_activity: [],
    } };
    if (path.endsWith("/tasks/qa-task")) payload = { data: {
      id: "qa-task", project_id: "qa-project", title: "Permission test task", description: "Synthetic task", status: "TODO", priority: "MEDIUM", position: 0, is_required: false, amount: 100, collected_amount: 0, labels: [],
      actions: { edit: true, move: false, comment: false, request_review: false, review: false },
    } };
    await send("Fetch.fulfillRequest", { requestId, responseCode: 200, responseHeaders: [
      { name: "Content-Type", value: "application/json" },
      { name: "Access-Control-Allow-Origin", value: "*" },
      { name: "Access-Control-Allow-Headers", value: "Authorization,Content-Type,Idempotency-Key" },
      { name: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
    ], body: Buffer.from(JSON.stringify(payload)).toString("base64") }).catch((error) => { if (!error.message.includes("Invalid InterceptionId")) throw error; });
  }
});
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(expression) {
  for (let i = 0; i < 150; i++) { if (await evaluate(expression)) return; await pause(100); }
  throw new Error(`Timeout: ${expression}`);
}
async function visit(path) {
  const loaded = new Promise((resolve) => { onLoad = resolve; });
  await send("Page.navigate", { url: `http://127.0.0.1:3000${path}` });
  await loaded;
  await until(`location.origin === "http://127.0.0.1:3000" && location.pathname === ${JSON.stringify(path)} && document.readyState === "complete"`);
}
async function readyTeams() {
  await visit("/teams");
  await until("!!document.querySelector('.teams-heading') && !document.body.innerText.includes('Đang tải đội nhóm')");
}
try {
  await send("Page.enable"); await send("Runtime.enable");
  await send("Fetch.enable", { patterns: [{ urlPattern: "*/api/v1/*" }] });
  await visit("/login");
  const token = `e30.${Buffer.from(JSON.stringify({ exp: Date.now() / 1000 + 3600 })).toString("base64url")}.signature`;
  await evaluate(`sessionStorage.setItem('qlcv.access-token', ${JSON.stringify(token)})`);
  for (const currentRole of ["SUPER_ADMIN", "PARTNER", "LAWYER", "ACCOUNTANT"]) {
    role = currentRole; actions = {};
    await readyTeams();
    assert.equal(await evaluate("!!document.querySelector('.workhub-nav a[href=\"/users\"]')"), role === "SUPER_ADMIN");
    assert.equal(await evaluate("!!document.querySelector('.quick-create')"), ["SUPER_ADMIN", "PARTNER"].includes(role));
    assert.equal(await evaluate("[...document.querySelectorAll('button')].some(b => b.textContent === 'Tạo đội nhóm')"), ["SUPER_ADMIN", "PARTNER"].includes(role));
    if (["LAWYER", "ACCOUNTANT"].includes(role)) {
      calls.length = 0; await visit("/projects/new");
      await until("document.body.innerText.includes('Bạn chưa được cấp quyền truy cập')");
      assert.equal(calls.some((call) => call.path.endsWith("/customers")), false);
    }
    await visit("/"); await until("!!document.querySelector('.workhub-metrics')");
    assert.equal(await evaluate("!!document.querySelector('.revenue-card')"), role !== "LAWYER");
    assert.equal(await evaluate("!!document.querySelector('.employees-card')"), ["SUPER_ADMIN", "PARTNER"].includes(role));
    await evaluate("document.querySelector('.recent-card .task-copy-button').click()");
    await until("document.querySelectorAll('.task-detail-form [role=combobox]').length === 3");
    const fieldDisabled = (label) => evaluate(`(() => { const field = [...document.querySelectorAll('.task-detail-form [role=combobox]')].find(field => document.getElementById(field.getAttribute('aria-labelledby'))?.textContent.includes(${JSON.stringify(label)})); if (!field) throw Error('Missing field'); return field.getAttribute('aria-disabled') === 'true'; })()`);
    assert.equal(await fieldDisabled("Người thực hiện"), ["LAWYER", "ACCOUNTANT"].includes(role));
    assert.equal(await fieldDisabled("Trạng thái"), true);
    assert.equal(await evaluate("!!document.querySelector('.task-detail-form input[type=number]')"), role !== "LAWYER");
    await evaluate("document.querySelector('.task-detail-header button').click()");
    await visit("/labels"); await until("!!document.querySelector('.labels-editor')");
    assert.equal(await evaluate("!!document.querySelector('.labels-editor form')"), ["SUPER_ADMIN", "PARTNER"].includes(role));
    console.log(`PASS ${role}: navigation, create controls, direct-route policy, dashboard, task field permissions, label editor`);
  }
  role = "SUPER_ADMIN"; actions = { "teams.manage": false, "users.manage": false, "projects.create": false, "tasks.create": false, "customers.manage": false };
  await readyTeams();
  assert.equal(await evaluate("!!document.querySelector('.quick-create')"), false);
  assert.equal(await evaluate("[...document.querySelectorAll('button')].some(b => b.textContent === 'Tạo đội nhóm')"), false);
  await visit("/users"); await until("document.body.innerText.includes('Bạn chưa được cấp quyền truy cập')");
  console.log("PASS explicit backend denials override administrator role");
  role = "LAWYER"; actions = { "teams.manage": true };
  await readyTeams();
  assert.equal(await evaluate("[...document.querySelectorAll('button')].some(b => b.textContent === 'Tạo đội nhóm')"), true);
  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  await evaluate("document.querySelector('.workspace-nav-toggle').click()");
  assert.equal(await evaluate("document.querySelector('.workspace-nav-toggle').getAttribute('aria-expanded')"), "true");
  assert.equal(await evaluate("document.documentElement.scrollWidth > innerWidth"), false);
  const screenshot = await send("Page.captureScreenshot", { format: "png" });
  await fs.writeFile("/private/tmp/qlcv-role-permissions-mobile.png", Buffer.from(screenshot.data, "base64"));
  console.log("PASS explicit grant to Lawyer and mobile navigation at 375px");
  malformed = true; await visit("/teams");
  await until("document.body.innerText.includes('Không xác minh được quyền truy cập')");
  assert.equal(await evaluate("!!document.querySelector('.teams-heading')"), false);
  assert.equal(calls.some((call) => !["GET", "OPTIONS"].includes(call.method)), false);
  console.log("PASS invalid permission response blocks protected content; no writes sent");
} finally {
  await evaluate("sessionStorage.removeItem('qlcv.access-token')");
  await send("Page.navigate", { url: "http://127.0.0.1:3000/login" });
  await send("Fetch.disable");
  await send("Emulation.clearDeviceMetricsOverride");
  ws.close();
}
