# ST-010 Execution Plan — Auth, Profile, MFA and RBAC

Status: Non-MFA scope implemented; runtime QA partially verified

Date: 2026-07-29

Story branch: `story/QLCV-ST-010-auth-profile-rbac`

Product roadmap: `ROADMAP_V1.md` / `ST-010`

## Objective

Complete authentication, current-user profile, MFA and role-based access using
the real backend contract while preserving the architecture boundaries created
in EP-002.

The Story is complete only when normal login and MFA work against the backend,
session expiry is safe, profile updates use optimistic versioning, direct URLs
respect role access and QA passes before Reviewer.

## Roles

| Role | Responsibility |
| --- | --- |
| PO | Confirm acceptance criteria and owner decisions |
| BA | Verify runtime API contracts and record deviations |
| PM | Maintain this plan, dependencies, assignments and merge order |
| FE DEV1 | Session, login and route/action access stream |
| FE DEV2 | Profile and self-service MFA stream |
| BE DEV | Verify/fix backend identity and MFA contract |
| QA | Manual functional, security and four-role regression |
| Reviewer | Final technical/security review after QA |

## Status model

| Status | Meaning |
| --- | --- |
| `TODO` | Ready but not started |
| `IN_PROGRESS` | Owner is actively working |
| `BLOCKED` | A named dependency or contract decision is missing |
| `DEFERRED` | Explicitly removed from the current delivery scope |
| `QA` | Implementation is merged into the Story and awaiting QA |
| `DONE` | QA passed and Reviewer accepted the work |

Only one owner updates an issue at a time. A status change must include the
branch, latest commit and any blocker.

## Assignment board

| Issue | Owner | Depends on | Owned paths | Initial status |
| --- | --- | --- | --- | --- |
| `I-0100` Execution plan | PM | — | `docs/planning/ST-010_EXECUTION_PLAN.md` | `DONE` |
| `I-0101` Current-user/session cache | FE DEV1 | BA identity check | `src/api/client.ts`, `src/features/auth/auth.store.ts`, `src/layouts/app-shell/AppShell.tsx` | `QA` |
| `I-0102` Login MFA challenge/return URL | FE DEV1 | `I-0101`, MFA challenge shape | `src/features/auth/LoginForm.tsx`, `src/api/auth.api.ts` | `DEFERRED` |
| `I-0103` Profile/update/version | FE DEV2 | BA `/users/me` check | `app/settings/profile/page.tsx`, `src/features/profile/**`, profile portion of `src/api/users.api.ts` | `QA` |
| `I-0104` Enable/disable MFA | FE DEV2 | `I-0103`, MFA enrollment response | `src/features/profile/mfa/**`; consume public methods from `src/api/auth.api.ts` | `DEFERRED` |
| `I-0105` Route/action guards | FE DEV1 | `I-0101`; MFA dependency waived for current scope | `src/layouts/app-shell/model/access.ts`, guard UI and action-policy helpers | `QA` |
| `I-0106` Manual QA/Reviewer fixes | QA, then responsible DEV | Current non-MFA scope | `docs/qa/ST-010-manual-auth-rbac.md`; regression fixes stay with original owner | `IN_PROGRESS` |
| `I-0107` Local runtime smoke | QA | `I-0106`, running FE/BE | `README.md`, runtime section of `docs/qa/ST-010-manual-auth-rbac.md` | `QA` |
| Backend identity support | BE DEV | BA contract checklist | Backend auth/user/MFA handlers and DTOs in `qlcv-work-board` | `TODO` |

## Branches

```text
develop
  └── story/QLCV-ST-010-auth-profile-rbac
        ├── issue/QLCV-I-0100-execution-plan
        ├── issue/QLCV-I-0101-session-cache
        ├── issue/QLCV-I-0102-login-mfa
        ├── issue/QLCV-I-0103-profile
        ├── issue/QLCV-I-0104-mfa-settings
        ├── issue/QLCV-I-0105-role-guards
        ├── issue/QLCV-I-0106-manual-qa
        └── issue/QLCV-I-0107-runtime-smoke
```

