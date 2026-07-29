# QLCV V1 Capability Matrix

Date: 2026-07-29

Sources:

- `SRS_FE_API.md`
- `SRS_FE_UI_NEXT_MUI.md`
- Frontend source at Story `QLCV-ST-001`

## Status model

| Status | Meaning |
| --- | --- |
| `AVAILABLE` | Verified against a reachable staging API with representative data |
| `DECLARED` | Defined by the SRS and represented by a frontend API client, but not staging-verified |
| `CHANGED` | Staging contract differs from the SRS and the accepted difference is documented |
| `DIAGNOSTIC_ONLY` | Endpoint is intentionally exposed only through an admin/diagnostic surface |
| `BLOCKED` | A contract conflict or missing dependency prevents safe implementation |

No backend or staging environment is present in this repository. Therefore no
capability is marked `AVAILABLE` solely because a TypeScript client exists.

## Capability coverage

| Capability | Canonical route | SRS endpoint family | API client | UI state | Contract status | Required decision/work |
| --- | --- | --- | --- | --- | --- | --- |
| Login/session | `/login` | `/auth/login`, `/auth/me` | Partial | Partial real UI | `BLOCKED` | Confirm current-user source and MFA challenge shape |
| Current profile/MFA | `/settings/profile` | `/users/me`, `/auth/mfa/*` | Profile partial; MFA missing | Placeholder | `BLOCKED` | Confirm `/users/me` vs `/auth/me`; add MFA methods |
| User management | `/users` | `/users*` | Declared client | Route missing | `DECLARED` | Add canonical route and User 360 UI |
| Profile documents | User/Customer detail | `/profile-documents*` | Declared client | Missing | `DECLARED` | Build reusable entity panel; verify multipart contract |
| Customers | `/customers`, `/customers/[id]` | `/customers*` | Declared client | Placeholder | `DECLARED` | Build lifecycle, conflict, documents and labels UI |
| Projects | `/projects`, `/projects/[id]` | `/projects*` | Declared client | List/create partial; detail placeholder | `DECLARED` | Complete edit/close/detail and action rules |
| Project workflow board | `/projects/board` | `/projects/board`, workflow-step, conflict override | Declared client | Partial real UI | `DECLARED` | Verify move, conflict and payment error payloads |
| Workflow templates | `/settings/workflow-templates` | `/workflow-templates*` | Declared client | Partial real UI | `BLOCKED` | Correct `FIXED`/`FIXED_AMOUNT`; verify trigger payloads |
| Work Board | `/work` | `/issues*` aliases over `/tasks*` | `issues.api.ts` rejects; task client incomplete | Hard-coded prototype | `BLOCKED` | Choose `/issues` or `/tasks`; normalize board DTO and move endpoint |
| Labels/assignments | `/labels` and entity panels | `/labels*`, `/label-assignments*` | Declared client | Placeholder | `DECLARED` | Verify scoped-label/archive semantics |
| Project documents | `/documents`, Project detail | `/documents*` | Declared client | Placeholder | `DECLARED` | Verify multipart, download, lock and malware errors |
| Time entries | `/time-entries` | `/time-entries*` | Declared client | Placeholder | `DECLARED` | Verify invoice lock and permission behavior |
| Invoices | `/invoices`, `/invoices/[id]` | `/invoices*` | Declared client | Placeholder | `DECLARED` | Verify generate input/status transitions |
| Project payments | Project Billing tab | `/project-payments*` | Read client declared | Missing | `DECLARED` | Verify relation to financial workflow confirmation |
| Dashboard | `/dashboard` | `/dashboard/summary` | Declared client | Partial real UI | `DECLARED` | Remove derived/fake metrics and verify response schema |
| Task/workload reports | `/reports` | `/reports/tasks/*`, `/reports/workload` | Declared client | Route missing | `DECLARED` | Add report route, filters and drilldowns |
| OKR | `/okr` | `/okr/*`, `/reports/okr/summary` | Declared client | Placeholder | `DECLARED` | Verify summary DTO currently typed as `unknown` |
| Audit logs | `/audit-logs` | `/audit-logs*` | Declared client | Placeholder | `DECLARED` | Verify filters and hash-chain response |
| Tenant settings | `/admin/tenant-settings` | `/admin/tenant-settings` | Declared client | Route missing | `DECLARED` | Add SUPER_ADMIN-only route |
| Metadata schemas | Admin/table configuration | `/metadata/schemas/{entity}` | Declared client | Not surfaced | `DIAGNOSTIC_ONLY` | Use only where a dynamic schema is required; otherwise document diagnostics |
| Purge | `/admin/purge` | `/admin/purge` | Declared client | Placeholder | `DECLARED` | Add strong confirmation and result evidence |

