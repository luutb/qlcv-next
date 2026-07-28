# ST-01 Commit History Audit

## IS-01.3.1 — Platform and dependency commit boundary

### Result

**Current split action: N/A.** At the pre-write observation point, the index, tracked worktree, untracked set, and unmerged index were empty. `develop...HEAD` contained four ST-01 documentation paths and **zero platform/dependency paths**. There is therefore no remaining platform/dependency delta that can be honestly split into a new commit.

Historical baseline commit `1daaac7` did bundle dependencies, framework configuration, root shell/provider work, domain providers, and application features. It was merged by `a714abe` and is contained by the local and remote-tracking `main`/`develop` history. This Issue does **not** claim that bundle was split and does not rewrite it. The safe result is to preserve shared history and enforce focused forward commits.

No reset, restore, rebase, cherry-pick, commit, push, branch change, staging operation, dependency install, build, or typecheck was performed.

## Scope taxonomy and exact path boundaries

The categories below define “platform/dependency” for this audit and for future focused commits.

| Category | Exact in-scope paths | Boundary |
|---|---|---|
| Dependency declarations and lock snapshots | `package.json`, `package-lock.json`, `yarn.lock` | Scripts and dependency versions belong here. Both lockfiles are currently tracked; changing or removing either requires an explicit package-manager decision. `node_modules/**` and `node_modules/.package-lock.json` are generated and never belong in a commit. |
| Next.js and compiler/request framework | `next.config.ts`, `tsconfig.json`, `middleware.ts` | Only framework/compiler/middleware behavior. Read the relevant installed Next.js guide before a future Next.js code/config change. `next-env.d.ts` is generated and ignored, so it is not in this commit allowlist. Keep it in `tsconfig.json` `include`, never hand-edit, commit, or force-add it, and regenerate it with `next typegen`, `next dev`, or `next build`. |
| Lint, CSS toolchain, and repository hygiene | `eslint.config.mjs`, `postcss.config.mjs`, `tailwind.config.js`, `.gitignore` | Tool configuration only; feature CSS/components do not enter merely because Tailwind or ESLint is involved. |
| Test platform | `vitest.config.ts`, `vitest.setup.ts` | Test discovery/environment/setup only. Product tests remain with their feature or test Story. Required package changes belong in the preceding dependency commit. |
| Build/deployment platform | `Dockerfile`, `docker-compose.yml` | Reproducible build/runtime wiring only; environment values and deployment credentials are excluded. |
| Root application shell, theme, and generic provider | `src/app/layout.tsx`, `src/app/globals.css`, `src/components/ThemeRegistry.tsx`, `src/lib/theme.ts`, `src/providers/QueryProvider.tsx` | Root composition, global reset/tokens, theme, and generic query provider only. A feature style or business component remains outside this category. |

Explicit exclusions:

- `src/contexts/AuthContext.tsx` and `src/contexts/NotificationContext.tsx` are domain providers. Root-layout wiring may be reviewed with the shell, but provider internals belong to Auth/Notification commits.
- `src/app/page.tsx`, `src/app/(dashboard)/layout.tsx`, Header, Sidebar, routes, and domain components are product/navigation work, not platform by filename alone.
- `.env*`, credentials, tokens, local editor settings, `.DS_Store`, `.next/**`, `next-env.d.ts`, `tsconfig.tsbuildinfo`, coverage, caches, logs, and private/generated artifacts are excluded. Although ignored, `next-env.d.ts` must remain in `tsconfig.json` `include`; regenerate it with `next typegen`, `next dev`, or `next build` instead of hand-editing, committing, or force-adding it.
- `.codex/**`, `AGENTS.md`, workflow docs, backlog, audit, and review records are repository governance, a separate commit category.

## Observation and current inventory

| Item | Observed value before this audit file was created |
|---|---|
| Branch | `story/st-01-git-baseline` |
| HEAD | `4932d252bcf530c2cb19604ff1aaef26000a0351` (`chore(st-01): record TK-01.2 QA pass`) |
| Local `develop` and merge base | `8d454afa43adfd579cfd21356201b87c53fec9b9` |
| Staged paths | 0 |
| Unstaged tracked paths | 0 |
| Non-ignored untracked paths | 0 |
| Unmerged index entries | 0 |
| `develop...HEAD` | 4 documentation paths, 10 commits |
| Platform/dependency paths in `develop...HEAD` | 0 |

Current Story delta:

| Path | Change | Category |
|---|---|---|
| `docs/BACKLOG.md` | Modified | Coordinator-managed tracking |
| `docs/audits/ST-01-MODULE-SCOPE.md` | Added | ST-01 audit/decision evidence |
| `docs/audits/ST-01-WORKTREE-INVENTORY.md` | Added | ST-01 audit evidence |
| `docs/reviews/ST-01.md` | Added | Coordinator/QA review evidence |

After this report is written, the expected only working-tree record is untracked `docs/audits/ST-01-COMMIT-HISTORY.md`. It is Issue-owned documentation, not a platform/dependency delta.

## Path-scoped history evidence

### Historical baseline commits

| Commit | Path-scoped evidence | Classification |
|---|---|---|
| `cba6dd6` — Create Next App initial commit | Added 19 scaffold/governance paths including dependency manifest/lock, Next/TS/ESLint/PostCSS config, root app shell, and default assets. | Purpose-focused bootstrap snapshot, but not separate dependency-versus-platform commits. Do not relabel it as historically split. |
| `85d59da` — `update FE` | A 72-file feature commit also changed `package.json`, both locks, `tsconfig.json`, `middleware.ts`, globals/layout/theme, and Auth/Notification providers. The scoped platform/dependency subset is +7,322/-192. | Bundled historical feature/platform/dependency change. |
| `8f58896` — `update code` | A 9-file commit added Docker files while changing `next.config.ts`, `package.json`, `yarn.lock`, documentation, and Task/Workflow pages. Scoped platform/dependency subset is +146/-70. | Bundled operations/dependency/feature change. |
| `0e912b5` — `update fe` | A 120-file feature commit changed `package.json`, both locks and added Vitest config/setup. That dependency/test-platform subset is +2,543/-114. | Bundled dependency/test/feature change. |
| `1daaac7` — `update code` | Changed 170 files (+15,079/-18,272 overall). Strict current platform/dependency scope changed nine paths: `middleware.ts`, `next.config.ts`, both manifests/locks, globals/layout, `QueryProvider`, and Tailwind config (+1,015/-17). Auth/Notification provider internals add a separate +27/-32 cross-domain delta. | Major bundled baseline; it added packages/query provider/tooling while migrating/removing many application domains. It was not split. |
| `a714abe` — merge of the feature baseline | First-parent merge diff has the same 170-file +15,079/-18,272 baseline as `1daaac7`. | Shared merge history, not a new focused platform commit. |
| `8d454af` — `chore: define agent development workflow` | Changed exactly agent/repository instructions, README, backlog, development workflow, quality baseline, and review template. It touched no path in this audit's platform/dependency allowlist. | Focused repository-governance setup commit. It is correctly scoped, but it does not retroactively split the baseline. |
| `9926e39..4932d25` | Ten ST-01 commits change only the four documentation/review paths listed above. | Focused ST-01 evidence history; no platform/dependency work to extract. |

The line totals are path-scoped Git `numstat`, not semantic estimates. Binary paths are not included in those numeric subsets.

### Shared versus remaining state

- `1daaac7` is contained by `main`, `develop`, the feature branch, and corresponding remote-tracking refs.
- `a714abe` is contained by local/remote-tracking `main` and `develop` history.
- `8d454af` is contained by local and remote-tracking `develop` and is the Story merge base.
- Rewriting any of those commits would rewrite shared ancestry. It is forbidden by this Issue and unnecessary for the current result.
- Current Story commits were observed only on the local Story branch, but this does not authorize rewriting them. They are already reviewed evidence and the user explicitly prohibited history mutation.
- Remote-tracking containment is a local snapshot; no fetch or remote URL inspection was performed, so it is not proof of current server synchronization.
- The only remaining change after implementation is this new audit file. It must follow the normal Issue QA/commit flow; it contains no platform/dependency content to split.

## Precise conclusion

