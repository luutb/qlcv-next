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
