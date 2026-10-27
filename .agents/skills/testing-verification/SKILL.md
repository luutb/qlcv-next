---
name: testing-verification
description: "Select and execute proportional QLCV acceptance/regression checks and report evidence."
---

# testing-verification

1. Map AC/risk to observable positive, negative and boundary scenarios; choose existing tooling from [context](../../../docs/ai-development/project-context.md).
2. Execute targeted checks first. Use lint, architecture check, types and build only as relevant; no test framework installation without approval. Browser smoke requires verified runtime/tools and safe test data.
3. Record exact command, outcome, tested revision/scope, expected/actual failures and unexecuted scenarios. Do not equate compilation with functional correctness or weaken assertions.
4. Retest fixes when failures/new changes justify it; use [test plan](../../../docs/ai-development/templates/test-plan.md) for multi-party/risky work.
Complete when important AC map to evidence and all failures/unverified behavior are disclosed.
