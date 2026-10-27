# QLCV Next — Requirements Traceability Matrix

**Baseline:** `docs-master/QLCV_NEXT_BMAD_MASTER.md` + `QLCV_NEXT_API_MASTER.md` (2026-09-07)  
**Purpose:** delivery, QA and release traceability. Requirement changes must update this matrix, the owning story, and (where applicable) ADR/API contract.

## Delivery controls

| Control | Rule / evidence | Owner |
| --- | --- | --- |
| DoR | Story has FR/NFR link, owner, testable AC, UX states, API/role/error contract and test data. | BA + PO + Architect + QA Lead |
| DoD | Review plus appropriate unit, contract and E2E tests pass; authorized and denied roles tested; audit/idempotency/lock evidence attached; no production fixture truth. | Dev + QA + Reviewer |
| Canonicality | One `Task` adapter/query-key family; `/tasks` canonical and `/issues` compatibility-only. Project lifecycle is `OPEN/DONE`; board column is workflow step. | Architect + Dev |
| Evidence location | Link test run, contract fixture or staging capture in the story/PR. Never include passwords, tokens, MFA secrets, or sensitive PII. | QA |

## Functional traceability

| Requirement | Epic / story | Acceptance and test evidence (minimum) | Gate / decision |
| --- | --- | --- | --- |
| FR-01 Identity session | E01 / 01.02 | Login, `GET /users/me`, refresh/logout/401 clear-and-redirect; no token exposure. Contract + E2E. | Current-user is `/users/me`; MFA UX out of R1. |
| FR-02 RBAC | E01 / 01.03 | Route/action denied UI and real 403; tenant boundary safe. Role E2E + API auth tests. | G-04 action matrix. |
| FR-03 User admin | E01 / 01.04 | User CRUD, activate/deactivate/reset/MFA reset, confirmation and immutable audit. | G-04. |
| FR-04 Profile | E01 / 01.04 | Profile update with version; 428 retains draft and supports reload/merge. | Version contract fixture. |
| FR-05 Customer | E02 / 02.01 | Server search/page, create/edit/detail/archive/restore/conflict/document context; audit. | Customer conflict contract. |
| FR-06 Project lifecycle | E02 / 02.02 | Create in Customer context, detail deep link, `OPEN↔DONE`; complete-blocker meta/recovery. | Complete policy; canonical `/complete`, not `/close`. |
| FR-07 Team ownership | E02 / 02.03 | Team/member lifecycle, one Team per Project, archive/open-project blocker. | G-04. |
| FR-08 Eligible assignee | E02 / 02.03; E03 / 03.02 | Selector only from `assignable-users`; invalid team change/unassign shows recovery. | Assignment-conflict fixture. |
| FR-09 Task lifecycle | E03 / 03.01–03.02 | Canonical typed CRUD, child tree, status/step/order/assignee/comments/reviews; drafts survive failures. | G-01, G-02, G-04. |
| FR-10 Dependencies | E03 / 03.03 | Add/remove/search; self/cycle and incomplete blockers rejected; board shows impact. | Cycle/incomplete 409 fixture. |
| FR-11 Reviews | E03 / 03.02 | Named reviewer, request and approve/request-changes decision with history. | Review permission/policy confirmed. |
| FR-12 Work Board | E03 / 03.04 | Task-only board; workflow-step columns separate from status; URL state, keyboard move, optimistic rollback. | G-01/G-02; accessibility evidence. |
| FR-13 Workflow templates | E03 / 03.04 | Template/step admin and migration-safe use; no silent historical Task mutation. | G-02 legacy workflow policy. |
| FR-14 Documents | E04 / 04.01 | Contextual multipart upload/list/blob download/delete/lock; malware, size/type and WORM states actionable. | G-06; PARTNER-only lock unless contract changes. |
| FR-15 Time entries | E04 / 04.02 | Project-context log/filter/edit/delete; billing lock prevents change and retains state. | G-03; 423 fixture. |
| FR-16 Invoices | E04 / 04.03 | Generate from eligible Project/source entries; transitions and audit; source trace visible. | G-03 finance transition matrix. |
| FR-17 Dashboard | E05 / 05.01 | Render verified `/dashboard/summary` aggregates only; attention/deep links. | Aggregate contract/staging fixture. |
| FR-18 Reports | E05 / 05.02 | Filterable task/workload reports and URL deep-link drilldown. | Report contract. |
| FR-19 OKR scope | E05 / 05.02 | Explicit PO decision: validated implementation evidence **or** R1 removal. | PO scope decision. |
| FR-20 Audit | E05 / 05.03 | Entity audit paging/diff and Super Admin integrity check; material mutations create event. | G-04; resolve current authenticated verify-route drift. |
| FR-21 Tenant/purge | E05 / 05.03; E06 / 06.03 | Settings authorization; purge approved environment/flow only with audit. | Super Admin policy and release checklist. |

