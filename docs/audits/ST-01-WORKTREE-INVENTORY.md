# ST-01 Worktree Inventory

## Scope

- Issue: `IS-01.1.1` — export staged, unstaged, and untracked changes grouped by domain.
- Observation time: 2026-07-28 (Asia/Ho_Chi_Minh).
- Inspection mode: read-only Git commands before this report was created.
- This inventory does not decide keep/remove/restore outcomes and does not change the Git index, refs, or existing files.

## Branch baseline

| Item | Value |
|---|---|
| Current branch | `story/st-01-git-baseline` |
| HEAD | `8d454afa43adfd579cfd21356201b87c53fec9b9` |
| `develop` | `8d454afa43adfd579cfd21356201b87c53fec9b9` |
| Merge-base of HEAD and `develop` | `8d454afa43adfd579cfd21356201b87c53fec9b9` |
| `main` | `a714abe3a8a90e98e5481f8f172c938ce432cad5` |
| HEAD subject | `chore: define agent development workflow` |
| Upstream shown by porcelain status | none |

The Story branch starts exactly at the current local `develop` commit. No remote URL or credential-bearing configuration was inspected or recorded.

## Pre-existing worktree inventory

This is the state captured **before** creating this report.

### Summary by Git category

| Category | File count | Files |
|---|---:|---|
| Staged | 0 | none |
| Unstaged tracked | 0 | none |
| Untracked | 1 | `docs/reviews/ST-01.md` |

### Summary by domain

| Domain | Ownership/context | Staged | Unstaged tracked | Untracked |
|---|---|---:|---:|---:|
| Workflow and review evidence | Coordinator-owned review record for ST-01 | 0 | 0 | 1 |
| Application source | Product/application code | 0 | 0 | 0 |
| Tests and quality configuration | Test, lint, typecheck, build, and CI assets | 0 | 0 | 0 |
| Project documentation | Roadmap, backlog, architecture, and usage documentation | 0 | 0 | 0 |
| Dependencies and generated artifacts | Manifests, lockfiles, build output, and generated files | 0 | 0 | 0 |

### File-level detail

| Path | Git category | Domain | Classification |
|---|---|---|---|
| `docs/reviews/ST-01.md` | Untracked | Workflow and review evidence | Coordinator-owned file created to record Issue, Task, Story QA, and PO gates. It is not application code and was not modified by this Issue. |

There were no staged or unstaged tracked paths to group. There were also no pre-existing application-code changes in any Git category.

## Change introduced by IS-01.1.1

After the pre-existing snapshot, this Issue created only:

| Path | Expected Git category | Domain | Purpose |
|---|---|---|---|
| `docs/audits/ST-01-WORKTREE-INVENTORY.md` | Untracked | Git audit evidence | This inventory report. |

This report must not be mistaken for a pre-existing worktree change. At post-write verification time, the expected worktree is two untracked files: the coordinator-owned review record and this Issue-owned audit report.

## Reproducible commands

Run from the repository root. These commands are read-only and do not print remote URLs:

```sh
git branch --show-current
git rev-parse HEAD
git rev-parse develop
git merge-base HEAD develop
git status --short --branch
git status --porcelain=v2 --branch
git diff --cached --name-status
git diff --name-status
git ls-files --others --exclude-standard
git for-each-ref --format='%(refname:short) %(objectname)' refs/heads/main refs/heads/develop refs/heads/story/st-01-git-baseline
git log -1 --format='%H%n%ad%n%s' --date=iso-strict HEAD
```

Interpretation:

- `git diff --cached --name-status` returned no paths: staged count is zero.
- `git diff --name-status` returned no paths: unstaged tracked count is zero.
- `git ls-files --others --exclude-standard` returned only `docs/reviews/ST-01.md` before this report was created.
- `git status --porcelain=v2 --branch` reported the branch OID, branch name, and one untracked path; it showed no upstream line.

## Remaining risks and follow-up

- Both the coordinator review record and this inventory remain untracked until a later, explicitly authorized Git operation handles them.
- This Issue only inventories status categories. Detecting ambiguous staged-delete/recreated or add/delete states belongs to `IS-01.1.2`; none are implied by the current zero staged/unstaged counts.
- Local branch equality does not prove remote synchronization. Remote URLs and network state were intentionally outside this Issue's scope.
- Any worktree change made after the observation invalidates the counts and requires rerunning the commands above.