Each issue branches from the latest Story HEAD. An issue is squash-merged into
the Story only after its local gates pass. No issue branch merges directly to
`develop` or `master`.

The configured `origin/develop` belongs to an unrelated repository history.
Until the correct frontend repository is selected, do not force-push or merge
into that branch. Push work only to explicitly approved isolated branches.

## Parallel execution

### Phase 0 — Contract gate

PO, BA and BE DEV run first. This phase is short and blocks unsafe UI guesses.

- Verify normal login request/response.
- Capture the MFA-required response code and payload without recording secrets.
- Verify `/users/me` for all four roles.
- Verify profile update request, `version` and HTTP `428` behavior.
- Verify MFA enable response fields and disable proof requirements.
- Record backend differences in `IDENTITY_CONTRACT.md` before FE adapts.

### Phase 1 — Parallel foundations

These issues may run at the same time because their primary files do not
overlap:

```text
FE DEV1: I-0101 session/cache
FE DEV2: I-0103 profile/update/version
BE DEV:  identity/MFA contract fixes
QA:      prepare manual fixtures and role matrix
```

FE DEV1 exclusively owns `auth.store.ts`, `client.ts` and `AppShell.tsx` during
this phase. FE DEV2 exclusively owns the new Profile feature and profile update
surface. Changes to `users.api.ts` must be limited to current-profile methods;
User 360 methods remain untouched.

### Phase 2 — Parallel user flows

After Phase 0 and the relevant foundation merge:

```text
FE DEV1: I-0102 login MFA challenge
FE DEV2: I-0104 self-service MFA settings
BE DEV:  support verified runtime gaps
```

`auth.api.ts` has one owner: FE DEV1. If FE DEV2 needs an API change, FE DEV2
specifies the contract and FE DEV1 adds the public method before UI integration.
This prevents simultaneous edits to the same API file.

### Phase 3 — Integration and access policy

FE DEV1 implements `I-0105` only after session and login are stable. FE DEV2
supports action-policy wiring in Profile without editing the central access
model. Then all completed issues merge into the Story for QA.

### Phase 4 — QA then Reviewer

QA executes `I-0106`. Reviewer starts only after QA returns PASS. A
`REQUEST_CHANGES` finding returns to the owner of the affected path, followed by
full re-QA and re-review.

## Accepted identity contract

- `POST /auth/login` creates the access token.
- `GET /users/me` is the canonical current-user source.
- `PUT /users/me` updates profile with `version > 0`.
- `POST /auth/mfa/enable` starts enrollment.
- MFA UI is deferred. Source inspection found that `POST /auth/mfa/disable`
  currently ignores proof/TOTP; do not expose this unsafe self-service flow
  until the backend enforces re-authentication.
- `401` clears token and cached user and redirects to a safe internal return URL.
- `403` never clears a valid session.
- `428` refetches current profile before retry; it never silently overwrites.
- UI action visibility prefers DTO `actions`; missing actions use conservative
  role fallback and backend authorization remains authoritative.
- MFA secrets, QR payloads and recovery material must not be logged, persisted
  in local storage or copied into QA evidence.

## Issue completion checks

### I-0101 — Session/cache

- First server/client render is hydration-safe.
- Cached user is replaced as a whole after `/users/me` refresh.
- Missing, expired or inactive sessions clear both storage keys.
- `401` redirects safely; `403` keeps the session.
- Multiple components do not issue competing current-user refreshes.

### I-0102 — Login/MFA

- Normal login reaches the safe return URL or role default.
- MFA-required, invalid-code and valid-code paths are distinct.
- External, protocol-relative and malformed return URLs are rejected.
- Submit is guarded against duplicate requests and errors remain actionable.

### I-0103 — Profile

