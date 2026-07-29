# ST-003 Decomposition Map

Status: implementation complete, pending manual QA and Reviewer

Date: 2026-07-29

## Ownership

| Orchestrator | State and side effects retained | Extracted presentation/model |
| --- | --- | --- |
| `WorkBoardPage` | URL state, issue collection, filters, selection, drafts, settings, timers and mutations | Controls, board/list views, cards, drawer, create dialog, settings sheet, icons, primitives, fixtures, types, settings and utilities |
| `DashboardPage` | URL query composition, router replacement and summary request lifecycle | Header, content sections, lists, KPI primitives, states, icons, constants and pure query/view utilities |
| `AppShell` | Session synchronization, cached user state, redirects and menu anchor state | Navigation definition, access policy, role labels, top bar, sidebar, user menu and no-permission view |

## Public entries

Feature and layout `index.ts` files expose only route-level components or a
cross-feature capability with a current production consumer. Internal
components and model files are not exported. Cross-feature consumers use the
owning feature entry and no `@/features/*/*` deep import remains.

## Naming and duplicate helpers

- Route-level components retain the `Page` suffix.
- Presentation components use domain-specific nouns; model files use the
  `<domain>.<kind>` convention.
- The duplicate person-initial helper is now owned by
  `shared/lib/presentation` and consumed by Dashboard and Work Board. Its
  optional unassigned label preserves each feature's existing output.
- Feature-specific CSS selectors, status labels and SVG sets remain local to
  avoid creating styling dependencies through `shared`.

## Size result

- `WorkBoardPage.tsx`: 1,363 baseline lines, 406 after decomposition.
- `DashboardPage.tsx`: 654 baseline lines, 41 after decomposition.
- `AppShell.tsx`: 392 baseline lines, 74 after decomposition.

Line count is supporting evidence only. The acceptance boundary is that state,
requests and effects remain in orchestrators while presentation and pure logic
are independently named modules.
