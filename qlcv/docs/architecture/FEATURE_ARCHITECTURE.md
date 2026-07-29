# Feature Architecture

Status: accepted for `EP-002`

Date: 2026-07-29

## Objective

Make feature ownership and dependency direction explicit without changing
routes, API contracts, query behavior, storage keys or user-visible behavior.

## Target source tree

```text
src/
  api/                         # HTTP repositories and transport DTOs
  features/
    auth/
    dashboard/
    projects/
      components/
      queries/
    project-workflow-board/
      components/
      queries/
    work-board/
      components/
      model/
    workflow-templates/
      components/
      queries/
  layouts/
    app-shell/
  shared/
    lib/
      routing/
    ui/
      states/
```

The `app` directory remains a route adapter layer. Route files do not own
business behavior.

## Dependency direction

Allowed:

```text
app -> feature public entry or layout
layout -> feature public entry + shared + api
feature -> shared + api
shared -> api + framework/library
api -> framework/library + api-local types
```

Forbidden:

```text
api -> feature
shared -> feature
feature A -> internal file of feature B
feature -> app route
```

When one feature needs another domain, the owning feature exposes a small
public `index.ts`. Public entries are a boundary, not a barrel for every
internal file.

## Ownership map

| Current source | Target owner | Decision |
| --- | --- | --- |
| `features/auth/*` | `features/auth` | Keep; expose session boundary through public entry |
| `features/dashboard/*` | `features/dashboard` | Keep UI; move transport DTO types to `api` |
| `features/shared/AppShell.tsx` | `layouts/app-shell` | Move out of feature namespace |
| `features/shared/redirect-url.ts` | `shared/lib/routing` | Move as framework-neutral helper |
| `features/shared/*State.tsx` | `shared/ui/states` | Move without prop or copy changes |
| `features/shared/PageHeader.tsx` | `shared/ui` | Keep only as reusable UI primitive |
| `features/shared/PlaceholderPage.tsx` | `shared/ui` | Temporary shared scaffold; remove as routes mature |
| `features/projects/ProjectsPage.tsx` | `features/projects` | Keep |
| `workflow-board/CreateProjectModal.tsx` | `features/projects/components` | Project creation belongs to Projects |
| `workflow-board/WorkflowBoardPage.tsx` | `features/project-workflow-board` | Rename owner; route remains `/projects/board` |
| Project board cards/columns/dialogs | `features/project-workflow-board/components` | Move together |
| Project board queries/utilities | `features/project-workflow-board/queries` | Split without changing keys |
| `workflow-board/WorkflowTemplateSettingsPage.tsx` | `features/workflow-templates` | Separate administration domain |
| Workflow-template queries | `features/workflow-templates/queries` | Preserve keys and enabled conditions |
| `features/work-board/*` | `features/work-board` | Canonical `/work` owner |
| `features/issue-board/*` | Remove after zero-consumer audit | Dormant duplicate; API repositories remain |

## Invariants

- Preserve all 27 route pathnames.
- Preserve the six legacy redirect destinations and complete query strings.
- Preserve API path, method, headers, payload, DTO mapping and idempotency.
- Preserve React Query keys, invalidation targets and enabled conditions.
- Keep shared React Query key factories in `src/api/query-keys.ts`; features
  must not redeclare the same resource keys.
- Preserve `access_token`, `auth_user` and `work-board-settings` storage keys.
- Preserve CSS selectors, copy, role visibility and confirmation behavior.
- Preserve client boundaries and component identity where remount changes state.
- Do not connect the mock Work Board to an API in this epic.
- Do not install automated-test tooling.

## Migration sequence

1. Record this contract and the baseline inventory.
2. Move layout, routing and shared UI primitives.
3. Separate Projects, Project Workflow Board and Workflow Templates.
4. Remove the dormant Issue Board only after `rg` proves zero production consumers.
5. Move Dashboard transport types into the API layer.
6. Add lint restrictions for `api/shared -> feature` imports.
7. Run structural and manual regression QA before Reviewer.
8. Decompose the large pages in a separate Story after boundaries are stable.

Every issue must build independently and remain revertible. Compatibility
re-exports may be used during migration, but must be removed before the Story
is approved.

## Rollback

- Issue rollback: revert the issue squash commit on the Story branch.
- Story rollback: revert the Story merge commit on `develop`.
- Release rollback: revert the release merge commit on `master` and redeploy
  the prior tag.
- No data migration is involved; this epic changes source ownership only.

## Completion checks

- No `src/features/shared`, `src/features/workflow-board` or
  `src/features/issue-board` directory remains.
- `src/shared` imports no feature.
- `src/api` imports no feature.
- Projects imports no internal Project Workflow Board implementation.
- Lint, strict typecheck, production build and `git diff --check` pass.
- Production build still reports 27 routes.
- Manual QA passes before Reviewer approval.