1. The historical baseline contains bundled platform/dependency changes; no claim is made that those commits were split.
2. Those baseline commits are shared history and must remain intact. A revert, replacement, or migration would require a separately authorized forward change, not history rewriting.
3. The Story setup commit `8d454af` is focused on repository workflow/governance and has no platform/dependency paths.
4. At current HEAD there is **no staged, unstaged, untracked, or Story-committed platform/dependency delta** requiring separation.
5. Therefore the actionable split for `IS-01.3.1` is **N/A / no destructive rewrite**. The deliverable is the reproducible audit and forward commit boundary below.

## Forward commit plan

Create only commits whose causal unit actually exists. Do not create empty commits merely to match this plan.

| Order | Suggested subject pattern | Allowlist | Required separation |
|---:|---|---|---|
| 1 | `IS-xx.y.z: update <package-manager> dependencies` | `package.json` plus the explicitly selected lockfile(s) | No source/config/docs. Decide npm versus Yarn ownership first; if both locks must remain, prove both represent the same manifest. Lockfile removal is a separate approved decision. |
| 2 | `IS-xx.y.z: configure Next and TypeScript` | `next.config.ts`, `tsconfig.json`, `middleware.ts` | No feature route/service. Split middleware business authorization changes to ST-06/ST-07 when they exceed framework wiring. Keep generated/ignored `next-env.d.ts` out of the commit; retain its `tsconfig.json` include and verify regeneration with `next typegen`, `next dev`, or `next build`. |
| 3 | `IS-xx.y.z: configure lint and CSS tooling` | `eslint.config.mjs`, `postcss.config.mjs`, `tailwind.config.js`, `.gitignore` | No bulk lint fixes or feature styles. |
| 4 | `IS-xx.y.z: configure test platform` | `vitest.config.ts`, `vitest.setup.ts` | Dependency declarations precede this commit; feature tests remain in their owning Issue. |
| 5 | `IS-xx.y.z: update root app shell` | root shell/theme/generic-provider allowlist above | Domain provider internals, route UI, navigation, and features remain separate. |
| 6 | `IS-xx.y.z: update container build` | `Dockerfile`, `docker-compose.yml` | No environment values, application refactor, or unrelated dependency churn. |

If one atomic change genuinely crosses two rows, document why the repository would be broken or unreviewable if separated, keep the smallest combined allowlist, and require QA to approve the exception. Convenience is not sufficient.

## Safeguards for later Issues

Before editing or staging:

1. Start from the correct Story/Task branch and record `HEAD`, merge base, staged, unstaged, untracked, and unmerged state.
2. Preserve user changes. Never reset/restore/clean/rebase to manufacture a focused diff.
3. Assign exclusive file ownership where parallel agents are active.
4. Read `node_modules/next/dist/docs/` before any future Next.js code/config migration.
5. Choose and record the package manager before lockfile regeneration; do not casually update both locks or delete one.

Before review/commit:

1. Compare changed and staged paths against the selected row's allowlist; remove unrelated work by moving it to a later forward commit, not by destructive discard.
2. Inspect manifest and lockfile diffs for unexpected packages, lifecycle scripts, registries, local paths, or broad version churn. Do not print credential-bearing configuration.
3. Exclude `.env*`, local settings, caches, `.next`, `node_modules`, `next-env.d.ts`, `tsconfig.tsbuildinfo`, coverage, `.DS_Store`, and generated output. Never force-add `next-env.d.ts`; keep its `tsconfig.json` include and regenerate it through Next.js.
4. Run focused config validation plus the quality commands appropriate to that Issue. Until ST-05 passes, compare against `docs/QUALITY_BASELINE.md` and prove no new regression; afterward require lint, typecheck, tests, and build all green.
5. Review the final commit with name-status/stat and verify its subject contains the Issue ID. Record commands, results, and residual risk before QA.
6. Do not claim a path group is separated until a real commit contains only its approved causal scope.

Recommended read-only/staging-review commands for a future implementation:

```sh
git status --porcelain=v2 --branch
git diff --cached --name-status
git diff --name-status
git ls-files --others --exclude-standard
git ls-files --unmerged
git diff --check
git diff --cached --check
git show --format='%h%n%ad%n%s' --date=iso-strict --name-status --stat HEAD
```

This report does not authorize staging or committing those future changes.

## Reproducible read-only audit commands

Run from repository root. These commands omit remote URLs, credential configuration, environment contents, and author email fields:

```sh
git branch --show-current
git rev-parse HEAD
git rev-parse develop
git merge-base develop HEAD
git status --porcelain=v2 --branch
git diff --cached --name-status
git diff --name-status
git diff-files --raw
git diff-index --cached --raw HEAD --
git ls-files --others --exclude-standard
git ls-files --unmerged
git log --format='%h%x09%ad%x09%s' --date=iso-strict --name-status develop..HEAD
git diff --name-status develop...HEAD
git diff --name-status develop...HEAD -- . ':(exclude)docs/**'
git diff --name-status main...develop
git show --format='%h%n%ad%n%s' --date=iso-strict --name-status 8d454af
git show --format='%h%n%ad%n%s' --date=iso-strict --stat 1daaac7
git diff --name-status a714abe^1 a714abe -- package.json package-lock.json yarn.lock next.config.ts tsconfig.json eslint.config.mjs vitest.config.ts vitest.setup.ts postcss.config.mjs tailwind.config.js middleware.ts Dockerfile docker-compose.yml .gitignore src/app/layout.tsx src/app/globals.css src/components/ThemeRegistry.tsx src/lib/theme.ts src/providers/QueryProvider.tsx
git log --format='%h%x09%ad%x09%s' --date=iso-strict --name-status -- package.json package-lock.json yarn.lock next.config.ts tsconfig.json eslint.config.mjs vitest.config.ts vitest.setup.ts postcss.config.mjs tailwind.config.js middleware.ts Dockerfile docker-compose.yml .gitignore src/app/layout.tsx src/app/globals.css src/components/ThemeRegistry.tsx src/lib/theme.ts src/providers/QueryProvider.tsx
git ls-files next-env.d.ts
git check-ignore -v next-env.d.ts
rg -n '"next-env.d.ts"' tsconfig.json
sed -n '83,92p' node_modules/next/dist/docs/01-app/03-api-reference/05-config/02-typescript.md
sed -n '204,208p' node_modules/next/dist/docs/01-app/03-api-reference/06-cli/next.md
sed -n '45,48p' node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md
git branch --all --contains 1daaac7
git branch --all --contains a714abe
git branch --all --contains 8d454af
git diff --check
```

## Limitations and residual risks

- Git history proves recorded path snapshots, not why a dependency/config changed, whether it was reviewed independently, or whether a deployed environment uses it.
- Remote-tracking refs may be stale because this audit did not fetch or access a remote.
- Both npm and Yarn lockfiles remain tracked; their long-term canonical owner is unresolved.
- `next.config.ts` currently ignores TypeScript build errors, Vitest currently excludes `.test.tsx`, and the documented global quality baseline is red. This Issue records those risks but does not change configuration.
- Historical middleware contains diagnostic logging and domain authorization behavior inside a framework path, illustrating why future middleware commits need a narrow contract/security review.
- Existing bundled commits reduce bisect/revert precision. Forward focused commits improve future history but do not repair the old graph.
- Ignored/generated/local files may exist without appearing in the non-ignored untracked inventory. Their contents were not inspected and they are not evidence of a platform delta.
- No full build/typecheck was run because this is a read-only history/documentation Issue; the focused evidence is Git path/status/history validation.

## Independent QA readiness

`IS-01.3.1` is ready for independent QA when the focused working-tree change is only `docs/audits/ST-01-COMMIT-HISTORY.md`. QA should reproduce:

1. clean pre-write staged/unstaged/untracked/unmerged counts;
2. four documentation-only paths and zero platform/dependency paths in `develop...HEAD`;
3. the exact platform/dependency taxonomy and exclusions;
4. bundled historical evidence for `85d59da`, `8f58896`, `0e912b5`, `1daaac7`, and merge `a714abe`;
5. the focused governance-only path set of `8d454af`;
6. shared-ref containment and the explicit no-rewrite conclusion;
7. N/A current split conclusion without any false claim that historical commits were separated;
8. forward subjects/allowlists, lockfile/generated/secret safeguards, limitations, and residual risks;
9. no application/config/backlog/review/index/ref/commit/remote/environment mutation by this Issue.

---

## IS-01.3.2 — API and types migration commit boundary

### Result

**Current split action: N/A.** Before this section was appended, the index, tracked worktree, non-ignored untracked set, and unmerged index were empty. `develop...HEAD` contained exactly five ST-01 documentation/review paths and **zero** paths under the types, API client, services, repositories, or application-consumer boundaries below. There is no present API/types migration delta that can honestly be separated into a new commit.

