# ST-03 API client comparison and migration decision

## Audit metadata

- Issue: `IS-03.1.1`
- Story branch: `story/st-03-api-services`
- Audited base: `fc68b76eb24eac36699d3060fa2ad7b658d63032`
- Scope: read-only comparison of `src/api/client.ts` and `src/services/api/client.ts`, their current consumers, tracked environment configuration, and relevant ST-01 decisions
- Out of scope: changing transport behavior, selecting an unverified backend envelope, migrating consumers, deleting the legacy layer, or implementing `IS-03.1.2` and later Issues

## Decision

`src/services/api/client.ts` is the canonical target. `src/api/client.ts` is a frozen legacy compatibility surface until its consumers have migrated and the removal gates in `IS-03.4` pass.

This decision is supported by all of the following:

1. `docs/ROADMAP.md` explicitly selects `src/services` and `src/services/api/client.ts` as the target architecture.
2. ST-01 assigns canonical transport ownership to `src/services/api/client.ts`, permits `src/api/client.ts` only as a temporary adapter, and requires consumer and test evidence before deletion.
3. The two current files have identical executable content. Their only diff is the missing final newline in `src/services/api/client.ts`; therefore choosing the services path does not discard a distinct implementation.
4. Existing domain services already depend on the services client, while the old path is coupled to direct page/context calls, `src/api/services`, and legacy repositories that ST-03 explicitly plans to migrate.

This audit does **not** accept the current client behavior as a verified backend contract. It selects ownership and records the behavior that later Issues must validate or change.

Despite their identical source behavior, the two modules are not one runtime client. Each module executes its own `new ApiClient()`, creating a separate Axios instance, interceptor set, `isRefreshing` flag, and `failedQueue`. Because both paths have active consumers, concurrent 401 responses can start independent refresh requests and race while writing tokens. A temporary legacy adapter must therefore delegate to the canonical exported singleton; copying or retaining both implementations would preserve the refresh race and possible token overwrite.

## Exact file comparison

At the audited base:

| Evidence | `src/api/client.ts` | `src/services/api/client.ts` | Interpretation |
|---|---:|---:|---|
| Lines reported by `wc -l` | 240 | 239 | The canonical file lacks an EOF newline. |
| SHA-256 | `0c31201cf239a6d6c594ab44deda6d9fb52eb3cb1920db5f436a9a1336c86db8` | `aeb3efe61ea4d2673c23c79742048ff848150033bd4b7feeb195061932b1d5b9` | Byte hashes differ only because of EOF. |
| Unified diff | one EOF-newline marker | one EOF-newline marker | No executable, type, import, or comment difference. |

Both files currently implement the same behavior:

| Concern | Current shared behavior | Owning follow-up |
|---|---|---|
| Base URL | Reads browser-exposed `NEXT_PUBLIC_API_URL` directly; no runtime validation or fallback. | `IS-03.1.2` |
| Defaults | Axios instance with JSON `Content-Type` and 30-second timeout. | `IS-03.1.2` |
| Request identity | Generates a new `X-Request-ID` with `Math.random` for each intercepted request. | `IS-03.1.2` |
| Access token | Reads `token` from a cookie, then browser local storage, and adds `Authorization: Bearer ...`. | `IS-03.1.3` |
| Refresh | On the first 401, reads `refresh_token`, sends a separate Axios request to `${NEXT_PUBLIC_API_URL}/auth/refresh`, accepts `token` or `access_token`, queues concurrent 401 requests, stores tokens, and retries. | `IS-03.1.3` |
| Expired session | Removes token/user/role cookies and local-storage entries, then redirects browser clients to `/login`. | `IS-03.1.3`, coordinated with ST-06 |
| Error mapping | Converts most interceptor failures to a plain `{ message, code, details }`; uses `any` internally and discards status, headers, request ID, and original cause. | `IS-03.1.4` |
| Success mapping | CRUD and upload helpers return `response.data` while declaring `Promise<ApiResponse<T>>`. Delete/no-content behavior is not modeled separately. | ST-02 response contract, then `IS-03.1.2`/`IS-03.1.4` |
| Multipart | Builds `FormData`, appends one field named `file`, explicitly sets multipart `Content-Type`, and optionally reports percentage when total size exists. | `IS-03.1.2` |
| Download | Requests a blob and triggers a browser DOM download; filename defaults to `download`. | `IS-03.1.2` plus owning attachment/export domain |
| Logging | In development, logs request payloads, response payloads, and error response payloads. The environment guard avoids intended production logging but does not make payload logging safe. | `IS-03.1.5` |
| Escape hatch | Exposes the raw Axios instance through `.axios`; no current source consumer was found. | Remove or narrowly justify during `IS-03.1.x` |

