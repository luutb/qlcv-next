# BA traceability confirmation — ST-01.01

**Story:** ST-01.01 — UI foundation và accessibility baseline  
**BA role:** BA  
**Date:** 2026-09-08  
**Inputs:** `ST-01-01-MUI-DESIGN-SYSTEM-CONTEXT.md`, `QA-ST-01-01-RESULT.md`, `REVIEW-ST-01-01.md`, `REQUIREMENTS_TRACEABILITY.md`, `ADR-05-MUI-DESIGN-SYSTEM.md`, `design-system/qlcv-next/MASTER.md`, and the reviewed source scope.  
**Decision:** `TRACEABILITY_CONFIRMED`

## 1. Decision summary

The story has a coherent FR/NFR/ADR → acceptance criteria → implementation and test-evidence
chain for the limited UI-foundation slice. QA retest resolved QA-001 and QA-002, and reviewer
approval confirmed the dependency and architecture boundaries. No API, RBAC, domain, tenant,
or business workflow scope was introduced.

This confirmation does not close the story, accept the story for PO, or close G-05. The QA and
review artifacts explicitly retain residual runtime evidence gaps for axe, keyboard traversal,
contrast, viewport screenshots, and runtime reduced-motion verification.

## 2. FR/NFR/ADR → AC → evidence mapping

| Requirement / decision | Linked AC | Evidence and source mapping | BA result |
| --- | --- | --- | --- |
| FR-01 Identity session; FR-02 RBAC — shared UI foundation only | AC3, AC4 | Story context limits this story to reusable UI/accessibility primitives. `src/features/auth/ui/login-form.tsx` and `src/features/customers/ui/customers-list.tsx` preserve labels, safe states, and defensive error presentation. No session, endpoint, role, or authorization contract changed. | Confirmed as dependency/foundation trace; implementation of FR-01/02 remains in their owning stories. |
| NFR-01 Quality baseline | AC7 | QA retest reports `npm run lint`, `npm run typecheck`, and `npm run build` PASS. Build generated all 16 App Router routes. | Confirmed. |
| NFR-05 Accessibility | AC3, AC4, AC5, AC6 | QA/reviewer confirm labels, semantic headings, `role="status"`, `role="alert"`, visible `:focus-visible`, 44px controls/inputs, responsive breakpoints, and `prefers-reduced-motion` CSS. Runtime axe, keyboard, contrast, viewport, and reduced-motion checks remain not-run/blocked. | Trace confirmed with residual verification risk; G-05 remains open. |
| NFR-06 Vietnamese-first and safe mapped errors | AC4 | `src/api/client.ts` exposes `getSafeApiErrorMessage`; auth, customer, and task UI consumers use it. QA-002 was resolved and reviewer confirmed raw backend `detail`/`title` is not rendered in reviewed paths. User-facing states are Vietnamese. | Confirmed. |
| NFR-07 Security/privacy — scoped UI implication | AC1, AC4 | Synthetic/unauthenticated QA checks; no token, password, MFA secret, or real PII in evidence. Safe error mapping avoids exposing backend details in reviewed consumers. | Confirmed for story scope; full authz/security verification remains in G-04 and owning stories. |
| NFR-04 Runtime proof | AC7 and story QA approach | Route smoke for `/`, `/login`, `/work`, `/customers` returned HTTP 200 with `<main>`, `<h1>`, and skip link. This is render smoke only, not endpoint contract or full runtime proof. | Trace confirmed; full NFR-04 remains outside this slice and is not claimed as closed. |
| ADR-05 — MUI is the only UI/accessibility library | AC1 | `package.json` contains `@mui/material` as the UI component library; no Ant Design/Chakra/Radix competitor or new package was added. Reviewer confirmed ADR-05 boundary and `npm audit --audit-level=high` reported 0 vulnerabilities. | Confirmed. |
| Approved visual tokens from `design-system/qlcv-next/MASTER.md` | AC2, AC6 | `src/shared/ui/theme.ts` maps primary `#1E3A8A`, accent `#B45309`, background `#F8FAFC`, foreground `#0F172A`, border `#CBD5E1`; `src/app/layout.tsx` wires Next Font Module EB Garamond/Lato; `src/app/globals.css` owns global token/focus/reduced-motion behavior. | Confirmed with reviewer note that raw derived colors/fallbacks should be consolidated before broad rollout. |
| Approved limited waiver / no gate expansion | All ACs, especially AC1/AC2/AC7 | Story context records PO limited waiver for typography/token foundation. QA and review both state that the slice does not close G-01…G-04, G-06, or G-07 and does not establish full G-05 readiness. | Confirmed. |

