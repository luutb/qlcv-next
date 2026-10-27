# G-04 — RBAC / Tenant Action Matrix (BA Draft & Gap Analysis)

**Trạng thái:** DRAFT — chưa phải policy approval và chưa đủ điều kiện chuyển G-04 sang `PASS`  
**Vai trò lập:** BA sidecar  
**Ngày:** 2026-09-08  
**Phạm vi:** role × route/action, expected authorization/tenant-negative tests và policy drift cần PO/Security/BE quyết định.

## 1. Nguồn và giới hạn bằng chứng

Đã đối chiếu:

- `docs-master/QLCV_NEXT_API_MASTER.md` — API catalog, route guard baseline, tenant/error conventions.
- `docs-master/QLCV_NEXT_BMAD_MASTER.md` — persona, FR-02/03/07/09/14/16/20/21, backend drift notes và baseline role matrix.
- `.agents/artifacts/REQUIREMENTS_TRACEABILITY.md` — FR-02, FR-03, FR-07, FR-09, FR-14, FR-16, FR-20, FR-21; G-04 acceptance.
- `.agents/artifacts/GATE_WORK_ITEMS.md` — G-04 acceptance: positive/negative/cross-tenant tests và xử lý `/close`, audit verify, document lock.
- `.agents/artifacts/BACKEND_EVIDENCE_2026-09-07.md` — backend package tests/vet PASS; live HTTP/DB security fixtures BLOCKED.
- Backend source registrations tại `/Users/sapo/golang/qlcv-work-board/internal/server/router.go` để kiểm tra guard cấp router.

**Boundary:** Đây là source-level draft. `requireAuth`/`requireRole` không chứng minh handler-level authorization, object ownership, tenant isolation, audit, hoặc status/error payload trên runtime. Không sử dụng draft này để tự cấp quyền, đóng gate hay thay đổi production code.

## 2. Role vocabulary và nguyên tắc test

| Role | Persona / baseline nghiệp vụ | Ghi chú BA |
|---|---|---|
| `SUPER_ADMIN` | Quản trị tenant, user và audit integrity | Quyền tenant settings/purge; phải được test không vượt tenant của chính request context. |
| `PARTNER` | Quản trị vận hành, user/team/workflow, project control, billing/document control | Không mặc định được tenant settings/purge. Document lock hiện là PARTNER-only ở source. |
| `LAWYER` | Thực hiện và bàn giao task | Quyền mutation task phụ thuộc handler: assignee/team leader/actor cần negative tests. |
| `ACCOUNTANT` | Time, invoice, payment/billing | Invoice generate được route guard; invoice status/time mutation hiện còn drift/handler policy cần xác nhận. |
| Unauthenticated | Không có identity | Tất cả API nghiệp vụ phải trả `401` theo contract; không leak object existence qua body/detail. |

Nguyên tắc chung cho mọi test:

1. Backend là authority; UI action flags chỉ là fallback hiển thị.
2. `organization_id` lấy từ auth context, không lấy từ client.
3. Cross-tenant object phải trả kết quả an toàn theo policy đã duyệt (`404` hoặc `403`), không leak existence/PII.
4. Với mutation, kiểm tra cả `Idempotency-Key`, audit event, retry/replay và không tạo side effect khi bị từ chối.
5. Expected `403` là `application/problem+json` với code ổn định (`FORBIDDEN` hoặc policy code); `401` là `UNAUTHORIZED`/`INVALID_CREDENTIALS` theo ngữ cảnh.

## 3. Role × route/action matrix — source baseline

Ký hiệu:

- **A** = source guard cho phép ở route level, subject to handler/entity/tenant checks.
- **D** = source route guard từ chối role này, expected `403` khi authenticated.
- **H** = authenticated ở router nhưng handler-level policy/ownership chưa đủ rõ; cần runtime test và quyết định.
- **D*** = source drift hoặc compatibility route; không được coi là approved product policy.
- **—** = không thuộc scope/action grouping này.

### 3.1 Identity, users, teams, customer và project

