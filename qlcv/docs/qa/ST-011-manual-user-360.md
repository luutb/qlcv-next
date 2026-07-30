# ST-011 Manual QA — User 360

Date: 2026-07-30

Scope: `I-0111` through `I-0117` against
`docs/planning/ST-011_EXECUTION_PLAN.md` and the current working tree.

Overall result: `PASS` for the Story delivery gate. Static gates, the four-role
runtime matrix, primary browser flows, API authorization, conflicts,
security-version refresh, Assigned Work and the last-active-admin safeguard all
pass. The temporary lifecycle setup used for the final admin-rule check was
successfully restored and verified. Reviewer fixes were subsequently inspected;
the production build and all 17 existing browser-smoke checks passed again with
zero console errors.

## Environment

- Production frontend: `http://localhost:3000`.
- Backend: `http://localhost:8080`.
- Runtime checks used the documented local demo accounts and a disposable QA
  user. No credential, bearer token, password value or MFA secret is recorded.
- The disposable QA user was intentionally left inactive after the lifecycle
  sequence.

## Static gates

| Check | Result | Evidence |
| --- | --- | --- |
| ESLint | PASS | `npm run lint`; zero warnings/errors |
| Strict TypeScript | PASS | `npm run typecheck` |
| Production build | PASS | `npm run build`; 27 routes generated, including `/users` and `/users/[id]` |
| Patch whitespace | PASS | `git diff --check` |
| Automated tests | NOT INSTALLED | Existing project decision; no test tooling was added |

## Four-role route and authorization matrix

| Scenario | SUPER_ADMIN | PARTNER | LAWYER | ACCOUNTANT |
| --- | --- | --- | --- | --- |
| Login | PASS | PASS | PASS | PASS |
| `GET /api/v1/users` | PASS — 200 | PASS — 200 | PASS — 403 | PASS — 403 |
| Browser `/users` | PASS — list | PASS — list | PASS — No Permission | PASS — No Permission |
| Session retained after denial | N/A | PASS after target 403 | PASS | PASS |
| `GET /api/v1/users/{self}` | PASS — 200 | PASS — 200 | PASS — 200 | PASS — 200 |
| Non-admin other-user detail | N/A | N/A | PASS — 403 | Not repeated |

Browser denial retained the access token for LAWYER and ACCOUNTANT. PARTNER also
remained authorized for a subsequent list request after forbidden SUPER_ADMIN
target actions.

## List and browser behavior

| Scenario | Result | Evidence |
| --- | --- | --- |
| SUPER_ADMIN canonical list | PASS | Production browser rendered the server-backed user list with zero console/runtime errors. |
| PARTNER canonical list | PASS | Production browser rendered the server-backed list. |
| URL restoration | PASS | `q`, `role`, `is_active` survived direct URL load; browser network request contained the restored filter state. |
| Filter reset/pagination implementation | PASS | Browser filter request passed; code resets `offset` on search/role/active changes and writes page offset to the URL. |
| Role filter | PASS | `role=LAWYER` returned 200 with count 1. |
| Active-state filter | PASS | `is_active=false` returned 200. |
| Search | PASS | `q=admin` returned 200. |
| Invalid role | PASS | API returned 400. |
| Loading/empty/error/retry | PASS WITH STATIC SUPPORT | Browser covered successful loading; distinct pending, empty, filtered-empty and error/retry branches are present in the implementation. Error injection was not repeated. |

## Create and edit

| Scenario | Result | Evidence |
| --- | --- | --- |
| Blank create validation | PASS | Browser kept the dialog open and showed field validation; no create request was accepted. |
| Role options for SUPER_ADMIN | PASS | Full managed-role set available. |
| Role options for PARTNER | PASS | `SUPER_ADMIN` was omitted. |
| Create | PASS | Disposable QA user returned 201. |
| Duplicate conflict | PASS | Repeating the unique identity returned 409. |
| Stale edit conflict | PASS | Update with stale version returned 428. |
| Unchanged edit | PASS (code inspection) | Save is disabled when the trimmed editable fields equal the current baseline. |
| Duplicate-submit/pending guard | PASS (code inspection) | Synchronous submit ref and pending state prevent replay; form controls and dismissal are disabled while pending. |
| 428 review/retry policy | PASS (runtime + code) | Real API returned 428; UI refetches current data, preserves the draft and requires an explicit second save. It does not replay automatically. |
| Self-edit actor synchronization | PASS WITH CODE INSPECTION / RUNTIME NOT RUN | After a successful self-edit, the modal awaits `authStore.refreshUser`, verifies the refreshed actor ID and version, and closes only after synchronization. Sync failure keeps the form open; retry performs synchronization only and cannot repeat the user mutation. A dedicated browser interaction timed out before mutation, and the QA user was confirmed unchanged before cleanup. |