Commit `1daaac7` historically bundled API/types/service/repository migration with feature UI additions, removals, and edits. Merge commit `a714abe` brought that snapshot into shared history. Neither commit is, or is claimed to be, a separately reviewed API/types migration commit. This Issue does not rewrite shared history; it defines safe forward boundaries for ST-02/ST-03.

No application edit, staging operation, commit, reset, restore, rebase, rewrite, cherry-pick, push, branch operation, remote inspection, dependency install, typecheck, or build was performed.

## Exact migration taxonomy and boundaries

| Category | Exact current paths / pattern | In-scope responsibility | Explicit boundary |
|---|---|---|---|
| Canonical type primitives | Canonical definitions selected from/refactored out of `src/types/index.ts`; barrel exports in `src/types/index.ts` and `src/types/entities/index.ts` only when required by the same type change | `Role`, IDs, timestamps, money/date primitives, shared entity metadata, stable enums/unions and type-only exports | No API calls, React/MUI props repair, route behavior, repositories, service implementation, or restoration of the removed all-in-one type block |
| Domain DTOs | `src/types/case.types.ts`, `src/types/label.types.ts`, `src/types/budget.ts`, the selected canonical Board/Task file among `src/types/board-task.types.ts`, `src/types/board.ts`, `src/types/board.types.ts`, plus new verified domain type files required by ST-02 | Backend-backed request/response/entity/query types for User, Task/Workflow, Case/Label, Budget/Payment, Contract Type and retained module decisions | Duplicate Board/Task shapes are migration inputs, not three approved canonical models; no JSX/UI behavior; no DTO invented from mock/historical UI |
| API response/error envelope | `src/types/api/index.ts` and only the type-export lines required to expose its canonical definitions | `ApiResponse<T>`, pagination, typed error/details, query/paging primitives and success/no-content semantics confirmed against backend evidence | No Axios interceptors, token storage/refresh, endpoints, domain DTOs, or `any`/`unknown` escape used as a finished contract |
| Canonical API client, auth envelope and error normalization | `src/services/api/client.ts`, `src/lib/errors.ts`, and narrowly required client-contract tests | Base URL/timeout/headers, request ID, typed error mapping, access/refresh behavior, retry queue, upload/download primitives, response unwrapping, safe logging and auth-expiry behavior | `src/api/client.ts` is legacy/adapter scope; domain endpoints and UI are excluded. Never log token or sensitive payload. Auth UI/session policy belongs to ST-06 unless required for client compatibility. |
| Domain services | `src/services/*.service.ts` excluding `src/services/api/**`, plus `src/services/index.ts`; split by ST-03.2 domain group | Typed endpoint methods, domain request/response mapping and business-facing service contract for capabilities marked `KEEP` | No page/component layout, mock restoration, repository deletion, direct client duplication, or capabilities marked `REMOVE FROM MVP`/`DEFER` |
| Transitional API services/adapters | `src/api/services/**`, `src/api/client.ts`, and an explicitly minimal compatibility adapter introduced under an owning migration Issue | Temporary preservation of old import/return conventions while consumers move; adapter must delegate to the canonical implementation | No new endpoint/business logic. Every adapter needs owner, consumer list and removal gate; it is not a second permanent architecture. |
| Legacy repositories/adapters | `src/repositories/**` | Existing consumer bridge only until a verified canonical service covers the retained behavior | No feature expansion. A repository deletion belongs to ST-03.4 only after zero-import, contract-test and smoke evidence; stored/backend data is never deleted by frontend cleanup. |
| Consumer migration | Exact files discovered per domain in `src/app/**`, `src/components/**`, `src/contexts/**`, `src/hooks/**`, `src/lib/**` and `src/providers/**`; the commit allowlist must enumerate files, not use the whole directories | Import replacement, service invocation, response mapping and type-consumer repair necessary to preserve existing observable behavior | New route, layout/style/copy, user interaction, product behavior, MUI migration, or feature restoration belongs to its feature/ST-02.4 commit. A JSX file is not automatically feature work, but mixed migration/feature lines must be separated forward. |

Generated output, `.env*`, credentials, tokens, logs, caches, `node_modules/**`, `.next/**`, `next-env.d.ts`, build artifacts, private files, audit/review/backlog edits, and unrelated framework/dependency changes are excluded from every API/types migration commit.

## Current inventory and split decision

| Item | Pre-write observation |
|---|---|
| Branch / HEAD | `story/st-01-git-baseline` at `593c8844b87d45fccbf776679fe9b643481a0133` (`IS-01.3.1: audit platform commit boundary`) |
| Merge base / local `develop` | `8d454afa43adfd579cfd21356201b87c53fec9b9` |
| Staged / unstaged tracked / non-ignored untracked / unmerged | `0 / 0 / 0 / 0` |
| `develop...HEAD` | 11 commits; 5 paths, all under `docs/**` |
| Types/API/services/repositories/application paths in `develop...HEAD` | 0 |

The five Story paths are `docs/BACKLOG.md`, the three ST-01 audit files, and `docs/reviews/ST-01.md`. They are coordinator, audit and QA evidence—not migration code. After this section is written, the expected working-tree delta is only this Issue-owned modification to `docs/audits/ST-01-COMMIT-HISTORY.md`.

Therefore:

1. no real current API/types delta exists to split;
2. no empty or documentation-mislabeled “migration” commit should be manufactured;
3. the eventual Issue commit for this audit is evidence for `IS-01.3.2`, not proof that ST-02/ST-03 code migration occurred;
4. future migration work must use the forward sequence below.

## Path-scoped historical evidence

### Disjoint `1daaac7` migration groups

The following groups are disjoint for counting. Values come from path-scoped `git diff --numstat 1daaac7^ 1daaac7`; they may be summed without double-counting:

| Historical group | Paths changed | Added | Deleted | Recorded change |
|---|---:|---:|---:|---|
| Domain/common types excluding `src/types/api/**` | 7 | 638 | 316 | Added Case/Label/Board/entity type files and heavily replaced `src/types/index.ts`. |
| API clients and response envelope | 3 | 501 | 82 | Modified `src/api/client.ts`; added `src/services/api/client.ts` and `src/types/api/index.ts`. `src/lib/errors.ts` was in the pathspec but unchanged. |
| Transitional `src/api/services/**` | 2 | 107 | 0 | Added Auth and Label services on the legacy client. |
| Domain services excluding `src/services/api/**` | 9 | 689 | 0 | Added the service barrel/wrapper and Budget, Case, Customer, Label, Task, User and Workflow services. |
| Repositories | 11 | 178 | 1,177 | Deleted ten repositories and modified Workload; many legacy repositories still remained unchanged in the tree. |
| **Total scoped API/types/service/repository snapshot** | **32** | **2,113** | **1,575** | Same 32-path scoped snapshot visible in the first-parent diff of merge `a714abe`. |

These totals do not include application UI/consumer paths. Separately, `src/app`, `src/components`, `src/contexts`, `src/hooks`, and `src/providers` account for 108 changed paths and +11,226/-12,856 in the same commit; those broad numbers include feature UI, root/provider changes, deleted legacy surfaces, tests and possible consumer migration. They are **not** labeled “consumer migration” because name-status/numstat cannot prove line intent.

### History interpretation

| Commit | Path-scoped evidence | Safe interpretation |
|---|---|---|
| `85d59da` (2026-04-20) | Added the original `src/api/client.ts`, `src/lib/errors.ts`, monolithic `src/types/index.ts`, base repositories and many feature files. | Origin of the legacy architecture, bundled with UI; not a focused migration commit. |
| `0e912b5` (2026-04-29) | Added Budget types and many PascalCase repositories while deleting lowercase repository predecessors; also changed a large feature surface. | Repository rename/replacement and domain expansion evidence, not proof of a safe canonical migration or zero consumers. |
| `1daaac7` (2026-07-28) | Introduced canonical-looking types/client/services while deleting some repositories and changing/removing many routes/components. Exact disjoint scoped totals are above. | Incomplete, bundled migration: both clients, `src/api/services`, many repositories, duplicate types and mixed consumers remain today. |
| `a714abe` (2026-07-28) | First-parent merge exposes the same 32 scoped paths and +2,113/-1,575 snapshot. | Integration of the bundle into shared history; not a second implementation and not an independent migration split. |
| `8d454af..HEAD` | Current Story history changes documentation/review evidence only. | No API/types code to extract, relabel or split. |

