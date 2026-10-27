# QLCV Next — Quality and Readiness Plan

**Owner:** Lead QA  
**Inputs:** `docs-master/QLCV_NEXT_BMAD_MASTER.md`, `docs-master/QLCV_NEXT_API_MASTER.md`  
**Status:** Planning — runtime backend/staging has **not** been verified.  
**Rule:** `SOURCE-VERIFIED` is useful design evidence, not release evidence. No gate, story, or
release may claim runtime verification without the named executable evidence below.

## 1. Quality objectives and controls

Release 1 quality is measured against these controls:

| Quality objective | QA control | Minimum evidence |
| --- | --- | --- |
| One canonical Task model | `/tasks` only in product adapter/query keys; `/issues` compatibility tested only | adapter/query-key review, contract fixtures, static check |
| Tenant-safe, authorized operations | role and cross-tenant negative paths tested at API boundary | automated authorization tests plus captured problem JSON |
| No silent data loss | idempotency, version-conflict, lock and business-blocker paths preserve draft/recovery | API tests and UI/e2e evidence |
| Finance/document safety | state transitions, billing locks, malware and WORM behavior verified | high-risk integration/staging evidence |
| Accessible usable flows | keyboard, focus, semantic labels, error recovery and Vietnamese copy verified | automated accessibility scan plus manual keyboard record |
| Auditable material mutations | audit event/correlation checked for write operations in scope | API assertion or authorized audit/history evidence |

All tests use synthetic, tenant-isolated data. Screenshots, logs, fixtures and defect reports must
redact passwords, access tokens, MFA secrets/QR codes and unnecessary PII.

## 2. Readiness decision model

### Evidence labels

| Label | Meaning | May it close a gate? |
| --- | --- | --- |
| `DOC-PLANNED` | Requirement/decision written but not verified | No |
| `SOURCE-VERIFIED` | Route or handler inspected in backend source | No, unless gate explicitly asks only for source analysis |
| `CONTRACT-VERIFIED` | Executable contract test passes against an integration environment | Yes, where listed |
| `RUNTIME-VERIFIED` | Captured local integration/staging API or E2E result with environment/build/date | Yes |
| `UAT-VERIFIED` | Role-authorized stakeholder acceptance in approved environment | Required for release/cutover items |

Every evidence item records: work-item ID, requirement/gate ID, environment and build/commit,
executor/date, role/test data class, test case ID, outcome, artifact link, and defect IDs. A pass
from a local mock, frontend fixture, source inspection, or unexecuted test is recorded as
`DOC-PLANNED`/`SOURCE-VERIFIED`, never as runtime pass.

### Gate result

* **PASS:** all required evidence is `CONTRACT-VERIFIED` or stronger, critical paths pass, no
  unresolved Critical/High defect, decision owner signs the record.
* **CONCERNS:** evidence exists but a non-blocking risk, environment limitation, or explicitly
  accepted Medium/Low defect remains. PO documents disposition; affected epic cannot overstate Done.
* **FAIL/BLOCKED:** any required decision/evidence missing, a Critical/High defect open, an
  authorization/tenant/finance/document safety failure, or no executable environment for a gate
  that requires runtime proof.

## 3. G-01 to G-07 evidence register

