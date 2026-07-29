# ST-010 Manual QA — Auth, Profile and RBAC

Date: 2026-07-29

Scope: `I-0101`, `I-0103`, `I-0105`. MFA issues `I-0102` and `I-0104` are
explicitly deferred.

Overall result: `PARTIAL PASS`; static gates and available local API/HTTP smoke
PASS. Browser interaction and SUPER_ADMIN remain `NOT VERIFIED`.

## Static gates

| Check | Result | Evidence |
| --- | --- | --- |
| ESLint | PASS | `npm run lint`, zero warnings/errors |
| Strict TypeScript | PASS | `npm run typecheck` |
| Production build | PASS | `npm run build`; 27 routes generated, including `/login` and `/settings/profile` |
| Patch whitespace | PASS | `git diff --check` |
| Automated tests | NOT INSTALLED | Explicit project decision; no test tooling was added |

## Contract inspection

| Contract | Result | Evidence |
| --- | --- | --- |
| Login token | VERIFIED IN SOURCE | `POST /api/v1/auth/login` returns `{ token }` |
| Current user | VERIFIED IN SOURCE | `GET /api/v1/users/me` returns role, active/MFA state, version, plan and feature flags |
| Profile update | VERIFIED IN SOURCE | `PUT /api/v1/users/me` requires `version > 0`; stale update returns HTTP 428 |
| MFA enrollment | DEFERRED | Handler returns `qr_code_uri`; no UI delivered in current scope |
| MFA disable proof | SECURITY FOLLOW-UP | Handler accepts no TOTP/proof; do not expose the flow |

## Runtime matrix

Frontend `http://127.0.0.1:3000` and backend `http://127.0.0.1:8080` were running
during the follow-up smoke. The database contains PARTNER, LAWYER and ACCOUNTANT
demo users but no SUPER_ADMIN.

| Scenario | SUPER_ADMIN | PARTNER | LAWYER | ACCOUNTANT |
| --- | --- | --- | --- | --- |
| Login API and `/users/me` | NOT VERIFIED — no seed | PASS | PASS | PASS |
| Profile read API | NOT VERIFIED — no seed | PASS | PASS | PASS |
| Profile update API | NOT VERIFIED — no seed | PASS | NOT VERIFIED | NOT VERIFIED |
| Profile stale 428 response | NOT VERIFIED — no seed | PASS | NOT VERIFIED | NOT VERIFIED |
| Profile direct URL | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| User-management API role policy | NOT VERIFIED — no seed | PASS — 200 | PASS — 403 | PASS — 403 |
| Sidebar/direct-route browser policy | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| Project action visibility | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| Expired/inactive session | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |

Additional runtime evidence:

- Backend `/health`: HTTP 200.
- Invalid password: HTTP 401.
- Invalid bearer token on `/users/me`: HTTP 401.
- PARTNER profile update increased optimistic version from 1 to 2.
- Reusing version 1 returned HTTP 428.
- Next development server returned HTTP 200 for `/login`, `/dashboard`,
  `/settings/profile`, `/users`, `/admin/tenant-settings` and `/projects/board`.
- HTTP 200 only proves route compilation/response. It does not prove client-side
  RBAC, localStorage session behavior or absence of hydration console warnings.

## Code-level review notes

- Current-user refresh is deduplicated so multiple consumers share one request.
- A cached user renders the shell, then `/users/me` refresh replaces the whole
  cached object.
- A `401` clears token and user; a `403` does not destroy a valid session.
- An inactive cached/refreshed user clears the session.
- Profile save sends only changed editable fields plus the current version.
- HTTP 428 refetches the profile before allowing a new user decision.
- Route rules drive both navigation visibility and direct-route checks.
- Explicit DTO action decisions win; missing decisions use a conservative role
  fallback and unknown roles are denied.

## Remaining acceptance work

1. Add or provide a safe local SUPER_ADMIN fixture.
2. Execute the UI matrix in a real browser for all four roles.
3. Verify logout, refresh, inactive session and hydration console behavior.
4. Capture only non-secret evidence; never record JWTs, QR payloads or MFA data.
5. Fix regressions, rerun all static gates, then obtain Reviewer approval.