Git snapshots prove paths and line counts, not backend correctness, semantic intent, consumer coverage, test results, or independent review. No historical commit is relabeled as satisfying ST-02 or ST-03.

## Reconciliation with ST-02, ST-03 and canonical module decisions

- ST-02 owns primitive/domain DTO consolidation, verified response/pagination types, removal of duplicates only after consumer migration, and zero typecheck errors without `any` concealment.
- ST-03 owns the single `src/services/api/client.ts` architecture, typed errors/auth/refresh/upload behavior, domain services, consumer migration, zero legacy imports, old-layer deletion and an import restriction.
- `KEEP` capabilities—Budget, Expenses, Task/Expense attachments, minimal in-app Notifications, Contract Types, and core Workflow/Task/Board transitions—must retain their bounded contracts through migration.
- `REMOVE FROM MVP` capabilities must not be restored wholesale to make old types or repositories compile. Historical Files/full Contract/advanced Workflow UI is evidence only.
- `DEFER` capabilities, including direct Firebase Storage and push/FCM/preferences, must not acquire active services or consumers inside an API migration commit.
- Contract Types and minimal in-app Notifications require explicit backlog ownership before feature delivery; a generic migration commit cannot silently create those product surfaces.
- Workflow file/payment gates must align with retained attachment and ST-13 Payment contracts rather than embedding a second source of truth.

## Safe forward commit sequence

Create a commit only when its causal change exists. Suggested subjects use the real owning Issue; do not reuse `IS-01.3.2` for future code.

| Order | Suggested subject | Exact allowlist / content | Entry and exit gate |
|---:|---|---|---|
| 1 | `IS-02.1.x: consolidate <domain> types` | Named canonical primitive/domain files under `src/types/**` and only their type barrel exports | Backend/source evidence recorded; no `any`, suppressions or wholesale old-type restore; duplicate remains until all consumers migrate. |
| 2 | `IS-02.2.x: define canonical API response contracts` | `src/types/api/index.ts` plus narrowly required type exports and contract tests | Response/pagination/no-content/error semantics verified; service/client compilation can consume one envelope. |
| 3 | `IS-03.1.x: consolidate API client and errors` | `src/services/api/client.ts`, `src/lib/errors.ts`, focused client tests | Auth/refresh/retry/error/upload/logging contract agreed; no sensitive payload/token logging; old client still available only as a temporary bridge. |
| 4 | `IS-03.1.x: bridge legacy API client consumers` | `src/api/client.ts` only if needed as a thin delegation adapter, plus focused adapter tests | No duplicated transport/auth logic or new endpoint; adapter owner, consumer list and removal Issue recorded. Skip if direct migration is safe. |
| 5 | `IS-03.2.x: migrate <domain> service` | Named `src/services/<domain>.service.ts`, necessary service barrel line, its verified domain DTOs if not already committed, and contract tests | Capability allowed by decision register; canonical client only; typed request/response; no UI or repository deletion. Prefer one domain or backlog-defined cluster per commit. |
| 6 | `IS-03.3.x: migrate <domain> consumers` | Enumerated page/component/context/hook/provider files for one domain and focused tests | Observable behavior preserved; import/call/response mapping only. Split new UI/MUI/feature behavior to ST-02.4 or the owning feature Story. |
| 7 | `IS-03.4.x: remove migrated <domain> adapters` | Proven-unused files in `src/api/services/**` and/or `src/repositories/**`; legacy client only after all domains migrate | `rg` shows zero imports/dynamic consumers, contract/smoke/type checks pass, stored/backend data unaffected, recovery path documented. |
| 8 | `IS-03.4.4: prevent legacy API imports` | Lint restriction/config and its rule test/documented violation check | Old paths are absent first; restriction blocks `@/api/client`, `@/api/services` and `@/repositories` from returning without blocking approved canonical imports. |

If a type and service must change atomically to keep the branch reviewable, use the smallest named cross-row allowlist, state the dependency in the commit body/review evidence, and obtain QA approval. Convenience or broad “fix TypeScript” scope is insufficient.

### Temporary adapter and removal gates

1. An adapter delegates to the canonical implementation; it must not copy interceptors, token state, retry queues, response unwrapping or endpoint logic.
2. Record the exact old import(s), consumers, owner and removal Issue before adding/retaining an adapter.
3. Preserve old return behavior only long enough to migrate consumers; add characterization tests where behavior is ambiguous.
4. Migrate one domain/import family at a time and search static imports, barrels, dynamic imports and direct fetches before declaring completion.
5. Delete a repository/service/client only after zero-consumer evidence, canonical contract tests, focused UI smoke coverage, typecheck/no-regression evidence and decision-log compatibility.
6. Never delete frontend or backend data, storage objects, audit history or migration metadata as part of code-layer removal.
7. Do not restore historical types/repositories/UI wholesale. Reconstruct only backend-verified `KEEP` contracts.

## Type and feature separation rules

- A type-only commit may change compile-time contracts and type exports; it does not opportunistically change copy, layout, MUI props, endpoint behavior or business states.
- A service/client commit may normalize transport and DTO mapping; it does not create routes, buttons, mock data, navigation or previously removed capabilities.
- A consumer migration in a `.tsx` file is allowed only for import/type/call/result adaptation that preserves the accepted UI behavior. Any visible or interaction change is a separate feature/MUI commit.
- Case, Task and Board feature work belongs to IS-01.3.3/ST-08–ST-10, even when it consumes new types/services. Finance, Admin/Auth and navigation work remain with their owning Stories.
- Do not use `any`, `@ts-ignore`, broad assertions, empty response shapes, lint disables, or relaxed compiler rules to manufacture a green migration. Existing debt must be measured and reduced under ST-02/ST-03.
- If a future consumer edit changes a Next.js API/convention, read the relevant installed guide under `node_modules/next/dist/docs/` before editing. This documentation-only Issue changes no Next.js code and therefore required no build.

## Verification and no-regression gates for future commits

Before staging each forward commit:

```sh
git status --porcelain=v2 --branch
git diff --name-status
git diff --cached --name-status
git ls-files --others --exclude-standard
git ls-files --unmerged
rg -n "@/api/client|@/api/services|@/repositories" src
rg -n "@/services/api/client|from './api/client'" src
git diff --check
git diff --cached --check
```

Required review evidence:

1. changed/staged paths match one row's enumerated allowlist and the commit subject names the owning Issue;
2. type/API contract tests cover success, error, no-content, pagination and auth/refresh behavior as applicable;
3. domain service tests cover mapping and failure without network secrets or production data;
4. focused consumer tests/smoke checks prove behavior is preserved;
5. before ST-05 `PASS`, scoped and global diagnostics are compared with `docs/QUALITY_BASELINE.md` and introduce no new errors; after ST-05, lint, typecheck, test and build are all green;
6. legacy-import searches decrease monotonically and reach zero before old-layer deletion;
7. final `git show --name-status --stat` proves the real commit boundary. Do not claim separation based on a working-tree plan.

This audit itself needed no application typecheck/full build because it changed documentation only. It does not waive those checks for future migration code.

## Reproducible read-only audit commands

Run from the repository root. These commands do not inspect remote URLs, environment values, credential configuration, tokens or author email fields:

```sh
git branch --show-current
git rev-parse HEAD
git rev-parse develop
git merge-base develop HEAD
git status --porcelain=v2 --branch
git diff --cached --name-status
git diff --name-status
git ls-files --others --exclude-standard
git ls-files --unmerged
git rev-list --count develop..HEAD
git diff --name-status develop...HEAD
git diff --name-status develop...HEAD -- . ':(exclude)docs/**'
rg --files src/types src/api src/services src/repositories | sort
rg -n "from ['\"]@/api/client|from ['\"]@/api/services|from ['\"]@/repositories" src --glob '*.{ts,tsx}'
rg -n "from ['\"]@/services/api/client|from ['\"]\./api/client" src --glob '*.{ts,tsx}'
git diff --name-status 1daaac7^ 1daaac7 -- src/types src/api/client.ts src/api/services src/services src/repositories src/lib/errors.ts
git diff --numstat 1daaac7^ 1daaac7 -- src/types ':(exclude)src/types/api/**'
git diff --numstat 1daaac7^ 1daaac7 -- src/api/client.ts src/services/api/client.ts src/types/api src/lib/errors.ts
git diff --numstat 1daaac7^ 1daaac7 -- src/api/services
git diff --numstat 1daaac7^ 1daaac7 -- src/services ':(exclude)src/services/api/**'
git diff --numstat 1daaac7^ 1daaac7 -- src/repositories
git diff --numstat 1daaac7^ 1daaac7 -- src/app src/components src/contexts src/hooks src/providers
git diff --numstat a714abe^1 a714abe -- src/types src/api/client.ts src/api/services src/services src/repositories src/lib/errors.ts
git log --format='%h%x09%ad%x09%s' --date=short --name-status -- src/types src/api src/services src/repositories src/lib/errors.ts
git branch --all --contains 1daaac7
git branch --all --contains a714abe
git diff --check -- docs/audits/ST-01-COMMIT-HISTORY.md
```

