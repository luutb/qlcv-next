# ST-012 QA — Shared Profile Documents

Date: 2026-07-30

Verdict: PASS

Final technical review: APPROVE

## Scope validated

- Secured profile-document list, upload, download and soft-delete.
- User 360 lazy tab and self-service documents on `/settings/profile`.
- Original filename persistence and safe download headers.
- Four-role user policy, authoritative actions and actionable failures.

## Static gates

| Gate | Result |
| --- | --- |
| Frontend `npm run lint` | PASS |
| Frontend `npm run typecheck` | PASS |
| Frontend `npm run build` | PASS — 27 routes |
| Frontend `git diff --check` | PASS |
| Backend `go test ./...` | PASS |
| Backend `go vet ./...` | PASS |
| Migration `009_profile_documents_original_filename.sql` | PASS on existing local database |

## Runtime API evidence

| Scenario | Evidence | Result |
| --- | --- | --- |
| Unauthenticated list | `401` | PASS |
| Self list capability | SUPER_ADMIN, PARTNER, LAWYER and ACCOUNTANT return `200`, `actions.upload=true` | PASS |
| SUPER_ADMIN reads LAWYER | `200` | PASS |
| PARTNER targets SUPER_ADMIN | list, direct guessed download and direct guessed delete all `403` | PASS |
| LAWYER/ACCOUNTANT target another user | `403` | PASS |
| Invalid entity type / UUID / missing file | `400` | PASS |
| Missing entity/document UUID | `404` | PASS |
| Clean Vietnamese filename round-trip | upload `201`, download `200`, payload byte-for-byte equal | PASS |
| Title differs from filename | response preserves both values; download uses original filename | PASS |
| UTF-8 download header | `filename="h_-s_-ST012.txt"; filename*=UTF-8''h%E1%BB%93-s%C6%A1-ST012.txt` | PASS |
| Omitted title | defaults to `hồ-sơ-ST012.txt` | PASS |
| Delete lifecycle | delete `200`; subsequent download `404` | PASS |
| Malware | EICAR fixture returns `400`, `MALWARE_DETECTED` | PASS |
| Scanner framing | real ClamAV `stream: OK\0` accepted after NUL-terminator fix | PASS |

All created clean-document fixtures were soft-deleted after validation. The
EICAR test string was rejected before persistence.

## Browser smoke evidence

- SUPER_ADMIN can open a LAWYER User 360 and see the `Hồ sơ đính kèm` tab.
- Opening the tab triggers an entity-scoped profile-document request lazily.
- Upload controls render from the authoritative list capability.
- LAWYER and ACCOUNTANT can manage their own documents from
  `/settings/profile` without access to the administrative `/users` route.
- The self-profile document panel renders at a 390 px viewport.
- No browser console or runtime exceptions were observed.

## Non-blocking residual risks

- The local fixture has one tenant, so a second-tenant runtime UUID was not
  available. Handler lookups and mutations explicitly include
  `organization_id`, and an unknown UUID returns `404`.
- A multipart body larger than 50 MiB was not transmitted end-to-end. The
  bounded-reader exact/over-limit tests pass, `MaxBytesReader` guards the full
  request, and the browser rejects a selected file above 50 MiB.
- Customer UI reuse remains deferred to ST-020. The generic customer backend
  policy was reviewed statically but is not part of this browser gate.
