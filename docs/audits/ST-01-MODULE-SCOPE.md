# ST-01 Module Scope Decisions

## IS-01.2.1 — Budget and Expenses

### Decision summary

| Domain | Decision | Product scope | Immediate effect |
|---|---|---|---|
| Budget | **KEEP** | Preserve the Budget domain and deliver a verified MVP through the canonical service architecture. | Do not delete current Budget types, service contract, or active consumers. Do not restore the deleted legacy UI wholesale. |
| Expenses | **KEEP** | Preserve Expenses as a Budget-linked finance capability required for cost tracking and reconciliation. | Do not delete current Expense types or service contract. Rebuild only the verified MVP after the backend contract and permissions are confirmed. |

Neither domain is `DEFER`: the repository backlog already makes cost tracking part of ST-13's product Story, and the current tree contains intentional service/domain artifacts. Individual advanced capabilities are held outside MVP until their contracts are proven; that does not defer the domain decision.

This Issue records scope only. It does not restore, delete, or modify application code.

### Ownership and custody

- Decision authority: **ST-01 owner / Tech Lead**, as assigned in `docs/BACKLOG.md`.
- Decision-record custodian for this Issue: **`repo_stabilizer`**.
- Downstream delivery owner: **Feature Team Finance** for ST-13.
- Contract and migration owners: **`core_types`** for ST-02 and **`api_services`** for ST-03.
- Independent acceptance: **`qa_reviewer`** at the Issue gate.

These are role assignments, not named human ownership. The repository does not identify a person holding each role.

## Evidence audit

### Current routes and navigation

- There is no current `/budgets` or `/expenses` route under `src/app/(dashboard)`. The remaining related route is `src/app/(dashboard)/cost-centers/page.tsx`.
- The current menu in `src/components/layout/Sidebar.tsx:42`–`48` contains no Budget, Expenses, or Cost Centers entry.
- The earlier tree immediately before commit `1daaac7` contained:
  - `src/app/(dashboard)/budgets/page.tsx`
  - `src/app/(dashboard)/budgets/create/page.tsx`
  - `src/app/(dashboard)/budgets/[id]/page.tsx`
  - `src/app/(dashboard)/budgets/[id]/edit/page.tsx`
  - `src/app/(dashboard)/budgets/analytics/page.tsx`
  - `src/app/(dashboard)/expenses/page.tsx`
- The earlier Sidebar exposed Budget management, Budget analytics, Expenses, and Cost Centers to role-specific audiences. That historical role list is evidence of prior intent, but it is not an approved current permission contract.

Conclusion: route and menu removal makes both domains unavailable as complete user journeys today. It does not by itself prove product removal.

### Current components and consumers

| Artifact | Current use | Finding |
|---|---|---|
| `src/components/budget/BudgetAlertsWidget.tsx` | Imported and rendered by `src/app/(dashboard)/admin/page.tsx:18` and `:182` | Live Budget consumer using `budgetService`; preservation is required until it is deliberately replaced. |
| `src/components/budget/BudgetSummaryWidget.tsx` | Imported and rendered by the admin page at `:17` and `:179` | Placeholder implementation; the admin passes unsupported props, so it is not production-ready. Keep the capability, not necessarily this implementation. |
| `src/components/features/budget/index.ts` | Re-exports the summary widget | Compatibility barrel with no discovered consumer; evaluate during consumer migration. |
| `src/components/tasks/BudgetTracking.tsx` | Re-exported by `src/components/features/tasks/index.ts`; no direct render/import was found | Contains Budget totals and a Budget-linked “add expense” interaction. It is dormant evidence, not a verified production consumer. |
| `src/components/tasks/ResourceManagement.tsx` | Uses a local resource type value named `budget` | Related task-resource concept, but not proof that its local model matches the finance Budget domain. Do not couple it without contract evidence. |
| `src/app/(dashboard)/cost-centers/page.tsx` | Imports `CostCenter` from the Budget type module and calls `BudgetRepo` | Active source dependency on the combined finance domain, but currently contains direct fetch/debug logic and old architecture. |

Focused TypeScript inspection found current integration errors in the admin Budget widget props, missing `BudgetAlert.budget_name`, the Budget service's `ApiResponse` import, and Blob response typing. This supports repair/migration; it does not justify silent deletion of a backlog-required domain.

### Services, repositories, and types

- `src/services/budget.service.ts:22`–`246` defines Budget CRUD/approval/status, categories, Expenses, attachments, alerts, forecasts, analytics, Cost Centers, export, and bulk operations through `src/services/api/client.ts`.
- `src/services/index.ts:3` intentionally exports `budgetService`.
- `src/types/budget.ts:1`–`330` defines Budget, categories, Expenses, attachments, alerts, forecasts, Cost Centers, request/query/response types, and form state.
- Two legacy repository implementations remain:
  - `src/repositories/BudgetRepo.ts`
  - `src/repositories/BudgetRepository.ts`
- `src/repositories/BudgetRepo.ts` is still consumed by Cost Centers. No current consumer was found for `src/repositories/BudgetRepository.ts`.
- The roadmap explicitly selects `src/services` plus `src/services/api/client.ts` as the target and requires migration away from `src/repositories` and `src/api/client.ts` (`docs/ROADMAP.md:50`–`56`; `docs/BACKLOG.md:165`–`179`).

Conclusion: the domain has duplicate and inconsistent data layers. `src/services/budget.service.ts` is the preservation target; repository presence is migration debt, not a reason to remove Budget or Expenses.

### Tests

- The only discovered current unit test is `src/components/ui/__tests__/SkeletonLoader.test.tsx`.
- No Budget- or Expense-focused test/spec file was found.
- The quality baseline already records that the test include pattern does not currently collect the `.test.tsx` test (`docs/QUALITY_BASELINE.md`).

Conclusion: there is no automated evidence that any current or historical Budget/Expense flow works. Restoring routes before contracts and tests would reproduce an unverified surface.

### Backlog and roadmap intent

- `docs/BACKLOG.md:114`, `:127`, and `:163` explicitly schedule Budget type consolidation, Budget component type fixes, and completion of retained Budget services.
- ST-13 states that an accountant needs payment processing and cost tracking for reconciliation (`docs/BACKLOG.md:490`).
- TK-13.2 requires MVP comparison, backend contract confirmation, intentional restore/remove work, and a data-migration decision (`docs/BACKLOG.md:499`–`504`).
- ST-13 acceptance requires Budget/Expense to have clear scope and no half-removed/half-retained module (`docs/BACKLOG.md:513`).
- The roadmap says to decide Budget, Expenses, and Cost Centers before restoration/removal (`docs/ROADMAP.md:156`–`164`).

This is direct product evidence for keeping both domains in scope while narrowing what is restored.

### Relevant Git history

| Commit | Evidence | Interpretation |
|---|---|---|
| `0e912b5` (`update fe`, 2026-04-29) | Added Budget routes, Expenses route, Budget/Expense components, both repositories, mock repository, task Budget tracking, and the combined type module. | Establishes that both domains once had broad UI and data-layer implementations. It does not prove those implementations were correct. |
| `7d07611` and `d84ee4d` (2026-04-29) | Modified the Budget and Expenses pages/components shortly after introduction. | Shows active iteration, but no test or backend acceptance evidence was found. |
| `1daaac7` (`update code`, 2026-07-28) | Deleted all Budget/Expenses routes, most detailed components, `ExpenseForm`, and the mock repository; simplified the two remaining widgets; added `src/services/budget.service.ts`. The scoped diff removes 6,257 lines and adds 323. | Strong evidence of an incomplete architecture/UI reset: the same commit removes legacy UI while introducing the target service. It is not a clean domain removal because active consumers, types, repositories, and a new service remain. |

Commit subjects are generic and no decision record accompanies the deletion. Therefore history alone cannot establish who approved product removal or why the UI was removed.

## Budget decision — KEEP

### In scope

The retained Budget MVP capability is:

1. A canonical Budget model and API contract.
2. List and detail Budget records with pagination/filter semantics matching the backend.
3. Create and update a Budget.
4. Explicit approval/status transitions supported by the backend and RBAC policy.
5. Budget categories required to classify allocations and Expenses.
6. Summary/utilization and active-alert display where the backend provides those contracts.
7. Budget linkage required by Expenses and Cost Centers.
8. Currency/date/error/loading handling and focused automated tests for the above.

Current paths to preserve until migration decides their final form:

- `src/types/budget.ts`
- `src/services/budget.service.ts`
- the `budgetService` export in `src/services/index.ts`
- `src/components/budget/BudgetAlertsWidget.tsx`
- `src/components/budget/BudgetSummaryWidget.tsx`
- `src/components/features/budget/index.ts`
- `src/components/tasks/BudgetTracking.tsx`
- Budget/Cost Center consumers that still depend on the shared contract

“Preserve” does not mean each file must survive unchanged. It means no deletion before its required capability is migrated, replaced, or explicitly shown unused.

