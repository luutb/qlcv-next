# ST-000 Manual Smoke Evidence

Date: 2026-07-29

Branch: `story/QLCV-ST-000-delivery-foundation`

Automated-test tooling is intentionally not installed by project-owner decision.

## Environment

- Node: 24.4.1
- npm: 11.4.2
- Next.js: 16.2.9
- Server: production build on `http://127.0.0.1:3100`

## Completed checks

| Check | Expected | Actual | Result |
| --- | --- | --- | --- |
| Clean install | Install from the npm lockfile without drift | 517 packages installed; audit reported 0 vulnerabilities | PASS |
| Lint | ESLint exits 0 with no warnings | `npm run lint` exited 0 | PASS |
| Typecheck | Strict TypeScript exits 0 | `npm run typecheck` exited 0 | PASS |
| Production build | All current routes compile | Build exited 0 and generated 24 routes | PASS |
| Production server | Server starts from the built output | Ready on `127.0.0.1:3100` | PASS |
| Root HTTP response | Application responds | `GET /` returned HTTP 200 | PASS |
| Login HTTP response | Login route responds | `GET /login` returned HTTP 200 | PASS |

## Human browser checks still required

The following client-side behavior cannot be proven by `curl` and must be
checked by QA in a normal browser without an installed automation framework:

1. Clear `access_token` and `auth_user` from local storage.
2. Open `/dashboard` directly.
3. Confirm the application navigates to `/login` and shows the login form.
4. Open `/work?new=1` and confirm the New Issue dialog opens.
5. Close the dialog and confirm the `new` query parameter is removed.
6. Navigate client-side to `/work?new=1` again and confirm the dialog reopens.

Status: **PENDING HUMAN QA**.

## External GitHub checks still required

- Confirm `@luunbsapo` is a valid repository owner and is auto-requested by
  `.github/CODEOWNERS`.
- Rotate the credential embedded in the current remote URL and replace the
  remote with SSH or a credential helper.
- Enable and capture evidence for required PR, required quality check,
  approvals, resolved conversations, force-push block, and deletion block on
  `develop` and `master`.

Status: **BLOCKED UNTIL REMOTE CREDENTIAL IS ROTATED**.