## Configuration evidence

- `README.md` documents the name `NEXT_PUBLIC_API_URL`.
- `.env.production.example` gives a public API URL example ending in `/api/v1`.
- `docker-compose.yml` forwards `NEXT_PUBLIC_API_URL` as a build argument.
- Both clients use that value both as Axios `baseURL` and as the prefix for refresh. No tracked runtime validation was found.
- One Cost Centers page directly constructs a URL from the same variable; other direct `fetch` calls use relative `/api...` paths. These bypasses belong to `IS-03.3.4`, not this Issue.

No local or untracked environment files, secret values, credentials, or tokens were inspected. The tracked example URL was read only as repository configuration evidence; no live endpoint was contacted and no production request was made. No backend repository or OpenAPI document was available in this workspace, so URL joining and endpoint existence remain unverified.

## Direct consumer graph

The counts below are static TypeScript/TSX import/export sites. They do not claim runtime route coverage.

### Legacy client: 23 direct importers

| Layer | Count | Paths |
|---|---:|---|
| Legacy API services | 2 | `src/api/services/auth.service.ts`, `src/api/services/label.service.ts` |
| Repositories | 10 | `BudgetRepo.ts`, `BudgetRepository.ts`, `ContractTypeRepo.ts`, `CustomerRepo.ts`, `SettingsRepo.ts`, `TaskAssigneesRepository.ts`, `TaskRepo.ts`, `TimeTrackingRepository.ts`, `UserRepo.ts`, `WorkflowRepo.ts` under `src/repositories/` |
| Contexts | 2 | `src/contexts/AuthContext.tsx`, `src/contexts/NotificationContext.tsx` |
| Pages | 9 | Accountant overview, Admin overview, Admin reports, Analytics, Board, Manager overview, shared Profile, shared Task detail, and Staff overview pages |

The complete page set is:

- `src/app/(dashboard)/accountant/page.tsx`
- `src/app/(dashboard)/admin/page.tsx`
- `src/app/(dashboard)/admin/reports/page.tsx`
- `src/app/(dashboard)/analytics/page.tsx`
- `src/app/(dashboard)/board/page.tsx`
- `src/app/(dashboard)/manager/page.tsx`
- `src/app/(dashboard)/shared/profile/page.tsx`
- `src/app/(dashboard)/shared/tasks/[id]/page.tsx`
- `src/app/(dashboard)/staff/page.tsx`

The layer split is 2 legacy services + 10 repositories + 2 contexts + 9 pages = **23**. `TaskRepository.ts` is a barrel for `TaskRepo.ts` and does not itself import the client.

### Canonical client: 9 direct consumers plus one barrel export

| Layer | Count | Paths |
|---|---:|---|
| Canonical domain services | 7 | `budget.service.ts`, `case.service.ts`, `customer.service.ts`, `label.service.ts`, `task.service.ts`, `user.service.ts`, `workflow.service.ts` under `src/services/` |
| Repository not yet migrated to a service | 1 | `src/repositories/WorkloadRepository.ts` |
| Direct page bypassing a domain service | 1 | `src/app/(dashboard)/manager/tasks/gantt/page.tsx` |
| Barrel export | 1 | `src/services/index.ts` |

The services path is therefore the architectural target but is not yet a clean service-only boundary. Workload and Gantt still require domain-service migration.

### Indirect migration edges

- `useAuth` and `useLabels` consume the two legacy API services.
- Admin Contract Types, Settings, Users, and Workflows; shared Customers/Profile; manager Task creation/list flows; Cost Centers; Workload components; and several hooks consume repositories.
- `src/services/auth.service.ts` only re-exports the legacy auth service, so its canonical-looking path is currently an adapter alias rather than a migrated implementation.
- Direct page/context imports of either client bypass domain services and must move to a named service before the old client can be removed.
- Eight direct `fetch` call sites were found across Labels, Cost Centers, and Subtasks. They are separate `IS-03.3.4` migration inputs.

## Response and error contract hazards

The two clients import `ApiResponse` and `ApiError` from the monolithic `@/types`, not from `src/types/api/index.ts`. Both locations currently define similar interfaces, so type ownership is duplicated.

Current callers also make incompatible assumptions:

- canonical services generally read `response.data`;
- some repositories type the result as `{ data: T } | T` and normalize both shapes;
- other repositories and pages directly destructure `.data`;
- auth comments claim the login endpoint returns data directly while the code still reads an envelope;
- generic delete helpers declare `ApiResponse<T>`, although a real 204 response would have no body.