### Out of the retained MVP

- Wholesale restoration of the deleted Budget pages and tabs from before `1daaac7`.
- The deleted `BudgetRepoMock` and mock-backed production behavior.
- A standalone analytics page, forecast authoring UI, bulk deletion, and Budget export until ST-13 verifies the backend and product requirement.
- Reuse of the old Sidebar role matrix without ST-07 authorization review.
- Keeping both legacy repositories after all consumers migrate to the canonical service.
- Treating the placeholder `BudgetSummaryWidget` as complete.

These capabilities may be added later by a separately accepted backlog item. They are not implicit deliverables of `KEEP`.

### Why KEEP

- ST-13 explicitly retains cost tracking and requires a Budget/Expense scope outcome.
- The canonical service was added in the same commit that removed legacy UI, which indicates migration intent.
- An active admin widget calls Budget alerts, and Cost Centers depends on the combined Budget types/repository.
- Expenses are budget-linked in the current model and endpoints; removing Budget would orphan the retained Expense decision.
- Deleting the domain now would conflict with ST-02, ST-03, and ST-13 work already specified in the backlog.

## Expenses decision — KEEP

### In scope

The retained Expenses MVP capability is:

1. A canonical Expense model linked to a Budget and optionally a Budget category.
2. Per-Budget paginated/filterable Expense list and Expense detail.
3. Create and update an Expense.
4. Delete only under a verified business rule and permission policy.
5. Approve/reject transitions with required reason/note behavior where supported by the backend.
6. Amount, currency, date, vendor, category, task/contract linkage fields only when present in the confirmed contract.
7. Summary impact on Budget spent/remaining values with explicit refresh/cache behavior.
8. Error/loading/empty states and focused automated tests.

Current paths to preserve until migration decides their final form:

- Expense, request, query, response, and form types inside `src/types/budget.ts`
- Expense methods inside `src/services/budget.service.ts`
- the dormant add-expense interaction in `src/components/tasks/BudgetTracking.tsx` until its consumer status and contract are resolved

### Out of the retained MVP

- Wholesale restoration of `src/app/(dashboard)/expenses/page.tsx`, `BudgetExpensesTab`, or the deleted `ExpenseForm` from Git history.
- The old global Expenses page's N-Budget fan-out request pattern; a global list needs a dedicated backend endpoint before implementation.
- Bulk approve/reject and Expense export until ST-13 confirms endpoint, authorization, pagination, and failure semantics.
- Attachment upload activation until `IS-01.2.2` resolves the Files module and ST-13 confirms upload/storage/security contracts. The current type/service signature is preserved only to prevent premature destructive cleanup.
- Treating Expense status `paid` as an Expense-owned transition without alignment to ST-13 Payment workflow.
- Independent Expense navigation until a usable route, RBAC, and end-to-end checks exist.

### Why KEEP

- Cost tracking and reconciliation are explicit ST-13 business outcomes.
- The current canonical service and type module deliberately retain Expense CRUD, approval, queries, and Budget association.
- Task Budget tracking already models adding an expense, even though the component is currently dormant.
- Removing Expenses would leave Budget's spent/committed model and ST-13 finance Story without its cost-record source.
- The absence of a current route is an implementation gap, not sufficient evidence to discard the business capability.

## Migration and deletion prerequisites

No legacy file may be restored or deleted solely from this decision. Downstream work must satisfy these gates in order:

1. **ST-02 contract consolidation**
   - Confirm `ApiResponse<T>`, pagination, money/currency, dates, optional relations, and status enums from real backend responses.
   - Remove duplicate local Budget shapes only after every consumer migrates.
   - Resolve current widget/service type errors without `any` or suppressions.
2. **ST-03 canonical data layer**
   - Make `src/services/budget.service.ts` use the single target client and response convention.
   - Move Cost Centers and any retained consumers away from `src/repositories/BudgetRepo.ts` and direct fetch.
   - Prove `src/repositories/BudgetRepository.ts` has no consumers, then delete it.
   - Delete `src/repositories/BudgetRepo.ts` only after Cost Centers and all finance consumers are migrated and smoke-tested.
3. **ST-04/ST-05 quality gates**
   - Add service contract tests and component/route tests for retained flows.
   - Keep scoped error counts from regressing before ST-05; require all gates green afterward.
4. **ST-07 authorization**
   - Define who can read, create, edit, approve, reject, delete, export, and administer Budget/Expense data.
5. **ST-13 backend and MVP confirmation**
   - Confirm actual endpoints, response wrappers, pagination, status transitions, idempotency, validation, attachment behavior, and Budget-total consistency.
   - Rebuild only the retained MVP routes/components; do not revert the 6,257-line legacy deletion.
   - Remove unselected advanced service methods/types only after endpoint and consumer checks prove them unnecessary.
6. **Navigation/release**
   - Add menu entries only after routes are functional and permission-tested.
   - Require finance E2E coverage before release acceptance.

## Dependency risks

| Risk | Impact | Required control |
|---|---|---|
| Two API clients and two repository implementations disagree on response shape | Empty data, double-unwrapping, runtime failures | ST-02/ST-03 canonical response contract before UI restoration |
| Current service imports `ApiResponse` from a module that does not export it | Typecheck failure | Resolve in ST-02; do not copy the broken signature into new UI |
| Admin passes props unsupported by both remaining Budget widgets | Admin route typecheck failure and unclear refresh behavior | Define widget contract and tests before treating dashboard integration as complete |
| `BudgetAlert` lacks the rendered `budget_name` field | Type/runtime display inconsistency | Use confirmed nested Budget relation or add a backend-backed DTO field |
| Cost Centers uses direct token-bearing fetch/debug code plus legacy repository | Security, logging, and response inconsistency | Migrate under ST-03/ST-13.3; never use it as a template |
| No Budget/Expense tests | High regression risk during migration | Add focused contract/component tests before repository deletion |
| No current routes or navigation | Domain cannot be completed by a user | Rebuild minimal verified route set in ST-13, then expose via tested RBAC navigation |
| Expense attachment depends on Files scope | Orphan upload behavior and security uncertainty | Hold activation until `IS-01.2.2` and backend contract are resolved |
| Expense `paid` overlaps Payment workflow | Conflicting source of truth | Define transition ownership in ST-13.1/ST-13.2 |
| Historical UI was large and unverified | Restoring it can reintroduce old MUI/API/type defects | Use history only as requirements evidence, not as code to revert wholesale |

## Effect on later Stories

| Story | Effect of this decision |
|---|---|
| ST-02 | Budget and Expense domain types are retained and consolidated; they must not be discarded as dead code. |
| ST-03 | `budget.service.ts` is the target. Repository consumers migrate, then duplicate repositories are removed with proof. |
| ST-04 | Add tests for retained service contracts and critical finance UI; do not resurrect legacy tests blindly. |
| ST-05 | Budget/Expense type and lint failures are part of stabilization; no new regression is allowed against the documented baseline. |
| ST-07 | Replace historical Sidebar roles with an explicit current permission matrix. |
| ST-08/ST-09 | Task/Case linkage to Budget/Expense must use canonical IDs and optional relations, not the local `BudgetTracking` shape by assumption. |
| ST-13 | Implement the retained MVP, verify backend contracts, resolve Payment/Files dependencies, and remove all leftover half-migrated code. |
| ST-14 | Dashboard/report consumers may use verified summaries only; placeholder widgets are not accepted evidence. |
| ST-15/ST-16 | Navigation and accessible finance UI follow functional routes and RBAC, not precede them. |
| ST-17/ST-18 | Add finance E2E/UAT scenarios before the domains are considered releasable. |

## Reproducible read-only commands

Run from the repository root. These commands do not inspect remotes or print author email fields:

```sh
git status --short --branch
rg --files src | rg -i 'budget|expense|cost-center'
rg -n -i --glob '!node_modules/**' '\b(budget|budgets|expense|expenses)\b' src docs
rg -n "BudgetTracking|BudgetSummaryWidget|BudgetAlertsWidget|budgetService|BudgetRepo|BudgetRepository|@/types/budget" src docs
rg -n -i "href.*(budget|expense)|path.*(budget|expense)|label.*(budget|expense)" src
rg --files | rg -i '(test|spec)\.(ts|tsx|js|jsx)$'
rg -n -i --glob '*.{test,spec}.{ts,tsx,js,jsx}' 'budget|expense' .
git log --all --format='%h%x09%ad%x09%s' --date=short --name-status -- ':(glob)**/*udget*' ':(glob)**/*xpense*'
git log --all --format='%h%x09%ad%x09%s' --date=short --name-status -- src/app src/components/layout/Sidebar.tsx
git ls-tree -r --name-only 1daaac7^ | rg -i 'budget|expense|cost-center'
git show --format='%h%n%ad%n%s' --date=iso-strict --stat 1daaac7 -- 'src/app/(dashboard)/budgets' 'src/app/(dashboard)/expenses' src/components/budget src/components/expense src/services/budget.service.ts src/repositories/BudgetRepoMock.ts
npx tsc --noEmit --pretty false --incremental false 2>&1 | rg -i 'budget|expense|cost-centers|admin/page'
```

