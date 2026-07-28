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

---

## IS-01.1.3 — Ownership and provenance by change group

### Scope and attribution model

- Issue: `IS-01.1.3` — attach an owner or an evidence-backed origin to every change group.
- Observation time: 2026-07-28 (Asia/Ho_Chi_Minh).
- Comparison: merge-base diff `develop...HEAD` on `story/st-01-git-baseline` at observed HEAD `b69db8f3505a403437f2499c586ba9a00b5ca9b8`.
- Inspection was read-only. Remote configuration, credential-bearing URLs, and author email fields were not used as evidence.

This section distinguishes two forms of attribution:

1. **Role ownership** identifies the project role responsible for the artifact according to the repository workflow, the artifact's stated purpose, and its contents.
2. **Git author provenance** identifies the local Git author name and commit that recorded a tree change. It does not prove which project role or agent produced each line, especially when one commit bundles coordinator, implementer, and reviewer artifacts.

### Path and change-group matrix

| Domain / change group | Paths in `develop...HEAD` | Change origin | Role ownership / custody | Git author provenance | Confidence and unresolved ownership |
|---|---|---|---|---|---|
| Project tracking and backlog state | `docs/BACKLOG.md` | `IS-01.1.1` and `IS-01.1.2` changed their checkboxes from open to complete | **Coordinator-owned tracking state.** The project workflow assigns the primary coordinator responsibility for recording review evidence before updating backlog checkboxes; this is not implementation evidence owned by `repo_stabilizer`. | Recorded in `9926e39` and `b69db8f`, both under the same configured Git author name, `luunbsapo`. | Role attribution is evidence-backed by `AGENTS.md` workflow rules and the checkbox-only diff. The named human accountable for coordinator custody is not recorded in the changed file and remains unresolved. |
| Git audit evidence | `docs/audits/ST-01-WORKTREE-INVENTORY.md` | Added for `IS-01.1.1`; extended for `IS-01.1.2`; this section is the working-tree output of `IS-01.1.3` | **`repo_stabilizer`-owned audit evidence** for ST-01/TK-01.1. Each labeled section declares its Issue scope and read-only evidence. | The committed portions were recorded in `9926e39` and `b69db8f` under Git author name `luunbsapo`. The current `IS-01.1.3` section is not assigned commit provenance until a later authorized commit occurs. | High confidence for role ownership from the Story mapping and labeled Issue sections. Git metadata cannot distinguish agent execution from the Git identity that recorded the commits. |
| Workflow and review evidence | `docs/reviews/ST-01.md` | Created with the `IS-01.1.1` review record and extended with the `IS-01.1.2` QA verdict/history | **Coordinator-custodied review record**, containing **`qa_reviewer`-owned verdict evidence**. The file itself identifies `repo_stabilizer` as Story owner, but that does not make the implementation agent the owner of its independent QA verdicts. | Added in `9926e39` and modified in `b69db8f`, both under Git author name `luunbsapo`. | Role separation is evidenced by the review table/history and the mandatory independent-review workflow. The commits bundle the record with implementation evidence, so Git history alone cannot identify who typed or transcribed each QA entry; individual human ownership remains unresolved. |
| Application source | none | N/A — zero changed files in `develop...HEAD` | N/A | N/A | No owner is assigned because there is no changed path in this domain. |
| Tests and quality configuration | none | N/A — zero changed files in `develop...HEAD` | N/A | N/A | No owner is assigned because there is no changed path in this domain. |
| Dependencies and generated artifacts | none | N/A — zero changed files in `develop...HEAD` | N/A | N/A | No owner is assigned because there is no changed path in this domain. |

All three changed paths are documentation or workflow evidence. There are no application, test/configuration, dependency, build-output, or generated-artifact changes to assign.

### Commit-to-path provenance

| Commit | Subject | Paths recorded | Provenance interpretation |
|---|---|---|---|
| `9926e39` | `IS-01.1.1: inventory worktree changes` | Modified `docs/BACKLOG.md`; added the audit and review records | One Git snapshot recorded artifacts with three different role contexts. The commit subject proves Issue association, not exclusive role authorship of every path. |
| `b69db8f` | `IS-01.1.2: identify ambiguous git states` | Modified all three paths | The audit addition belongs to `repo_stabilizer`; the backlog and QA record are coordinator/reviewer workflow evidence. Their shared Git author identity does not collapse those roles. |

### Reproducible read-only commands

Run from the repository root. These commands intentionally omit author email and remote configuration:

```sh
git branch --show-current
git rev-parse HEAD
git merge-base develop HEAD
git status --porcelain=v2 --branch
git diff --name-status develop...HEAD
git diff --stat develop...HEAD
git diff develop...HEAD -- docs/BACKLOG.md
git log --format='%h%x09%an%x09%ad%x09%s' --date=iso-strict develop..HEAD
git log --format='%h%x09%s' --name-status --find-renames develop..HEAD
git show --format='%h%n%an%n%ad%n%s' --date=iso-strict --stat 9926e39
git show --format='%h%n%an%n%ad%n%s' --date=iso-strict --stat b69db8f
```

Interpretation:

- `git diff --name-status develop...HEAD` reports exactly one modified backlog, one added audit file, and one added review file.
- Per-commit name-status shows that both Story commits touched all three paths.
- The backlog diff contains only completion-state changes for `IS-01.1.1` and `IS-01.1.2`.
- The audit and review contents supply the role context that the bundled commit metadata cannot provide.

### Unresolved ownership and limitations

- No changed artifact names a human accountable owner for the coordinator, `repo_stabilizer`, or `qa_reviewer` roles. This report therefore assigns project roles, not people.
- The same configured Git author name appears on both commits. Git author provenance shows who the repository recorded, but it cannot authenticate agent identity, prove who typed a line, or demonstrate that independent review happened outside the commit process.
- The two commits bundle implementation audit evidence with coordinator and QA evidence. A future commit policy could improve provenance by recording reviewer evidence separately, but changing history or commit policy is outside this Issue.
- `IS-01.1.3` itself is currently an uncommitted modification to this audit file. Its final commit author and hash cannot be stated before an explicitly authorized commit.
- This attribution is limited to `develop...HEAD`. Ignored files, reflogs, remote-only commits, external tickets, chats, and CI identities were not inspected.
- Later changes to the branch invalidate the path and commit matrix and require rerunning the commands.

### Independent QA readiness

`IS-01.1.3` is ready for independent QA when the focused diff contains only this appended section in `docs/audits/ST-01-WORKTREE-INVENTORY.md`. QA should reproduce the path matrix, confirm that every non-empty change group has an evidence-backed role owner/origin, confirm that zero-change domains are marked N/A, and verify that no role attribution is presented as equivalent to Git author provenance.