## Limitations and residual risks

- No backend/OpenAPI source, production traffic, database, data migration, runtime environment or stakeholder confirmation was available; current DTOs/endpoints are not treated as verified contracts.
- Static import search does not prove dynamic/runtime consumers are absent. Historical name-status/numstat cannot distinguish semantic migration from feature work.
- `1daaac7` and `a714abe` remain bundled shared history, reducing bisect/revert precision. Forward commits improve new history without rewriting the old graph.
- Both API clients are currently near-duplicate transport implementations; `src/services/auth.service.ts` re-exports a legacy service; repositories and direct page clients remain. This audit does not claim ST-03 completion.
- Current types contain duplicate/incompatible shapes and `any`; this audit does not claim ST-02 completion or zero type errors.
- Module decisions constrain migration scope but do not supply missing backend, security, legal, finance, storage or product evidence.
- Remote-tracking refs may be stale because no fetch or remote inspection occurred.
- No environment value, credential, token, remote URL, author email or private domain/file content was inspected or recorded.

## Claim consistency and independent QA readiness

The claims in this section are intentionally limited:

- **Historical split:** not performed and not claimed.
- **Current migration delta:** none outside documentation; split action is `N/A`.
- **Shared history rewrite:** prohibited and not performed.
- **ST-02/ST-03 completion:** not claimed; all code migration remains downstream.
- **Deliverable:** exact taxonomy, evidence-backed history audit and safe forward commit plan only.

`IS-01.3.2` is ready for independent QA when the focused working-tree change is only this appended section in `docs/audits/ST-01-COMMIT-HISTORY.md`. QA should reproduce the clean pre-write inventory, five documentation-only Story paths, zero current migration paths, exact disjoint `1daaac7` totals, `a714abe` first-parent equivalence, current duplicate-client/repository/import evidence, ST-02/ST-03/module-decision reconciliation, forward allowlists/removal gates, no-regression rules, and the explicit N/A/no-rewrite/no-historical-split conclusion.

---

# IS-01.3.3 — Case, Task, and Board feature commit boundary audit

## Purpose and non-mutation rule

This section audits whether current or historical Case, Task, and Board work is separable by feature and defines a safe forward-only sequence for ST-08, ST-09, and ST-10. It does not rewrite, split, revert, cherry-pick, stage, commit, merge, or otherwise reinterpret shared history. Historical path groups below are evidence scopes, not permission to restore old UI or proof that a feature migration succeeded.

## Pre-write inventory and current split decision

The following is the recorded read-only snapshot at committed HEAD `7fc236e`, captured before this Issue changed the audit. It is historical provenance for this section, not a claim about a later mutable coordinator worktree:

| Check | Observed result |
|---|---|
| Branch / HEAD | `story/st-01-git-baseline` / `7fc236e` |
| `develop` / merge base | `8d454af` / `8d454af` |
| Commits in `develop..HEAD` | 12 documentation/governance commits |
| Staged paths | 0 |
| Unstaged tracked paths | 0 |
| Non-ignored untracked paths | 0 |
| Unmerged paths | 0 |
| `develop...HEAD` path delta | Exactly five documentation-only paths: `docs/BACKLOG.md`, this audit, `docs/audits/ST-01-MODULE-SCOPE.md`, `docs/audits/ST-01-WORKTREE-INVENTORY.md`, and `docs/reviews/ST-01.md`; 0 source, Case, Task, or Board paths |

There is therefore no current Case, Task, or Board source delta to split. The actionable result for `IS-01.3.3` is **N/A / no destructive history rewrite**. The deliverable is this audit and a forward commit contract; it does not claim that an old bundled commit, ST-08, ST-09, or ST-10 is complete.

## Exact, disjoint ownership boundaries

Ownership follows behavior and the backlog Story, not the directory name. In particular, Task consumers under `src/components/cases/` belong to Task, while Board renders Task data without owning the Task transition contract.

### Case/customer feature group — ST-08 owner

Current historical inventory paths assigned only to the Case group:

- Case routes: `src/app/(dashboard)/cases/[id]/edit/page.tsx`, `src/app/(dashboard)/cases/[id]/page.tsx`, `src/app/(dashboard)/cases/create/page.tsx`, and `src/app/(dashboard)/cases/page.tsx`.
- Case-only UI: `src/components/cases/CaseCard.tsx`, `src/components/cases/CaseMembers.tsx`, `src/components/cases/CaseStatusBadge.tsx`, and `src/components/features/cases/index.ts`.
- Historical customer surface: `src/app/(dashboard)/shared/customers/page.tsx`. This path is evidence of customer/Case lineage only. A future ST-08 commit may touch it solely when an accepted Case Issue requires customer lookup/selection or customer context in the Case lifecycle; standalone customer administration needs its own explicit product owner and acceptance criteria.

The Case group owns Case list/create/read/update/delete, Case status, members/roles, labels, customer reference, search/filter/pagination, and Case-specific loading/error/empty behavior. It does not own Task creation/status transitions merely because those controls render on a Case detail page.

### Task/workflow-transition consumer group — ST-09 owner

Current historical inventory paths assigned only to the Task group:

- Task routes: `src/app/(dashboard)/manager/review/page.tsx`, `src/app/(dashboard)/manager/tasks/create/page.tsx`, `src/app/(dashboard)/manager/tasks/gantt/page.tsx`, `src/app/(dashboard)/manager/tasks/page.tsx`, `src/app/(dashboard)/shared/tasks/[id]/page.tsx`, and `src/app/(dashboard)/staff/my-tasks/page.tsx`.
- Task controls embedded in Case: `src/components/cases/CaseTaskList.tsx`, `src/components/cases/CreateTaskForm.tsx`, `src/components/cases/TaskDetail.tsx`, and `src/components/cases/TaskStatusToggle.tsx`.
- Task UI/hooks: current files under `src/components/tasks/**`, `src/components/features/tasks/index.ts`, `src/hooks/api/useTasks.ts`, and `src/hooks/useTaskRepository.ts`.

The group owns Task CRUD, assignees, history, and consumers of the one canonical server-authoritative Workflow transition contract: next, approve, reject, complete, file-required, and payment-required actions. The broad historical `src/components/tasks/**` inventory is not a forward allowlist: each future Issue must enumerate only retained files. Generic Files UI stays removed from MVP; Task-owned attachment UI is allowed only under `IS-09.3.3` and the canonical Task/Expense attachment decision. Payment truth remains ST-13-owned.

### Board/view/DnD group — ST-10 owner

Current paths assigned only to the Board group are `src/app/(dashboard)/board/page.tsx`, `src/components/board/BoardFilter.tsx`, `src/components/board/Swimlane.tsx`, `src/components/board/TaskCard.tsx`, and `src/components/board/TaskSidebar.tsx`.

The Board group owns Task projection into columns/swimlanes, filters, loading/error/empty presentation, drag-and-drop interaction, optimistic view state, rollback, and Board sidebar presentation. It does not own Task/Workflow DTOs, transition legality, authorization, or a second status-update endpoint. A drop must call the canonical ST-09 transition operation and accept the server result as truth.

### Shared dependency and single-owner rule

Shared files are deliberately outside all three feature groups and are counted once:

