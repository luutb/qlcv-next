# QA result — ST-01.01

**Agent:** qa-1  
**Date:** 2026-09-08  
**Handoff state:** `ready_for_qa` — retest after dev-1 remediation  
**Test scope:** UI foundation, accessibility baseline, responsive CSS, dependency policy  
**Production code changed by QA:** none

## Retest — 2026-09-08

### Remediation verification

- **QA-001 RESOLVED:** `.quiet-button` is now `min-height: 44px`; customer search input is now `min-height: 44px` (`src/app/globals.css:17,24`).
- **QA-002 RESOLVED:** customer error rendering now calls `getSafeApiErrorMessage(...)` (`src/features/customers/ui/customers-list.tsx:20`). The mapper returns Vietnamese-safe messages by status/code and falls back generically; it does not render backend `detail`/`title` directly (`src/api/client.ts:17-37`).

### Retest commands

- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS; all 16 App Router routes generated successfully
- `npm audit --audit-level=high` — PASS; `found 0 vulnerabilities`

### Retest runtime smoke

`/`, `/login`, `/work`, and `/customers` each returned HTTP 200 and rendered one `<main>`, one `<h1>`, and the skip link in the server response.

### Retest limitations

- axe — **BLOCKED / NOT-RUN**: no configured runnable axe harness; the lockfile-only transitive `axe-core` entry is not a test runner.
- Keyboard traversal — **BLOCKED / NOT-RUN**: no usable browser interaction harness available.
- Visual/viewport at 375, 768, 1024, 1440 — **BLOCKED / NOT-RUN**: no usable screenshot/visual harness output available.
- Contrast measurement and runtime reduced-motion preference — **NOT-RUN** for the same browser-harness limitation; static focus and reduced-motion CSS remain present.

## Quality plan

| Area | Planned check | Result |
| --- | --- | --- |
| Static quality | `npm run lint`, `npm run typecheck`, `npm run build` | PASS |
| Dependency policy | inspect `package.json`/lockfile, `npm audit --audit-level=high` | PASS; no new package, 0 vulnerabilities |
| Runtime smoke | `/`, `/login`, `/work`, `/customers`; HTTP and semantic landmarks | PASS |
| Accessibility DOM/static | labels, headings, roles, focus CSS, reduced motion, error states | PASS after retest; browser checks remain blocked |
| Keyboard traversal | tab order/focus return | BLOCKED / NOT-RUN; no usable browser interaction harness available |
| axe | automated scan of four routes | BLOCKED / NOT-RUN; axe is only transitive in lockfile and no configured runner exists |
| Visual/viewport | 375, 768, 1024, 1440 screenshots | BLOCKED / NOT-RUN; no usable screenshot/visual harness output was produced |

## Environment and data

- Workspace: `/Users/sapo/Desktop/qlcv`
- Next.js resolved by build: `16.3.4`
- Synthetic/unauthenticated route checks only; no token, password, MFA secret or real PII used.
- Local dev server: `http://127.0.0.1:3000`

## Results

### Automated/static checks

- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS; all 16 App Router routes generated successfully
- `npm audit --audit-level=high` — PASS; `found 0 vulnerabilities`
- Dependency boundary — PASS for this story: `package.json` contains MUI as the UI component library; no Ant Design/Chakra/Radix UI dependency and no package was added by the handoff.

### Runtime/DOM smoke

| Route | HTTP | `<main>` | `<h1>` | Skip link |
| --- | ---: | ---: | ---: | ---: |
| `/` | 200 | 1 | 1 | present |
| `/login` | 200 | 1 | 1 | present |
| `/work` | 200 | 1 | 1 | present |
| `/customers` | 200 | 1 | 1 | present |

Static source review also confirms visible labels for login and customer search fields, `role="status"` for loading/unauthorized states, `role="alert"` for login/customer errors, visible `:focus-visible`, and a `prefers-reduced-motion` rule.

## Findings

### QA-001 — Medium — interactive controls below the agreed touch target *(original run; resolved in retest)*

- **Expected:** Interactive controls follow the story/design contract's approximately 44px minimum target.
- **Actual:** `.quiet-button` has `min-height: 36px` at `src/app/globals.css:17`; customer search input has `min-height: 40px` at `src/app/globals.css:24`. These styles are used by actionable controls in dashboard/resource-list states.
- **Evidence:** `src/app/globals.css:17`, `src/app/globals.css:24`; story context AC3 and design-system accessibility checklist.
- **Impact:** Small targets can reduce keyboard/pointer usability, especially on narrow screens.
- **Owner/action:** dev-1 should align shared actionable controls with the approved target contract, then rerun responsive and keyboard checks.

### QA-002 — Medium — backend error detail can be rendered directly *(original run; resolved in retest)*

- **Expected:** Error feedback is user-safe and must not render raw backend errors.
- **Actual:** `src/features/customers/ui/customers-list.tsx:20` renders `query.error.problem.detail ?? query.error.problem.title` directly inside the alert.
- **Impact:** Backend-provided detail may expose implementation/internal information and violates the story's NFR-06/AC4 wording.
- **Owner/action:** dev-1 should map API failures to approved Vietnamese-safe UI messages while preserving a generic fallback; then add/retest an error-state case.

## AC → evidence

| Acceptance criterion | QA assessment | Evidence / gap |
| --- | --- | --- |
| AC1 MUI-only UI primitive | PASS | `package.json`; dependency review; audit pass |
| AC2 approved visual tokens | PASS with implementation concern | MUI theme in `src/shared/ui/theme.ts`; token values match. Static CSS still contains some intentional raw color values, so reviewer should confirm token ownership before broad rollout. |
| AC3 names/focus/cursor/size/keyboard | PASS static / NOT VERIFIED runtime | Labels, names, cursor, focus CSS and 44px control/input targets present after retest. Keyboard traversal not-run due blocked harness. |
| AC4 semantic states and safe errors | PASS static | Roles/states present; customer error now uses safe status/code mapping. |
| AC5 narrow responsive layout/no unintended horizontal scroll | NOT VERIFIED | Responsive CSS has mobile breakpoints; visual/viewport run blocked. Board/table scroll containers are intentional; mobile nav uses `overflow-x:auto` and needs visual verification. |
| AC6 reduced motion | PASS static / NOT VERIFIED runtime | `src/app/globals.css:20` contains reduced-motion overrides; runtime preference test not-run. |
| AC7 lint/typecheck/build | PASS | All three commands pass in this QA run. |

## Residual risk

- No axe result, real keyboard traversal evidence, contrast measurement, or viewport screenshots were produced in this environment.
- The current report therefore does not establish full G-05 accessibility/visual readiness.
- QA-001 and QA-002 are resolved. Browser-based evidence remains a residual risk and should be collected when the harness is available.

## Decision

**`READY_FOR_REVIEW`**

Retest passed for the previously reported defects. The story may proceed to reviewer; axe, keyboard, viewport, contrast, and runtime reduced-motion checks remain explicitly blocked/not-run and are recorded as residual risk. QA does not transfer the story to PO.
