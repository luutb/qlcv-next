# Code Review

Purpose: Independently identify actionable defects in a bounded change.

Entry conditions: Review request or significant/risky completed change.

Required inputs: Exact diff/base or before/after snapshots, AC, surrounding code/tests and verification evidence.

Responsible agent: Code Reviewer

Supporting agents: QA/Architect/security capability for focused questions; orchestrator consolidates.

## Ordered steps

1. Establish scope/base and independent versus self-review status.
2. Inspect actual diff, not only summaries.
3. Read surrounding callers, contracts and tests.
4. Analyze correctness, security/auth, integrity, regressions, errors, types, performance and maintainability.
5. Validate suspected defects with evidence or targeted safe checks.
6. Rank severity by impact and provide precise references.
7. Report trigger/evidence/impact/remediation and review limitations; avoid speculative confirmed findings.
8. Return report to orchestrator for G5 disposition; reviewer does not edit.

## Artifacts produced

Session findings for small review; review-report for significant handoff. Use [templates](../templates/requirements.md) selectively; statuses/authority follow [architecture](../architecture.md).

## Decision points

Missing diff/baseline limits review; lint/format success never substitutes for inspection.

## Handoff conditions

Orchestrator validates findings; developer receives actionable defects; reviewer sees fixes and affected verification before closure.

## Failure and escalation paths

Confirmed defect → developer then retest/review; unresolved material risk → authorized user; unavailable evidence → explicit limitation.

## Completion criteria

G5 findings disposition and review coverage explicit; review-only task may finish with unresolved findings accurately reported. See shared [gates](../gates.md); these are process instructions, not automatic enforcement.
