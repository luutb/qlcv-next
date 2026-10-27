# Refactoring

Purpose: Improve structure while preserving authorized behavior.

Entry conditions: Explicit structural objective with compatibility constraints.

Required inputs: Existing behavior, relevant code/tests, target boundary and scope.

Responsible agent: Tech Lead / orchestrator

Supporting agents: Developer, Architect for consequential boundary decisions, QA and reviewer by risk.

## Ordered steps

1. Define structural improvement and explicit exclusions (G1).
2. Establish current observable behavior and compatibility baseline.
3. Assess regression risks; obtain design/G2 only for consequential choices.
4. Implement small coherent steps with explicit file ownership (G3).
5. Preserve behavior unless user authorized its change; route discovered defects separately.
6. Run relevant tests, type checks and layer checks (G4).
7. Review actual diff; independent G5 for significant/risky changes.
8. Report structural result, behavior evidence and remaining risk.

## Artifacts produced

Session scope/results; short plan/test/review note when multiple parties need it; ADR only for consequential design. Use [templates](../templates/requirements.md) selectively; statuses/authority follow [architecture](../architecture.md).

## Decision points

Behavior change requires scope decision; avoid unrelated cleanup.

## Handoff conditions

Developer needs invariants and boundaries; QA/reviewer receive before/after behavior evidence.

## Failure and escalation paths

Baseline failure → identify pre-existing condition; unexpected behavior change → repair or seek authority; no weakening tests.

## Completion criteria

Structural objective met within scope, behavior compatibility evidenced and verification/review gaps disclosed. See shared [gates](../gates.md); these are process instructions, not automatic enforcement.
