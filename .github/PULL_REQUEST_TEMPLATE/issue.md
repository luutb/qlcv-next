---
name: Issue pull request
about: Merge one independently testable issue into its parent story
---

## Work item

- Issue: QLCV-I-####
- Parent story: QLCV-ST-###
- Base branch: `story/QLCV-ST-###-...`

## Change

Describe the user-visible or technical outcome.

## Acceptance criteria mapping

- [ ] Criterion 1:
- [ ] Criterion 2:

## Evidence

- [ ] Lint
- [ ] Typecheck
- [ ] Manual verification for the changed behavior
- [ ] Relevant screenshots or recordings
- [ ] No credential, production fixture, or unrelated change included

## Risk and rollback

Describe failure modes and how this issue can be reverted safely.

## Review

- [ ] PR targets the parent story branch, not `develop` or `master`
- [ ] Conversations resolved
- [ ] DEV reviewer approved
