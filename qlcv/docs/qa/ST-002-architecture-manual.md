# ST-002 Architecture Refactor Evidence

Date: 2026-07-29

Story: `QLCV-ST-002` — feature ownership and module boundaries

Automated-test tooling is intentionally not installed by project-owner decision.

## Quality gates

| Check | Evidence | Result |
| --- | --- | --- |
| Lint and boundary rules | `npm run lint` exited 0 with no warnings | PASS |
| Strict typecheck | `npm run typecheck` exited 0 | PASS |
| Production build | `npm run build` exited 0 and generated 27 routes | PASS |
| Whitespace validation | `git diff --check` exited 0 | PASS |
| API/shared direction | No import from `src/api` or `src/shared` to `src/features` | PASS |
| Public feature imports | No `@/features/<feature>/<internal>` import remains | PASS |
| Legacy namespaces | No `features/shared`, `features/workflow-board` or `features/issue-board` source remains | PASS |
| Work Item repository | `src/api/issues.api.ts` remains available for ST-030 | PASS |

## Production route smoke

The local production server ran at `http://127.0.0.1:3101`.

| Route | HTTP result |
| --- | --- |
| `/login` | 200 |
| `/dashboard` | 200 |
| `/work?new=1` | 200 |
| `/projects` | 200 |
| `/projects/board` | 200 |
| `/settings/workflow-templates` | 200 |

## Redirect parity

| Legacy request | Destination observed in Next.js redirect marker | Result |
| --- | --- | --- |
| `/settings/users?q=lan&role=LAWYER` | `/users?q=lan&role=LAWYER` | PASS |
| `/tasks?status=TODO` | `/work?status=TODO` | PASS |
| `/issue-board?assignee_id=u1` | `/work?assignee_id=u1` | PASS |
| `/board?workflow_template_id=w1` | `/projects/board?workflow_template_id=w1` | PASS |
| `/workflow-board?workflow_template_id=w1` | `/projects/board?workflow_template_id=w1` | PASS |
| `/settings/workflows?active=true` | `/settings/workflow-templates?active=true` | PASS |

## Contract parity inspection

- API endpoint paths, request payloads and transport repositories were not changed.
- React Query arrays remain `['workflow-board']`,
  `['workflow-board', 'templates']` and
  `['workflow-board', 'board', workflowTemplateId]`.
- Existing invalidation targets and enabled conditions remain unchanged.
- Storage keys `access_token`, `auth_user` and `work-board-settings` remain unchanged.
- CSS classes, visible copy and role rules were not changed.
- Dormant Issue Board UI/query scaffolding was removed only after a zero-consumer
  source search; `issues.api.ts` was not removed.

Status: **STRUCTURAL PASS**.

## Human browser and staging checks still required

The interaction checks below have not been executed in a normal browser. Some
can use local fixtures; API-backed flows additionally need the four staging
roles and representative data:

1. Login/session expiry, safe return URL and logout.
2. Sidebar visibility and direct-route guard for all roles.
3. Dashboard range, refresh, drilldown and API error behavior.
4. Project list/create and Project Board move/conflict/payment flows.
5. Workflow Template create flow.
6. Work Board create/edit/delete/drag/drop/settings interactions.
7. Browser network comparison of endpoint, payload and request count.

Status: **NOT VERIFIED — NO HUMAN BROWSER RUN; STAGING ACCESS ALSO NOT PROVIDED**.

## QA disposition

Local structural QA: **PASS**.

Interactive UI parity: **NOT VERIFIED; PROJECT-OWNER EXCEPTION REQUIRED FOR
LOCAL MERGE**.

The project owner's existing direction permits local progression without
automated-test installation and with browser/staging checks recorded as
pending. This evidence does not claim those checks passed. The exception does
not authorize a remote push or classify browser/staging checks as completed.
