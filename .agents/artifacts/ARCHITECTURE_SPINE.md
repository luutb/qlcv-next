# QLCV Next — Architecture Spine

**Status:** `CONCERNS` — execution baseline, not runtime proof.  
**Inputs:** `docs-master/QLCV_NEXT_BMAD_MASTER.md` and `docs-master/QLCV_NEXT_API_MASTER.md` (snapshot 2026-09-07).  
**Evidence boundary:** backend routes/handlers/models are **SOURCE-VERIFIED** only. No live, staging, database, deployment, latency, or security-runtime fact is assumed here.

## 1. Release-1 scope and non-goals

Build one tenant-safe operational spine:

```text
Tenant → Customer → Project → Team → Task → Time entry → Invoice
                                  └→ Document / Audit / Dashboard summary
```

Release 1 includes identity/RBAC, customer/project/team, canonical Task work board, documents, time/billing, dashboard/reports/audit, and controlled migration/release. It excludes MFA enrollment/recovery UX until its security flow is approved, a second Issue/Work Board model, a generic dynamic-form builder, and routine data purge.

## 2. Binding decisions

| Area | Decision |
| --- | --- |
| System shape | Modular-monolith REST backend under `/api/v1`, with PostgreSQL and object storage as the intended logical components. |
| Web client | Next.js App Router, TypeScript strict, React Query; route files are adapters only. Pick exactly one UI library before UI implementation. |
| Canonical work item | `Task` and `/tasks/*` only. `/issues/*` is a compatibility transport alias: no Issue model, feature, or query-key family. |
| Lifecycle | Project: `OPEN`, `DONE`; Task: `TODO`, `DOING`, `DONE`, `CANCELLED`; workflow step is a board column, not either lifecycle. |
| Authorization | Server decides tenant isolation, entity/action authorization, locks, transitions and dependency validity. Client offers defensive action gating only. |
| Concurrency | Every non-GET sends `Idempotency-Key`; only send `version` where that endpoint contract requires it. Keep the user draft on `409`, `423`, or `428`. |
| Aggregates | Dashboard/report totals come from summary endpoints; never derive them from paginated lists. |
| Money | Preserve source contract's `float64` transport until an approved finance ADR and reconciled migration establish a replacement. |

## 3. Component boundaries

```text
Browser
  app routes ──> feature / layout ──> typed API adapter + React Query ──> /api/v1
                                                           │
                                                        shared
API domains: Auth/RBAC | Customer | Project/Team/Task | Documents | Finance | Audit/Insights
                                                           │
                                         PostgreSQL + authorized object storage
```

Allowed frontend dependency direction: `app → feature/layout`; `feature → api/shared`; `shared → api`.
Forbidden: `api/shared → feature`, `feature → app`, and internal imports across features. Each domain has one typed adapter and canonical query-key factory; adapters unwrap API envelopes, map RFC-7807 errors, attach idempotency, and keep components transport-agnostic.

## 4. Domain invariants and integration contracts

- All data and relations are tenant-scoped. Client-provided `organization_id` is never authoritative.
- A Project has at most one Team. A Task assignee must be an active member of that Project Team and the selector must use `GET /projects/{id}/assignable-users`.
- A task parent/dependency stays in its Project/tenant; self/cycle dependencies are invalid. An unfinished blocker prevents transition to `DOING` or `DONE`.
- Project completion uses `POST /projects/{id}/complete`; the client must render `PROJECT_COMPLETION_BLOCKED` metadata and must not call compatibility `/close` as a canonical action.
- Lists use server filtering/search/paging; standard envelope is `{ data, pagination }`, though small lists may omit pagination. Entity responses are unwrapped centrally.
- Documents use multipart upload and authorized blob download; server controls MIME, size, malware scan and lock enforcement. UI renders `422`, `413`, `415`, and `423` as distinct recoverable states.
- Time/invoice editability and transitions are enforced by the server. Invoice source time entries and payment ledger are displayed; UI never infers billing totals/locks.
- Every material mutation must produce immutable audit evidence; audit dashboard/report views use server results.

## 5. Security, reliability, and UX constraints

