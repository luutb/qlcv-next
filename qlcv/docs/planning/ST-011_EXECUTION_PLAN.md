# ST-011 Execution Plan — User 360

Status: Complete; QA PASS and Reviewer APPROVE

Story branch: `story/QLCV-ST-011-user-360`

Product roadmap: `ROADMAP_V1.md` / `ST-011`

## Outcome and scope

Deliver a real User 360 experience for `SUPER_ADMIN` and `PARTNER` using the
existing user-management API. The story covers list/search/filter/pagination,
create/edit, versioned lifecycle actions, password and administrator MFA reset,
and an Assigned Work tab backed by `/tasks`.

The following remain outside this story:

- self-service MFA and the MFA login challenge deferred from ST-010;
- profile documents, which remain ST-012 pending a backend authorization policy;
- invite/email delivery semantics;
- conversion of the fixture-based Work Board, owned by ST-030;
- automated-test tooling, per the project-owner decision in `ROADMAP_V1.md`.

## Accepted product and contract decisions

- `/users` and `/users/{id}` are available only to `SUPER_ADMIN` and `PARTNER`.
  `LAWYER` and `ACCOUNTANT` receive the existing No Permission experience and
  retain their authenticated session.
- List URL state is `q`, `role`, `is_active` and `offset`; changing a filter
  resets `offset`.
- Backend `actions` values are authoritative. For user records, `edit` controls
  edit/security administration, `delete` maps to deactivate and `restore` maps
  to activate. A present `false` value must never be replaced by a role fallback.
- The frontend prevents self-deactivation. The backend remains authoritative for
  the last-active-admin rule and other target-specific restrictions.
- A `428` version conflict refetches current data and requires explicit user
  review/retry; mutations are never replayed automatically.
- Password and MFA reset responses contain no updated user. Both actions must
  refetch the detail because the backend increments `version`.
- Assigned Work calls `GET /api/v1/tasks?assignee_id={userId}` directly. No link
  to `/work?assignee_id=...` is exposed until ST-030 makes that route consume the
  filter and UUID-based API data.
- `send_invite` is not exposed because the backend records audit metadata only;
  it does not send an invitation.

## Acceptance criteria

1. The canonical list uses server data and has loading, empty, error/retry,
   search, role, active-state and pagination states that survive reload/history.
2. Create/edit validate fields, prevent duplicate submission and never submit an
   unchanged edit. Version conflicts do not silently overwrite newer data.
3. User detail contains Overview, Security and Assigned Work. Assigned Work uses
   real task data scoped by the selected user's UUID.
4. Activate/deactivate require confirmation and the current version. Self
   deactivation is blocked; last-admin errors remain actionable.
5. Password and administrator MFA reset require distinct confirmation, obey
   target permissions and refetch the record before another versioned action.
6. Successful mutations refresh the relevant list and detail. A stale dialog
   cannot mutate a record other than the one displayed.
7. Four-role manual QA, lint, strict typecheck and production build pass. QA must
   pass before Reviewer runs; Reviewer must approve before the Story is merged.

## Implementation issues and ownership

| Issue | Owner | Scope | Status |
| --- | --- | --- | --- |
| `I-0110` Plan and contract | PM/BA | This plan and verified backend contract | `DONE` |
| `I-0111` User list | FE DEV1 | `/users`, list components, list query keys | `DONE` |
| `I-0112` Create/edit | FE DEV1 | User forms, validation and edit conflict UX | `DONE` |
| `I-0115` Detail/Assigned Work | FE DEV2 | `/users/{id}`, detail tabs and task query | `DONE` |
| `I-0113` Lifecycle | FE DEV2 | Activate/deactivate and conflict handling | `DONE` |
| `I-0114` Security actions | FE DEV2 | Reset password and administrator MFA reset | `DONE` |
| `I-0116` Rule hardening | FE DEV1/DEV2 | Conflict, self/last-admin and sequential actions | `DONE` |
| `I-0117` Manual QA | QA | Four-role, runtime, accessibility and regression evidence | `DONE` |

File ownership while lanes run in parallel:

- DEV1: `app/users/page.tsx`, `src/features/users/list/**`,
  `src/features/users/forms/**`, `src/features/users/model/user-query-keys.ts`,
  and required changes in `src/api/users.api.ts`.
- DEV2: `app/users/[id]/page.tsx` and `src/features/users/detail/**`.
- QA: `docs/qa/ST-011-manual-user-360.md`.

DEV2 consumes the public API/types established by DEV1 and does not modify files
owned by DEV1. Neither lane changes the Work Board or profile-document code.

## Delivery order and gates

1. Complete `I-0111` to establish the list and query-key contract.
2. Run `I-0112` and `I-0115` in parallel from the integrated Story head.
3. Run DEV1 conflict hardening in parallel with DEV2 lifecycle/security work.
4. Run `I-0117` manual QA after all implementation work is integrated.
5. Send QA findings to the responsible file owner, rerun QA, then run Reviewer.

Every implementation issue must pass:

```bash
npm run lint
npm run typecheck
npm run build
git diff --check
```

Manual evidence must cover role denial, explicit `actions: false`, conservative
fallback when an action key is absent, duplicate-submit guards, `400` last-admin,
`403`, `409`, `428`, URL restoration and list/detail refresh after mutations.

## Known follow-ups

- ST-030 must make `/work` consume UUID-based API filters before User 360 exposes
  an "Open in Work" action.
- ST-012 must resolve/verify backend entity authorization and its profile-document
  DTO before the reusable panel is integrated into User 360.