The TypeScript command is diagnostic and currently exits non-zero under the documented pre-ST-05 baseline. It was run with incremental output disabled and did not change the worktree.

## Limitations

- No backend repository, OpenAPI schema, database migration, deployed environment, product analytics, or stakeholder interview was available in this Issue.
- Endpoint presence in frontend code is not proof that an endpoint exists or matches the declared DTO.
- Historical code and menu entries prove prior implementation intent, not current business acceptance or authorization.
- The audit did not run authenticated API calls, mutate data, restore deleted files, or validate runtime behavior.
- Advanced capabilities remain outside MVP unless ST-13 supplies backend and product evidence. If the Tech Lead changes the product decision, that change must be recorded by a later decision log rather than silently deleting retained artifacts.

## Independent QA readiness

`IS-01.2.1` is ready for independent QA when the focused diff contains only this file. QA should verify:

1. Budget and Expenses each have an explicit `KEEP` decision.
2. Every decision is supported by current-code, backlog, and Git-history evidence.
3. In-scope and out-of-scope capabilities are separate for each domain.
4. Deleted legacy UI is not represented as approved for automatic restoration.
5. Canonical-service migration and repository deletion prerequisites are explicit.
6. Files, Payment, permissions, testing, and backend-contract dependencies are surfaced.
7. No application file, backlog checkbox, review record, index entry, ref, or commit was changed by this Issue.

---

## IS-01.2.2 — Files and Notifications

### Decision summary

| Capability | Decision | MVP effect |
|---|---|---|
| Task and Expense attachments | **KEEP** | Retain a backend-mediated attachment capability scoped to its owning business record; do not create an independent file product first. |
| Standalone Files workspace, quota dashboard, version-history UI, public/team sharing, and generic file administration | **REMOVE from MVP** | Keep the deleted legacy route/components deleted. Reintroduce only a capability justified by a later accepted Story and verified backend contract. |
| Direct browser-to-Firebase Storage | **DEFER** | Do not activate or remove the shared Firebase utility until storage ownership is selected. The MVP defaults to the canonical backend API/client abstraction. |
| Authenticated in-app Notifications | **KEEP** | Deliver a minimal list/read/unread-count flow because the root provider and Header already expose this user contract. |
| Push/FCM, notification preferences, email/digest, and PWA notification settings | **DEFER** | Keep disabled until product need, token lifecycle, service-worker configuration, consent, backend delivery, and security prerequisites are accepted. |
| Deleted mock Notification page/components | **REMOVE from MVP** | Do not restore the mock data and callback-only implementation. Build a minimal route against a canonical service if the in-app MVP is scheduled. |

These are separate capability decisions. `KEEP` does not approve wholesale restoration, `REMOVE from MVP` does not authorize a deletion in this Issue, and `DEFER` does not represent production readiness.

This Issue changes no application code and does not restore or delete files.

### Ownership and downstream custody

- Decision authority: **ST-01 owner / Tech Lead**.
- Decision-record custodian: **`repo_stabilizer`**.
- Canonical contracts/data layer: **`core_types`** in ST-02 and **`api_services`** in ST-03.
- Task attachment integration: **`core_features`** in ST-09.
- Expense attachment integration: **`admin_features`** in ST-13.
- Authentication/authorization controls: **`auth_security`** in ST-06/ST-07.
- Navigation/accessibility and release validation: ST-15/ST-16 and ST-17/ST-18 owners.
- Independent Issue acceptance: **`qa_reviewer`**.

The backlog does not currently assign a dedicated implementation Task for an in-app Notifications center. `KEEP` therefore requires backlog refinement before feature implementation; this scope decision is not authority to expand another Story silently.

## Evidence audit

### Current routes and navigation

- There is no current Files route and no current `/staff/notifications` route.
- `src/components/layout/Header.tsx` still renders a notification badge and links every authenticated user to `/staff/notifications`. The target is therefore a dead route today.
- `src/app/layout.tsx` mounts `NotificationProvider` around the application, so unread-count behavior is part of the current global runtime surface rather than isolated dead code.
- The current Sidebar exposes neither Files nor Notifications.
- Commit `1daaac7` deleted both historical routes:
  - `src/app/(dashboard)/shared/files/page.tsx`
  - `src/app/(dashboard)/staff/notifications/page.tsx`

The missing routes make both complete journeys unavailable. The live Header/provider coupling is evidence to retain or deliberately hide the in-app notification contract; it is not evidence that push delivery works.

### Current Files and attachment artifacts

| Artifact | Consumer/evidence | Finding |
|---|---|---|
| `src/services/api/client.ts` and duplicate `src/api/client.ts` | Both define generic multipart `upload` and browser `download` helpers. | Upload is cross-domain infrastructure but duplicated. Preserve the capability and migrate consumers to the canonical ST-03 client. |
| `src/services/budget.service.ts` | Defines upload to an Expense attachment endpoint. | Direct dependency from the retained Expense domain; endpoint and response shape remain unverified. |
| `src/repositories/BudgetRepo.ts` | Implements the same Expense upload through the legacy client. | Migration debt; not a second approved attachment architecture. |
| `src/types/budget.ts` | Defines `ExpenseAttachment`, attachment fields, and form `File[]`. | Confirms retained Expense contract intent, not backend correctness. |
| `src/app/(dashboard)/shared/tasks/[id]/page.tsx` | Declares a local Document shape and renders/downloads documents returned inside a Task payload. | Active read/display surface; no upload/delete/authorization contract is connected. |
| `src/components/tasks/steps/StepUpload.tsx` and `StepRenderer.tsx` | Model a workflow step requiring a file, but no consumer of `StepRenderer` was found. Focused typecheck reports missing workflow exports/properties. | Dormant and currently broken evidence of a Task requirement; do not present it as working upload. |
| `src/components/tasks/DocumentManagement.tsx` | Re-exported from a barrel, but no render/import consumer was found. Its download action only logs, and its `onUpload` prop is not wired to an upload control. | Placeholder/general document UI outside the retained MVP unless rebuilt against Task attachments. |
| `src/lib/firebase.ts` | Defines direct Firebase Storage upload; no current consumer was found. | Unselected storage implementation. Defer rather than make it the default or delete it before Firebase scope is split. |

The generic `Attachment` in `src/types/index.ts`, the local Task `Document`, the `DocumentManagement` shape, and `ExpenseAttachment` disagree on IDs, names, timestamps, owners, permissions, and URLs. ST-02 must not merge them by assumption.

### Current Notification, Firebase, and service-worker artifacts

| Artifact | Consumer/evidence | Finding |
|---|---|---|
| `src/contexts/NotificationContext.tsx` | Root-mounted and consumed by Header; calls unread-count through the legacy `src/api/client.ts`. | Partial live in-app feature. It has no list/read service and belongs in ST-03 migration. |
| `src/components/layout/Header.tsx` | Shows unread badge and invokes `useFcmNotification`. | Visible product promise, but links to a deleted route. |
| `src/hooks/useFcmNotification.ts` | Only reads/requests browser permission; its token state is never populated and it does not subscribe to messages. | Name overstates behavior; not working FCM integration. |
| `src/lib/firebase.ts` | Defines messaging/token helpers; no current consumer was found. | Dormant. Required configuration names are documented only partially; runtime delivery was not proved. |
| `public/firebase-messaging-sw.js` | Present and exempted from auth middleware matching. It contains placeholder project configuration. No service-worker registration consumer was found. | Must not be treated as deployable push configuration. Keep push disabled; replace/generated-configure or remove this placeholder only in a dedicated push implementation decision. |
| `src/types/index.ts` | Defines a camelCase generic Notification model. | Does not match the historical page/repository snake_case models, so no canonical DTO exists. |
| `NEXT_PUBLIC_DISABLE_NOTIFICATIONS` | Documented and checked by the provider. | Provides a temporary kill switch for unread-count requests, not proof that Notifications are complete. |

No source-code occurrence registering a service worker, registering a notification token with a backend, revoking it on logout, or consuming foreground FCM messages was found. No token value or environment-file content was inspected.

### Tests

- No File, attachment, Notification, Firebase, service-worker, upload, permission, or download test/spec was found.
- The only discovered unit test targets `SkeletonLoader`, and the repository quality baseline already records test-collection problems.
- Focused TypeScript diagnostics show `StepRenderer.tsx` does not compile against the current Task/workflow types. No scoped diagnostics identified the current notification files in the filtered output; that is not runtime proof.

Neither historical UI nor current partial wiring has automated acceptance evidence.

### Backlog and roadmap intent

