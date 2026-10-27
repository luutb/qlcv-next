# Release Verification

Purpose: Assess readiness and prepare a concrete deployment decision.

Entry conditions: Explicit release/build/CI/deployment assessment request.

Required inputs: Release scope/revision, required checks, configuration names, migration/rollback constraints.

Responsible agent: Release Engineer / orchestrator

Supporting agents: Developer for fixes, QA for evidence, Architect for migration risks.

## Ordered steps

1. Inspect release requirements, revision/snapshot and required check list.
2. Check actual CI/configuration, environment names and migration prerequisites without printing values.
3. Execute available required build, lint, type and test commands; record missing tools/environment accurately.
4. Investigate failures/warnings; route authorized fixes to developer and rerun affected checks.
5. Assess rollback, migrations, health checks/logging/monitoring where applicable; never invent production setup.
6. Produce readiness report with pass/fail/warning/unverified and blockers; assess G4 and G6.
7. Prepare reviewable release result before requesting any missing deployment authority. Deploy only if explicitly authorized and within execution permissions; otherwise assessment ends without deployment.

## Artifacts produced

Dated release-checklist with revision, commands/results, blockers, rollback risks and approval state. Use [templates](../templates/requirements.md) selectively; statuses/authority follow [architecture](../architecture.md).

## Decision points

No CI/production config means unverified operational readiness, not invented deployment instructions. Existing deployment authority applies only to its scope.

## Handoff conditions

Orchestrator/user receives concrete readiness evidence and exact action requiring authority; configuration implementation is separate assignment.

## Failure and escalation paths

Required failure or missing verification → Blocked/qualified assessment; unsafe migration → Architect/user; no deployment while required readiness/authority absent.

## Completion criteria

Assessment accurately completed even if blocked; unqualified Release Ready requires required checks complete and deployment authority when necessary. See shared [gates](../gates.md); these are process instructions, not automatic enforcement.
