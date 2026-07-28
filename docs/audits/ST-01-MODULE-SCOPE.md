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