- `docs/ROADMAP.md` explicitly requires a keep/remove decision for Files and Notifications before cleanup.
- ST-03 requires canonical upload behavior in the API layer.
- `IS-09.3.3` explicitly requires Task attachment/document integration with the backend or hiding the UI.
- ST-13 retains Expense attachment signatures only pending this Files decision and a verified backend/storage contract.
- No later Story explicitly commits to FCM/push, notification preferences, a generic Files workspace, version history, quota management, or public sharing.

This supports a narrow attachment and in-app Notifications MVP, with advanced cross-cutting capabilities removed from MVP or deferred.

### Relevant Git history

| Commit | Evidence | Interpretation |
|---|---|---|
| `85d59da` (2026-04-20) | Added Firebase library, messaging service worker, notification route/context/hook, and a notification repository. | Establishes prior intent, not production acceptance. |
| `0e912b5` (2026-04-29) | Added Files route/components, document repository, contract upload, Notification center/preferences, and Task document management; removed the notification repository. | Expanded UI while removing its data layer. The Files page used mock quota/empty versions and a callback that only logged an upload. |
| `1daaac7` (2026-07-28) | Deleted both routes, generic Files/Notification components, contract upload, and document repository; replaced the FCM hook with a reduced permission-only hook; retained context, Firebase library, service worker, Task display, and Expense attachment service/type artifacts. | Evidence of an incomplete reduction/migration, not a coherent removal. The retained/deleted split requires the explicit capability decisions above. |

Generic commit subjects and absence of a decision record mean history cannot prove stakeholder acceptance. Deleted legacy code is requirements evidence only.

## Files decision details

### KEEP — attachment MVP

The exact retained MVP is:

1. Task attachment metadata displayed inside the owning Task.
2. Upload for a Task/workflow step only when the confirmed workflow contract requires a file.
3. Expense attachment metadata and upload inside the owning Expense flow.
4. Authenticated download through a backend-authorized response or short-lived signed URL.
5. Delete only where the backend business rule, record state, audit rule, and user permission allow it.
6. Consistent loading, progress, retry/error, empty, validation, and inaccessible-file states.
7. Focused contract/component/E2E tests for Task and Expense attachment flows.

The attachment is owned by its Task or Expense. A generic `/files` workspace is not required to deliver this MVP.

Paths/capabilities that must be preserved until replacement or migration is proved include the Task document display, Task upload-step intent, Expense attachment types/service signature, and the canonical client's upload/download capability. Individual placeholder files may later be replaced or removed after their retained behavior has a tested successor.

### REMOVE from MVP

- Standalone Files route and general document library.
- Storage-quota dashboard, version browser, public/team sharing matrix, locking, generic shared-with management, and generic file administration.
- Wholesale restoration of `FileUpload`, `FileVersionHistory`, `PDFPreview`, `StorageQuota`, `DocumentRepository`, `ContractFileUpload`, or the deleted Files page.
- Contract attachment behavior until the Contract scope and backend contract are separately accepted.
- Browser logging as download/upload behavior.
- Public permanent object URLs as an authorization mechanism.

Historical implementations remain deleted. “REMOVE from MVP” does not prevent a later accepted Story from adding one capability with current contracts and tests.

### DEFER — storage provider selection

Direct Firebase Storage is deferred. The default MVP integration is backend-mediated via the canonical API client because Task and Expense authorization/audit belong to backend records. A later architecture decision may select backend streaming, backend-issued signed upload/download URLs, or Firebase-backed storage, but it must preserve server-side ownership and authorization.

Do not upload directly from the browser to Firebase merely because `src/lib/firebase.ts` exists. Do not delete or activate that helper until storage and messaging responsibilities are split and all consumers are proven.

## Notifications decision details

### KEEP — in-app Notifications MVP

The exact retained MVP is:

1. Authenticated, user-scoped notification list with pagination.
2. Unread count using one canonical response contract.
3. Mark one and mark all as read, with consistent count refresh.
4. Safe deep links only to authorized application records/routes.
5. Loading, empty, error, stale-count, and disabled-feature states.
6. Backend-generated events for a small accepted set of business cases; candidate events must be refined with the owning Stories rather than copied from mock data.
7. Focused service, provider/Header, route, authorization, and E2E tests.

The current dead Header link must either point to the verified MVP route after implementation or be hidden until that route exists. A badge that links to a 404 is not accepted as completion.

### REMOVE from MVP

- Restoration of the historical mock Notification page and local-only mutations.
- Restoration of `NotificationCenter` or `NotificationPreferences` wholesale.
- Delete-all, rich preference management, email/digest scheduling, and arbitrary notification types without accepted product/backend contracts.
- Treating browser permission state as proof of push registration.

### DEFER — push/FCM and PWA Notifications

Push delivery, foreground/background FCM handlers, token registration, preference synchronization, and PWA notification settings are deferred. Until a dedicated accepted backlog item satisfies the prerequisites, production behavior should remain disabled and must not request notification permission opportunistically on page load.

The existing placeholder service worker is not a recovery template for production configuration. Push implementation must explicitly replace or remove it; it must never embed private credentials or user notification tokens.

## Backend, storage, security, and permission prerequisites

### Attachments

Before activation or legacy deletion/migration:

1. Confirm Task and Expense endpoint paths, multipart/signed-upload protocol, response wrapper, metadata DTO, pagination/list semantics, and delete behavior from backend evidence.
2. Define tenant/record ownership checks and action permissions for list, upload, download, replace, and delete. “Public/team/private” historical labels are not an approved RBAC policy.
3. Enforce size limits, extension/MIME checks plus server-side content detection, filename normalization, storage key isolation, malware scanning/quarantine, encryption, retention, and audit logging on the trusted side.
4. Use authorized downloads or short-lived signed URLs; define expiry, cache, revocation, and content-disposition behavior. Do not trust a client-provided URL or filename.
5. Define record-state rules: required attachment before workflow transition, whether deletion is allowed after approval/payment, and whether replacement creates an auditable version.
6. Confirm cleanup of orphaned uploads and transactional behavior when record creation/update fails.
7. Consolidate attachment types and migrate consumers before deleting a repository, helper, type, or UI placeholder.

### Notifications

Before in-app activation:

1. Confirm list/count/read endpoints, pagination, DTO naming, event types, idempotency, ordering, unread consistency, retention, and cross-device behavior.
2. Scope every query/mutation to the authenticated user on the backend; protect referenced records independently when following a deep link.
3. Define which backend events create Notifications and prevent sensitive case/task/payment content from leaking into unauthorized titles, bodies, logs, browser previews, or push payloads.
4. Define retry/rate-limit and polling/realtime behavior; avoid one request per uncontrolled render/session event.
5. For future push only: explicit consent UX, secure device-token registration/revocation/rotation, logout cleanup, multi-device semantics, service-worker lifecycle/versioning, delivery credentials held server-side, CSP/third-party script review, and preference enforcement.
6. Replace the legacy API client dependency with the canonical ST-03 service before treating the provider as stable.

## Task and Expense dependency effects

| Owner | Required effect of this decision |
|---|---|
| Task / ST-09 | `IS-09.3.3` should KEEP Task attachments, confirm the Task/Workflow DTO, connect a minimal upload/display/download flow, and hide dormant/broken upload UI until it works. It must not depend on a generic Files workspace. |
| Expense / ST-13 | KEEP Expense attachments as part of the owning Expense flow, but do not activate `uploadExpenseAttachment` until endpoint, permission, storage, and Budget/Expense state contracts pass. Use the canonical client; migrate away from `BudgetRepo`. |
| Contract / later scope | Historical contract upload remains out of this MVP. A Contract Story must make its own record-ownership, permission, retention, and backend decision. |
| Shared type/service migration | ST-02/ST-03 must preserve Task and Expense attachment use cases while removing duplicate shapes and clients. A single DTO need not erase domain-specific required fields. |

## Legacy restoration and deletion policy

1. Do not revert or cherry-pick the deleted Files/Notification surface wholesale.
2. Historical code may be consulted only for interaction requirements. Any reused logic must be ported to current Next.js/MUI/API conventions, security rules, accessibility requirements, and tests.
3. Before deleting a current artifact, prove its import/consumer graph, map its retained capability to a tested successor or accepted removal, and run scoped type/lint/test/build checks under the current quality policy.
4. Remove duplicate clients/repositories only after every retained consumer migrates. Do not retain a generic repository solely to imitate a deleted page.
5. Split Firebase Storage and Messaging concerns before deciding the fate of `src/lib/firebase.ts`; decide the service worker with the push scope, not with attachment cleanup.
6. Remove or hide any dead navigation/placeholder UI in the implementing Story if its backend capability is not ready.
7. Record data migration for existing stored attachments and Notifications before changing storage keys, ownership models, retention, or endpoint DTOs. No data store was available to prove that no production data exists.

## Effect on later Stories

