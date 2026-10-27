---
name: code-review
description: "Review a bounded diff for evidence-backed defects; use for requested or significant/risky change reviews."
---

# code-review

1. Establish base/head and scope; without Git require before/after evidence. Inspect actual changes and surrounding callers/types/tests.
2. Trace correctness, authorization, data integrity, regressions, errors, types, performance and maintainability in that order. Validate suspected defects with a concrete execution path or targeted check.
3. Return severity, file:line, trigger, impact and remediation using [review report](../../../docs/ai-development/templates/review-report.md) when persistent output is needed. Separate confirmed findings from untested risks.
4. Do not edit during review or report style preferences as defects. Disclose independent versus self-review and scope limitations.
Complete when actionable material findings and residual gaps are reported; lint alone is not a review.