- `/settings/profile` reads real `/users/me` data.
- Editable fields follow the verified backend contract.
- Update includes current `version` and refreshes the cached current user.
- HTTP `428` presents stale-data recovery and refetches before retry.

### I-0104 — MFA settings

- Enrollment provisioning data is shown only for the active flow.
- Enable/disable requires confirmation and prevents duplicate mutation.
- Secret/recovery data is cleared when the flow closes.
- Invalid TOTP, `401` and `403` are rendered distinctly.

### I-0105 — Role/action guards

- All four roles receive the approved navigation and direct-route behavior.
- Unauthorized direct URLs render No Permission or redirect according to policy.
- Hidden UI is not treated as authorization; backend `403` remains handled.
- Profile remains reachable for every authenticated role.

## Manual QA matrix

Automated-test tooling is intentionally not installed for this project. QA must
still run lint, strict typecheck, production build and real browser/API checks.

Minimum identities:

| Role | Required checks |
| --- | --- |
| `SUPER_ADMIN` | Admin navigation, Profile, tenant routes, forbidden partner-only assumptions |
| `PARTNER` | Profile/MFA, user/workflow access, privileged actions |
| `LAWYER` | Profile/MFA, operational routes, denied admin/user management |
| `ACCOUNTANT` | Profile/MFA, billing routes, read-only Work Board, denied admin routes |

Minimum scenarios:

1. Normal login and logout.
2. Safe and unsafe return URLs.
3. MFA required, invalid and valid code.
4. Refresh authenticated pages and restore the cached shell without hydration
   warnings.
5. Expired token during query and mutation.
6. Inactive user session.
7. Profile update success and stale `428` recovery.
8. MFA enable/disable success, validation and cancellation.
9. Direct URL access and action visibility for all four roles.
10. Backend `403` even when the UI previously displayed an action.

Browser/staging checks that cannot be run must be marked `NOT VERIFIED`; they
must not be reported as PASS.

## Quality gates

Every implementation issue:

```bash
npm run lint
npm run typecheck
npm run build
git diff --check
```

Story completion additionally requires:

- Production build still reports all expected routes.
- Local backend health and representative identity endpoints succeed.
- Manual QA evidence is committed.
- QA returns PASS.
- Reviewer returns APPROVE.
- Story is merged to `develop`; release smoke runs before `develop` is merged to
  `master`.

## Merge order

Recommended Story merge order:

1. `I-0100` execution plan.
2. `I-0101` session/cache and `I-0103` profile in either order after resolving
   any API-file ownership conflict.
3. Backend contract changes and updated contract evidence.
4. `I-0102` login MFA.
5. `I-0104` MFA settings.
6. `I-0105` route/action guards.
7. `I-0106` QA evidence and Reviewer fixes.

## Daily update template

```text
Issue:
Owner:
Branch:
Status:
Latest commit:
Completed today:
Next step:
Blocker/contract question:
Files owned:
QA evidence:
```

## Current decisions and blockers

- Identity source decision: accepted; `/users/me` is canonical.
- Hydration-safe session bootstrap: implemented on `develop`.
- Backend local environment: available at `http://localhost:8080/api/v1`.
- MFA scope: explicitly deferred by the PO/user on 2026-07-29. Backend source
  returns `qr_code_uri` for enrollment and currently disables MFA without TOTP;
  remediation is required before `I-0102`/`I-0104` resume.
- Static quality gates: lint, strict typecheck and production build PASS on
  2026-07-29.
- Local runtime QA: backend health, three seeded-role logins/current-user,
  user-management API authorization, profile update/428 and frontend HTTP route
  smoke PASS on 2026-07-29. Browser interaction/hydration and SUPER_ADMIN remain
  `NOT VERIFIED` because no browser harness or SUPER_ADMIN seed is available.
- Correct frontend remote repository: unresolved; destructive merge into the
  unrelated `origin/develop` is forbidden.
