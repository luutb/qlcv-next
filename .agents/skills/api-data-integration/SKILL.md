---
name: api-data-integration
description: "Integrate or change API reads/mutations, query caching and session/error handling."
---

# api-data-integration

1. Trace src/services/http and the affected feature API/hooks/model before adding transport. Inspect src/features/auth/api/authorized-request.ts and session.ts for bearer-token ownership.
2. Confirm endpoint/request/response/error contract using current evidence and docs-master/QLCV_NEXT_API_MASTER.md; report mismatches instead of inventing fields. parseApiResponse<T> is a cast, not runtime validation: validate untrusted data where risk warrants it.
3. Keep transport in services/feature API; use existing ApiProblem/safe messages, query keys and invalidation. Cover 401/403, empty, conflict/stale, locked, retry/duplicate writes and cancellation as relevant. Preserve idempotency conventions where required.
4. Keep server authorization authoritative; do not duplicate domain rules or leak raw responses/tokens into logs/UI. Verify success/failure and stale-cache behavior.
Complete when the contract, states and cache/session behavior have evidence or explicit gaps.
