# Task routing

Purpose: choose the least process that covers real risk. Owner: orchestrator. Status: Verified by scenario review; gates remain manual.

| Level | Trigger | Route and outputs |
| --- | --- | --- |
| Small | Typo, isolated UI/TypeScript/conditional fix with clear behavior | Inspect local context; use relevant skill; implement directly; targeted verification and diff review. No subagents or persistent artifacts. Apply G1/G3/G4 briefly in session. |
| Medium | API form, data table, multi-component/business-flow change | Context, scoped AC, short plan when useful; developer, QA and focused review by risk. BA/designer/architect only for actual ambiguity/interaction/boundary needs. Persist one combined task note if handoff warrants it. |
| Large | New module, auth redesign, contract migration, cross-cutting design/database work | BA/PO for material business scope; PM delivery plan; Architect design; Tech Lead coordinated ownership; relevant developers; QA and independent reviewer. G1–G5, G2 when design needed. Release Engineer/G6 only if release in scope. |

Risk can promote a tiny diff: authorization, tenant isolation, data loss, public API compatibility or irreversible migration warrants focused design/security/review. File count alone does not determine level. Roles are perspectives, not mandatory separate spawned agents.

Pick [feature](workflows/new-feature.md), [bug](workflows/bug-fix.md), [design](workflows/technical-design.md), [review](workflows/code-review.md), [refactor](workflows/refactoring.md) or [release](workflows/release-verification.md). For combined work choose a primary workflow and explicitly include applicable gates from the others. Read only relevant skills. Shared [gates](gates.md) and [authority](architecture.md) apply.

Examples: rename button → Small direct implementation, no document/team. Form with API mutation → Medium AC plus failure/cache/accessibility verification. Authorization redesign → Large requirements/design/security, server contract, QA and independent review, no deployment unless assigned. Reproduced one-line bug → bug workflow, regression test when meaningful, no PRD. Design-only request ends at implementable tasks/unresolved decisions, not application changes.

If blocked, record evidence/owner/needed input and continue independent authorized work. Do not reinterpret silence as approval or claim incomplete work passed a gate. Final report includes changed scope, AC evidence, checks and failures/gaps. For system changes, report the files changed and run the repository validator.