| Route/action group | SUPER_ADMIN | PARTNER | LAWYER | ACCOUNTANT | Expected decision / evidence need |
|---|---:|---:|---:|---:|---|
| `GET /users/me`, `PUT /users/me` | A | A | A | A | Self-profile; PUT version conflict `428` khi stale. |
| `GET /users`, `POST /users`, `PUT /users/{id}`, activate/deactivate/reset-password/MFA reset | A | A | D | D | Source guard `PARTNER,SUPER_ADMIN`; target-role restrictions vẫn cần handler tests. |
| `GET /users/{id}` | H | H | H | H | Router chỉ `requireAuth`; verify same-tenant/not-found policy và PII minimization. |
| `GET /teams`, `GET /teams/{id}`, members | A | A | A | A | Authenticated route; object tenant/visibility và member PII cần test. |
| Team create/update/archive/member upsert/remove | A | A | D | D | Source guard `PARTNER,SUPER_ADMIN`; archive/member-open-task blockers cần test. |
| Customer list/get/create/update/archive/restore/conflicts | A | A | A | A | Router authenticated; handler tenant/action restrictions chưa được chứng minh. |
| Project list/get/create/update/history | A | A | A | A | Router authenticated; mutation policy cần handler/runtime evidence. |
| `PATCH /projects/{id}/team`, `POST .../override-conflict`, `POST .../complete` | A | A | D | D | Source guard `PARTNER,SUPER_ADMIN`; conflict justification ≥50 chars/audit cần test. |
| `POST /projects/{id}/close` compatibility alias | D* | D* | D* | D* | Router hiện chỉ `requireAuth` (**BE-04**); actual source may allow all authenticated. Must fix/retire/explicitly constrain before release. |
| `PATCH /projects/{id}/workflow-step`, `GET /projects/board` | H | H | H | H | Legacy workflow compatibility; G-02 governs lifecycle, not an approved new mutation policy. |
| `GET /projects/{id}/assignable-users`, project tasks | A | A | A | A | Result must be same-tenant active project-team members only; cross-tenant negative test. |

### 3.2 Canonical tasks, compatibility issues, workflow templates

| Route/action group | SUPER_ADMIN | PARTNER | LAWYER | ACCOUNTANT | Expected decision / evidence need |
|---|---:|---:|---:|---:|---|
| Task/board list, get, history | H | H | H | H | Authenticated route; entity tenant visibility and role/team scope need runtime fixtures. |
| Task create/update/delete/reorder/status/workflow-step/assignee | H | H | H | H | Handler-level authorization is authoritative; test actor, assignee, team leader, project membership and tenant. |
| Task comments list/create/update/delete | H | H | H | H | Confirm author/assignee/team-leader/Partner/Super Admin policy; no role approval inferred here. |
| Review list/create request/decision | H | H | H | H | Backend tests indicate assignee/team leader/PARTNER/SUPER_ADMIN behavior; confirm reviewer decision scope and tenant. |
| Dependency list/add/delete | H | H | H | H | Same-project/tenant, self/cycle and blocker rules; distinguish `403` from `409`. |
| `/issues/*` equivalent routes | H | H | H | H | Compatibility transport only; must not introduce second UI permission model or query-key family. |
| Workflow-template list/get | A | A | A | A | Authenticated read per source. |
| Workflow-template create/update/archive | A | A | D | D | Source guard `PARTNER,SUPER_ADMIN`; historical task mutation must be prevented. |

### 3.3 Documents, finance, audit and tenant administration

| Route/action group | SUPER_ADMIN | PARTNER | LAWYER | ACCOUNTANT | Expected decision / evidence need |
|---|---:|---:|---:|---:|---|
| Document/profile-document list/get/download/upload/delete | H | H | H | H | Authenticated route but object/context authorization must be runtime-tested; upload policy belongs G-06. |
| `POST /documents/{id}/lock` | D* | A* | D* | D* | Source is PARTNER-only (**BE-03**). Product intent may expect Super Admin/security role; PO/Security/BE must decide. |
| Time-entry list/get/create | H | H | H | H | Handler policy and project/user ownership unclear from route guard; billing lock must return `423`. |
| Time-entry update/delete | H | H | H | H | Source handler comments indicate PARTNER/ACCOUNTANT/SUPER_ADMIN may edit/delete any time entry; verify LAWYER self-entry policy and `423`. |
| Invoice list/get/source time entries | H | H | H | H | Authenticated route; same-tenant source visibility and PII/finance scope need test. |
| `POST /invoices/generate` | A | A | D | A | Source guard `PARTNER,ACCOUNTANT`; validate eligible project/source entries, audit/idempotency. |
| `PUT /invoices/{id}/status` | H | H | H | H | Router currently authenticated (**G-04 drift**); approve transition-role matrix in G-03 and enforce before release. |
| Project payments list/get | H | H | H | H | Authenticated route; tenant and finance visibility policy needs decision/runtime evidence. |
| Audit list/get/entity history | H | H | H | H | Router authenticated; product requirement says Super Admin integrity check, but read scope not explicitly role-restricted. |
| `POST /audit-logs/verify` | D* | D* | D* | D* | Source is authenticated-only (**BE-03**); FR-20 says Super Admin integrity check. Decide whether restrict to `SUPER_ADMIN`, possibly Security/operations role, and response sensitivity. |
| `GET/PUT /admin/tenant-settings` | A | D | D | D | Source guard `SUPER_ADMIN`. Test same-tenant admin context and no client-supplied tenant override. |
| `POST /admin/purge` | A | D | D | D | Source guard `SUPER_ADMIN`; requires approved flow/environment, confirmation token, audit, dry-run/rollback controls. |
| OKR mutations | A | A | D | D | Source guard `PARTNER,SUPER_ADMIN`; product scope still has explicit R1 decision in FR-19. |
| Labels CRUD | A | A | D | D | Source guard mutations `PARTNER,SUPER_ADMIN`; label assignments are authenticated and need target authorization. |