| Story | Effect of this decision |
|---|---|
| ST-02 | Consolidate Notification and attachment DTOs without assuming the historical shapes are equivalent; retain Task/Expense requirements. |
| ST-03 | Add canonical Notification service and upload/download contracts; migrate the provider and Expense attachment consumer away from legacy clients/repositories. |
| ST-04/ST-05 | Add focused attachment/Notification tests and resolve the broken dormant upload-step types before activation; enforce baseline/no-regression rules. |
| ST-06 | Future push token lifecycle must follow login/logout/session changes. In-app requests must stop cleanly when unauthenticated. |
| ST-07 | Define record/action permissions for attachment and notification APIs and protect notification deep-link targets. |
| ST-09 | Implement or hide Task attachment/document UI under `IS-09.3.3`; do not expose the dormant `StepRenderer` as working. |
| ST-13 | Expense attachments remain KEEP but gated by verified backend/storage/security and canonical service migration. |
| ST-14 | Notification preferences/push settings remain deferred; do not present placeholders as completed system settings. |
| ST-15/ST-16 | Resolve the Header's dead Notification link and provide accessible upload/progress/error/permission UX only when routes work. |
| ST-17/ST-18 | Add authorization, invalid-file, failed-upload, download, unread/read, deep-link, and disabled-feature scenarios before release/UAT acceptance. Push needs separate UAT if later selected. |

## Reproducible read-only commands

Run from the repository root. These commands intentionally avoid environment contents, remotes, credentials, notification tokens, author emails, and private uploaded-file content:

```sh
git status --porcelain=v2 --branch
rg --files src public | rg -i 'file|notification|document|attachment|firebase|messaging|service.?worker'
rg -n -i --glob '!**/*.map' 'FileContext|NotificationContext|useFiles|useNotifications|fileService|notificationService|attachment|upload|firebase|messaging|serviceWorker|firebase-messaging-sw|notifications?' src public
rg -n 'DocumentManagement|StepRenderer|StepUpload|PWA|useFcmNotification|useNotification|uploadFileToFirebase|requestFCMToken' src
rg -n 'serviceWorker|firebase-messaging-sw|NEXT_PUBLIC_DISABLE_NOTIFICATIONS|NEXT_PUBLIC_FIREBASE' src public README.md middleware.ts next.config.ts
rg --files | rg -i '(test|spec)\.(ts|tsx|js|jsx)$'
rg -n -i --glob '*.{test,spec}.{ts,tsx,js,jsx}' 'file|attachment|upload|notification|firebase|messaging' .
git diff-tree --no-commit-id --name-status -r 1daaac7 | rg -i 'file|notification|document|firebase|messaging'
git ls-tree -r --name-only 1daaac7^ | rg -i 'file|notification|document|attachment|firebase|messaging|service.?worker'
git log --format='%h%x09%ad%x09%s' --date=short --name-status -- 'src/components/files/**' 'src/components/notifications/**' 'src/repositories/DocumentRepository.ts' 'src/contexts/NotificationContext.tsx' 'src/hooks/useFcmNotification.tsx' 'src/hooks/useFcmNotification.ts' 'src/lib/firebase.ts' 'public/firebase-messaging-sw.js' 'src/app/**/notifications/**'
npx tsc --noEmit --pretty false --incremental false 2>&1 | rg -i 'NotificationContext|useFcmNotification|firebase|DocumentManagement|StepUpload|StepRenderer|shared/tasks|budget.service|BudgetRepo|types/index'
```

The TypeScript diagnostic is expected to find errors under the documented pre-ST-05 baseline. Its filtered output identified the dormant upload-step type failures; it did not mutate the worktree.

## Limitations

- No backend repository, API schema, database/storage inventory, Firebase console, deployed service worker, browser permission state, object store, malware scanner, product analytics, or stakeholder interview was available.
- Frontend endpoint strings and types do not prove backend existence, authorization, storage durability, or data ownership.
- Import searches establish current source consumers, not runtime traffic or dynamically loaded external code.
- Historical code establishes implementation intent only. Generic commit subjects do not establish why deletion occurred or who approved it.
- Environment names were inspected only in tracked source/documentation. No environment value, credential, remote URL, notification token, author email, or uploaded/private file content was inspected or recorded.
- `KEEP`, `REMOVE from MVP`, and `DEFER` can be revised only by a later explicit decision record with product/backend/security evidence; they do not authorize application edits in this Issue.

## Independent QA readiness

`IS-01.2.2` is ready for independent QA when the focused diff contains only this appended section in `docs/audits/ST-01-MODULE-SCOPE.md`. QA should verify:

1. Attachment, standalone Files, in-app Notifications, and push/FCM each have a distinct `KEEP`, `REMOVE from MVP`, or `DEFER` decision.
2. MVP in/out scope is exact and does not claim legacy restoration.
3. Task and Expense attachment dependencies are retained but backend/storage/security/permission-gated.
4. The dead Notification route, partial provider/hook, placeholder service worker, missing consumers, type conflicts, tests, backlog, and Git history are represented accurately.
5. Migration/deletion prerequisites protect consumers and potential stored data.
6. Later Story impacts and the missing dedicated Notification implementation backlog item are explicit.
7. No secret, token, environment value, remote URL, private file content, application file, backlog checkbox, review record, Git index/ref, or commit was changed by this Issue.

---

## IS-01.2.3 — Legacy Contract and Workflow scope

### Decision summary

| Capability | Decision | Exact outcome |
|---|---|---|
| Contract Types / configuration | **KEEP** | Retain a small administrator-owned Contract Type taxonomy: list, create, update, activate/deactivate, and safe deletion rules. Migrate it to the canonical service architecture and add an explicit implementation backlog item. |
| Full Contract lifecycle, Contract documents, e-signature, and Contract payment milestones | **REMOVE FROM MVP** | Keep the deleted lifecycle UI/repository deleted. No Contract record CRUD, document signing, signature capture, or Contract-specific milestone ledger is part of the current MVP. A later accepted Contract Story is required to reintroduce any part. |
| Core Workflow definitions, steps, and Task transitions | **KEEP** | Retain Workflow administration and the server-authoritative Workflow/Task step contract because Task creation, filtering, approval, rejection, file requirements, payment gates, completion, and Board rules depend on it. |
| Workflow templates/library | **REMOVE FROM MVP** | Do not restore the deleted template library or import the separate workflow-template settings UI. Core Workflow CRUD uses one confirmed contract without a template layer. |
| Workflow version-history compare/restore UI | **REMOVE FROM MVP** | Do not restore the deleted history UI. Backend immutability/snapshot semantics for in-use Workflows remain a prerequisite for safe core editing, but a user-facing version browser/restore flow is not an MVP deliverable. |
| Workflow auto-assign rules | **REMOVE FROM MVP** | Do not restore the deleted rules UI. Task assignment remains explicit unless a later Story defines algorithms, capacity inputs, fairness, overrides, audit, and backend execution. |
| Legacy custom Workflow execution UI/repository | **REMOVE FROM MVP** | Keep `CustomWorkflow` and `/custom-workflows` execution/history artifacts deleted; they duplicate the retained core Workflow concept without a current consumer or accepted contract. |
| Separate workflow-board / issue-board lineage | **REMOVE FROM MVP** | Do not merge or copy the non-ancestor `qlcv/src/features/workflow-board` implementation into this application. Its macro-column/template API and Ant Design UI are a separate architecture, not evidence for the current MUI/Next tree. |

No capability is `DEFER` in this decision. Legal, backend, data, RBAC, Files, and Payment unknowns are explicit implementation gates. They do not require keeping deleted legacy surfaces in a third, ambiguous state. A later product decision may add a new Story; it must not silently reinterpret `KEEP` or `REMOVE FROM MVP`.

This Issue changes no application code and authorizes no restoration or deletion.

### Decision ownership and custody

- Decision authority: **ST-01 owner / Tech Lead**.
- Decision-record custodian: **`repo_stabilizer`** for `IS-01.2.3`.
- Core Workflow delivery owner: **Feature Team Admin — Configuration** in ST-12.
- Task transition consumer owner: **Feature Team Core — Task** in ST-09; Board enforcement follows ST-10.
- Contract Type delivery owner proposed by this decision: **Feature Team Admin — Configuration**, subject to the backlog refinement below.
- Canonical types and data-layer owners: **`core_types`** in ST-02 and **`api_services`** in ST-03.
- Full Contract lifecycle product authority: unassigned because no current Story owns it. Product/legal/finance ownership must be established before a future Contract Story is accepted.
- Independent Issue acceptance: **`qa_reviewer`**.

These are role assignments rather than named human owners. The repository contains no evidence naming the people holding those roles.

## Evidence audit

### Current routes, admin pages, and navigation

The current tree retains four direct routes:

- `src/app/(dashboard)/admin/contract-types/page.tsx`
- `src/app/(dashboard)/admin/workflows/page.tsx`
- `src/app/(dashboard)/admin/workflows/create/page.tsx`
- `src/app/(dashboard)/admin/workflows/[id]/page.tsx`

The Contract Types route renders list/create/edit/delete controls through `ContractTypeRepo`. The Workflow routes render list/delete, create with configured steps, and detail/edit/activation controls through `WorkflowRepo`.

