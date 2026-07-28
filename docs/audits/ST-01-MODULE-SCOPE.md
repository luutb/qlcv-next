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
