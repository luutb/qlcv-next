# Review — ST-01.01 UI foundation và accessibility baseline

**Reviewer:** reviewer  
**Date:** 2026-09-08  
**Story owner:** dev-1  
**Input state:** `ready_for_review` after QA retest  
**Decision:** `APPROVED_FOR_PO_REVIEW_WITH_RESIDUAL_RISK`

## Reviewed evidence

- `ST-01-01-MUI-DESIGN-SYSTEM-CONTEXT.md`
- `QA-ST-01-01-RESULT.md`
- `ADR-05-MUI-DESIGN-SYSTEM.md`
- Source changed by the story/remediation:
  - `src/app/layout.tsx`
  - `src/app/globals.css`
  - `src/shared/ui/theme.ts`
  - `src/api/client.ts`
  - `src/features/auth/ui/login-form.tsx`
  - `src/features/customers/ui/customers-list.tsx`
  - `src/features/tasks/ui/work-board.tsx`
- `package.json` and the existing lockfile dependency set.

## Review result

No Critical/High or release-blocking finding was identified for the scoped foundation slice.
The implementation stays within the approved limited waiver: typography/token setup, shared
visual behavior, accessibility-oriented CSS, and safe presentation of the customer/task/auth
error states. It does not add an API, change authorization, introduce a second UI library, or
change domain behavior.

## Acceptance criteria review

| AC | Result | Review evidence / residual risk |
|---|---|---|
| AC1 — MUI-only UI dependency | PASS | `package.json` contains MUI as the only UI component library; no Ant Design, Chakra, Radix, or icon/UI competitor was added. `npm audit --audit-level=high` passed with 0 vulnerabilities. |
| AC2 — approved tokens and theme | PASS WITH NOTE | `src/shared/ui/theme.ts` contains the approved primary, accent, background, foreground, and border values; EB Garamond/Lato are wired through Next Font Module. `globals.css` still has several intentional raw derived colors and duplicate typography fallbacks; this is not a competing library or behavior boundary violation, but should be consolidated before broad rollout. |
| AC3 — names, focus, cursor, target size, keyboard | PASS STATIC / RUNTIME RESIDUAL | QA verified labels, focus CSS, cursor styles, and the remediated 44px controls. Keyboard traversal was not run because no usable browser harness was available. |
| AC4 — semantic states and safe errors | PASS | Loading/unauthorized use `role="status"`, error states use `role="alert"`, and current auth/customer/task UI consumers call `getSafeApiErrorMessage`. Raw backend `detail`/`title` is not rendered by the reviewed UI paths. |
| AC5 — narrow responsive behavior | PASS STATIC / RUNTIME RESIDUAL | Responsive breakpoints and intentional table/board overflow containers are present. Visual checks at 375/768/1024/1440 were blocked, so unintended overflow cannot be fully ruled out from this evidence set. |
| AC6 — reduced motion | PASS STATIC / RUNTIME RESIDUAL | `prefers-reduced-motion` disables transitions/animations and restores normal scroll behavior. Runtime preference verification was not available. |
| AC7 — static quality | PASS | QA reports lint, typecheck, and build passing; all four scoped route smoke checks returned HTTP 200 with expected landmarks. |

## Architecture and dependency review

- ADR-05 is respected: MUI remains the only UI/accessibility library dependency and no package
  was added or upgraded for this story.
- The app layer composes feature/shared UI; no reviewed app-to-feature inversion or feature-to-app
  import was found.
- `src/shared/ui/theme.ts` owns the MUI theme, while `src/app/globals.css` owns global visual
  tokens and responsive/focus rules. This is acceptable for the limited foundation slice, but the
  split ownership should be documented or consolidated before more screens are migrated.
- No API endpoint, query key, RBAC rule, tenant fixture, or domain model was changed.

## Safe error mapping review

The current UI paths are safe: `customers-list.tsx`, `login-form.tsx`, and `work-board.tsx`
use `getSafeApiErrorMessage` rather than rendering `problem.detail` or `problem.title`.
Status/code mapping covers common 401/403/404/409/423/428/5xx cases and falls back to a generic
Vietnamese message.

### Non-blocking hardening recommendation

`ApiProblem` still initializes `Error.message` from backend `detail`/`title`. No reviewed UI
consumer currently displays that message directly, but a future consumer could accidentally
bypass the safe mapper. Consider making the base error message generic or exposing backend
details only through a deliberately internal field in a follow-up security-hardening story.

## Accessibility and residual risks

QA explicitly records these checks as `BLOCKED / NOT-RUN`: axe, keyboard traversal, visual/viewport
screenshots, contrast measurement, and runtime reduced-motion preference. These are accepted here
as residual evidence gaps for this limited story review; they do not constitute evidence that G-05
is closed. A future browser-capable QA pass remains required before declaring the design-system gate
`PASS` or using this story as full accessibility certification.

## Handoff decision

`APPROVED_FOR_PO_REVIEW_WITH_RESIDUAL_RISK`.

This artifact is review evidence only. The reviewer does not perform PO acceptance, does not mark
the story `done`, and does not close G-05. PO/BA should decide acceptance using this artifact and
the QA residual-risk record.