## 3. Acceptance-criteria trace

| AC | Acceptance statement | Evidence | Status |
| --- | --- | --- | --- |
| AC1 | MUI-only UI/accessibility primitive dependency | `package.json`, existing lockfile, QA dependency review, reviewer ADR-05 review, audit result | PASS |
| AC2 | Approved theme/token values and no competing raw token ownership | `src/shared/ui/theme.ts`, `src/app/globals.css`, design-system master, QA and reviewer review | PASS with consolidation note |
| AC3 | Accessible names, visible focus, cursor, 44px targets, keyboard-compatible controls | Login/customer source labels; global focus CSS; remediated `.quiet-button` and search input; QA retest | PASS static; keyboard runtime not verified |
| AC4 | Labels and semantic loading/error/auth states; safe backend error presentation | `login-form.tsx`, `customers-list.tsx`, `work-board.tsx`, `client.ts`; QA-002 resolved; reviewer approval | PASS |
| AC5 | Narrow responsive layout without unintended horizontal scroll | Breakpoints in `globals.css`; intentional `.table-wrap`, `.board-columns`, and mobile nav overflow documented | Static pass; viewport/visual runtime not verified |
| AC6 | Respect reduced-motion preference | `@media (prefers-reduced-motion: reduce)` in `globals.css`; QA/reviewer static confirmation | Static pass; runtime preference not verified |
| AC7 | Lint, typecheck, build pass | QA retest command results and route smoke evidence | PASS |

## 4. Scope and dependency check

### In-scope and evidenced

- Typography foundation: Next Font Module with EB Garamond and Lato.
- MUI theme and approved visual token wiring.
- Shared CSS behavior for focus, control sizing, responsive layout, and reduced motion.
- Safe presentation of auth/customer/task error states.
- Static quality and unauthenticated route render smoke.

### Explicitly not changed or claimed

- No API endpoint, query key, DTO, domain model, RBAC rule, tenant policy, or migration changed.
- No business feature, mutation modal, fixture truth, or API contract was introduced.
- No claim that G-05 is closed; no claim that axe, keyboard, contrast, viewport, or runtime
  reduced-motion evidence exists.
- No claim that FR-01/FR-02, NFR-04, or the other open gates are implemented by this story.

### Dependency/security boundary

- No package was added or upgraded for the story.
- MUI remains the only UI/accessibility component library.
- Next Font Module and the Web Platform/CSS are used for the approved capability; no untrusted
  or unrelated library was introduced.
- QA reports `npm audit --audit-level=high`: 0 vulnerabilities.
- Reviewer confirmed the app/feature/shared architecture boundary for the reviewed scope.

## 5. Findings and residual risks

No traceability break, scope violation, or missing required requirement link was found. The
following are evidence limitations already recorded by QA/reviewer and remain open follow-ups:

1. Browser-based axe, keyboard traversal, contrast measurement, viewport screenshots at 375,
   768, 1024, and 1440, and runtime reduced-motion verification were blocked/not-run.
2. `globals.css` contains intentional derived/raw colors and duplicate typography fallbacks;
   reviewer marked this as non-blocking consolidation work before broad migration.
3. `ApiProblem` still initializes `Error.message` from backend detail/title; reviewed UI paths
   use the safe mapper, while hardening the base error remains a non-blocking follow-up.

These items do not break the story's requirement-to-evidence mapping, but they prevent using this
artifact as full accessibility certification or as evidence that G-05 is closed.

## 6. BA confirmation

`TRACEABILITY_CONFIRMED`

BA confirms that ST-01.01's scoped requirements, acceptance criteria, ADR boundary, dependencies,
and available evidence are mutually consistent. This is a traceability handoff only. The story
remains subject to PO acceptance according to workflow and is not marked `done` here.
