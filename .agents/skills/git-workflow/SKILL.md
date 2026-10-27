---
name: git-workflow
description: "Preserve workspace changes and review scoped diffs during development or delivery."
---

# git-workflow

1. Inspect git status --short and applicable instructions before edits. Record existing changes; never reset, clean, stash or overwrite them implicitly.
2. If Git is absent, do not initialize it automatically: record baseline hashes or explicit before/after copies, and disclose missing history/diff support.
3. Coordinate file ownership; inspect final diff and git diff --check where available. Stage only intended paths when authorized.
4. Do not commit, push, merge or deploy without user authority. Existing scoped authorization persists; avoid repeated confirmation for authorized reversible work.
Complete when task changes are distinguishable, unrelated work preserved and delivery actions match authority.
