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