## Endpoint inventory from SRS API section 23

Every endpoint from the SRS checklist appears once below. `DECLARED` means the
local repository method exists, not that the backend has been verified.

### Auth and users

| Endpoint | Frontend owner | Status | Follow-up/evidence owner |
| --- | --- | --- | --- |
| `POST /auth/login` | `auth.api.ts` | `DECLARED` | ST-010; BA/BE verify MFA response |
| `GET /auth/me` | `auth.api.ts` | `BLOCKED` | I-0013; BA/BE decide identity source |
| `GET /users/me` | `users.api.ts` | `BLOCKED` | I-0013; BA/BE decide profile source |
| `PUT /users/me` | `users.api.ts` | `DECLARED` | ST-010; verify version contract |
| `POST /auth/mfa/enable` | Missing | `BLOCKED` | I-0013/ST-010; BE supplies contract |
| `POST /auth/mfa/disable` | Missing | `BLOCKED` | I-0013/ST-010; BE supplies contract |
| `GET /users` | `users.api.ts` | `DECLARED` | ST-011; QA four-role evidence |
| `POST /users` | `users.api.ts` | `DECLARED` | ST-011; QA permission evidence |
| `GET /users/{id}` | `users.api.ts` | `DECLARED` | ST-011 |
| `PUT /users/{id}` | `users.api.ts` | `DECLARED` | ST-011; verify `version` |
| `POST /users/{id}/activate` | `users.api.ts` | `DECLARED` | ST-011; verify `version` |
| `POST /users/{id}/deactivate` | `users.api.ts` | `DECLARED` | ST-011; verify self/last-admin behavior |
| `POST /users/{id}/reset-password` | `users.api.ts` | `DECLARED` | ST-011; QA security action |
| `POST /users/{id}/mfa/reset` | `users.api.ts` | `DECLARED` | ST-011; QA security action |

### Customers and profile documents

| Endpoint | Frontend owner | Status | Follow-up/evidence owner |
| --- | --- | --- | --- |
| `GET /customers` | `customers.api.ts` | `DECLARED` | ST-020 |
| `POST /customers` | `customers.api.ts` | `DECLARED` | ST-020 |
| `GET /customers/{id}` | `customers.api.ts` | `DECLARED` | ST-020 |
| `PUT /customers/{id}` | `customers.api.ts` | `DECLARED` | ST-020 |
| `DELETE /customers/{id}` | `customers.api.ts` | `DECLARED` | ST-020; verify soft delete |
| `POST /customers/{id}/restore` | `customers.api.ts` | `DECLARED` | ST-020 |
| `GET /customers/{id}/conflicts` | `customers.api.ts` | `DECLARED` | ST-020 |
| `POST /customers/{id}/conflicts` | `customers.api.ts` | `DECLARED` | ST-020 |
| `GET /profile-documents` | `profile-documents.api.ts` | `DECLARED` | ST-012 |
| `POST /profile-documents` | `profile-documents.api.ts` | `DECLARED` | ST-012; verify multipart fields |
| `GET /profile-documents/{id}/download` | `profile-documents.api.ts` | `DECLARED` | ST-012; verify filename/401 |
| `DELETE /profile-documents/{id}` | `profile-documents.api.ts` | `DECLARED` | ST-012 |

