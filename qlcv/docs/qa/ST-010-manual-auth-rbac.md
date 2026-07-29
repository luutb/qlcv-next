# ST-010 Manual QA — Auth, Profile and RBAC

Date: 2026-07-29

Scope: `I-0101`, `I-0103`, `I-0105`, `I-0107` and `I-0108`. MFA issues
`I-0102` and `I-0104` are explicitly deferred.

Overall result: `PASS` for the agreed non-MFA scope.

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

Frontend `http://localhost:3000` and backend `http://localhost:8080` were running
during the final smoke. A local-only SUPER_ADMIN fixture was added to complete
the four-role matrix; no production or staging data was changed.

| Scenario | SUPER_ADMIN | PARTNER | LAWYER | ACCOUNTANT |
| --- | --- | --- | --- | --- |
| Login, `/users/me`, refresh and logout | PASS | PASS | PASS | PASS |
| Profile read/direct URL | PASS | PASS | PASS | PASS |
| Profile update API | PASS | PASS | NOT REPEATED | NOT REPEATED |
| Profile stale 428 response | PASS | PASS | NOT REPEATED | NOT REPEATED |
| User-management API role policy | PASS — 200 | PASS — 200 | PASS — 403 | PASS — 403 |
| Sidebar/direct-route browser policy | PASS | PASS | PASS | PASS |
| Project action visibility | PASS | PASS | PASS | PASS |
| Expired/inactive session cleanup | PASS | PASS | PASS | PASS |
| Hydration and browser console | PASS — 0 errors | PASS — 0 errors | PASS — 0 errors | PASS — 0 errors |

Additional runtime evidence:

- Backend `/health`: HTTP 200.
- Invalid password: HTTP 401.
- Invalid bearer token on `/users/me`: HTTP 401.
- PARTNER profile update increased optimistic version from 1 to 2.
- Reusing version 1 returned HTTP 428.
- Production SSR browser smoke logged in through the React form for all roles.
- Safe internal return URLs were honored; `//evil.example` fell back to the
  internal dashboard and never changed origin.
- Authenticated refresh preserved the session and logout cleared both storage
  keys for every role.
- Invalid/expired token and inactive cached-user fixtures cleared both storage
  keys and returned to login.
- Project actions matched policy: SUPER_ADMIN/PARTNER edit/move/close, LAWYER
  move without edit/close, ACCOUNTANT view-only.
- The original hydration failure was reproduced before the fix. With
  `AppRouterCacheProvider` on the production build, every role completed with
  zero hydration errors and zero console errors.

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

## Deferred work

MFA remains outside the agreed delivery scope. Do not expose self-service MFA
disable until the backend requires verified proof. No token, MFA secret or QR
payload was included in QA output.
