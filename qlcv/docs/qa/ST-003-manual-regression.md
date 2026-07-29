# ST-003 Manual Regression Evidence

Date: 2026-07-29

Branch: `issue/QLCV-I-0036-manual-regression`

Scope: behavior-preserving decomposition of Work Board, Dashboard and AppShell.
No automated-test tooling was installed or used.

## Quality gates

| Gate | Result | Evidence |
| --- | --- | --- |
| ESLint with zero warnings | PASS | `npm run lint` |
| Strict TypeScript | PASS | `npm run typecheck` |
| Production build | PASS | `npm run build` |
| Route inventory | PASS | Next build reports the same 27 routes |
| Patch whitespace | PASS | `git diff --check` |

`npm run ci` executed the lint, typecheck and production-build gates together
and completed successfully.

## Local production HTTP smoke

The production build was served locally on port 3101. The following routes
returned HTTP 200:

- `/`
- `/login`
- `/dashboard`
- `/work`
- `/projects`
- `/projects/board`
- `/settings/workflow-templates`
- `/invoices`
- `/users`

The six compatibility routes returned Next redirect markers with the complete
destination query string preserved:

| Legacy request | Destination marker |
| --- | --- |
| `/settings/users?q=lan&role=LAWYER` | `/users?q=lan&role=LAWYER` |
| `/tasks?status=TODO` | `/work?status=TODO` |
| `/issue-board?assignee_id=u1` | `/work?assignee_id=u1` |
| `/board?workflow_template_id=w1` | `/projects/board?workflow_template_id=w1` |
| `/workflow-board?workflow_template_id=w1` | `/projects/board?workflow_template_id=w1` |
| `/settings/workflows?active=true` | `/settings/workflow-templates?active=true` |

## Contract and structure regression

- `git diff develop...HEAD` changes no file under `app`, `src/api`, auth,
  Projects, Project Workflow Board or Workflow Templates.
- Dashboard request ownership and timing remain in `DashboardPage` and the
  unchanged `useDashboardSummary` hook.
- Work Board issue/filter/draft/settings/timer ownership remains in
  `WorkBoardPage`; extracted components are controlled by page callbacks.
- AppShell session refresh, cached-user handling and redirect effects remain in
  `AppShell`; access/navigation presentation is extracted without route changes.
- The unique `od-workboard__*` and `od-dashboard__*` selector token sets are
  identical before and after the Story.
- Storage keys remain `access_token`, `auth_user` and `work-board-settings`.
- No `@/features/*/*` cross-feature deep import remains. Public entries expose
  only route components or capabilities with a current cross-feature consumer.
- Removed namespaces from ST-002 remain absent: `features/shared`,
  `features/workflow-board` and `features/issue-board`.

## Source-trace interaction coverage

Source-level callback tracing confirms the original handlers remain connected
for Work Board search/filter, board/list toggle, drag/drop, drawer edit/move,
create/delete, settings persistence and read-only guards; Dashboard range,
custom dates, refresh and navigation; AppShell profile/logout and role access.

Interactive browser and staging checks were not run in this environment. This
evidence therefore does not claim visual pixel parity, live API success or
browser-driven interaction coverage. Those remain deployment smoke checks and
do not change the local structural QA result.

## Owner exception

The owner explicitly directed the work to continue without installing
automated-test tooling and accepted the previously reported browser/staging
limitation. Therefore browser interaction and staging success paths are tracked
as a release smoke risk, not reported as a passing local gate. This exception
does not relax lint, typecheck, build, route, redirect or source-contract gates.

## QA result

PASS for the locally verifiable ST-003 acceptance criteria, subject to final
Reviewer approval.

The first QA review found that the shared initials helper changed Dashboard's
`Unassigned` output from `UN` to `--`. The helper now accepts an optional
feature-specific label: Dashboard retains `UN`, while Work Board explicitly
retains `--`. The full CI gate passed again after this correction.