### Projects and workflow templates

| Endpoint | Frontend owner | Status | Follow-up/evidence owner |
| --- | --- | --- | --- |
| `GET /projects` | `projects.api.ts` | `DECLARED` | ST-040 |
| `POST /projects` | `projects.api.ts` | `DECLARED` | ST-040 |
| `GET /projects/{id}` | `projects.api.ts` | `DECLARED` | ST-041 |
| `PUT /projects/{id}` | `projects.api.ts` | `DECLARED` | ST-040 |
| `POST /projects/{id}/close` | `projects.api.ts` | `DECLARED` | ST-040 |
| `PATCH /projects/{id}/workflow-step` | `projects.api.ts` | `DECLARED` | ST-041; verify financial error payload |
| `POST /projects/{id}/override-conflict` | `projects.api.ts` | `DECLARED` | ST-041; verify justification rule |
| `GET /projects/board` | `projects.api.ts` | `DECLARED` | ST-042 |
| `GET /workflow-templates` | `workflow.api.ts` | `DECLARED` | ST-042 |
| `POST /workflow-templates` | `workflow.api.ts` | `BLOCKED` | I-0012/ST-042; correct payment enum/trigger contract |
| `GET /workflow-templates/{id}` | `workflow.api.ts` | `DECLARED` | ST-042 |
| `PUT /workflow-templates/{id}` | `workflow.api.ts` | `DECLARED` | ST-042; steps remain read-only after create |
| `DELETE /workflow-templates/{id}` | `workflow.api.ts` | `DECLARED` | ST-042; verify archive semantics |

### Issues / project tasks

| Endpoint | Frontend owner | Status | Follow-up/evidence owner |
| --- | --- | --- | --- |
| `GET /issues` | `issues.api.ts` rejects | `BLOCKED` | I-0012/ST-030; BA/BE choose alias |
| `GET /issues/board` | Wrong DTO and rejects | `BLOCKED` | I-0012/ST-030; dynamic step contract |
| `POST /issues` | `issues.api.ts` rejects | `BLOCKED` | I-0012/ST-031 |
| `GET /issues/{id}` | `issues.api.ts` rejects | `BLOCKED` | I-0012/ST-031 |
| `PUT /issues/{id}` | `issues.api.ts` rejects | `BLOCKED` | I-0012/ST-031 |
| `PATCH /issues/{id}/workflow-step` | Missing/wrong move model | `BLOCKED` | I-0012/ST-031 |
| `POST /issues/{id}/move` | Wrong status payload and rejects | `BLOCKED` | I-0012/ST-031 |
| `PATCH /issues/{id}/status` | Missing from issue client | `BLOCKED` | I-0012/ST-031 |
| `PATCH /issues/{id}/assignee` | Missing from issue client | `BLOCKED` | I-0012/ST-031 |
| `PATCH /issues/reorder` | Missing from issue client | `BLOCKED` | I-0012/ST-031 |
| `DELETE /issues/{id}` | `issues.api.ts` rejects | `BLOCKED` | I-0012/ST-031 |

### Labels and documents

| Endpoint | Frontend owner | Status | Follow-up/evidence owner |
| --- | --- | --- | --- |
| `GET /labels` | `labels.api.ts` | `DECLARED` | ST-021 |
| `POST /labels` | `labels.api.ts` | `DECLARED` | ST-021 |
| `GET /labels/{id}` | `labels.api.ts` | `DECLARED` | ST-021 |
| `PUT /labels/{id}` | `labels.api.ts` | `DECLARED` | ST-021 |
| `DELETE /labels/{id}` | `labels.api.ts` | `DECLARED` | ST-021; verify archive semantics |
| `GET /label-assignments` | `labels.api.ts` | `DECLARED` | ST-021 |
| `POST /label-assignments` | `labels.api.ts` | `DECLARED` | ST-021 |
| `DELETE /label-assignments/{id}` | `labels.api.ts` | `DECLARED` | ST-021 |
| `GET /documents` | `documents.api.ts` | `DECLARED` | ST-022 |
| `POST /documents` | `documents.api.ts` | `DECLARED` | ST-022; verify multipart/malware errors |
| `GET /documents/{id}` | `documents.api.ts` | `DECLARED` | ST-022 |
| `GET /documents/{id}/download` | `documents.api.ts` | `DECLARED` | ST-022; verify filename/401 |
| `DELETE /documents/{id}` | `documents.api.ts` | `DECLARED` | ST-022; verify WORM `423` |
| `POST /documents/{id}/lock` | `documents.api.ts` | `DECLARED` | ST-022; verify irreversible action |

