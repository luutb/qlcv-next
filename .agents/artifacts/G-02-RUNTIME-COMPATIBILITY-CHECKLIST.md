# G-02 — Runtime Compatibility Checklist

**Gate:** G-02 Legacy Project Workflow Board policy  
**Role:** Architect sidecar task  
**Date:** 2026-09-08  
**Decision status:** `BLOCKED / RUNTIME EVIDENCE OPEN`  
**Scope:** compatibility of the legacy **Project Workflow Board** with canonical Task/workflow-step execution during cutover.

This artifact is a runtime evidence checklist. It does not change `ADR-08-LEGACY-WORKFLOW-CUTOVER.md`, does not choose a new disposition, and does not authorize concurrent writes or transition G-02 to `PASS`.

## 1. Inputs and evidence boundary

Reviewed:

- `docs-master/QLCV_NEXT_BMAD_MASTER.md`
- `docs-master/QLCV_NEXT_API_MASTER.md`
- `.agents/artifacts/ADR-08-LEGACY-WORKFLOW-CUTOVER.md`
- `.agents/artifacts/ARCHITECTURE_SPINE.md`
- `.agents/artifacts/GATE_WORK_ITEMS.md`
- `.agents/artifacts/BACKEND_EVIDENCE_2026-09-07.md`
- `.agents/artifacts/READINESS_REVIEW.md`
- Frontend route/API references under `src/`
- Backend router/source under `/Users/sapo/golang/qlcv-work-board`

Current evidence is `SOURCE-VERIFIED` plus package-test evidence. Docker/runtime HTTP, database, telemetry, staging parity, migration mapping, and rollback rehearsal are not evidenced. `go test ./...` and frontend build/smoke results do not close this gate.

## 2. Compatibility contract to prove

The following target is inferred directly from ADR-08 and the master/API documents and must be confirmed by PO/BA/BE before execution:

1. `Task` plus `workflow_step` is the only execution model and canonical write model.
2. `/api/v1/tasks/*` is the canonical Task adapter/UI path.
3. The legacy Project Workflow Board is compatibility-only. Its read behavior, redirect/alias behavior, and any remaining write behavior must have an explicit owner and expiry.
4. `/api/v1/issues/*` is a Task compatibility transport, not a second Project Workflow Board and not a second frontend model/query-key family. Its validation belongs with G-01/G-02 boundary testing, but it must not be used to justify legacy Project Board writes.
5. No request may create or maintain a second workflow state, cache family, or competing write path.

## 3. Acceptance criteria

| ID | Acceptance criterion | Required evidence | Owner | Status |
| --- | --- | --- | --- | --- |
| AC-G02-01 | PO/BA decision identifies `retain`, `migrate`, or `retire` for the legacy Project Workflow Board, including affected users/routes and target date. | Approved decision record linked to ADR-08, with owner and date. | PO + BA | OPEN |
| AC-G02-02 | Canonical read/write ownership is explicit: Task/workflow-step state has one authoritative API and one storage model. | Runtime request trace and code/config reference showing canonical path and persisted state. | Architect + BE | OPEN |
| AC-G02-03 | Every legacy route has a tested behavior: redirect, read-only compatibility response, or controlled rejection with actionable deprecation message. | Authenticated route matrix with status, `Location`/problem code, body contract, tenant and role cases. | BE + QA | OPEN |
| AC-G02-04 | Legacy and canonical reads are parity-checked for the same tenant/project and equivalent workflow state. | Seeded staging dataset; normalized response diff for columns, task/project IDs, step IDs, ordering and state. | QA + BE | OPEN |
| AC-G02-05 | Concurrent write safety is proven: a legacy Project Board write cannot race with canonical Task/workflow-step writes, or the legacy write is disabled before canonical writes are enabled. | Negative test, server logs/audit, and deployment flag/config evidence; no dual-write window. | BE + Ops | OPEN |
| AC-G02-06 | Redirect/alias usage emits telemetry with route, tenant-safe actor context, target, result, correlation ID and deprecation version/date without secrets or sensitive payloads. | Dashboard/query or structured log sample from staging; redaction check. | BE + Observability | OPEN |
| AC-G02-07 | Deprecation has an externally visible expiry and an operational owner, with warning/response behavior before and after expiry. | Config/contract, sample responses, runbook and owner sign-off. | PO + BE + Ops | OPEN |
| AC-G02-08 | Mapping between legacy Project Workflow Board state and canonical Task/workflow-step state is deterministic and reconciled. | Mapping table, dry-run output, mismatch policy and accepted synthetic fixtures. | BA + BE + QA | OPEN |
| AC-G02-09 | Rollback can restore the previous safe routing/configuration without restoring a competing data model or silently replaying writes. | Rehearsal record with trigger, owner, steps, validation and rollback result. | Ops + BE | OPEN |
| AC-G02-10 | Security and audit behavior is equivalent during compatibility: tenant isolation, authorization, idempotency and material mutation audit events are preserved. | Positive/negative role tests, cross-tenant tests, idempotency replay and audit samples. | Security + QA + BE | OPEN |