| Shared concern | Current examples | Owning prerequisite | Rule |
|---|---|---|---|
| Case/Task/Board/Workflow/Label types | `src/types/case.types.ts`, `src/types/board-task.types.ts`, `src/types/board.ts`, `src/types/board.types.ts`, `src/types/label.types.ts` | ST-02 | Select one verified canonical shape before feature consumers move. Duplicate Board/Task files are migration inputs, never parallel approved contracts. |
| Domain services and transport | `src/services/case.service.ts`, `src/services/customer.service.ts`, `src/services/task.service.ts`, `src/services/workflow.service.ts`, `src/services/label.service.ts` and the canonical API client | ST-03 | Service/adapter commit precedes consumers. A feature commit consumes it but does not duplicate endpoints, unwrapping, auth, or retry behavior. |
| Legacy repositories | `src/repositories/CustomerRepo.ts`, `src/repositories/TaskRepo.ts`, `src/repositories/TaskRepository.ts`, `src/repositories/WorkflowRepo.ts` | ST-03 migration/removal | Do not delete until zero consumers, contract tests, feature smoke tests, and rollback evidence exist. `src/hooks/useTaskRepository.ts` remains classified once as a Task consumer until it migrates. A historical deletion is not proof of safe migration. |
| Permissions | route/action permission definitions and tests | ST-07 | Server authorization is authoritative; hidden controls alone do not satisfy denial requirements. |
| Reusable User/Label UI | `src/components/users/UserSelect.tsx`, `src/components/labels/**` | ST-11/ST-12 or their accepted shared-component Issue | One owner changes the shared component; Case, Task, and Board commits separately wire and test their consumer behavior. |

If a shared contract must change, commit that prerequisite under its owning ST-02/ST-03/ST-07/ST-11/ST-12 Issue first. Never copy the same shared diff into Case, Task, and Board commits, and never count a shared path in more than one historical group. An unavoidable cross-feature atomic change needs a documented invariant showing why intermediate commits would fail, the smallest combined allowlist, focused tests for every affected owner, and independent QA approval; convenience or directory proximity is not sufficient.

## Historical evidence from disjoint path groups

The following totals use the exact groups above. The shared group is separate, so no file contributes to two totals.

| Commit | Case/customer | Task consumer | Board | Shared prerequisite | Supported conclusion |
|---|---:|---:|---:|---:|---|
| `85d59da` — `update FE` | 1 file, +292/-0 | 15 files, +2,268/-0 | 0 | 1 file, +79/-0 | Initial customer and Task UI arrived in one much broader commit; this is not an independently reviewable feature split. |
| `8f58896` — `update code` | 0 | 1 file, +60/-168 | 0 | 0 | A Task-create change was bundled with platform/dependency and Workflow changes documented earlier. |
| `d14e508` — `update code` | 1 file, +1/-1 | 1 file, +0/-1 | 0 | 0 | Small customer/Task edits coexisted in one commit; semantics are not proven by line counts. |
| `0e912b5` — `update fe` | 1 file, +1/-1 | 21 files, +5,698/-31 | 0 | 4 files, +193/-79 | Large Task expansion was mixed with admin, finance, Files, Workflow, repositories, and other UI. It is lineage evidence, not a safe migration template. |
| `1daaac7` — `update code` | 8 files, +1,763/-0 | 18 files, +2,663/-3,035 | 5 files, +2,333/-0 | 15 files, +1,421/-0 | Case and Board were introduced while Task UI was added, modified, and deleted alongside types/services and unrelated product removals. The commit remains bundled. |

For `1daaac7`, Case name-status is eight additions; Board is five additions. Task's 18 paths are exactly seven additions, three modifications, and eight deletions. The additions are four Case-embedded Task components, `TaskDetailPanel`, its feature barrel, and `useTasks`; the modifications are `src/app/(dashboard)/manager/tasks/gantt/page.tsx`, `src/app/(dashboard)/shared/tasks/[id]/page.tsx`, and `src/components/tasks/TaskGanttView.tsx`. The eight deletions include advanced or legacy surfaces, but Git path/line evidence alone cannot establish that they were migrated, replaced losslessly, or intentionally removed from MVP.

First-parent diff `a714abe^1..a714abe` reproduces the same Case, Task, and Board name-status/numstat as `1daaac7^..1daaac7`. This establishes that the merge carried the bundled snapshot; it does not turn the merge into three feature commits. No Board path appears in the audited feature history before `1daaac7`.

## Safe forward commit sequence

Create no empty commit for this audit. When implementation work exists, use focused Issue commits on the owning Story branch in dependency order:

| Order | Example subject | Exact allowlist rule | Required gate before commit |
|---:|---|---|---|
| 1 | `IS-02.x.x: consolidate Case Task Board workflow types` | Only the named canonical type files and required type-barrel export lines | Verified backend shapes/statuses, duplicate-consumer inventory, contract/type tests; no feature JSX. |
| 2 | `IS-03.x.x: migrate Case Task workflow services` | Only named canonical service/client adapter files and service tests | One response/auth/error convention, no duplicate endpoint logic, known consumers and removal plan. |
| 3 | `IS-07.x.x: enforce Case Task transition permissions` | Named permission policy/middleware/UI-gating files and negative tests | Server-side tenant/action denial proven; UI visibility is supplemental only. |
| 4 | `IS-08.x.x: complete <Case capability>` | Only the explicit Case route/UI paths from the Case group needed by that Issue | Case CRUD/member/label/customer contract, validation/error mapping, focused tests, no Task transition implementation. |
| 5 | `IS-09.x.x: complete <Task or workflow action>` | Only the enumerated Task route/component/hook consumers required by that Issue | Canonical transition service, idempotency/conflict behavior, permissions, history and applicable file/payment gates tested. |
| 6 | `IS-10.x.x: complete <Board capability>` | Only the five Board paths above, narrowed further to files actually changed by the Issue | Canonical ST-09 transition consumer, DnD status mapping/invalid-drop/rollback tests and permission/no-regression evidence. |

Task attachments must remain record-owned and backend-mediated; do not restore the deleted generic Files workspace. File-required transitions need ownership, MIME/size/malware, authorization, retention/audit, and atomicity evidence. Payment-required transitions may verify an ST-13-owned condition but may not calculate, confirm, or reconcile payment independently. Core Workflow definitions and in-use edit/version semantics remain ST-12-owned; ST-09 and ST-10 consume the same published instance/step contract and must not import a separate legacy workflow-board.

## Feature-specific review gates

1. **Case:** test list pagination/search/filter, create/edit validation, delete refresh/conflict, detail loading/error/empty, member role/add/remove, labels, customer lookup, and direct API denial. No mock fallback may satisfy ST-08 acceptance.
2. **Task:** test create/update/delete, assignee contract, every allowed and denied server transition, duplicate/idempotent submission, stale-state conflict, error rollback, history, approval/rejection authority, completion, and applicable attachment/payment preconditions. Remove console-only actions.
3. **Board:** test API-status-to-column mapping, filters, loading/empty/error, keyboard/pointer DnD where supported, valid and invalid drops, optimistic update, network/server-conflict rollback to the exact prior column/order, repeated drop, refresh reconciliation, and sidebar action errors. Remove diagnostic logs.
4. **Permissions:** test unauthorized direct routes and API actions for Case and Task transitions. Client role helpers and hidden buttons are not authorization evidence.
5. **Regression:** until ST-05 Story QA `PASS`, compare scoped diagnostics with `docs/QUALITY_BASELINE.md` and prove no new regression. After ST-05 passes, require lint, typecheck, tests, and build all green.
6. **Commit proof:** run focused checks first, then inspect staged paths and final `git show --name-status --stat`. A plan or working-tree partition is not evidence that a commit was actually separated.

## Reproducible read-only commands

These commands avoid remote URLs, environment values, credentials, tokens, and author email fields:

```sh
git branch --show-current
git rev-parse HEAD
git rev-parse develop
git merge-base develop HEAD
git status --porcelain=v2 --branch
git diff --cached --name-status
git diff --name-status
git ls-files --others --exclude-standard
git ls-files --unmerged
git rev-list --count develop..HEAD
git diff --name-status develop...HEAD
git diff --name-status develop...HEAD -- . ':(exclude)docs/**'
git diff --name-status 1daaac7^ 1daaac7 -- 'src/app/(dashboard)/cases/**' 'src/app/(dashboard)/shared/customers/page.tsx' src/components/cases/CaseCard.tsx src/components/cases/CaseMembers.tsx src/components/cases/CaseStatusBadge.tsx src/components/features/cases/index.ts
git diff --numstat 1daaac7^ 1daaac7 -- 'src/app/(dashboard)/cases/**' 'src/app/(dashboard)/shared/customers/page.tsx' src/components/cases/CaseCard.tsx src/components/cases/CaseMembers.tsx src/components/cases/CaseStatusBadge.tsx src/components/features/cases/index.ts
git diff --name-status 1daaac7^ 1daaac7 -- 'src/app/(dashboard)/manager/review/page.tsx' 'src/app/(dashboard)/manager/tasks/**' 'src/app/(dashboard)/shared/tasks/**' 'src/app/(dashboard)/staff/my-tasks/page.tsx' src/components/cases/CaseTaskList.tsx src/components/cases/CreateTaskForm.tsx src/components/cases/TaskDetail.tsx src/components/cases/TaskStatusToggle.tsx 'src/components/tasks/**' src/components/features/tasks/index.ts src/hooks/api/useTasks.ts src/hooks/useTaskRepository.ts
git diff --numstat 1daaac7^ 1daaac7 -- 'src/app/(dashboard)/manager/review/page.tsx' 'src/app/(dashboard)/manager/tasks/**' 'src/app/(dashboard)/shared/tasks/**' 'src/app/(dashboard)/staff/my-tasks/page.tsx' src/components/cases/CaseTaskList.tsx src/components/cases/CreateTaskForm.tsx src/components/cases/TaskDetail.tsx src/components/cases/TaskStatusToggle.tsx 'src/components/tasks/**' src/components/features/tasks/index.ts src/hooks/api/useTasks.ts src/hooks/useTaskRepository.ts
git diff --name-status 1daaac7^ 1daaac7 -- 'src/app/(dashboard)/board/**' 'src/components/board/**'
git diff --numstat 1daaac7^ 1daaac7 -- 'src/app/(dashboard)/board/**' 'src/components/board/**'
git diff --name-status 1daaac7^ 1daaac7 -- src/types/case.types.ts src/types/board-task.types.ts src/types/board.ts src/types/board.types.ts src/services/case.service.ts src/services/customer.service.ts src/services/task.service.ts src/services/workflow.service.ts src/repositories/CustomerRepo.ts src/repositories/TaskRepo.ts src/repositories/TaskRepository.ts src/repositories/WorkflowRepo.ts src/components/users/UserSelect.tsx 'src/components/labels/**' src/services/label.service.ts src/types/label.types.ts
git diff --numstat 1daaac7^ 1daaac7 -- src/types/case.types.ts src/types/board-task.types.ts src/types/board.ts src/types/board.types.ts src/services/case.service.ts src/services/customer.service.ts src/services/task.service.ts src/services/workflow.service.ts src/repositories/CustomerRepo.ts src/repositories/TaskRepo.ts src/repositories/TaskRepository.ts src/repositories/WorkflowRepo.ts src/components/users/UserSelect.tsx 'src/components/labels/**' src/services/label.service.ts src/types/label.types.ts
git diff --name-status a714abe^1 a714abe -- 'src/app/(dashboard)/cases/**' 'src/components/cases/**' 'src/app/(dashboard)/manager/tasks/**' 'src/app/(dashboard)/shared/tasks/**' 'src/components/tasks/**' 'src/app/(dashboard)/board/**' 'src/components/board/**'
git log --format='%h%x09%ad%x09%s' --date=short --name-status -- 'src/app/(dashboard)/cases/**' 'src/app/(dashboard)/shared/customers/page.tsx' 'src/components/cases/**' 'src/app/(dashboard)/manager/review/page.tsx' 'src/app/(dashboard)/manager/tasks/**' 'src/app/(dashboard)/shared/tasks/**' 'src/app/(dashboard)/staff/my-tasks/page.tsx' 'src/components/tasks/**' 'src/app/(dashboard)/board/**' 'src/components/board/**'
git diff --check -- docs/audits/ST-01-COMMIT-HISTORY.md
```

## Limitations, consistency, and independent QA readiness

- Git name-status/numstat proves path snapshots and line totals, not business intent, runtime correctness, lossless migration, backend compatibility, or authorization.
- No backend/OpenAPI repository, database, production traffic, persisted Workflow/Task inventory, stakeholder confirmation, or runtime environment was available. Forward implementation must verify those contracts.
- The historical group for `src/components/tasks/**` includes retained, deferred, and removed surfaces. It is intentionally history-query-only and must not be copied as a forward allowlist.
- `1daaac7` and `a714abe` remain bundled shared history. No split, rewrite, or feature-completion claim is made.
- This documentation-only Issue does not run application build/typecheck and does not waive focused/no-regression gates for implementation.
- No application, config, backlog, review, Git index/ref/history, remote, environment, credential, or private record was mutated or inspected by this Issue.

`IS-01.3.3` is ready for independent QA when the only Issue-owned change is this appended section. QA should reproduce the pre-write inventory and N/A current split, verify that Case/Task/Board/shared groups are exact and non-overlapping, reproduce the historical totals and `a714abe` first-parent evidence, confirm broad Task deletions are not called a proven migration, validate the ST-02/ST-03/ST-07 then ST-08/ST-09/ST-10 forward sequence, and verify canonical Workflow/attachment/payment/DnD/permission/no-regression/test gates plus the explicit no-rewrite and no-completion claims.

---

## IS-01.3.4 — Final lossless Story diff verification

### Verdict at the pre-write snapshot

**PASS — no Git-recorded file loss or out-of-scope change detected at base HEAD `82eb384ffcef40f189b6ee58aaccca5b632476f9`.** The worktree/index were clean, the Story was a linear 13-commit documentation-only chain from local `develop`, and `develop...HEAD` contained exactly the five expected backlog/audit/review paths. No delete, rename, copy, type/mode change, unmerged entry, source, configuration, or dependency delta was present.

This is a repository-snapshot verdict for independent Issue QA. It is not a PR, push, merge, Task QA, Story QA, PO acceptance, runtime-quality, remote-synchronization, or external-data verdict.

### PASS/FAIL evidence matrix

| Check | Reproduced evidence | Verdict |
|---|---|---|
| Branch and base | `story/st-01-git-baseline`; HEAD `82eb384`; local `develop` and merge base both `8d454af` | **PASS** |
| Worktree/index ambiguity | Porcelain v2 returned branch metadata only; cached diff, worktree diff, non-ignored untracked list and unmerged index were empty | **PASS** |
| Linear Story history | `develop` is an ancestor; `develop..HEAD` has 13 first-parent commits and zero merge commits | **PASS** |
| Exact Story path set | `M docs/BACKLOG.md`; added the three `docs/audits/ST-01-*.md` files and `docs/reviews/ST-01.md`; no sixth path | **PASS** |
| Exact Story stat | 5 files, 1,912 insertions, 11 deletions at the snapshot | **PASS** |
| Delete/rename/copy/type/mode/unmerged | `--name-status -M -C`, summary, raw diff and unmerged index show only one `M` and four `A`; all result modes are regular-file `100644` | **PASS** |
| Source/config/dependency preservation | Excluding `docs/**` from `develop...HEAD` returns no path; protected source/config/dependency files have no Story or worktree diff | **PASS** |
| Protection manifest — tracked paths | AGENTS/agent config, workflow/quality docs, manifests/locks, Next/TS/ESLint/Vitest/middleware files are present at HEAD, mode `100644`, and blob-identical to `develop` | **PASS** |
| Protection manifest — ignored local environment paths | `.env.local` and `.env.production.example` are present and still ignored by `.env*`; contents were not inspected and Git cannot prove content identity | **PASS with stated Git limit** |
| Changed-file blob identity | Pre-write worktree hashes for all five changed paths exactly matched their HEAD blob IDs below | **PASS** |
| Commit ownership/purpose trace | Every Issue/Task evidence commit touches only its assigned backlog/audit/review group; role custody is reconciled below | **PASS** |
| File outside scope disappeared | No `D` record anywhere in the Story diff and no non-documentation path delta | **PASS** |

No `FAIL` finding was observed. The limitations section states what this matrix cannot prove.

### Exact changed-tree identity

| Path | `develop` state | Base-HEAD mode/blob | Pre-write worktree identity | Custody and purpose |
|---|---|---|---|---|
| `docs/BACKLOG.md` | Blob `a4b24b34efa4caae7ad09849cfd3fc521877ec30` | `100644` / `8daff6434b766a0fdba84b72d1c20c104df8c4f7` | Matched HEAD | Coordinator-owned Issue checkbox state and Story contract |
| `docs/audits/ST-01-WORKTREE-INVENTORY.md` | Absent | `100644` / `70914835a3a8c2c50844ac8e69e8dbb1ef85f308` | Matched HEAD | `repo_stabilizer` evidence for IS-01.1.1–IS-01.1.4 |
| `docs/audits/ST-01-MODULE-SCOPE.md` | Absent | `100644` / `bb4ccb8b97e8ab52e7d50f90c4d82e99fa94277a` | Matched HEAD | `repo_stabilizer` decisions for IS-01.2.1–IS-01.2.4 |
| `docs/audits/ST-01-COMMIT-HISTORY.md` | Absent | `100644` / `6ab9d98ae6117d0abbaa30468f6073262b3a3896` | Matched HEAD before this section | `repo_stabilizer` evidence for IS-01.3.1–IS-01.3.4; this Issue now intentionally changes only this worktree file |
| `docs/reviews/ST-01.md` | Absent | `100644` / `d5285b4ef4c1e1794220a5b4057d61a14fd9aef8` | Matched HEAD | Coordinator custody with independent `qa_reviewer` verdict evidence |