The current `src/components/layout/Sidebar.tsx:45`–`52` exposes neither route. Immediately before commit `1daaac7`, the Sidebar exposed both “Quản lý quy trình” and “Quản lý loại hợp đồng” to `admin`. Historical menu roles are intent evidence, not a current authorization policy. Direct URL access and API mutations still require server-side and route-level authorization review under ST-07.

There is no current Contract list/detail/create route, Customer Contract surface, or Contract-specific Task panel. Therefore the surviving Contract Type route is a bounded configuration artifact, not evidence that a full Contract journey exists.

### Current Contract artifacts and linkages

| Artifact / linkage | Evidence | Scope interpretation |
|---|---|---|
| `src/app/(dashboard)/admin/contract-types/page.tsx` | Current CRUD UI for name, description, and active state | Supports `KEEP` for the small taxonomy only; it is currently unreachable from Sidebar and not type-safe. |
| `src/repositories/ContractTypeRepo.ts` | Current legacy-client calls to `/contract-types` for list/create/update/delete | Endpoint strings show intended integration, not backend existence or safe-delete behavior. Must migrate to a canonical service before acceptance. |
| `src/types/index.ts` | Current file no longer exports `ContractType`, create/update requests, `Contract`, or `CreateContractRequest` | Focused TypeScript diagnostics confirm the surviving page/repository do not compile. Recreate only verified Contract Type DTOs under ST-02; do not restore the entire old type block. |
| Task/customer current code | Task creation selects Workflow and Customer; current Task and Customer models/routes expose no Contract CRUD relationship | No current consumer justifies restoring a full Contract lifecycle. |
| `src/types/label.types.ts` and labels UI | A `contract` label category exists | A label category is classification metadata, not a Contract record, signature, document, or lifecycle contract. |
| `src/types/budget.ts` | Budget/Expense requests may contain `contract` reference fields | Optional identifiers do not prove a Contract module or endpoint. They remain unverified DTO fields under the finance decision. |
| Audit-log filter | Admin audit UI includes `contract` as a selectable category | A filter option is not proof of persisted Contract events or a product journey. |

Before `1daaac7`, the Task type embedded `contracts?: Contract[]`, `ContractRepo` called Task-scoped and Contract-scoped endpoints, and `ContractDialog` modeled number/type/value/dates/status/file URL. Commit `1daaac7` removed those types and artifacts while retaining Contract Types. This split is evidence to keep configuration bounded and leave the full lifecycle out of MVP.

### Historical full Contract capabilities

The parent of `1daaac7` contained:

- `src/components/contract/ContractDialog.tsx`
- `src/components/contract/ContractFileUpload.tsx`
- `src/components/contract/ESignaturePad.tsx`
- `src/components/contract/PaymentMilestoneTracker.tsx`
- `src/repositories/ContractRepo.ts`

Those files were deleted together by `1daaac7`. The observed implementations do not justify restoration:

- `ContractDialog` was a form and callback surface, not a complete route/authorization/audit journey.
- `ContractFileUpload` depended on the now-removed generic document layer addressed by `IS-01.2.2`.
- `ESignaturePad` stored a drawn canvas image plus client-supplied signer fields/time. No identity proof, consent ceremony, tamper-evident envelope, certificate, trusted timestamp, evidence export, revocation, retention, or legal-jurisdiction contract was found.
- `PaymentMilestoneTracker` held local callback-driven state and could toggle/mark payment. No ledger, invoice, idempotency, reconciliation, or ST-13 Payment integration was found.
- `ContractRepo` used the legacy client and offered only Task-scoped list/create plus Contract update/delete; there was no full lifecycle service or test evidence.

Accordingly, full Contract lifecycle, documents, e-signature, and milestones are **REMOVE FROM MVP**, not dormant code to recover.

### Current core Workflow consumers

| Consumer | Current dependency | Finding |
|---|---|---|
| `src/hooks/useWorkflows.ts` | Loads Workflows and supports active-only filtering through `WorkflowRepo` | Shared current consumer used by admin and Task pages; migrate rather than delete. |
| Manager Task create | Requires a selected `workflowId` and sends `workflow_id` with Task creation | Direct product dependency on retained core Workflow definitions. |
| Manager and staff Task lists | Display `workflow_name`, filter by `workflow_id`, and display current step configuration | Current type definitions no longer support these fields, but user journeys still depend on the contract. |
| `src/services/task.service.ts` | Defines next-step, approve, reject, complete, assign, and payment actions | Core transitions exist as canonical-service intent and must be server-authoritative/idempotent. |
| Workflow admin create/detail | Models named custom steps around fixed payment/completion steps, required roles, file requirement, approval, activation, and edit behavior | Strong core Workflow intent, but the fixed-step/payment layout must be confirmed with backend and finance; it must not become frontend-only authority. |
| `src/lib/workflow.ts` | Looks up step config, checks required role, and builds next-step payloads | Useful behavior intent; client checks cannot replace backend authorization. |
| `src/components/tasks/steps/*` | Contains default, file, payment, approval, and final step renderers | Dormant/broken: no outside consumer of `StepRenderer` was found and focused typecheck reports missing Workflow/Task/Payment types. Retain the required behaviors, not an assumption that these components work. |
| Board | Current Board groups primarily by Task status; ST-10 explicitly requires invalid drops to be blocked according to Workflow | Board transition validity must consume the same canonical server rules rather than inventing a second state machine. |

Core Workflow is therefore a required domain contract across ST-09, ST-10, and ST-12, not an isolated admin screen.

### Workflow services, repositories, and types

- `src/services/workflow.service.ts` was added by `1daaac7` and exported from `src/services/index.ts`. It is the target architecture but currently uses `any` for create/update data and imports Workflow types that no longer exist.
- `src/repositories/WorkflowRepo.ts` and `src/hooks/useWorkflows.ts` still use the legacy `src/api/client.ts` response convention.
- The current admin pages call `WorkflowRepo` directly instead of `workflowService`.
- Commit `1daaac7` replaced `src/types/index.ts` and removed `Role`, Workflow, Workflow detail/step/create/update types, Task workflow/step/payment fields, and Contract types while leaving their consumers intact.
- Focused TypeScript diagnostics report missing Contract/Workflow/Role/Payment exports across Contract Types, all Workflow pages, the hook, repository, service, workflow helpers, Task lists, and step renderers.

This is an incomplete type/service migration. It supports `KEEP` plus repair of core Workflow and Contract Type configuration; it does not support restoring every removed legacy capability.

### Advanced Workflow history and separate lineage

Commit `0e912b5` added `CustomWorkflow`, a `/custom-workflows` repository with execute/history methods, Workflow template/library UI, Workflow version compare/restore UI, and auto-assign rules. These surfaces were callback-heavy, used local `any` shapes, and had no tests discovered. Across exactly `src/components/contract/{ContractDialog,ContractFileUpload,ESignaturePad,PaymentMilestoneTracker}.tsx`, `src/components/tasks/CustomWorkflow.tsx`, `src/components/workflow/{AutoAssignRules,WorkflowTemplateLibrary,WorkflowVersionHistory}.tsx`, `src/repositories/{ContractRepo,CustomWorkflowRepository}.ts`, and the added `src/services/workflow.service.ts`, `git diff --numstat 1daaac7^ 1daaac7` reports 2,469 deletions and 33 additions. Including `src/types/**` broadens that count to 2,785 deletions and 712 additions; it is not the scoped legacy Contract/advanced Workflow/service count.

A separate commit `5c7d80d` contains `qlcv/src/features/workflow-board` and `/api/v1/workflow-templates` using macro columns, financial triggers, a different application root, and Ant Design. Read-only ancestry inspection shows that commit is not an ancestor of the current Story branch and is reachable through a separate branch lineage. It is not a prior version of the current Workflow UI and must not be copied as a shortcut.

The current MUI application also has an existing Board with its own Task status/milestone views. Introducing the separate workflow-board would create competing Board, Workflow, payment-trigger, styling, API, and state-machine contracts. It remains **REMOVE FROM MVP** unless a future architecture decision explicitly replaces the current system.

### Tests, backlog, and roadmap

- The only current test file discovered is `src/components/ui/__tests__/SkeletonLoader.test.tsx`; no Contract or Workflow test/spec exists.
- ST-09 explicitly retains Task workflow step, approval, rejection, completion, history, payment action, and attachment behavior (`docs/BACKLOG.md:352` onward).
- ST-10 requires Board drops to respect Workflow validity.
- ST-12 explicitly retains Workflow list/create/detail/edit and asks for a decision on versioning/template/auto-assign (`docs/BACKLOG.md:455`–`479`). This section resolves `IS-12.1.5` as **REMOVE FROM MVP** for those legacy UI capabilities.
- ST-13 owns Payment behavior; Workflow payment gates cannot create a second financial source of truth.
- ST-17 schedules Workflow fixtures and Workflow/Label admin E2E coverage.
- The roadmap retains list/create/detail/edit Workflow and asks to intentionally restore or remove old versioning/auto-assign UI.
- No Story/Task/Issue currently implements or accepts Contract Type configuration, and no Story owns the full Contract lifecycle.