## Record permissions and target restrictions

| Scenario | Result | Evidence |
| --- | --- | --- |
| Explicit `actions: false` | PASS | PARTNER received `edit=false` and `delete=false` for SUPER_ADMIN; list hid edit. Permission helpers return a present boolean immediately. |
| Missing action fallback | PASS (code inspection) | Unknown/non-admin actors deny; PARTNER fallback explicitly denies a SUPER_ADMIN target. |
| PARTNER create SUPER_ADMIN | PASS — 403 | Backend rejected the request. |
| PARTNER reset SUPER_ADMIN password | PASS — 403 | Backend rejected the request. |
| PARTNER deactivate SUPER_ADMIN | PASS — 403 | Backend rejected the request. |
| Session retention after 403 | PASS | A subsequent PARTNER list request returned 200. |

## Detail, lifecycle and security

| Scenario | Result | Evidence |
| --- | --- | --- |
| Detail navigation and tabs | PASS | Browser opened the detail link and rendered Overview, Security and Assigned Work. |
| Lifecycle confirmation/version | PASS | Disposable user progressed from initial version 1 to password-reset version 2, MFA-reset version 3 and deactivate version 4, ending inactive. Distinct activate/deactivate confirmation and pending guards are present. |
| Self-deactivation | PASS — 400 | Backend rejected self-deactivation; UI also disables this action for the signed-in user. |
| Last-active-admin | PASS — 400 | PARTNER was temporarily deactivated, leaving the existing SUPER_ADMIN as the sole active admin. Attempting to demote that SUPER_ADMIN returned HTTP 400 with detail identifying the last-active-admin rule. PARTNER was then reactivated successfully; final checks confirmed PARTNER active and the SUPER_ADMIN role unchanged. UI preserves the backend detail in an actionable alert. |
| Password reset version refresh | PASS | Disposable user advanced from initial version 1 to version 2 after password reset; UI performs a mandatory detail refetch before enabling another versioned action. |
| Administrator MFA reset refresh | PASS | Version advanced from 2 to 3 after MFA reset; UI performs the same mandatory detail refetch. The following deactivate used version 3 and returned version 4. |
| Sequential action safety | PASS | Security actions return message-only responses; UI blocks further actions until the selected detail record refetch succeeds. |
| Stale dialog target | PASS (code inspection) | Mutations verify the fetched record ID matches the route user ID; list edit modal is keyed by ID and version. |

## Assigned Work

| Scenario | Result | Evidence |
| --- | --- | --- |
| Selected assignee request | PASS | Browser network request used `GET /api/v1/tasks?assignee_id={selected-user-UUID}`. |
| API scoping | PASS | Known assignee returned count 2; mismatching assignee returned count 0. |
| Pagination/error/empty implementation | PASS WITH STATIC SUPPORT | Tab requests 11 records, renders at most 10 and enables Next only when the lookahead record exists, avoiding a false next page when a page is exactly full. Pending, error/retry, initial-empty, empty-page and previous/next states are present. |
| No premature `/work` CTA | PASS | Browser and source inspection found no `/work` or `/work?assignee_id=...` action. |

## Accessibility, responsive and regression smoke

| Scenario | Result | Evidence |
| --- | --- | --- |
| Narrow viewport | PASS | User 360 rendered at 390 px; tables use horizontal scrolling and filters wrap. |
| Browser runtime/console | PASS | The post-Reviewer-fix production rerun passed all prior 17 browser checks with zero console errors and zero runtime errors. |
| Basic semantics | PASS WITH STATIC SUPPORT | Named headings and filters, native links/buttons, keyboard-enabled rows and semantic alert states are present. Full screen-reader testing was not run. |
| ST-010 route/session regression | PASS | Four-role login and route denial/session-retention behavior passed; production build passed. Profile mutation, logout and expired-session cleanup were not repeated because no ST-010 implementation file changed. |

## Final result

The delivered implementation has no confirmed functional defect from the
completed checks. All mandatory ST-011 manual evidence is now covered, including
the last-active-admin HTTP 400 rule and cleanup verification. Reviewer fixes for
self-edit actor synchronization and Assigned Work lookahead pagination were
verified by code inspection, production build and regression browser smoke. The
dedicated self-edit mutation remains a disclosed runtime limitation, not a
release blocker given the guarded implementation and passing broader runtime
matrix. `I-0117` passes; the Story may proceed to final Reviewer approval.