### Billing

| Endpoint | Frontend owner | Status | Follow-up/evidence owner |
| --- | --- | --- | --- |
| `GET /time-entries` | `time-entries.api.ts` | `DECLARED` | ST-050 |
| `POST /time-entries` | `time-entries.api.ts` | `DECLARED` | ST-050 |
| `GET /time-entries/{id}` | `time-entries.api.ts` | `DECLARED` | ST-050 |
| `PUT /time-entries/{id}` | `time-entries.api.ts` | `DECLARED` | ST-050; verify invoice lock |
| `DELETE /time-entries/{id}` | `time-entries.api.ts` | `DECLARED` | ST-050; verify invoice lock |
| `GET /invoices` | `invoices.api.ts` | `DECLARED` | ST-051 |
| `POST /invoices/generate` | `invoices.api.ts` | `DECLARED` | ST-051; verify unbilled-only rule |
| `GET /invoices/{id}` | `invoices.api.ts` | `DECLARED` | ST-051 |
| `PUT /invoices/{id}/status` | `invoices.api.ts` | `DECLARED` | ST-051; verify transitions |
| `GET /invoices/{id}/time-entries` | `invoices.api.ts` | `DECLARED` | ST-051 |
| `GET /project-payments` | `project-payments.api.ts` | `DECLARED` | ST-041/ST-051 |
| `GET /project-payments/{id}` | `project-payments.api.ts` | `DECLARED` | ST-041/ST-051 |

### Dashboard, reports and OKR

| Endpoint | Frontend owner | Status | Follow-up/evidence owner |
| --- | --- | --- | --- |
| `GET /dashboard/summary` | `dashboard.api.ts` | `DECLARED` | ST-061 |
| `GET /reports/tasks/summary` | `task-reports.api.ts` | `DECLARED` | ST-061 |
| `GET /reports/tasks/by-assignee` | `task-reports.api.ts` | `DECLARED` | ST-061 |
| `GET /reports/tasks/by-status` | `task-reports.api.ts` | `DECLARED` | ST-061 |
| `GET /reports/tasks/overdue` | `task-reports.api.ts` | `DECLARED` | ST-061 |
| `GET /reports/workload` | `task-reports.api.ts` | `DECLARED` | ST-061 |
| `GET /reports/okr/summary` | `okr.api.ts` returns `unknown` | `BLOCKED` | I-0012/ST-060; BA/BE provide DTO |
| `GET /okr/cycles` | `okr.api.ts` | `DECLARED` | ST-060 |
| `POST /okr/cycles` | `okr.api.ts` | `DECLARED` | ST-060 |
| `GET /okr/objectives` | `okr.api.ts` | `DECLARED` | ST-060 |
| `POST /okr/objectives` | `okr.api.ts` | `DECLARED` | ST-060 |
| `PUT /okr/objectives/{id}` | `okr.api.ts` | `DECLARED` | ST-060 |
| `DELETE /okr/objectives/{id}` | `okr.api.ts` | `DECLARED` | ST-060 |
| `POST /okr/objectives/{id}/key-results` | `okr.api.ts` | `DECLARED` | ST-060 |
| `PUT /okr/key-results/{id}` | `okr.api.ts` | `DECLARED` | ST-060 |

### Audit and admin

