# Identity and Session Contract Decision

Decision ID: QLCV-I-0013

Status: Accepted; backend source and non-MFA live API verified

Date: 2026-07-29

## Source of truth

- `POST /auth/login` authenticates credentials and returns the access token.
- `GET /users/me` is the canonical current-user source for role, tenant plan,
  feature flags, active state, MFA state and optimistic-lock version.
- `PUT /users/me` updates the current user's editable profile with `version`.
- `GET /auth/me` remains a compatibility/diagnostic method until backend owners
  confirm whether it can be retired. Product authorization must not depend on a
  second, divergent identity response.

The auth store now refreshes through `/users/me`. Full stale-session refresh and
route/action policy remain in ST-010.

## Login and MFA

### Login request

```ts
type LoginRequest = {
  username: string;
  password: string;
  totp_code?: string;
};
```

- Send `totp_code` only during an MFA challenge/retry.
- Invalid credentials and invalid MFA tokens must remain distinguishable.
- An inactive account is forbidden and must not create a local session.

### MFA endpoints

| Operation | Endpoint | Contract decision |
| --- | --- | --- |
| Start enrollment | `POST /auth/mfa/enable` | Backend source returns `{ qr_code_uri, secret }`; current handler intentionally returns an empty raw secret |
| Disable MFA | `POST /auth/mfa/disable` | Backend source currently accepts no request proof and disables immediately; this is a security gap and the frontend flow remains deferred |
| Admin reset | `POST /users/{id}/mfa/reset` | Privileged User 360 action; no user TOTP assumed |

Enrollment UX, TOTP challenge UI and recovery copy belong to ST-010. Secret or
QR provisioning data must never be logged, cached in local storage or placed in
QA evidence.

## User and authorization shape

Canonical fields:

```ts
type CurrentUser = {
  id: string;
  organization_id: string;
  username: string;
  email: string;
  role: "SUPER_ADMIN" | "PARTNER" | "LAWYER" | "ACCOUNTANT";
  is_active: boolean;
  mfa_enabled: boolean;
  version: number;
  tenant_plan?: string;
  enabled_feature_flags?: string[];
  actions?: Partial<Record<string, boolean>>;
};
```

Every action member is optional. A response containing `actions: {}` is valid.
UI code must not crash or silently grant a privileged mutation when an action
key is absent. Approved role policy supplies a conservative display fallback;
backend `403` remains authoritative.

## Session rules

- Store only the access token and the minimum cached current-user shape needed
  to render the shell.
- A successful current-user refresh replaces the whole cached user object.
- `401` clears both token and cached user, then navigates to login with a safe
  internal return URL.
- `403` does not clear the session.
- A deactivated user or invalid current-user response clears the session.
- Client-side cache is not authorization evidence; sensitive mutations rely on
  response `actions` and backend enforcement.

Return URLs must start with a single `/`, must not start with `//`, and must not
contain an external origin. Invalid values fall back to `/dashboard`.

## Version and idempotency

- `PUT /users/me` and versioned user-management mutations send `version > 0`.
- HTTP `428` means stale data. Refetch before the user retries; never overwrite
  silently.
- Every mutation uses one idempotency key for all retries/replays of the same
  logical submission. A retry must not generate a different key after an
  ambiguous network result.

## Error decisions

| HTTP status | Identity behavior |
| --- | --- |
| `400` | Validation or missing/invalid MFA challenge data |
| `401` | Session invalid/expired; clear local session and redirect safely |
| `403` | Authenticated but inactive/forbidden; do not create or retain an invalid session |
| `428` | Current profile/user version is stale; refetch before retry |

Typed cross-domain error classes and shared UI states are implemented in
I-0015. Full login/session UX is implemented in ST-010.

## Manual verification required

1. Login without MFA.
2. MFA-enabled login without a code, with an invalid code and with a valid code.
3. `/users/me` response for all four roles, including plan/features/version.
4. Current-user `401` and inactive-user behavior.
5. Profile update with current version and stale version.
6. Enable/disable MFA request and response shape with all secret values redacted.

Backend handler source was inspected on 2026-07-29. Live login and `/users/me`
were verified for SUPER_ADMIN, PARTNER, LAWYER and ACCOUNTANT using local demo
fixtures. Profile update, stale HTTP 428, session refresh/logout, expired and
inactive cleanup, direct-route policy and hydration-safe rendering were also
verified in a production browser session. MFA UI was explicitly deferred and
must not be enabled until disable requires verified TOTP or another approved
proof.
