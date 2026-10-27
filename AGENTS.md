<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# QLCV frontend architecture

Before creating or moving UI code, read [`docs/architecture/FRONTEND_LAYER_RULES.md`](docs/architecture/FRONTEND_LAYER_RULES.md).
It defines the mandatory boundaries for `atoms`, `molecules`, `organisms`, `templates`, and route-level `pages`,
including dependency direction and service/model placement. Keep `src/app/**/page.tsx` thin and do not put API calls,
mock data, or business rules directly in route files.


# Codex development system

The primary Codex agent coordinates work using [task routing](docs/ai-development/routing.md).
Small tasks: direct implementation, targeted checks, no subagents or persistent artifacts.
Medium/large tasks: activate only useful roles/skills, bounded handoffs and applicable
[workflow gates](docs/ai-development/gates.md). Significant or risky changes require focused review.
Use native agents in `.codex/agents/` when available and reusable skills in `.agents/skills/`;
files do not execute workflows automatically. Read [system architecture](docs/ai-development/architecture.md)
for authority, delegation, evidence and legacy compatibility.

For newly assigned work this lean process supersedes the mandatory all-role pipeline and blanket
PO authority in legacy `.agents/*.md` / `workflow.yaml` / `bmad-workflow.md`; preserve their historical
artifacts and relevant product/API/ADR evidence. Current user authorization governs product decisions.
Do not treat historical plans as current requirements or silently override approved rules.

Follow installed Next.js docs and existing Server/Client, fetching/cache/auth patterns; keep server-only
code and secrets outside client bundles. Use semantic HTML, accessible keyboard/focus behavior and
existing design tokens. Reuse TypeScript types; handle nullable/untrusted input and avoid unjustified
`any`/casts. Keep API transport/contracts in existing service/feature boundaries; cover failure/empty
states and enforce authorization on the server. Assess XSS, CSRF, SSRF, injection, unsafe redirects and
sensitive-data leakage when the affected execution path makes them relevant.

Use existing test tools to check observable behavior and meaningful failure/boundary cases. Never
weaken assertions or claim unexecuted checks passed. See [repository evidence and commands](docs/ai-development/project-context.md).
Run `python3 scripts/validate-ai-system.py` for changes to this system; its structural checks do not enforce process gates.
Preserve unrelated work; inspect Git status/diff when available (this snapshot has no HEAD commit or tracked baseline).
Do not install dependencies, commit, push, merge or deploy without user authority. Review the actual
change before reporting completion, with executed checks, failures and unverified behavior explicit.
