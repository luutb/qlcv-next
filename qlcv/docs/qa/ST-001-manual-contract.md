# ST-001 Manual Contract Evidence

Date: 2026-07-29

Story: `QLCV-ST-001` — API contract, canonical routes and shared error model

Automated-test tooling is intentionally not installed by project-owner decision.

## Environment

- Node: 24.4.1
- npm: 11.4.2
- Next.js: 16.2.9
- Local server: production build on `http://127.0.0.1:3101`
- Backend staging URL/accounts/fixtures: not provided

## Quality gates

| Check | Evidence | Result |
| --- | --- | --- |
| Lint | `npm run lint` exited 0 with no warnings | PASS |
| Strict typecheck | `npm run typecheck` exited 0 | PASS |
| Production build | `npm run build` exited 0 and generated 27 routes | PASS |
| Whitespace validation | `git diff --check` exited 0 | PASS |
| Automated-test dependency scan | `package.json` contains no Vitest, RTL, Jest, Cypress or Playwright dependency | PASS |

## Canonical route smoke

The following requests were made against the local production build. Next.js
returned its server redirect marker and preserved the complete query string.

| Legacy request | Canonical destination | Result |
| --- | --- | --- |
| `/settings/users?q=lan&role=LAWYER` | `/users?q=lan&role=LAWYER` | PASS |
| `/tasks?status=TODO` | `/work?status=TODO` | PASS |
| `/issue-board?assignee_id=u1` | `/work?assignee_id=u1` | PASS |
| `/board?workflow_template_id=w1` | `/projects/board?workflow_template_id=w1` | PASS |
| `/workflow-board?workflow_template_id=w1` | `/projects/board?workflow_template_id=w1` | PASS |
| `/settings/workflows?active=true` | `/settings/workflow-templates?active=true` | PASS |

## Contract and source inspection

| Acceptance area | Evidence | Result |
| --- | --- | --- |
| Capability inventory | `CAPABILITY_MATRIX_V1.md` maps all 98 SRS endpoints without claiming unverified availability | PASS |
| Work Item boundary | `WORK_ITEM_CONTRACT.md` defines `/work`, UI Issue naming and adapter-owned transport decision | PASS |
| Identity contract | `/users/me`, optional action permissions and MFA request/response shapes are documented and typed | PASS |
| Problem Details parsing | API client accepts both `application/json` and `application/*+json` media types | PASS |
| Typed HTTP states | 401, 403, 423 and 428 create distinct error classes and status-derived UI codes | PASS |
| Expired session | JSON and download requests both clear token/profile and build an internal return URL | PASS |
| Open-redirect guard | Login rejects protocol-relative, backslash and control-character return targets | PASS |
| Shared UI states | Loading, empty, retry error, forbidden, locked, stale and mutation feedback components exist with Vietnamese defaults | PASS |
| Production diagnostics | Debug payload metadata is rendered only outside production | PASS |

## Human staging checks still required

These checks require a reachable backend plus fixtures/accounts for
`SUPER_ADMIN`, `PARTNER`, `LAWYER` and `ACCOUNTANT`:

1. Force a 401 from both a JSON request and file download; confirm local session
   data is cleared and login returns to the original internal page.
2. Force 403 and confirm the permission state appears without logging the user out.
3. Force 423 and confirm the reason appears with no mutation-retry action.
4. Force 428 and confirm reload/refetch resolves stale data before another mutation.
5. Verify canonical navigation visibility and action permissions for all four roles.
6. Compare representative response bodies with the capability and identity contracts.

Status: **BLOCKED — STAGING ACCESS AND FIXTURES NOT PROVIDED**.

## QA disposition and owner exception

QA disposition for local integration: **PASS WITH ACCEPTED EXCEPTIONS**.

On 2026-07-29, the project owner directed the team to continue without
automated-test installation and despite previously reported external blockers.
That direction permits local progression through `story → develop → master`.
It does not convert the staging checks above into a pass, authorize remote use
of the exposed credential, or authorize a remote push.
