---
name: frontend-implementation
description: "Implement scoped QLCV React/TypeScript UI behavior using existing layers and design patterns."
---

# frontend-implementation

1. Inspect comparable feature/public exports and design-system/qlcv-next/MASTER.md; reuse theme/tokens and MUI/Emotion patterns.
2. Place UI according to [layer rules](../../../docs/architecture/FRONTEND_LAYER_RULES.md), exporting features via index.ts. Keep model/services free of JSX.
3. Reuse types; explicitly handle nullable/untrusted values and avoid unjustified any/casts. Implement loading, empty, failure, permissions and mutation states as applicable.
4. Verify labels, semantic structure, keyboard/focus and responsive behavior. Use targeted behavioral checks plus applicable architecture/lint/type commands from [context](../../../docs/ai-development/project-context.md).
Complete when scoped AC work, integration states are covered and remaining verification gaps are disclosed.
