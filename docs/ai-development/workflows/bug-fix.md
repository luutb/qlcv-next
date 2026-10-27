# Bug Fix

Purpose: Correct a defect with the smallest defensible change.

Entry conditions: Unexpected behavior or failure report.

Required inputs: Reported trigger, expected/actual behavior, available logs/tests and affected code.

Responsible agent: Orchestrator

Supporting agents: Developer; QA/reviewer for risk; BA/Architect only if investigation exposes ambiguity/design fault.

## Ordered steps

1. Establish expected behavior from evidence and clarify the report (G1 in session).
2. Reproduce with safe test data or gather evidence; explicitly label an unconfirmed reproduction.
3. Trace root cause and affected callers/data; identify regression/security risks.
4. Add a meaningful regression test when practical; explain a missing test rather than manufacturing one.
5. Implement the smallest correct fix within assigned scope (G3); G2 only if a consequential redesign is necessary.
6. Execute targeted regression/acceptance checks (G4).
7. Review actual diff; independent G5 for significant/risky changes.
8. Report root cause, fix, verification and limits.

## Artifacts produced

Usually session reproduction/root cause/commands only; defect/test/review note for complex handoffs. No isolated-bug PRD. Use [templates](../templates/requirements.md) selectively; statuses/authority follow [architecture](../architecture.md).

## Decision points

If expected behavior is disputed use requirements analysis; larger design fault can enter technical design before dependent implementation.

## Handoff conditions

Developer needs trigger/expected result; QA needs fix scope/reproduction; reviewer needs before/after evidence.

## Failure and escalation paths

Cannot reproduce → report evidence and uncertainty, continue safe investigation; failed regression → fix root cause; unresolved policy → user.

## Completion criteria

Evidence supports fix, relevant checks accounted for, diff reviewed and unresolved risks explicit; no false reproduced/pass claim. See shared [gates](../gates.md); these are process instructions, not automatic enforcement.
