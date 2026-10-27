---
name: security-review
description: "Assess material trust-boundary changes involving authentication, authorization, untrusted content, URLs or sensitive data."
---

# security-review

1. Trace attacker-controlled inputs, sensitive outputs, server/client boundaries and actual authorization enforcement.
2. Inspect relevant XSS/unsafe HTML, redirects, CSRF for cookie-auth flows, SSRF for server URL fetches, injection and tenant/data leakage. Apply threats only when the execution path exists.
3. Confirm secrets stay server-side; inspect environment variable names only and redact evidence. Existing client JWT expiry/session guards do not validate authorization.
4. Return threat, exploit preconditions, file evidence, impact, mitigation and remaining uncertainty. Use safe tests; no production probing or credential exposure.
Complete when affected trust boundaries are assessed and confirmed vulnerabilities are distinguished from hypotheses. No security guarantee based solely on frontend checks.
