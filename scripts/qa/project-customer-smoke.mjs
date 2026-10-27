// Verify project creation sends the selected active customer using synthetic API responses.
// Requires Next at localhost:3000 and the dedicated Chrome CDP session on :9222.
const targets = await (await fetch("http://127.0.0.1:9222/json/list")).json();
const ws = new WebSocket(targets.find((target) => target.type === "page").webSocketDebuggerUrl);
await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));
let sequence = 0;
const pending = new Map();
let failure;
let createBody;
const token = `e30.${Buffer.from(JSON.stringify({ exp: Date.now() / 1000 + 3600 })).toString("base64url")}.test`;
ws.addEventListener("message", async (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const waiter = pending.get(message.id);
    if (waiter) {
      pending.delete(message.id);
      if (message.error) waiter.reject(message.error);
      else waiter.resolve(message.result);
    }
  }
  if (message.method !== "Fetch.requestPaused") return;
  try {
    const { requestId, request } = message.params;
    const url = new URL(request.url);
    let status = 200;
    let payload = { data: [] };
    if (request.method === "OPTIONS") {
      // Preflight has no body.
    } else if (url.pathname.endsWith("/users/me")) {
      payload = { data: { id: "1", organization_id: "org-1", username: "qa-admin", email: "qa@example.test", role: "SUPER_ADMIN", is_active: true, mfa_enabled: false, version: 1 } };
    } else if (url.pathname.endsWith("/teams")) {
      payload = { data: [] };
    } else if (url.pathname.endsWith("/customers")) {
      if (url.searchParams.get("include_deleted") !== "false") throw Error("Archived customer filter missing");
      const query = url.searchParams.get("search") || "";
      const options = query.toLowerCase().includes("archived") ? [] : [{ id: 17, full_name: "Khách QA", company_name: "Công ty QA", tax_code: "QA17", is_deleted: false }];
      payload = { data: { data: options, pagination: { page: 1, limit: 50, total: options.length } } };
    } else if (url.pathname.endsWith("/projects") && request.method === "POST") {
      createBody = JSON.parse(request.postData || "{}");
      if (createBody.customer_id !== 17) throw Error(`Selected customer was not sent: ${JSON.stringify(createBody)}`);
      status = 201;
      payload = { data: { id: 31, key: createBody.key, name: createBody.name, description: createBody.description, customer_id: "17", team_id: null, is_active: true } };
    }
    await send("Fetch.fulfillRequest", {
      requestId,
      responseCode: status,
      responseHeaders: [
        { name: "Content-Type", value: "application/json" },
        { name: "Access-Control-Allow-Origin", value: "*" },
        { name: "Access-Control-Allow-Headers", value: "Authorization,Content-Type,Idempotency-Key" },
        { name: "Access-Control-Allow-Methods", value: "GET,POST,PUT,OPTIONS" },
      ],
      body: Buffer.from(JSON.stringify(payload)).toString("base64"),
    });
  } catch (error) {
    if (error.code === -32602 && String(error.message).includes("Invalid InterceptionId")) return;
    failure = error;
    console.error(error);
  }
});
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(expression) {
  for (let i = 0; i < 100; i++) {
    if (failure) throw failure;
    if (await evaluate(`Boolean(${expression})`)) return;
    await pause(100);
  }
  throw Error(`Timeout: ${expression}`);
}
async function input(label, value) {
  await evaluate(`(() => { const element = [...document.querySelectorAll('input')].find((item) => item.labels?.[0]?.innerText.includes(${JSON.stringify(label)})); if (!element) throw Error('No input for '+${JSON.stringify(label)}); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(element,${JSON.stringify(value)}); element.dispatchEvent(new Event('input',{bubbles:true})); })()`);
}
async function chooseCustomer() {
  await until('[role="option"]');
  await evaluate(`[...document.querySelectorAll('[role="option"]')].find((item) => item.innerText.includes('Khách QA')).click()`);
}

await send("Page.enable");
await send("Runtime.enable");
await send("Fetch.enable", { patterns: [{ urlPattern: "*/api/v1/*" }] });
await send("Page.navigate", { url: "http://localhost:3000/login" });
await pause(500);
await evaluate(`sessionStorage.setItem('qlcv.access-token',${JSON.stringify(token)})`);
await send("Page.navigate", { url: "http://localhost:3000/projects/new" });
await until('document.querySelector("h1")?.innerText==="Tạo dự án"');
await until('document.querySelector("input[required]")');
const initiallyDisabled = await evaluate(`[...document.querySelectorAll('button')].find((button) => button.innerText.includes('Tạo dự án'))?.disabled`);
if (!initiallyDisabled) throw Error("Create button should wait for customer selection and required project fields");
await input("Khách hàng", "Khách QA");
await chooseCustomer();
await input("Tên dự án", "Dự án QA");
await input("Mã dự án", "QA17");
await until(`[...document.querySelectorAll('button')].find((button) => button.innerText.includes('Tạo dự án'))?.disabled===false`);
await evaluate(`[...document.querySelectorAll('button')].find((button) => button.innerText.includes('Tạo dự án')).click()`);
for (let i = 0; i < 100 && !createBody; i++) {
  if (failure) throw failure;
  await pause(100);
}
if (!createBody) throw Error("Project create request was not sent");
if (createBody.customer_id !== 17 || createBody.name !== "Dự án QA") throw Error(`Wrong create body: ${JSON.stringify(createBody)}`);
console.log("PASS project creation requires an active customer and sends its numeric customer_id");
await send("Fetch.disable");
ws.close();