## 4. Route and write ownership checklist

### 4.1 Known source-level routes

| Route | Observed owner/handler | Intended G-02 disposition to verify | Write? | Runtime check |
| --- | --- | --- | --- | --- |
| `GET /api/v1/tasks/board` | Canonical Task board handler (`handleGetTasksBoard`) | Canonical read source for Task/workflow-step board. | No | Verify response shape, tenant/role behavior, ordering and parity fixture. |
| `PATCH /api/v1/tasks/{id}/workflow-step` | Canonical Task handler (`handleUpdateTaskWorkflowStep`) | Sole canonical Task board mutation. | Yes | Verify idempotency, authorization, version/conflict semantics, audit and persisted state. |
| `GET /api/v1/projects/board` | Legacy Project Workflow Board handler (`handleGetProjectsBoard`) | Compatibility read/redirect/reject behavior must be decided. | No | Verify redirect or read-only contract, telemetry, expiry and parity with canonical data. |
| `PATCH /api/v1/projects/{id}/workflow-step` | Legacy Project workflow mutation (`handleMoveProjectWorkflowStep`) | Must not remain an unbounded competing write path. Disable, gate, or explicitly migrate with owner and expiry. | Yes | Verify it cannot race with canonical Task writes; test role, tenant, idempotency, audit and deprecation response. |
| `GET /api/v1/issues/*` and equivalent mutations | Task handlers exposed through compatibility transport | Task alias only; not Project Board ownership. | Some | Verify alias parity under G-01 and confirm no separate FE query keys/model or independent state. |
| Frontend `/work` | Canonical Task Work Board feature; calls `/tasks/board` | Canonical product UI path. | Via Task APIs | Verify no call to Project Board endpoints and correct error/deprecation states. |
| Frontend project workflow compatibility surface | `src/features/projects/api/projects.api.ts` exposes `/projects/board` and Project `/workflow-step` | Must be classified as legacy/compatibility and governed by cutover policy; no implicit canonical ownership. | Yes via adapter | Inventory consumers, guard or remove writes according to approved decision; add runtime test before use. |

### 4.2 Ownership questions that remain unanswered

- Does the legacy Project Board represent Project-level workflow state, Task workflow-step state, or a mixed projection? The source routes alone do not establish safe equivalence.
- Is `PATCH /projects/{id}/workflow-step` still intentionally writable in the target release, or must it return a deprecation/rejection response?
- Which component owns redirects: frontend route adapter, backend API, edge/router, or a deployment flag? Only one owner may decide the compatibility response.
- What is the exact source-to-target mapping for legacy project workflow columns, step IDs, task IDs and ordering?
- What is the cutover instant and what prevents writes from an old app instance during rollout?
- Which telemetry backend and retention period are authoritative for proving alias usage and zero legacy writes?

## 5. Runtime evidence still missing

### Environment and contract

- Running backend plus database with synthetic, tenant-isolated fixtures.
- Route matrix for canonical and legacy paths: `200/3xx`, `401`, `403`, safe `404`, validation `4xx`, conflict/stale response, and server failure behavior.
- Real request/response fixtures for both board reads, including pagination/filter/template semantics where applicable.
- Correlation ID and request trace across frontend → API → handler → database/audit.

### Parity and data mapping

- Same project/template/task fixture read through legacy and canonical paths, normalized diff attached.
- Explicit handling for missing/archived workflow steps, deleted projects/tasks, ordering/position, unassigned tasks and invalid legacy IDs.
- Dry-run mapping output with counts: source rows, mapped rows, skipped rows, conflicts and unresolved rows.
- Reconciliation rule and acceptable mismatch threshold; no silent coercion of unknown payloads.

### Write isolation and safety

- Sequential canonical write followed by legacy read and vice versa.
- Parallel/concurrent canonical and legacy write attempt proving rejection/serialization/no divergence.
- Idempotency replay for every remaining write endpoint.
- Audit records showing actor, route/operation, entity, before/after or safe metadata, correlation ID and outcome.
- Authorization and tenant-boundary tests for each route; verify legacy route does not have weaker authorization than canonical route.