## 4. Policy drift / decisions required

| ID | Drift / ambiguity | Risk | Decision owner(s) | Proposed decision to review (not approved) | Required evidence before G-04 PASS |
|---|---|---|---|---|---|
| G04-D1 | `/projects/{id}/close` is authenticated-only while `/complete` is `PARTNER,SUPER_ADMIN`, although both call close handler. | LAWYER/ACCOUNTANT may bypass intended project completion authorization; inconsistent UI/API semantics. | PO + Security + BE | Deprecate/retire `/close`, or apply same `PARTNER,SUPER_ADMIN` guard and emit deprecation telemetry. FE uses `/complete` only. | Runtime role matrix proving denied roles on `/close` and `/complete`; compatibility decision/ADR update. |
| G04-D2 | `POST /audit-logs/verify` is authenticated-only, while FR-20 describes Super Admin integrity check. | Any authenticated user may trigger integrity verification; possible operational/load or metadata exposure. | PO + Security + BE | Restrict to `SUPER_ADMIN` unless a separately approved security-operator capability exists; rate-limit and audit verification requests. | `401/403/200` fixtures for all roles, sensitive response review, audit event and rate-limit evidence. |
| G04-D3 | `POST /documents/{id}/lock` is PARTNER-only; Super Admin is not allowed by source. | Policy mismatch for retention/WORM incident response; UI must not assume hierarchy implies lock power. | PO + Security + BE | Keep PARTNER-only only if business-approved, or add explicit Security/Super Admin permission; document in G-06 and action flags. | Cross-role lock tests, same/cross-tenant object tests, `423` replay/locked-state evidence. |
| G04-D4 | Invoice status update is authenticated-only at router; G-03 requires finance transition-role approval. | Unauthorized invoice state changes and audit/accounting risk. | PO + Finance + BE | Restrict transitions by state/action (likely Partner/Accountant; exact matrix belongs G-03), not broad authenticated access. | Role × transition fixtures, invalid transition `4xx`, audit/idempotency evidence. |
| G04-D5 | Customer/project/time/document/payment reads are often authenticated-only at router; handler object authorization is not represented in route matrix. | Cross-tenant/object data disclosure if handler checks regress. | Security + BE + QA | Require explicit same-tenant ownership/context check for every object read/download and safe 404/403 policy. | Cross-tenant read/download tests for each resource family; no existence/PII leak. |
| G04-D6 | Task mutations are authenticated at router but rely on handler-level actor/team rules. | Role matrix cannot be approved from route guard alone; possible over-broad task mutation. | PO + Security + BE | Define action-level policy for assignee, team leader, Partner, Super Admin and reviewer; expose authoritative `actions` where needed. | Positive/negative handler tests, team membership/tenant fixtures, audit on material mutation. |
| G04-D7 | MFA enable/verify/disable routes are authenticated, but MFA policy/proof/recovery is out of R1. | Security action may be exposed without approved proof/recovery semantics. | PO + Security + BE | Keep MFA UX out of R1; do not include these actions in release UI until proof/recovery contract is approved. | Scope decision and explicit negative/feature-disabled behavior if route remains reachable. |

## 5. Expected authorization and tenant-negative test pack

Test data must be synthetic and tenant-isolated. Suggested fixtures:

- `ORG_A`, `ORG_B`.
- One active user for each role in each organization: `sa-a`, `partner-a`, `lawyer-a`, `accountant-a`, plus corresponding `*-b` users.
- `project-a-open`, `task-a`, `document-a`, `invoice-a`, `time-entry-a`, `audit-a` in `ORG_A`; matching resources in `ORG_B`.
- Team A with leader/member/viewer assignments; task A assigned to `lawyer-a`; locked time entry and WORM-locked document fixtures.
- Fresh idempotency keys per mutation; no real PII, tokens, MFA secrets or production-like credentials in artifacts.

### 5.1 Common expected cases