## Contract Types / configuration — KEEP

### Precise MVP boundary

In scope:

1. Administrator-only list of Contract Types.
2. Create and update `name`, optional `description`, and active/inactive state after backend confirmation.
3. Prefer deactivate/archive over deletion when a type is referenced.
4. Delete only if the backend proves no reference from persisted data and returns a stable domain error otherwise.
5. Loading, empty, validation, duplicate-name, conflict, permission, and retry-safe error behavior.
6. Canonical Contract Type DTO/service and focused service/component tests.
7. Navigation only after route authorization and the complete flow pass.

Out of scope:

- Contract records, customers' Contracts, Contract value/date/status management, document upload, signature, payment milestones, renewal, reminders, reporting, or audit export.
- Reintroducing old `Contract`/`CreateContractRequest` types solely to make deleted code compile.
- Treating an active Contract Type as permission to expose a full Contract feature.
- Keeping `ContractTypeRepo` after its page migrates to a tested canonical service.

Current paths to protect until migration succeeds are the Contract Types admin page and `ContractTypeRepo`. Their behavior may be replaced, but neither may be deleted before the `KEEP` decision is implemented or explicitly revised.

## Full Contract lifecycle/documents/e-signature/payment milestones — REMOVE FROM MVP

### Precise boundary

Keep all deleted full-Contract artifacts deleted. Do not expose endpoint strings, placeholder routes, dormant buttons, or label/audit options as proof that Contract management works.

A future Contract capability requires a new accepted Story with, at minimum:

1. Business owner, record/customer/task ownership model, lifecycle/status state machine, identifiers, dates, amendments, termination, renewal, and audit rules.
2. Backend API/schema, migration/retention policy, optimistic concurrency, authorization, deletion/archive policy, and existing-data inventory.
3. Document classification, storage, access, version/retention, malware scanning, download authorization, and the `IS-01.2.2` attachment decision.
4. Legal review for jurisdiction, consent, signer authentication, signature intent, integrity/evidence envelope, timestamp, certificate, revocation, privacy, retention, and admissibility before any e-signature UI.
5. ST-13 alignment for invoices, payment milestones, partial/overpayment, currency, ledger ownership, idempotency, reconciliation, refund/cancel, and audit. A UI toggle cannot mark financial truth.
6. RBAC/tenant isolation, notifications, accessibility, contract tests, E2E, security review, UAT, and release acceptance.

Until those prerequisites have a funded Story and owner, Contract lifecycle is not an implementation dependency for the retained Contract Type taxonomy.

## Core Workflow definitions/steps/Task transitions — KEEP

### Precise MVP boundary

In scope:

1. Workflow list/detail plus create/update of name, description, active state, and ordered steps.
2. Step name/key/order, required role, file requirement, approval requirement, payment-gate reference, terminal state, and allowed transitions only as confirmed by backend DTOs.
3. Task selection of an active Workflow at creation and stable Workflow identity on existing Tasks.
4. Server-authoritative next-step, approve, reject, complete, assign, and permitted Board transition behavior with current-step/version preconditions.
5. History/audit of Task transitions sufficient to explain actor, prior/new state, timestamp, note, failure, file reference, and payment reference.
6. Deactivate/archive and reference-aware delete behavior for Workflows used by Tasks.
7. Permission enforcement on the server plus consistent client affordances.
8. Focused type/service/admin/Task/Board tests and E2E coverage.

Out of the retained MVP:

- Template library/default templates as a separate domain.
- User-facing Workflow version comparison or restore.
- Auto-assign, custom expression execution, arbitrary triggers, execution-history dashboard, macro columns, financial-tag DSL, or a second Workflow Board.
- Frontend hard-coding of step number `9`, localized step names, fixed payment positions, or role checks as the source of truth.
- Hard deletion of a Workflow with persisted Tasks unless the backend proves a safe policy.
- Bulk migration of live Tasks to edited Workflow steps without an explicit data plan.

The core Workflow UI may be rewritten. `KEEP` protects the capability and consumer contracts, not the current broken repository/pages line-for-line.

## Advanced Workflow capabilities — REMOVE FROM MVP

### No-wholesale-restore policy

Do not revert, cherry-pick, or copy these deleted/separate surfaces wholesale:

- `src/components/tasks/CustomWorkflow.tsx`
- `src/repositories/CustomWorkflowRepository.ts`
- `src/components/workflow/WorkflowTemplateLibrary.tsx`
- `src/components/workflow/WorkflowVersionHistory.tsx`
- `src/components/workflow/AutoAssignRules.tsx`
- `qlcv/src/features/workflow-board/**`
- `qlcv/src/api/workflow.api.ts`

Historical code may inform requirements only. Any future selected feature needs its own Story, backend contract, data/RBAC design, current framework/library implementation, tests, and acceptance gates.

Removing version-history UI does not permit unsafe mutation of live Workflows. ST-12 must still choose and test one backend-safe rule: immutable published versions/snapshots, edit-only-when-unused, clone-on-change, or explicit migration of affected Tasks. That safety rule belongs to core Workflow data integrity, not to the removed compare/restore UI.

## Backend, data, RBAC, legal, Files, and Payment prerequisites

### Contract Types

1. Confirm `/contract-types` response envelope, IDs, uniqueness, active semantics, pagination if any, reference/conflict errors, and delete/archive rules.
2. Inventory persisted references before deleting or renaming a type; no database was available in this Issue.
3. Restrict mutations to the confirmed admin/configuration permission and enforce it server-side.

### Core Workflow

1. Confirm whether the canonical backend uses `/workflows`, `/workflows/{id}/configs`, another versioned path, or separate definition/instance resources.
2. Define Workflow publication/activation, step IDs versus order, fixed/terminal steps, validation, transition graph, concurrency/version precondition, and behavior when definitions change while Tasks are active.
3. Define Task transition idempotency, duplicate submission, rollback/failure response, approval/rejection authority, audit, and current-state conflict handling.
4. Align `require_file` with the `IS-01.2.2` Task attachment gate: file ownership, validation, storage, and transition atomicity must be explicit.
5. Align payment gates with ST-13: Workflow references a verified Payment condition; it must not calculate, confirm, or duplicate ledger truth independently.
6. Define route/menu and action permissions through ST-07; client role checks are presentation only.
7. Inventory existing Workflows and Tasks and produce a migration/rollback plan before changing IDs, steps, status values, or response shapes.

### Removed Contract capabilities

Legal/e-signature/payment prerequisites are not workarounds for MVP removal. They are entry criteria for a future Story. No historical canvas, file callback, or milestone component may be activated before all applicable prerequisites and independent security/legal/product reviews pass.

## Safe migration and deletion gates

1. **ST-02:** reconstruct verified `Role`, Contract Type, Workflow, Workflow step/detail/request, Task transition/history, and Payment action types. Do not restore the old all-in-one type block or use `any` to mask conflicts.
2. **ST-03:** implement/mend canonical Contract Type and Workflow services on `src/services/api/client.ts`; migrate Contract Types page, Workflow pages, `useWorkflows`, Task consumers, and Board consumers away from repositories/direct clients.
3. Delete `ContractTypeRepo.ts` only after its only current page uses the canonical service and focused CRUD/conflict tests pass.
4. Delete `WorkflowRepo.ts` only after admin, hook, Task create/filter/list, transition, and Board consumers use tested canonical services.
5. Remove or replace dormant step components only after each retained file/payment/approval/default/final behavior maps to a tested successor or an accepted out-of-scope decision.
6. Keep already deleted full Contract and advanced Workflow files deleted; do not create stubs or dead navigation for them.
7. Before modifying active Workflow definitions, prove backend reference/version safety and prepare data migration plus rollback for existing Tasks.
8. Before adding navigation, require route functionality, loading/error/empty states, server authorization, accessibility, and focused E2E.
9. Before any hard delete, confirm consumer imports, backend references, stored data, audit/retention policy, and recovery path. This Issue proves none of those external states.
10. Follow the pre-ST-05 baseline/no-regression policy until all quality gates become mandatory green.

## Dependency risks

