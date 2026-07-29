# Contributing to QLCV

## Branch flow

All product work follows this branch hierarchy:

```text
master
  └── develop
        └── story/QLCV-ST-###-short-name
              └── issue/QLCV-I-####-short-name
```

- Create every story branch from the latest `develop`.
- Create every issue branch from its parent story branch.
- Open issue pull requests against the story branch. Never merge an issue
  directly into `develop` or `master`.
- Squash-merge issue pull requests after checks and development review pass.
- After every issue and acceptance criterion is complete, synchronize the story
  with `develop`, run QA, and obtain Reviewer approval.
- Merge the story into `develop` with a merge commit so the story remains an
  independently revertible unit.
- Release an accepted story through a pull request from `develop` to `master`.
  Unfinished work must remain on story branches and must not enter `develop`.
- Direct pushes and force-pushes to `develop` and `master` are prohibited.

## Naming

- Story: `story/QLCV-ST-###-kebab-case`
- Issue: `issue/QLCV-I-####-kebab-case`
- Hotfix: `hotfix/QLCV-HF-###-kebab-case`

Use Conventional Commits and include the work item ID:

```text
feat(work): load dynamic workflow columns [QLCV-I-0303]
```

## Pull request bases

| Pull request | Head | Base | Merge strategy |
| --- | --- | --- | --- |
| Issue | `issue/*` | Its parent `story/*` | Squash merge |
| Story | `story/*` | `develop` | Merge commit |
| Release | `develop` | `master` | Merge commit and SemVer tag |
| Hotfix | `hotfix/*` | `master` | Merge commit, patch tag, then back-merge to `develop` |

## Required local checks

Before requesting review, run from `qlcv/`:

```sh
npm run lint
npm run typecheck
npm run build
```

The pull request must also include acceptance-criteria mapping, verification evidence,
risk, and rollback notes. A checklist never replaces quality checks or human
approval.

## Review workflow

1. DEV completes the issue and provides manual verification evidence.
2. QA validates the completed story against PO acceptance criteria.
3. Reviewer reviews only after QA passes.
4. If Reviewer requests changes, return the finding to DEV, then rerun QA and
   Reviewer approval.

## Security

- Never commit credentials, tokens, `.env.local`, build output, coverage output,
  or verification artifacts.
- Git remotes must use SSH or a credential helper. Credentials must not be
  embedded in remote URLs.
- A leaked credential must be revoked and rotated before any remote operation.
