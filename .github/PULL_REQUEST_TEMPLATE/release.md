---
name: Release pull request
about: Promote accepted work from develop to master
---

## Release

- Version: `v0.x.y`
- Head: `develop`
- Base: `master`
- Story/merge commit included:

## Release gates

- [ ] Staging smoke passed
- [ ] Impacted regression passed
- [ ] PO UAT signed off
- [ ] QA PASS and Reviewer APPROVE
- [ ] Dependency/security scan reviewed
- [ ] Environment configuration verified
- [ ] Release notes prepared
- [ ] Rollback plan verified
- [ ] Two approvals

## Deployment and smoke

Record the tagged SHA, deployment target, owner, and post-deployment smoke result.

## Rollback

Record the exact rollback trigger and procedure.