---

## IS-01.1.2 — Ambiguous Git-state analysis

### Scope and observation point

- Issue: `IS-01.1.2` — identify add/delete, staged-delete/recreated, index/worktree type-change, rename/copy ambiguity, overlapping staged/unstaged content, and unresolved index entries.
- Observation time: 2026-07-28 (Asia/Ho_Chi_Minh).
- Branch: `story/st-01-git-baseline`.
- Observed HEAD: `9926e3958017debed44b018b5e15d3ec33363383` (`IS-01.1.1: inventory worktree changes`).
- Inspection was read-only. No remote URL or credential-bearing Git configuration was inspected.

### Commands and evidence

The following read-only commands were run from the repository root:

```sh
git status --short
git status --porcelain=v2 --branch
git diff --cached --raw
git diff --raw
git diff-files --raw
git diff-index --cached --raw HEAD --
git ls-files --unmerged
git ls-files --stage docs/audits/ST-01-WORKTREE-INVENTORY.md docs/reviews/ST-01.md docs/BACKLOG.md
git show --format=fuller --summary --find-renames --find-copies 9926e39
git show --format='' --name-status --find-renames --find-copies 9926e39
```

Evidence at the observation point:

- `git status --short` returned no entries.
- Porcelain v2 returned only the branch OID and branch name; it returned no `1`, `2`, `u`, or `?` records.
- Cached, worktree, `diff-files`, and cached `diff-index` raw diffs all returned no entries.
- `git ls-files --unmerged` returned no entries.
- The three inspected tracked files were all ordinary blobs with mode `100644`, at index stage `0`.

### Findings by ambiguity class

| Ambiguity class | Current evidence | Finding |
|---|---|---|
| Add/delete or delete/add | No status or raw-diff entries | None detected |
| Staged-delete/recreated in worktree | Cached and worktree diffs are empty | None detected |
| Overlapping staged and unstaged content | Both cached and worktree diffs are empty | None detected |
| Index/worktree file-type or mode change | No raw-diff entries; inspected index entries are mode `100644`, stage `0` | None detected |
| Unmerged multi-stage index entries | `git ls-files --unmerged` is empty | None detected |
| Rename/copy ambiguity | No current changes exist to classify | None detected |

No file is identified as having an ambiguous Git state at this observation point. This is a positive clean-state finding based on the commands above, not an inference from the earlier inventory.

### Committed-history context

The latest committed parent-to-HEAD snapshot reports:

| Path | Committed change |
|---|---|
| `docs/BACKLOG.md` | Modified (`M`) |
| `docs/audits/ST-01-WORKTREE-INVENTORY.md` | Added (`A`) |
| `docs/reviews/ST-01.md` | Added (`A`) |

Rename/copy detection on commit `9926e39` did not classify any of those paths as a rename or copy. These are normal committed tree changes and are not present-day worktree ambiguities.

Git commits preserve tree snapshots, not the transient division between index and worktree that existed before a commit. Therefore, the committed `M/A/A` evidence cannot establish that a staged-delete/recreated, overlapping staged/unstaged, or similar ambiguous state existed historically. The pre-write snapshot documented by `IS-01.1.1` likewise recorded zero staged and zero unstaged tracked files; it identified only an untracked review file. There is no recorded evidence in this audit supporting a historical ambiguity claim.

### Conclusion and limitations

- **Conclusion:** no ambiguous Git-state files were detected on `story/st-01-git-baseline` at HEAD `9926e39`.
- This conclusion is time-bound. Concurrent or later worktree/index changes require rerunning the commands.
- The analysis does not reconstruct uncommitted states that were never captured by Git or by the prior audit.
- Remote synchronization, remote refs, reflogs, hooks, ignored files, and semantic duplication between differently named files are outside this Issue.
- No keep/remove/restore decision is required by `IS-01.1.2`, because no evidenced ambiguous path was found.

### Independent QA readiness

`IS-01.1.2` is ready for independent QA. QA can reproduce the clean-state checks with the commands above and should verify that this section is the only Issue-owned file change before accepting the Issue.
