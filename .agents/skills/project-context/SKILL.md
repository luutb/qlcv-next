---
name: project-context
description: "Discover QLCV context before multi-module changes or when project assumptions may be stale."
---

# project-context

1. Inspect working directory and Git status; if Git is absent establish a file/snapshot baseline and disclose the limitation.
2. Read applicable AGENTS.md and [project evidence](../../../docs/ai-development/project-context.md). Confirm versions/scripts from package.json and installed packages.
3. Trace the affected route → public feature export → organism/hooks → API/model boundary. Read only relevant product/master docs and ADRs; distinguish historical plans from current decisions.
4. Identify ownership, contract dependencies, available tests and unknowns. Sibling backend documentation is context, not edit permission.
Complete when the affected files, authoritative constraints and verification options are identified; return a concise context map, not a copied codebase.
