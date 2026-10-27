# Workflow gates

Purpose: explicit process exit criteria. Owner: orchestrator. Status: Verified for specification completeness, not automatic enforcement.

All gates below are instructions evaluated by the orchestrator; no executable tooling enforces them. Record evidence in session for small work, or the task artifact for meaningful handoffs. Passing static validation does not pass these gates.

| Gate | Applies | Exit criteria / evidence |
| --- | --- | --- |
| G1 Requirements Ready | Implementation/design work | Clear scope, testable AC, dependencies, material ambiguities resolved or documented; assumptions that would change implementation require decision before dependent work. |
| G2 Design Ready | Architectural work only | Affected modules, contracts/boundaries, security and migration risks covered; consequential decisions recorded with authority. |
| G3 Implementation Complete | Code/config implementation | Requested behavior implemented within scope; relevant tests updated where meaningful; no concealed blocker. |
| G4 Verification Complete | Implemented changes | Relevant checks executed where possible; exact failures and unverified behavior disclosed; important AC mapped to evidence. An unavailable check is not a pass. |
| G5 Review Complete | Significant/risky change; requested review | Material findings resolved and retested or explicitly accepted by authorized stakeholder; remaining limitations recorded. Self-review labeled; no false independent approval. |
| G6 Release Ready | Release tasks only | Required checks complete, known blockers identified, rollback/config risks accounted for; required deployment authorization obtained before deployment. |

A blocked required check prevents an unqualified ready verdict. Report “Blocked” or qualified assessment with evidence, rather than silently skipping a requirement. QA/reviewer cannot accept material product/security risk on the user's behalf. Approval already given for a specific action remains valid; prepare reviewable output before requesting new authority.