| Test ID | Scenario | Expected result |
|---|---|---|
| G04-AUTH-01 | No `Authorization` on every in-scope API family | `401` RFC 7807; no mutation, no object/tenant existence leak. |
| G04-AUTH-02 | Malformed/expired bearer token | `401`; client clears session safely; no handler side effect. |
| G04-AUTH-03 | Authenticated role not in approved route guard calls sensitive mutation | `403` stable problem code; no audit mutation event claiming success; draft/state remains recoverable. |
| G04-TEN-01 | `ORG_A` user requests `ORG_B` entity by ID | Approved safe outcome: `404` or `403` consistently per resource policy; never `200` or leaked metadata. |
| G04-TEN-02 | `ORG_A` user submits `ORG_B` ID in body/query (`project_id`, `team_id`, `customer_id`, `assignee_id`, target entity) | Backend ignores/rejects client tenant manipulation; expected `403/404` or validation `4xx`; no cross-tenant write. |
| G04-TEN-03 | Cross-tenant list/filter by foreign ID | Empty/safe not-found result according to contract; no foreign rows in pagination/count/aggregates. |
| G04-TEN-04 | Replay successful mutation with same `Idempotency-Key` under different principal or tenant | Reject key reuse or isolate cache by principal/tenant; never replay another tenant's result. |
| G04-AUD-01 | Allowed material mutation | Immutable audit includes actor, tenant/entity, action, time and correlation/idempotency context. |
| G04-AUD-02 | Denied/cross-tenant mutation | No false success audit; security event/denial logging behavior documented without sensitive detail leakage. |

### 5.2 Required role-positive / role-negative tests

| Test ID | Endpoint/action | Positive roles | Negative roles / expected |
|---|---|---|---|
| G04-R01 | User admin mutations | `SUPER_ADMIN`, `PARTNER` | `LAWYER`, `ACCOUNTANT` → `403`; target-role restrictions separately tested. |
| G04-R02 | Team mutations | `SUPER_ADMIN`, `PARTNER` | `LAWYER`, `ACCOUNTANT` → `403`; open-project/member-task blockers are business `409`. |
| G04-R03 | Workflow template mutations | `SUPER_ADMIN`, `PARTNER` | `LAWYER`, `ACCOUNTANT` → `403`. |
| G04-R04 | Project team/override/complete | `SUPER_ADMIN`, `PARTNER` | `LAWYER`, `ACCOUNTANT` → `403`; invalid business state → `409`. |
| G04-R05 | `/projects/{id}/close` compatibility | Expected to match approved `/complete` policy | Test all roles now; current source likely allows all authenticated → defect/drift evidence, not acceptance. |
| G04-R06 | Task create/update/status/assignee/delete | Approved handler actor/team roles | All four roles × assignee/team membership × tenant; distinguish `403` from dependency/business `409`. |
| G04-R07 | Document lock | Current source `PARTNER` | `SUPER_ADMIN`, `LAWYER`, `ACCOUNTANT` expected per PO/Security decision; current source denies non-Partner. |
| G04-R08 | Invoice generate | `SUPER_ADMIN`, `PARTNER`, `ACCOUNTANT` | `LAWYER` → `403`; invalid source/transition tests belong G-03. |
| G04-R09 | Invoice status | Pending G-03 approved matrix | Exercise all roles; current route accepts authenticated source, therefore cannot pass policy review yet. |
| G04-R10 | Audit verify | Intended FR-20 `SUPER_ADMIN` pending decision | Current source accepts all authenticated; test all roles and record drift. |
| G04-R11 | Tenant settings/purge | `SUPER_ADMIN` | `PARTNER`, `LAWYER`, `ACCOUNTANT` → `403`; verify confirmation/audit/approved environment. |

## 6. Acceptance criteria for G-04 handoff

G-04 may move from `blocked` only when all are true:

1. PO, Security and BE have explicitly decided G04-D1 through G04-D4; unresolved source drift is fixed, retired, or time-boxed with approved release risk.
2. Architect/BE publish the authoritative action semantics for handler-level task/entity checks.
3. QA executes positive, forbidden, unauthenticated and cross-tenant tests against live HTTP + DB/integration environment; package tests alone do not count.
4. Every sensitive mutation has stable `401/403` problem responses, no cross-tenant leak, correct audit behavior and idempotency isolation.
5. Traceability links FR-02, FR-03, FR-07, FR-09, FR-14, FR-16, FR-20 and FR-21 to test IDs/evidence; any accepted exception is recorded in the workflow/decision artifact.

## 7. BA handoff / open questions

- **To PO:** approve or reject proposed disposition for `/close`, audit verify, document lock and invoice status.
- **To Security:** confirm whether Super Admin may lock documents and verify audit integrity; define safe 404 vs 403 policy and rate-limit expectations.
- **To BE:** provide handler-level authorization table and runtime fixtures for task/entity reads/mutations, plus remediation plan for all accepted drifts.
- **To QA:** convert tables in §5 into executable API authorization/cross-tenant suite once the decisions and integration environment exist.

**BA conclusion:** G-04 remains `BLOCKED`. This artifact is ready for PO/Security/BE review, not approval.
