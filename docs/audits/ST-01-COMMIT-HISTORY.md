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
