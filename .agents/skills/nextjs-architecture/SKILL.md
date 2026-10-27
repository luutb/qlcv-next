---
name: nextjs-architecture
description: "Plan QLCV Next.js boundaries, rendering, caching or route changes."
---

# nextjs-architecture

1. Confirm installed Next.js version; search node_modules/next/dist/docs/ for the relevant App Router API and read it before code. Do not assume older synchronous request APIs or caching defaults.
2. Apply [layer rules](../../../docs/architecture/FRONTEND_LAYER_RULES.md). Keep routes as adapters and data/business behavior in feature services/models/hooks.
3. Prefer Server Components where compatible; place Client boundaries around interaction needs. Inspect current auth/session context before moving fetches server-side. Protect server-only code/secrets; public environment variables are bundled.
4. Specify data ownership, freshness/invalidation, auth, errors and compatibility. Record [ADR](../../../docs/ai-development/templates/architecture-decision-record.md) only for consequential choices.
Complete when affected modules, Server/Client boundary, contract/security risks and verification are explicit.