- Send bearer credentials only as required by the API; clear local session on `401`. Do not place passwords, access tokens, MFA secrets/QR codes, or sensitive PII in logs, query cache, screenshots, or documentation.
- Problem JSON must map `401`, `403`, `404`, `409`, `423`, and `428` to separate UI states. A `403` retains draft and avoids blind retry; `428` requires explicit reload/merge/retry.
- Screens need loading, empty, error, forbidden, and locked/stale states; dialogs need focus management and the board needs a keyboard alternative. Vietnamese-first copy belongs in a catalog; raw backend errors are not rendered.
- Required delivery evidence: CI lint/typecheck/test/build, role-positive and role-negative tests, contract/e2e tests as appropriate, idempotency/audit/lock verification, and documented error fixtures. Runtime availability/performance monitoring, backups, and deployment settings are not yet evidenced and remain release-readiness work.

## 6. Execution sequence and safe parallelism

1. Close the gates below and repeat implementation-readiness review.
2. Epic 01 Foundation/Identity establishes client boundaries, session, error mapper, query conventions, RBAC display fallback, and CI.
3. Epic 02 Customer/Project/Team establishes context navigation and assignment eligibility.
4. Epic 03 Task/Board follows only after G-01/G-02/G-04. Epic 04 Documents/Finance follows only after G-03/G-04/G-06. Epic 05 Insights/Governance can start read-side contract work after Foundation, but release depends on role/audit decisions. Epic 06 owns rehearsal and cutover.

Within an approved API contract, frontend features in different domains may proceed in parallel. Do not parallelize competing edits to shared API/query/error/auth layers, the Task canonical adapter, workflow migration, or the design-system foundation without an assigned owner and integration sequence.

## 7. Blocking gates G-01…G-07

| Gate | Decision/evidence required | Owner(s) | Delivery effect |
| --- | --- | --- | --- |
| G-01 | Running-environment smoke plus contract fixtures for `/tasks`: success, auth/tenant/error, paging, idempotency and high-risk dependency/review paths. | QA + BE | Blocks Epic 03 canonical Task/Board. |
| G-02 | Choose retain/migrate/retire legacy Project Workflow Board; document write ownership, redirect expiry/telemetry, data mapping and no-concurrent-write rule. | PO + BA | Blocks Epic 03 and cutover design. |
| G-03 | Approved invoice/payment/time-entry transition and lock matrix, with relevant 4xx samples and audit expectations. | PO + Finance + BE | Blocks Epic 04 finance. |
| G-04 | Role × action matrix reconciled with handlers and authorization tests; resolve `/close` guard drift, audit verify access, document-lock role policy and invoice-status policy. | PO + Security + BE | Blocks privileged/mutating work in Epics 03–04 and release. |
| G-05 | ADR selecting MUI or Ant Design, plus component migration/ownership plan. | UX + FE | Blocks production UI foundation. |
| G-06 | Approved upload/security/retention policy: MIME/size, scan behavior, storage/download authorization, WORM lock and error contract. | Security + BE | Blocks Epic 04 documents. |
| G-07 | Approved source-to-target mapping/seed approach, dry run, reconciliation criteria, backup/rollback owner and cutover plan. | BA + BE + Ops | Blocks production migration/release. |

## 8. Story-entry and release gates

A story can enter `ready_for_development` only when it traces to an `FR-*`, has an owner, verified/approved request-response-authorization-error contract, UX states, independent acceptance tests, role/test data, and no unresolved canonical dependency. `CONCERNS` permits only work demonstrably independent of its unresolved gate and requires PO's recorded risk acceptance.

Production release additionally needs real contract/staging evidence for every Release-1 capability, migration dry-run/reconciliation, backup/rollback rehearsal, role-based UAT, accessibility/RBAC/audit/finance checks, and a removal deadline for compatibility redirects. These are release conditions, not assertions that the environment already satisfies them.

## 9. ADR backlog

Existing ADR-01…ADR-07 remain binding. Create or update a dated ADR when deciding: the single UI library (G-05); legacy workflow disposition (G-02); finance representation/transition rules (G-03); authorization exceptions and role matrix (G-04); document retention/lock policy (G-06); and migration/cutover ownership (G-07). Each ADR must name alternatives, affected contracts/data, migration/rollback, test evidence, and owner.