| Endpoint | Frontend owner | Status | Follow-up/evidence owner |
| --- | --- | --- | --- |
| `GET /audit-logs` | `audit-logs.api.ts` | `DECLARED` | ST-070 |
| `GET /audit-logs/{id}` | `audit-logs.api.ts` | `DECLARED` | ST-070 |
| `POST /audit-logs/verify` | `audit-logs.api.ts` | `DECLARED` | ST-070 |
| `POST /admin/purge` | `admin.api.ts` | `DECLARED` | ST-070 |
| `GET /admin/tenant-settings` | `admin.api.ts` | `DECLARED` | ST-070 |
| `PUT /admin/tenant-settings` | `admin.api.ts` | `DECLARED` | ST-070 |
| `GET /metadata/schemas/{entity}` | `metadata.api.ts` | `DIAGNOSTIC_ONLY` | ST-070; BA owns any promoted consumer |

## Canonical route inventory

| Route | Repository state | ST-001 decision |
| --- | --- | --- |
| `/login` | Exists | Keep |
| `/dashboard` | Exists | Keep |
| `/work` | Exists | Keep; implementation blocked on issue/task contract |
| `/projects` | Exists | Keep |
| `/projects/[id]` | Exists, placeholder | Keep |
| `/customers` | Exists, placeholder | Keep |
| `/customers/[id]` | Exists, placeholder | Keep |
| `/documents` | Exists, placeholder | Keep |
| `/users` | Missing | Add canonical route |
| `/labels` | Exists, placeholder | Keep |
| `/time-entries` | Exists, placeholder | Keep |
| `/invoices` | Exists, placeholder | Keep |
| `/invoices/[id]` | Exists, placeholder | Keep |
| `/okr` | Exists, placeholder | Keep |
| `/reports` | Missing | Add canonical route |
| `/audit-logs` | Exists, placeholder | Keep |
| `/settings/workflow-templates` | Exists | Keep |
| `/settings/profile` | Exists, placeholder | Keep |
| `/admin/tenant-settings` | Missing | Add canonical route |
| `/admin/purge` | Exists, placeholder | Keep |

Legacy-route decisions:

- `/settings/users` must redirect to `/users`.
- `/tasks` and `/issue-board` redirect to `/work`.
- `/settings/workflows` redirects to `/settings/workflow-templates`.
- `/board` redirects to `/projects/board`.
- `/workflow-board` should redirect to `/projects/board` instead of rendering a
  duplicate page.

## Blocking contract decisions

### Current user and MFA

- The current implementation reads `/auth/me` while the SRS also defines
  `/users/me` as the profile/update source.
- Login request currently contains only username/password; MFA methods are
  absent from the API layer.
- Decision required: authentication identity comes from `/auth/me`; editable
  profile/version comes from `/users/me`, unless staging proves otherwise.

### Work Board

- The SRS states that FE issues are project tasks and declares both `/tasks` and
  `/issues` aliases.
- `issues.api.ts` models status columns (`BACKLOG`, `REVIEW`) and intentionally
  rejects every operation.
- The SRS board contract uses workflow-step columns and task statuses
  `TODO`, `DOING`, `DONE`, `CANCELLED`.
- Decision required: use `/issues` as the canonical UI adapter when the aliases
  exist; otherwise use `/tasks` behind the same feature adapter. UI components
  must not depend directly on the chosen transport name.

### Error and concurrency model

- JSON and download requests must handle `401` consistently.
- `403` means forbidden action/route, `423` means WORM or billing lock, and
  `428` requires record refetch before another versioned mutation.
- `application/problem+json` must be parsed as JSON, not text.
- Mutation retries must preserve the original idempotency key.

## Verification evidence required to promote `DECLARED` to `AVAILABLE`

For each capability, BA records:

1. Staging base URL/environment name without credentials.
2. Role/account fixture used.
3. Request method/path/query/body and relevant headers.
4. Success DTO and empty/pagination response.
5. Permission, validation, lock and concurrency errors where applicable.
6. Any accepted difference from the SRS, with PO/BA/BE approval.

Credentials, access tokens and production customer data must never be copied
into this matrix or a ticket.
