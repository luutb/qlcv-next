# Repository evidence

Observed 2026-10-27; recheck before relying on mutable facts. Owner: orchestrator. Status: Verified by filesystem/package inspection.

- `.git` exists, but this snapshot has no `HEAD` commit and `git status` reports project files as untracked. There is no tracked baseline for a meaningful diff; preserve unrelated files and inspect the specific files changed.
- Installed Next.js 16.4.0 (manifest range ^16.0.1), App Router under src/app; React 19, strict TypeScript, @ alias to src. Read matching node_modules/next/dist/docs before framework code.
- MUI/Emotion and TanStack Query 5; use existing theme/tokens and [WorkHub design system](../product/DESIGN_SYSTEM.md).
- Both package-lock.json and yarn.lock exist; no packageManager field. Existing docs/scripts use npm commands. Use npm to run scripts; do not rewrite lockfiles or install dependencies without approval.
- HTTP: src/services/http/request.ts, api-client.ts, api-url.ts; feature API/hooks/model layers. Bearer session token stored in sessionStorage by src/features/auth/model/session.ts; authorized-request.ts integrates it. Client guards/expiry are UX, server must enforce authorization. Do not read secret env values.
- [Local runtime](../operations/LOCAL_RUNTIME.md) identifies sibling /Users/sapo/Desktop/qlcv backend. Read-only go.mod inspection confirms Go 1.25.3, Gin, GORM/PostgreSQL, JWT and MinIO dependencies. No backend code, migrations, CI or deployment config found inside this frontend root. Backend writes/services are outside this task.
- Existing `.agents` prompt roster/workflow/artifacts and `docs/product/` contain useful product/API/design references; see [compatibility rules](architecture.md). Some plans are historical.

## Available checks

| Command | Scope / prerequisites |
| --- | --- |
| `python3 scripts/validate-ai-system.py` | AI file structure, minimal schema and links; Python 3.11+ standard library |
| `python3 scripts/validate-ai-system.py --native` | Also render installed Codex prompt for actual metadata discovery; no model call |
| `npm run architecture:check` | Existing frontend boundary scanner, not all semantic rules |
| `npm run lint` | ESLint 9 / Next config |
| `npm run typecheck -- --incremental false` | TypeScript; avoids rewriting existing tsbuildinfo |
| `node --test scripts/qa/session-model.test.mjs` | Existing session behavior tests |
| `npm run build` | Release build; may write .next and require environment/network; run for relevant app/release work |
| `node scripts/qa/ui-session-smoke.mjs` | Inspect prerequisites first; browser/runtime-dependent session smoke |

No general test script, Jest/Vitest/Playwright dependency or CI pipeline is present. Do not invent npm test or claim browser coverage from Node session tests. Build/browser/live API checks are not required for documentation-only changes; disclose when unexecuted.