### Operations

- Staging telemetry sample and dashboard/query for legacy requests and legacy writes.
- Feature flag/config evidence for enabling, disabling and expiring compatibility.
- Deployment sequencing test with old and new frontend/backend versions.
- Rollback rehearsal against disposable staging data, including post-rollback parity and audit validation.

## 6. Telemetry checklist

Telemetry must be structured and privacy-safe. It must not contain bearer tokens, passwords, MFA material, raw request bodies, or unnecessary PII.

- [ ] Event name/version defined, for example `legacy_workflow_compatibility_v1`.
- [ ] Dimensions defined: `route_family`, `http_method`, `compatibility_mode` (`redirect|read_only|rejected|write_blocked`), `target_route`, `result_code`, `tenant_hash`, `actor_role`, `correlation_id`, deployment version.
- [ ] Legacy **write** counter is separate from legacy read/redirect counter.
- [ ] Counter distinguishes attempted, accepted, rejected and failed legacy writes.
- [ ] Dashboard alert threshold and owner defined; alert on any accepted legacy write after cutover.
- [ ] Sampling/retention policy is documented and sufficient to prove expiry readiness.
- [ ] Logs/metrics are tenant-safe and redaction-tested.
- [ ] Synthetic smoke request can be located by correlation ID without exposing secrets.

## 7. Deprecation and expiry checklist

- [ ] PO/BA approve disposition and named business/technical owner.
- [ ] Public/internal deprecation date and hard expiry date recorded.
- [ ] Compatibility version and target canonical route recorded in API/runbook documentation.
- [ ] Before expiry: warning header/message or documented response contract is tested.
- [ ] At expiry: legacy route behavior is deterministic and actionable (`410`/controlled problem or approved redirect), not silent payload conversion.
- [ ] Frontend removes legacy navigation and mutation calls before the hard expiry.
- [ ] Backend rejects legacy writes before or at cutover according to the approved no-concurrent-write plan.
- [ ] Telemetry confirms zero accepted legacy writes for the observation window.
- [ ] Removal owner, change ticket and rollback boundary are recorded.

## 8. Rollback checklist

- [ ] Define rollback triggers: parity mismatch, unauthorized cross-tenant result, accepted competing write, audit gap, error-rate/SLO breach or unreconciled mapping.
- [ ] Name incident commander, BE owner, frontend owner, Ops owner and PO decision maker.
- [ ] Freeze or reject legacy/canonical mutations consistently during rollback; do not reopen two write paths.
- [ ] Revert routing/feature flag/config only through versioned deployment artifacts.
- [ ] Preserve audit and telemetry from failed cutover; never delete evidence to make parity pass.
- [ ] Reconcile writes accepted immediately before rollback using idempotency keys/correlation IDs.
- [ ] Validate tenant isolation, route behavior, canonical state and read parity after rollback.
- [ ] Document data repair authority and explicit approval for any repair; no silent payload translation.
- [ ] Re-run smoke, authorization, idempotency and audit checks before re-enabling traffic.

## 9. Recommended execution order and handoff

1. PO/BA freeze the G-02 disposition and expiry policy without changing ADR-08 in this sidecar.
2. BE/QA expose a disposable runtime with synthetic tenants and capture the route matrix.
3. BA/BE produce the legacy-to-canonical mapping and dry-run reconciliation.
4. BE/Ops prove write isolation, telemetry, deprecation behavior and rollback.
5. QA attaches fixtures and results to this checklist; Architect reviews completeness.
6. Only PO/BA/Architect/QA owners named by the workflow may decide the gate transition. This artifact alone does not transition G-02.

## 10. Evidence links

- [ADR-08 legacy workflow cutover](./ADR-08-LEGACY-WORKFLOW-CUTOVER.md)
- [Architecture spine](./ARCHITECTURE_SPINE.md)
- [Gate work items](./GATE_WORK_ITEMS.md)
- [Backend evidence](./BACKEND_EVIDENCE_2026-09-07.md)
- [BMAD master](../../docs-master/QLCV_NEXT_BMAD_MASTER.md)
- [API master](../../docs-master/QLCV_NEXT_API_MASTER.md)

**Architect conclusion:** `G-02` remains `BLOCKED / RUNTIME EVIDENCE OPEN`. Source-level route ownership is identified, but route parity, legacy write isolation, telemetry, expiry and rollback have not been proven in a running environment.
