# New Feature

Purpose: Deliver scoped new behavior with process proportional to complexity.

Entry conditions: A feature request with an observable desired outcome.

Required inputs: Request, relevant code/product constraints and known contracts.

Responsible agent: Orchestrator

Supporting agents: BA, PO, PM, Product Designer, Architect, Tech Lead, relevant developers, QA, reviewer; activate only useful roles.

## Ordered steps

1. Classify Small/Medium/Large and choose relevant skills; inspect current context.
2. For material ambiguity, BA defines sourced rules/AC; PO recommends MVP, priorities and exclusions. Pass G1.
3. For medium/large coordination PM records deliverables/dependencies. Designer specifies journeys/states/accessibility only when warranted.
4. Architect assesses actual boundary/API/security/migration changes; record consequential ADR and pass G2 when needed.
5. Tech Lead defines file ownership/sequence only when coordination helps; hand developers bounded AC, design and verification expectations.
6. Developers implement; inspect scope and test changes for G3.
7. QA verifies important AC/regression risks and records results for G4.
8. Independently review significant/risky changes; route defects back to developer and repeat affected checks for G5.
9. Orchestrator inspects evidence, resolves remaining decisions and reports delivered behavior and gaps.

## Artifacts produced

Small: session AC/results only. Medium/large: only useful requirements, UX section, implementation plan, ADR, test/review reports; combine where clearer. Use [templates](../templates/requirements.md) selectively; statuses/authority follow [architecture](../architecture.md).

## Decision points

Skip roles/documents without value. Promote security/data/compatibility risk even for a small diff. Release scope adds release workflow/G6.

## Handoff conditions

Implementation receives testable scope/design and ownership; QA receives changed scope and run instructions; reviewer receives actual diff and evidence.

## Failure and escalation paths

Unresolved business policy → user via PO/BA; design conflict → Architect/orchestrator; failed check/finding → developer, retest before gate exit.

## Completion criteria

G1/G3/G4 satisfied; G2/G5 when applicable; scoped AC evidence and all limitations reported. See shared [gates](../gates.md); these are process instructions, not automatic enforcement.
