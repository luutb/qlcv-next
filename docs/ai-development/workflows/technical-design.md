# Technical Design

Purpose: Resolve consequential engineering choices before implementation.

Entry conditions: Explicit design request or material boundary/contract/migration decision.

Required inputs: Requirements/AC, current architecture, compatibility/security constraints.

Responsible agent: Architect (coordinated by orchestrator)

Supporting agents: BA/PO for scope, designer for interaction, Tech Lead/PM for implementable breakdown.

## Ordered steps

1. Establish requirements, constraints, authority and G1.
2. Inspect actual architecture and relevant decisions rather than inferring from old plans.
3. Identify affected boundaries, contracts, dependencies and compatibility.
4. Compare alternatives only for consequential decisions using repository evidence.
5. Specify data flow, API/auth, trust boundaries, failure handling, migration/rollback and verification approach.
6. Record important decisions in ADR with decision owner/authority; leave unresolved decisions Draft or Blocked.
7. Break accepted design into bounded tasks, ordering and integration conditions.
8. Report unresolved questions and G2 assessment.

## Artifacts produced

Concise design/task note; ADR for important decisions, contract/flow only where useful. Use [templates](../templates/requirements.md) selectively; statuses/authority follow [architecture](../architecture.md).

## Decision points

Routine implementation skips this workflow. No code execution implied by design acceptance.

## Handoff conditions

Developer receives design, AC, file boundaries, contract decisions and tests; unresolved material decision blocks only dependent work.

## Failure and escalation paths

Missing contracts → gather evidence; material unresolved architecture/product choice → user with options; no endless agent debate.

## Completion criteria

Design is implementable and G2 assessed; unresolved questions explicitly assigned; design-only scope does not require G3/G4 code checks. See shared [gates](../gates.md); these are process instructions, not automatic enforcement.