Static code cannot determine whether the backend returns `{ data, success, message }`, raw entities, endpoint-specific shapes, or a mixture. A bulk import replacement could compile while preserving a wrong double-unwrapping or no-content assumption. Before changing the generic return contract, obtain backend/OpenAPI or characterization evidence for representative success, pagination, auth, error, upload, blob, and 204 responses.

The current plain error object is also incompatible with `src/lib/errors.ts`, whose `extractErrorMessage` expects an Axios-like object containing `response.data`. Once the interceptor normalizes an error, that helper cannot recover the response code through its current path. `IS-03.1.4` must select one typed error contract and migrate consumers without hiding uncertainty behind `any`.

## Security and behavior risks to preserve explicitly

These are findings, not changes authorized by this Issue:

1. Development logging includes arbitrary request/response bodies and can expose passwords, tokens, personal data, attachments metadata, or financial data on developer machines and shared logs.
2. Access and refresh tokens are readable by JavaScript in both cookies and local storage; cookie flags and session ownership require coordination with ST-06 and a verified backend design.
3. Refresh uses a separate Axios call, so it bypasses the configured instance, request ID, timeout, and normal interceptors.
4. A missing token in a successful refresh response is not validated before storage, queue resolution, and retry.
5. `originalRequest` and `originalRequest.headers` are asserted present on 401 paths; network/config edge cases are not characterized.
6. Explicit multipart `Content-Type` may interfere with boundary generation depending on runtime/Axios behavior; this must be tested, not inferred.
7. Download ignores server filename/content-disposition and is browser-only.
8. Request IDs are client-generated but not propagated into normalized errors, reducing supportability.

## Migration boundary and sequence

1. Freeze `src/api/client.ts`: no new consumers and no independent fixes. If compatibility is needed, replace it later with a thin delegation adapter rather than retaining a second interceptor/token/queue implementation.
2. In `IS-03.1.2` through `IS-03.1.5`, verify and implement the canonical transport contract only in `src/services/api/client.ts`, with focused characterization/contract tests.
3. Complete named domain services in `TK-03.2`. Do not silently invent Contract Type, Notification, attachment, payment, reporting, or Workflow contracts; retain the ST-01 `KEEP` boundaries and their backend/security gates.
4. Migrate consumers by domain/import family in `TK-03.3`, adapting return mapping deliberately. Replace direct client and direct `fetch` calls with domain services rather than merely changing the import path.
5. If the old import must remain during migration, make it delegate to the canonical singleton so there is only one refresh state and failed-request queue.
6. Remove legacy services/repositories/client only after static and dynamic import searches are empty, focused contract tests and UI smoke checks pass, and the pre-ST-05 baseline shows no new regression.
7. Add the `IS-03.4.4` import restriction only after approved migrations, so it prevents recurrence without concealing existing consumers.

## Exit status for `IS-03.1.1`

The comparison and ownership decision are complete. It is safe for the coordinator to send this documentation-only diff to the Issue QA gate. No source file, backend contract, backlog checkbox, or review verdict was changed here.

Open dependencies for implementation remain:

- authoritative API success/pagination/error/no-content schemas;
- refresh request/response and session-storage policy;
- multipart and download behavior, including authorization and filename rules;
- safe observability/redaction rules;
- ST-02 ownership of the one exported API response/error type;
- focused client test infrastructure and the baseline rules until ST-05 passes.

## Reproducible evidence commands

Run from the repository root:

```sh
cmp -s src/api/client.ts src/services/api/client.ts
shasum -a 256 src/api/client.ts src/services/api/client.ts
wc -l src/api/client.ts src/services/api/client.ts
diff -u src/api/client.ts src/services/api/client.ts
rg -n --glob '*.ts' --glob '*.tsx' "from ['\"](?:@/api/client|@/services/api/client|\./api/client)['\"]" src
rg -n --glob '*.ts' --glob '*.tsx' "from ['\"]@/(?:api/services|repositories)(?:/[^'\"]*)?['\"]" src
rg -n --glob '*.ts' --glob '*.tsx' "\\bfetch\\s*\\(|from ['\"]axios['\"]|axios\\." src
rg -n "NEXT_PUBLIC_API_URL" src README.md .env.production.example docker-compose.yml
rg -n "src/services/api/client|src/api/client" docs/ROADMAP.md docs/audits/ST-01-COMMIT-HISTORY.md docs/audits/ST-01-MODULE-SCOPE.md
git log --all --oneline -- src/api/client.ts src/services/api/client.ts
git diff --check
```