## Non-functional traceability

| Requirement | Scope / story | Verification evidence | Gate |
| --- | --- | --- | --- |
| NFR-01 Quality baseline | E01/01.01; E06/06.03 | CI strict typecheck, lint, tests and build pass. | DoD. |
| NFR-02 Errors | E01/01.02–03; all mutation stories | Problem-JSON mapper; distinct 401/403/409/423/428 state tests. | API error fixtures. |
| NFR-03 List performance/data | E02–E05 list stories | Server pagination/filter/search, cancellation and pagination contract tests. | List API contract. |
| NFR-04 Runtime proof | All R1 stories; E06/06.03 | Contract test or staging capture for every consumed endpoint and high-risk error path. | Release blocker. |
| NFR-05 Accessibility | E01/01.01, E03/03.04, all UI | Keyboard, semantic labels/headings, modal focus, contrast AA, live feedback; manual + automated audit. | G-05. |
| NFR-06 Vietnamese-first | E01/01.01; all UI | Catalog coverage; safe mapped backend errors; locale UI test. | UX review. |
| NFR-07 Security/privacy | E01/01.02–03; E04/04.01; E06/06.03 | No secret/PII in logs/captures; authz/tenant tests; server upload scan/type/size tests. | G-04, G-06. |
| NFR-08 Auditability | All material mutations; E05/05.03 | Immutable actor/entity/action/time/correlation audit fixture and history check. | DoD + audit contract. |

## Required decisions and readiness gates

| ID | Decision / exit criterion | Accountable | Blocks |
| --- | --- | --- | --- |
| G-01 | Live smoke + DTO/error contract for `/tasks`; prove `/issues` is compatibility only. | QA + BE | E03 |
| G-02 | Retire, migrate, or time-box legacy Project Workflow Board; prevent competing writes. | PO + BA | E03 |
| G-03 | Approve invoice/payment/time-entry transition and lock matrix with 4xx samples. | PO + Finance + BE | E04 |
| G-04 | Approve role×action matrix; resolve `/close` weaker guard and audit-verify/document-lock policy drifts. | PO + Security + BE | E03/E04/E05 |
| G-05 | Choose exactly one design system and migration plan. | UX + FE | UI implementation |
| G-06 | Approve MIME/size/scan/retention/lock and error policy. | Security + BE | E04 |
| G-07 | Approve data mapping, dry-run reconciliation, backup/rollback owner and seed policy. | BA + BE + Ops | E06/release |

## High-risk regression pack

1. Project complete blocked (`PROJECT_COMPLETION_BLOCKED`) with required tasks, balance and conflict metadata.
2. Team reassignment/unassign conflict; assignee eligibility and recovery link.
3. Task dependency self/cycle and blocked `DOING`/`DONE`; board rollback preserves draft.
4. Profile version conflict; document malware/type/size/WORM; time-entry billing lock.
5. Invoice generation/status transitions and source-entry trace; audit event/idempotent replay.
6. Role/tenant matrix for mutations, notably Project `/complete` vs compatibility `/close`, document lock, audit verify and tenant purge.

## Change protocol

BA records changed FR/NFR and impact; Architect updates ADR/contract when technical semantics change; PO re-accepts scope; QA updates trace/test pack. No story proceeds when its linked gate is open.