| Risk | Impact | Control |
|---|---|---|
| Surviving Contract Types and Workflow routes import deleted types | Current routes do not typecheck | ST-02 verified DTO reconstruction; no wholesale type rollback |
| Current pages/hooks call repositories while new `workflowService` exists | Competing response/error/auth semantics | ST-03 migration to one service/client before repository deletion |
| Workflow create/detail hard-code fixed payment positions and infer steps by localized names | Wrong transition/payment behavior if backend differs | Backend-defined stable step keys/types and validation |
| Workflow edit can affect Tasks already in progress | Orphaned or semantically changed Task instances | Immutable snapshot/clone/edit-only-unused/migration rule before edit acceptance |
| Client role helper and UI controls are mistaken for authorization | Unauthorized definition or transition actions | Server RBAC/tenant checks; ST-07 negative tests |
| File-required steps and payment-required steps span other domains | Non-atomic transition, orphan file, double payment confirmation | Explicit Files/ST-13 contracts, idempotency, transaction/audit rules |
| Contract Type is retained without a backlog delivery item | Broken, unreachable page persists indefinitely | Add the refinement below before implementation scheduling |
| Full Contract labels/audit filters imply a working module | Misleading UX and reporting | Hide/remove unsupported affordances in owning Stories or document them as generic taxonomy only |
| Canvas signature is mistaken for legally valid e-signature | Legal, identity, integrity, and privacy exposure | Full Contract/e-sign remains out of MVP; future legal/security design required |
| Payment milestones compete with Task/Payment finance flow | Multiple sources of truth and reconciliation failure | Keep Contract milestones out; future finance-owned ledger integration only |
| Separate workflow-board lineage is copied into current app | Duplicate framework/API/state machine/Board | Architecture decision and replacement Story required; no current import/cherry-pick |
| No Contract/Workflow tests | High regression and data-integrity risk | ST-04/ST-12/ST-17 focused contract, transition, admin, and E2E tests |

## Required backlog refinement

The coordinator should record these refinements in a separately reviewed backlog/document Issue; this implementation does not edit `docs/BACKLOG.md`:

1. Add **Contract Type configuration** as an explicit Task or Issue, preferably under ST-12 Admin Configuration or another named configuration Story. Include canonical service migration, verified DTO, validation, reference-aware deactivate/delete, RBAC, navigation decision, tests, and E2E acceptance.
2. Record `IS-12.1.5` outcome: legacy template library, version-history UI, and auto-assign are **REMOVE FROM MVP**. Replace vague “keep or remove” implementation work with cleanup/evidence checks.
3. Add a core Workflow data-integrity Issue under ST-12 for published/in-use definition edit semantics, snapshots/version preconditions, Task migration, and rollback. This is required even though version-history UI is removed.
4. Make ST-09/ST-10 explicitly share one server-authoritative transition contract, including conflict/idempotency, approval/rejection, file and payment gates, history, and invalid Board drops.
5. Link Workflow payment gates to ST-13.1 and file-required steps to `IS-09.3.3` plus the `IS-01.2.2` attachment decision.
6. Do not add a full Contract lifecycle item to an existing Story implicitly. If product later wants Contract CRUD/documents/e-signature/milestones, create a new Story with named product/legal/finance/security owners and the prerequisites in this section.
7. Extend ST-17 coverage with Contract Type admin CRUD/conflict only if the `KEEP` capability is implemented; do not add full Contract fixtures under the current MVP.

## Effect on later Stories

| Story | Required effect |
|---|---|
| ST-02 | Restore/consolidate only verified Contract Type and core Workflow/Task transition types. Full Contract and advanced Workflow types remain absent unless a future Story is accepted. |
| ST-03 | Add/mend canonical Contract Type and Workflow services; migrate all retained consumers; then remove legacy repositories with proof. |
| ST-04/ST-05 | Add service/type/admin/transition tests and resolve current missing-type errors without increasing the baseline; enforce all-green gates after ST-05. |
| ST-07 | Define admin configuration permissions and Task transition/file/payment permissions; test direct-route and API denial, not Sidebar visibility alone. |
| ST-09 | Use the canonical Workflow instance/step contract for Task create, next, approve, reject, complete, history, file, and payment actions. |
| ST-10 | Validate Board moves against the same server Workflow rules and recover from rejected/conflicting transitions. Do not import the separate workflow-board. |
| ST-12 | Deliver core Workflow list/create/detail/edit safely; implement the Contract Type refinement if assigned; remove advanced Workflow UI from MVP and define in-use edit semantics. |
| ST-13 | Own payment truth and reconciliation. Workflow may gate on a confirmed condition; Contract milestones remain out of MVP. |
| ST-14 | Avoid reporting/setting claims for full Contracts; audit filters must reflect real event sources. |
| ST-15/ST-16 | Add admin navigation only after retained routes work with RBAC and accessibility; no dead links for removed capabilities. |
| ST-17/ST-18 | Add Workflow/Task transition and retained Contract Type admin E2E/UAT. Full Contract/e-sign/milestone scenarios are not MVP release criteria. |

## Reproducible read-only commands

Run from the repository root. These commands avoid environment values, remote URLs, credentials, author emails, and private Contract/document content:

```sh
git status --porcelain=v2 --branch
rg --files src docs | rg -i 'contract|workflow|e-sign|esign|signature|milestone|auto.?assign|template|version'
rg -n -i --glob '!node_modules/**' '\b(contract|contracts|contract.?type|workflow|workflows|e.?sign|signature|milestone|auto.?assign|versioning|template)\b' src docs
rg -n 'ContractType|ContractRepo|ContractDialog|WorkflowRepo|workflowService|useWorkflows|WorkflowStep|workflow_id|workflow_name|current_step|require_payment|require_approval' src
rg --files src/app/'(dashboard)' | sort
rg -n -i 'contract|workflow' src/components/layout/Sidebar.tsx
rg --files | rg -i '(test|spec)\.(ts|tsx|js|jsx)$'
rg -n -i --glob '*.{test,spec}.{ts,tsx,js,jsx}' 'contract|workflow' .
git log --all --format='%h%x09%ad%x09%s' --date=iso-strict --name-status -- ':(glob)**/*ontract*' ':(glob)**/*orkflow*'
git ls-tree -r --name-only 1daaac7^ | rg -i 'contract|workflow|e-sign|esign|signature|milestone|auto.?assign|template|version'
git diff-tree --no-commit-id --name-status -r 1daaac7 | rg -i 'contract|workflow|signature|milestone|auto.?assign|template|version'
git show --format='%h%n%ad%n%s' --date=iso-strict --stat 1daaac7 -- src/types 'src/components/contract/**' 'src/components/workflow/**' src/components/tasks/CustomWorkflow.tsx src/repositories/ContractRepo.ts src/repositories/CustomWorkflowRepository.ts src/services/workflow.service.ts
git diff 1daaac7^ 1daaac7 -- src/types/index.ts
git merge-base --is-ancestor 5c7d80d HEAD
git branch --all --contains 5c7d80d
npx tsc --noEmit --pretty false --incremental false 2>&1 | rg -i 'contract|workflow|step(renderer|approval|payment|upload|final|default)|manager/tasks|staff/my-tasks'
```

The ancestry command exits `1` because `5c7d80d` is not an ancestor of current HEAD. The TypeScript diagnostic is expected to exit non-zero under the documented pre-ST-05 baseline. Both are read-only and did not alter the worktree.

## Limitations

- No backend repository, OpenAPI schema, database, Workflow instance inventory, Contract/Contract Type records, deployed environment, product analytics, stakeholder interview, legal opinion, signature provider, certificate/timestamp service, document store, payment ledger, or audit/event store was available.
- Frontend endpoint strings and historical DTOs do not prove backend existence, response shape, authorization, data integrity, legal validity, or production use.
- Static imports prove current source coupling, not runtime traffic. The lack of imports/tests does not prove that no external system or stored data depends on an endpoint.
- Generic commit subjects do not explain why capabilities were removed or who approved removal.
- The separate workflow-board lineage was inspected only as source/history evidence; no network, remote URL, private document, environment value, credential, token, or author email was inspected or recorded.
- `KEEP` protects bounded capability intent, not current broken code. `REMOVE FROM MVP` is not authorization to delete stored data or incompatible backend resources.
- Any revision requires a later explicit decision record with product/backend/data/security evidence and the normal QA/PO gates.

## Independent QA readiness

`IS-01.2.3` is ready for independent QA when the focused diff contains only this appended section in `docs/audits/ST-01-MODULE-SCOPE.md`. QA should verify:

1. Contract Types, full Contract lifecycle/documents/e-sign/milestones, core Workflow, templates, version-history UI, auto-assign, custom Workflow, and separate workflow-board each have an explicit decision.
2. Contract Types and core Workflow are `KEEP`; full Contract and every advanced/legacy Workflow surface are `REMOVE FROM MVP`.
3. Decisions cite current routes/consumers, missing types/typecheck evidence, backlog/roadmap, tests, and relevant history without treating endpoint strings as backend proof.
4. MVP in/out boundaries are precise and no deleted surface is approved for wholesale restoration.
5. Backend/data/RBAC/legal/e-signature/Files/Payment gates and safe migration/deletion rules protect retained consumers and possible stored data.
6. The missing Contract Type backlog work, ST-12.1.5 resolution, in-use Workflow edit safety, shared Task/Board transition contract, and future full Contract Story requirement are explicit.
7. No application file, backlog checkbox, review record, Git index/ref/commit, environment value, credential, remote URL, author email, or private Contract/document content was changed or exposed by this Issue.
