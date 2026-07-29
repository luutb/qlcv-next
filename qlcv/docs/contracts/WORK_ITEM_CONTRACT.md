# Work Item Contract Decision

Decision ID: QLCV-I-0012

Status: Accepted for frontend architecture; runtime unverified

Date: 2026-07-29

## Context

The product calls the experience **Work Board** and the UI entity **Issue**.
The backend domain entity is a project task. The SRS declares both `/issues/*`
aliases and `/tasks/*` endpoints, while the current `issues.api.ts` models a
different status-column board and rejects every request.

## Decision

- Canonical product route: `/work`.
- Canonical frontend feature vocabulary: `Issue` and `Work Board`.
- Preferred transport: `/api/v1/issues/*` when the aliases declared by the SRS
  are available.
- Fallback transport: `/api/v1/tasks/*`, hidden behind the same Work Item
  repository adapter if staging proves that issue aliases are unavailable.
- Feature components must consume normalized Work Item types and must not depend
  on whether the transport path says `issues` or `tasks`.
- `tasks.api.ts` remains the repository for Project Tasks use cases until the
  adapter is implemented in ST-030.

This decision does not activate the current rejecting issue repository. The
production adapter and removal of Work Board fixtures belong to ST-030/ST-031.

## Canonical types

### Status

```text
TODO
DOING
DONE
CANCELLED
```

Status is an internal task state. It never defines board columns.

### Work item

```ts
type WorkItem = {
  id: string;
  organization_id: string;
  project_id: string;
  workflow_step_id: string | null;
  title: string;
  description: string | null;
  status: "TODO" | "DOING" | "DONE" | "CANCELLED";
  assignee_id: string | null;
  due_date: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  actions?: Partial<{
    edit: boolean;
    delete: boolean;
    move: boolean;
    assign: boolean;
  }>;
};
```

The base contract does not assume embedded project/customer names, priority,
labels, avatar or creator. Those fields may be normalized from a verified
response or enriched through cached repositories.

### Board

```ts
type WorkBoard = {
  workflow_template_id: string;
  columns: Array<{
    workflow_step_id: string;
    step_key: string;
    step_name: string;
    macro_column: "INTAKE" | "IN_PROGRESS" | "BILLING" | "ARCHIVED";
    sort_order: number;
    tasks: WorkItem[];
  }>;
  unassigned_tasks: WorkItem[];
};
```

Columns are ordered workflow steps. `unassigned_tasks` contains tasks without a
valid workflow step and is not a status bucket.

## Query contract

Supported filters:

| Parameter | Type | Meaning |
| --- | --- | --- |
| `limit` | number | Page size for list mode |
| `offset` | number | Offset for list mode |
| `workflow_template_id` | UUID | Select dynamic board structure |
| `project_id` | UUID | Filter by project |
| `workflow_step_id` | UUID | Filter by step in list mode |
| `assignee_id` | UUID | Filter by assignee |
| `status` | Work Item status | Filter internal task state |
| `q` | string | Search title/description supported by BE |
| `include_unassigned` | boolean | Request `unassigned_tasks` |

The frontend must not send the prototype fields `priority`, free-text `label`
or `search` unless staging accepts an explicitly documented extension.

## Mutation contract

| Action | Preferred endpoint | Payload |
| --- | --- | --- |
| Create | `POST /issues` | Project, workflow step, title and editable task fields |
| Full edit | `PUT /issues/{id}` | Full verified update DTO |
| Move step | `PATCH /issues/{id}/workflow-step` | `{ workflow_step_id, position? }` |
| Move alias | `POST /issues/{id}/move` | `{ workflow_step_id, position? }` |
| Change status | `PATCH /issues/{id}/status` | `{ status }` |
| Change assignee | `PATCH /issues/{id}/assignee` | `{ assignee_id }` |
| Reorder | `PATCH /issues/reorder` | Verified ordered IDs/positions payload |
| Delete | `DELETE /issues/{id}` | No domain fields |

Drag/drop uses a specialized workflow-step/move endpoint, never a full update.
Reordering in the same column uses the reorder endpoint.

## Client behavior

- Include unassigned tasks when the board response provides them.
- Optimistically move/reorder only after snapshotting the affected columns.
- On failure, restore the snapshot and show the typed error.
- An invalid workflow step triggers refetch of board/template data.
- Changing status must not move a card to another workflow column.
- `assignee_id: null` means unassigned.
- Missing `actions` must not crash the UI. The approved role policy provides a
  conservative fallback and the backend `403` remains authoritative.
- Labels are managed through `/label-assignments` unless the verified Work Item
  DTO provides an accepted embedded representation.

## Transport normalization boundary

The ST-030 adapter will normalize transport variants once, before data reaches
React Query or UI components. Examples requiring explicit normalization:

- response item key `tasks` versus `issues`;
- macro key `macro_column` versus another verified backend field;
- wrapper `{ data, pagination }` versus a bare list;
- optional `actions` members;
- missing enrichment fields.

UI code must not contain endpoint-specific compatibility branches.

## Manual verification required before runtime activation

Using redacted staging evidence, BA/QA must verify:

1. List, board and detail response shapes.
2. Dynamic workflow-step ordering and unassigned tasks.
3. Create and full edit DTOs.
4. Cross-column move and same-column reorder payloads.
5. Status and assignee mutations, including `null` assignee.
6. At least one permission error and one invalid-step error.
7. Idempotency-key replay behavior for mutations.

Until this evidence exists, capability status remains `BLOCKED`/runtime
unverified in the capability matrix. No credential or customer data may be
stored in the evidence.

## Consequences

- ST-030 can replace the current prototype without redesigning board semantics.
- Existing `IssueStatus`, `IssueBoardColumn` and `MoveIssueRequest` types are
  known migration targets, not accepted contract types.
- Priority, embedded labels and rich activity remain excluded until backend
  support is verified.