Git blob identity proves the committed/worktree bytes at the observation point. It does not authenticate the human or agent that created them. After appending this section, only the commit-history audit is expected to differ from base HEAD until normal Issue handling occurs.

### Commit chain, owner and purpose reconciliation

| Linear commit(s) | Issue/purpose | Exact path boundary | Role custody |
|---|---|---|---|
| `9926e39`, `b69db8f`, `5f61491`, `f824d97` | IS-01.1.1–IS-01.1.4: inventory, ambiguity, provenance and protection | Backlog + worktree audit + review record | `repo_stabilizer` audit; coordinator checkbox/review custody; independent QA verdict custody |
| `dca7df3` | Record TK-01.1 QA gate | Review record only | Coordinator/QA evidence |
| `da5bc56`, `223c2b8`, `0d6ccae`, `f73caa8` | IS-01.2.1–IS-01.2.4: module decisions and canonical register | Backlog + module-scope audit + review record | `repo_stabilizer` decision evidence; coordinator/QA custody |
| `4932d25` | Record TK-01.2 QA gate | Review record only | Coordinator/QA evidence |
| `593c884`, `7fc236e`, `82eb384` | IS-01.3.1–IS-01.3.3: platform, API/types and feature commit boundaries | Backlog + commit-history audit + review record | `repo_stabilizer` audit; coordinator/QA custody |

All 13 commits have one parent in this Story range; no merge interrupts the chain. Bundling implementation evidence with coordinator/QA records limits identity attribution, but not the exact path/purpose trace above. The future IS-01.3.4 Issue commit is not listed or claimed before it exists.

### Protected-path reconciliation

The protection manifest in `ST-01-WORKTREE-INVENTORY.md` remains satisfied at the Git-observable level:

- the five changed Story evidence/tracking paths are present and recoverable from the linear Story commits;
- `AGENTS.md`, `.codex/config.toml`, all 11 `.codex/agents/*.toml`, `.gitignore`, `README.md`, `docs/DEVELOPMENT_WORKFLOW.md`, `docs/QUALITY_BASELINE.md`, and `docs/reviews/README.md` are tracked and unchanged from `develop`;
- `package.json`, `package-lock.json`, `yarn.lock`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `vitest.config.ts`, and `middleware.ts` are tracked and unchanged from `develop`;
- the two ignored environment paths are present and remain outside Git. Their content/recovery backup is user-controlled and was not inspected;
- no cleanup, restore, reset or deletion is needed or authorized by this verification.

This proves no protected tracked path changed or disappeared in the Story. It does not decide the unresolved canonical package-manager choice or validate application correctness.

### Pre-merge checklist

Run this checklist again against the reviewed commit immediately before any separately authorized merge:

1. Confirm the branch and intended reviewed HEAD; confirm `git merge-base develop HEAD` is the expected integration base and `develop` is an ancestor.
2. Require empty staged, unstaged, non-ignored untracked and unmerged results. Do not clean/reset/restore to achieve them; investigate any difference.
3. Re-run `git diff --name-status -M -C develop...HEAD`, raw diff and summary. Permit only the five documented paths unless a later independently reviewed commit explicitly expands scope.
4. Reject any `D`, `R`, `C`, type/mode change, unmerged record, or source/config/dependency path until it has an owner, purpose, recovery evidence and matching Issue QA.
5. Recompute blob IDs for all changed paths and compare them with the exact reviewed QA evidence; update stale HEAD/hash references through coordinator-owned records, not this pre-QA section.
6. Verify every Issue in TK-01.3 has independent QA `PASS`, then run the TK-01.3 QA gate. Do not infer Task `PASS` from this Issue matrix.
7. Run Story QA and only then Story PO review according to `AGENTS.md`. Do not claim merge readiness or Story acceptance before both required verdicts are recorded.
8. Retain the ignored-environment secure-backup warning; never commit secrets to make Git evidence complete.
9. If merge is later authorized, inspect the resulting diff/commit separately. This audit does not authorize or predict the merge result.

### Expected post-Issue state

Immediately after this implementation and before independent QA, the only expected working-tree entry is modified `docs/audits/ST-01-COMMIT-HISTORY.md`. The index, unmerged set and non-ignored untracked set should remain empty. After QA/coordinator handling, backlog/review evidence and commit count/blob IDs may legitimately change; those later states must be verified rather than assumed.

No PR, push, merge, Task QA, Story QA, Story PO acceptance or production-readiness claim is made.

### Reproducible read-only commands

These commands avoid remote URLs, environment values, credentials and author email fields:

```sh
git branch --show-current
git rev-parse HEAD
git rev-parse develop
git merge-base develop HEAD
git merge-base --is-ancestor develop HEAD
git status --porcelain=v2 --branch
git diff --cached --raw
git diff-files --raw
git ls-files --others --exclude-standard
git ls-files --unmerged
git rev-list --count develop..HEAD
git rev-list --merges develop..HEAD
git rev-list --first-parent --reverse --format='%h %s' develop..HEAD
git log --reverse --format='COMMIT %h %s' --name-status develop..HEAD
git diff --name-status -M -C develop...HEAD
git diff --stat develop...HEAD
git diff --summary develop...HEAD
git diff --raw develop...HEAD
git diff --name-status develop...HEAD -- . ':(exclude)docs/**'
git ls-tree HEAD -- docs/BACKLOG.md docs/audits/ST-01-COMMIT-HISTORY.md docs/audits/ST-01-MODULE-SCOPE.md docs/audits/ST-01-WORKTREE-INVENTORY.md docs/reviews/ST-01.md
git ls-tree develop -- docs/BACKLOG.md docs/audits/ST-01-COMMIT-HISTORY.md docs/audits/ST-01-MODULE-SCOPE.md docs/audits/ST-01-WORKTREE-INVENTORY.md docs/reviews/ST-01.md
git hash-object docs/BACKLOG.md docs/audits/ST-01-COMMIT-HISTORY.md docs/audits/ST-01-MODULE-SCOPE.md docs/audits/ST-01-WORKTREE-INVENTORY.md docs/reviews/ST-01.md
git diff --name-status develop...HEAD -- AGENTS.md .codex/config.toml .codex/agents .gitignore README.md docs/DEVELOPMENT_WORKFLOW.md docs/QUALITY_BASELINE.md docs/reviews/README.md package.json package-lock.json yarn.lock tsconfig.json next.config.ts eslint.config.mjs vitest.config.ts middleware.ts
git check-ignore -v .env.local .env.production.example
git diff --check -- docs/audits/ST-01-COMMIT-HISTORY.md
```

### Limitations

- Git proves tracked snapshots and recorded ancestry, not runtime correctness, completeness of product behavior, deploy state, stakeholder intent or authorship identity.
- Ignored files, their contents and their backups are outside Git proof. Presence/ignore classification does not prove content integrity. Reflogs, hooks, submodule/external storage, backend/database records and deleted external data were not inspected.
- Local and remote-tracking refs may be stale because no fetch or remote inspection occurred. This audit proves local `develop` ancestry only.
- A clean diff cannot prove that files lost before the merge base should have existed; this verification proves only that the Story introduced no recorded outside-scope loss relative to `develop`.
- The global quality baseline remains red and was not rerun because this Issue changes documentation only. Lossless Git scope is not equivalent to application quality or release readiness.

### Independent QA readiness

`IS-01.3.4` is ready for independent QA when this appended section is the only Issue-owned working-tree change. QA should reproduce every matrix row, exact five-path set/stat/modes/blob IDs, 13-commit linear chain, protected-path equality, ignored-path limitation, role/purpose trace and immediate expected state. QA must not promote this Issue-level `PASS` matrix into Task/Story/PO acceptance without the separate required gates.