| Gate | Decision and accountable owners | Required test/evidence | Pass criteria |
| --- | --- | --- | --- |
| G-01 | Canonical Task live contract — QA + BE | Versioned OpenAPI/JSON-schema or approved contract; automated tests for `GET/POST/PUT /tasks`, status, workflow-step, assignee, dependency, comment, review, board and pagination; real valid/error fixtures (`401/403/404/409`); idempotent replay and audit assertion for writes; `/issues` parity smoke only if compatibility retained | `/tasks` envelopes/DTO/error codes work in integration/staging; no production Task adapter/query key uses `issues`; source-only inspection remains insufficient |
| G-02 | Retain, migrate, or retire legacy Project Workflow Board — PO + BA | Signed lifecycle decision: Project `OPEN/DONE`, Task status and workflow-step ownership; inventory of legacy routes/writes; migration/deprecation plan with owner, telemetry, expiry and rollback; test cases proving no competing writes and deep-link/redirect behavior | One canonical writer/model; migration rehearsal or compatibility tests demonstrate data preservation and rollback; Epic 03 work is not released on an unresolved decision |
| G-03 | Finance/time/payment/invoice state machine — PO + Finance + BE | Approved transition matrix for `DRAFT → UNPAID → PAID/VOID`, generate inputs/source entries, edit/delete lock semantics, authorization; executable valid/invalid transition tests; 4xx fixtures including `423 BILLING_LOCK_ACTIVE`; amount/reconciliation expectations; audit evidence | Each allowed/forbidden role+transition verified in integration/staging; locked time entry cannot mutate; invoice source entries and totals reconcile under the approved `float64` contract (no unapproved currency representation change) |
| G-04 | RBAC action matrix — PO + Security + BE | Versioned role×route×action matrix for `SUPER_ADMIN`, `PARTNER`, `LAWYER`, `ACCOUNTANT`; tests for allowed, forbidden, unauthenticated and cross-tenant cases; explicit disposition for `/projects/{id}/close`, audit verify, invoice-status and document-lock source drifts; UI action fallback check | Backend outcomes are consistent with approved policy or drift is remediated/deprecated; every sensitive mutation has negative authorization evidence; UI neither grants access nor hides recovery/error state |
| G-05 | Single design system — UX + FE | ADR naming chosen library; component inventory (MUI/AntD/current custom); migration sequencing/owners; visual-regression baseline; keyboard/focus/contrast acceptance criteria; lint/static rule preventing a second library | One library used for new feature surfaces and migration plan is executable; selected critical screens pass keyboard/focus and WCAG-AA contrast checks; no mixed-library exception without ADR |
| G-06 | Upload/security/retention — Security + BE | Approved MIME/size/retention/deletion/lock policy; server scan behavior and error contract; executable safe upload/download authorization tests; `422 MALWARE_DETECTED`, `413`, `415`, WORM lock/delete negative evidence; download blob behavior; audit evidence | Server—not UI—enforces type, size, scan, authorization and lock policy; malicious/unsupported/oversize samples are rejected safely; retention/lock recovery and audit ownership are documented |
| G-07 | Migration and seed strategy — BA + BE + Ops | Approved source-to-target mapping, transformations/defaults, tenant isolation rules, seed-data policy, backup/restore plan and named rollback owner; dry-run output; record counts/totals/sample reconciliation; rollback rehearsal; cutover/UAT plan | Dry run reconciles agreed counts and finance-sensitive totals; failed migration rollback is demonstrated; no uncontrolled production-like data is used in QA; discrepancies are resolved or explicitly accepted by PO/BA/Ops |

Gate artifacts live under `.agents/artifacts/gates/G-0X/` (decision, matrix/contract, test output,
fixtures redacted, risk/disposition). QA Lead maintains a gate register and re-runs the readiness
review after G-01..G-07 are decided.

## 4. Test levels and risk-based mapping

| Level | Primary scope | Owner | Required for |
| --- | --- | --- | --- |
| Static/unit | TypeScript strict, pure domain mapping, error mapper, query-key canonicalization, state/permission presentation | Dev | Every code change |
| API contract/integration | Request/envelope/error schema, idempotency, pagination/filter, authz, tenant boundary, audit, locks and state transitions | Dev + QA | Every Release-1 endpoint; mandatory for all mutations |
| Component/UI integration | Loading/empty/error/forbidden/locked/stale states, draft preservation, response-to-UI mapping | Dev + QA | Every changed user flow |
| E2E | Cross-domain journey with real auth/data: Customer→Project→Team→Task; task review; time→invoice; document workflow | QA | High/critical stories and release candidate |
| Accessibility/manual exploratory | Keyboard drag/drop alternative, dialog focus, labels, `aria-live`, responsive tables, Vietnamese-first copy and recovery flows | QA | Interactive critical screens and changed dialogs/boards |
| Security/operational/release | RBAC/tenant tests, secret/PII scan, migration rehearsal, performance observation, monitoring/rollback/UAT | QA Lead + Security/Ops | G-04/G-06/G-07 and Epic 06 |

| Risk class | Examples | Mandatory coverage and release rule |
| --- | --- | --- |
| Critical | Tenant escape, authorization bypass, destructive migration, malware bypass, invoice/payment corruption, audit tampering | Unit + integration + E2E/authorized runtime negative tests; no open defect; QA Lead and relevant owner sign-off |
| High | Task dependency cycle/blocker bypass, assignment conflict, billing/WORM lock, version conflict, project completion blocker, canonical-model split | Unit + contract/integration + UI recovery + E2E where journey spans domains; no open High defect for release |
| Medium | Pagination/filter drift, dashboard aggregate/deep link mismatch, workflow ordering, document download UX, responsive/accessibility regression | Unit/component plus targeted integration or manual exploratory evidence; accepted residual risk must have owner/date |
| Low | Cosmetic copy/layout with no accessibility or interpretation impact | Component/manual check proportional to change |

