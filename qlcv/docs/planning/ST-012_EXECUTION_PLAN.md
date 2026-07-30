# ST-012 Execution Plan — Shared Profile Documents

Status: Complete — QA PASS, Reviewer APPROVE

Story branch: `story/QLCV-ST-012-profile-documents`

Product roadmap: `ROADMAP_V1.md` / `ST-012`

## Outcome and scope

Deliver a reusable profile-document panel backed by a secured API and integrate
it into User 360. The component and API contract remain generic for Customer
reuse, but Customer UI integration belongs to ST-020.

This Story includes list, upload, download and soft-delete; original filenames;
malware/file-size/forbidden feedback; record actions; and four-role security QA.
It excludes project documents, preview, versioning, folders, bulk operations,
WORM behavior and simulated upload percentages.

## Security gate and role policy

The previous auth-only backend contract is not acceptable for UI delivery.
Every endpoint must resolve the entity/document inside the actor organization
and authorize it independently. RLS remains defense in depth.

| Actor | User target | Read/download | Upload/delete |
| --- | --- | --- | --- |
| `SUPER_ADMIN` | Any same-tenant user | Allow | Allow |
| `PARTNER` | Self or non-`SUPER_ADMIN` | Allow | Allow |
| `PARTNER` | `SUPER_ADMIN` | Deny `403` | Deny `403` |
| `LAWYER`, `ACCOUNTANT` | Self | Allow | Allow |
| `LAWYER`, `ACCOUNTANT` | Other user | Deny `403` | Deny `403` |

For customer compatibility, authenticated same-tenant users may read/download;
only `PARTNER` and `SUPER_ADMIN` may upload/delete. Missing or cross-tenant
entities/documents return `404`; known same-tenant forbidden targets return
`403`.

## Frozen API contract

List returns `data` and a list capability:

```json
{
  "data": [
    {
      "id": "uuid",
      "organization_id": "uuid",
      "entity_type": "user",
      "entity_id": "uuid",
      "title": "Hợp đồng lao động",
      "file_name": "hop-dong.pdf",
      "file_size": 12345,
      "uploaded_by": "uuid",
      "created_at": "RFC3339",
      "actions": { "download": true, "delete": true }
    }
  ],
  "actions": { "upload": true }
}
```

Upload remains multipart with required `entity_type`, `entity_id`, `file` and
optional `title`; it returns a complete row DTO. Download uses the persisted
original `file_name`, with safe ASCII fallback and UTF-8 `filename*`. Delete is
soft-delete and returns the existing message response.

`FILE_TOO_LARGE` and `MALWARE_DETECTED` remain RFC7807 errors. Scanner
infrastructure failures must not be reported as malware.

## Product decisions

- `ProfileDocument` is a dedicated DTO and must not reuse project
  `DocumentRecord`.
- `actions` values are authoritative. Missing upload/download/delete decisions
  deny the operation.
- Existing Fetch/FormData transport cannot expose byte progress. The UI shows a
  truthful indeterminate pending state and prevents duplicate submission; it
  does not display or simulate a percentage.
- `uploaded_by` is displayed as an identifier until the API offers a safe
  uploader projection. The panel does not make privileged user lookups.
- A panel-level `403` must not break the other User detail tabs.

## Issues and ownership

| Issue | Owner | Scope | Status |
| --- | --- | --- | --- |
| `I-0120` Contract/plan | PO, BA, PM | Secure contract and execution plan | `DONE` |
| `I-0121` Backend filename contract | BE DEV1 | Migration, DTO, filename/header and bounded read | `DONE` |
| `I-0122` Backend authorization | BE DEV1 | Entity/document policy, actions and focused tests | `DONE` |
| `I-0123` Reusable panel | FE DEV2 | Correct API DTO, query keys and panel | `DONE` |
| `I-0124` User integration | FE DEV2 | Lazy User detail tab and self-profile access | `DONE` |
| `I-0125` Manual QA | QA | Security/runtime/regression evidence | `PASS` |
| `I-0126` Final review | Reviewer | Technical/security review after QA PASS | `APPROVED` |

Backend ownership is limited to:

- `migrations/009_profile_documents_original_filename.sql`;
- `internal/server/profile_document_handlers.go`;
- focused profile-document handler tests.

Runtime QA exposed an existing ClamAV protocol-framing defect that blocked all
clean uploads. ST-012 therefore also owns the minimal fix and regression tests
in `internal/malware/clamav.go` and `internal/malware/clamav_test.go`.

The backend repository currently has no commits and all files appear untracked.
No clean, reset, broad stage or backend commit is allowed during this Story.

Frontend ownership is limited to:

- `src/api/profile-documents.api.ts`;
- `src/features/profile-documents/**`;
- profile-document integration in `src/features/users/detail/UserDetailPage.tsx`;
- self-service integration in `src/features/profile/ProfilePage.tsx` so
  LAWYER and ACCOUNTANT can exercise their self-document capability.

## Delivery order and gates

1. Freeze the secure contract and add the filename migration.
2. Implement backend policy/DTO and frontend reusable panel in parallel.
3. Integrate the panel into User 360 only after the contract matches.
4. Run static gates and secured local runtime QA.
5. Run Reviewer only after QA PASS; route findings to the responsible owner,
   rerun QA, then rerun Reviewer.

Backend gates:

```bash
gofmt
go vet ./...
go test ./...
```

Frontend gates:

```bash
npm run lint
npm run typecheck
npm run build
git diff --check
```

Runtime QA must cover unauthenticated access, the complete four-role table,
guessed entity/document UUIDs, cross-tenant `404`, invalid input, 50 MiB limit,
malware feedback, ASCII/Vietnamese filename round-trips, title distinct from
filename, delete disappearance, authoritative false actions, indeterminate
upload state, isolated query refresh and ST-011 detail-tab regressions.