Minimum high-risk scenario pack: project completion blocked; Project-Team assignment conflict;
Task dependency self/cycle and incomplete blocker; Task review request/changes/approval; user profile
version conflict; time-entry billing lock; invoice invalid transition; malware/WORM lock; cross-tenant
not-found/forbidden; idempotent write replay.

## 5. Story handoff templates

### A. Ready for Development — PO/BA/Architect/Lead QA

```md
Story: <ID/title>                 Epic: <ID>                 Risk: <Critical|High|Medium|Low>
Traceability: FR-__ / NFR-__ / ADR-__ / Gate G-__
Business outcome and scope: <in/out>
Acceptance criteria: <numbered, independently testable>
API/contract: <endpoint, request, response envelope, errors, idempotency/version, authorization>
UX states: <loading, empty, error, 401/403, 409/423/428, success; accessibility notes>
Test data: <synthetic tenant, roles, setup/cleanup>
Dependencies/decisions: <gate status, owners, blockers>
QA approach: <test levels, scenario IDs, automation target>
Readiness decision: <PASS|CONCERNS|FAIL>, signed by <PO/BA/Architect/Lead QA>
```

### B. Ready for QA — Developer

```md
Story / implementation links: <ID, PR/commit, deployed build if any>
Changed scope and known exclusions: <...>
Self-test: <commands/results; unit/typecheck/lint/build; API/component tests>
Contract impact: <new/changed endpoint/schema/error/query keys; fixture location>
Test instructions: <environment, feature flag, synthetic data, roles, deterministic setup>
Risk controls verified by Dev: <idempotency/audit/authz/lock/conflict as applicable>
Known risks or follow-ups: <none or IDs>
```

### C. QA result — QA to Lead QA / Dev / Reviewer

```md
Story: <ID>    Build/environment/date: <...>    Executor: <...>
Coverage: <scenario IDs, roles, data class, test levels>
Results: <passed/failed/blocked/not-run with artifact links>
Requirement traceability: <AC → test → evidence mapping>
Residual risk: <risk, impact, mitigation, owner, expiry>
Decision: <return to Dev | ready for review | blocked>
```

### D. Defect return — QA or Reviewer to Developer

```md
Defect: <ID/title>  Severity: <Critical|High|Medium|Low>  Story/build/environment: <...>
Preconditions and synthetic role/data: <...>
Steps to reproduce: <numbered>
Expected / actual: <...>
Evidence: <redacted request/response, trace, screenshot/video, automated failure>
Scope/requirement: <FR/AC/API/ADR>; regression risk: <...>
Exit criterion: <specific test that must pass>
```

### E. QA approval and PO acceptance

```md
QA approval: required tests passed; no Critical/High open; evidence index attached; residual risk accepted by <owner>.
Reviewer approval: independent review evidence attached; any review rework completed and re-tested by QA.
PO/BA close: acceptance criteria confirmed; traceability updated; release/close note records gate status and deferred work.
```

## 6. Execution and reporting rules

1. Lead QA assigns QA independently from the implementing Dev where feasible and keeps a live
   `AC → test → evidence → defect` traceability matrix.
2. A QA failure returns to the implementing Dev. A review failure also returns to Dev **then must
   re-enter QA**; reviewer approval never substitutes for regression testing.
3. `blocked` is a valid result. QA does not fabricate runtime evidence when an environment, role,
   malware-safe sample, migration rehearsal, or contract is unavailable.
4. Required error states are explicitly tested when applicable: `401`, `403`, `404`, `409`, `423`,
   `428`, `422`, `413`, `415`. UI must preserve draft/recovery where the contract requires it.
5. The dashboard is tested against the summary endpoint; QA does not accept client-derived totals
   from paginated data. Money assertions use the approved backend representation until an ADR
   changes it.
6. Release readiness is a separate decision from story QA: Epic 06 requires CI evidence,
   role-based UAT, migration/rollback rehearsal, security/a11y evidence, monitoring and rollback
   contacts before PO closes a release task.

## 7. Current QA readiness conclusion

**CONCERNS / no runtime claim.** The master documents provide a strong source-level baseline, but
G-01 through G-07 still require executable evidence or signed product/security/migration decisions.
Implementation may prepare low-risk foundation work only when its own Definition of Ready passes;
Epic 03 remains gated by G-01/G-02/G-04 and Epic 04 by G-03/G-04/G-06. QA will update this plan
only when linked evidence changes the stated verification level.
