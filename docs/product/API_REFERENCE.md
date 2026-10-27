# QLCV Next — API Master and UI Data Map

**Snapshot gốc:** 2026-09-07  
**Trạng thái:** API/UI mapping tham khảo, không phải xác nhận runtime hiện tại. Xem [Project Status](../PROJECT_STATUS.md); kiểm tra backend đang dùng trước khi dựa vào endpoint/quyền.

Tài liệu này đi cùng `PRODUCT_BLUEPRINT.md`. File BMAD mô tả **cần xây gì**; file này mô tả
**màn hình nào gọi API nào, truyền data gì và nhận data gì**.

---

## 1. Quy ước transport chung

| Hạng mục | Contract backend hiện tại |
| --- | --- |
| Base URL | `/api/v1` |
| Authentication | `Authorization: Bearer <access_token>` cho mọi API nghiệp vụ |
| Write request | FE hiện gửi `Idempotency-Key`; BE hỗ trợ cache/replay write request khi header có mặt, gắn với principal, method, route và fingerprint body |
| Thành công list | Thường `{ "data": [...], "pagination": { "limit", "offset", "count", "total" } }`; một số list nhỏ chỉ `{ "data": [...] }` |
| Thành công entity | Thường `{ "data": { ... } }`; FE adapter phải unwrap một chỗ, không để component đoán envelope |
| Lỗi | RFC 7807 `application/problem+json`: `{ type, title, status, detail, code, meta? }` |
| Tenant | `organization_id` lấy từ auth context phía BE; client không quyết định tenant scope |
| Concurrency | Một số user/profile update dùng `version`, lỗi `428 VERSION_CONFLICT`; không giả định mọi entity đã versioned |
| Date | Date-time ISO 8601; date-only như `due_date` dùng `YYYY-MM-DD` |
| Money | Backend model hiện dùng `float64`; không đổi sang integer/minor-unit nếu chưa có ADR + migration |

### Error map phải có ở UI

| HTTP/code | Ý nghĩa UI |
| --- | --- |
| `401` / `INVALID_CREDENTIALS`, `UNAUTHORIZED` | Login failure hoặc clear session + safe redirect login |
| `403` / `FORBIDDEN`, `TENANT_VIOLATION` | Giữ màn hình/draft, báo không có quyền; không retry mutation mù quáng |
| `404` / `NOT_FOUND` | Entity không tồn tại hoặc không còn trong tenant/context |
| `409` / `PROJECT_COMPLETION_BLOCKED`, `PROJECT_TEAM_ASSIGNMENT_CONFLICT`, `TASK_DEPENDENCY_*` | Hiển thị blocker từ `meta`, mở recovery flow |
| `423` / `WORM_LOCK_ACTIVE`, `BILLING_LOCK_ACTIVE`, `LOCKED` | Render locked state, không tự bỏ lock |
| `428` / `VERSION_CONFLICT` | Reload bản mới, giữ draft và yêu cầu người dùng xác nhận merge/retry |
| `422` / `MALWARE_DETECTED` | Chặn upload, không lưu/preview file nguy hiểm |
| `413` / `FILE_TOO_LARGE`; `415` / `UNSUPPORTED_FILE_TYPE` | Hiển thị giới hạn file trước khi retry |

---

## 2. Canonical data model

### 2.1 Identity, user và team

| Entity | Fields UI cần dùng | Ghi chú |
| --- | --- | --- |
| CurrentUser/User | `id`, `organization_id`, `username`, `email`, `role`, `is_active`, `mfa_enabled`, `version`, `tenant_plan?`, `enabled_feature_flags?`, `actions?` | `/users/me` là current-user canonical FE; role: `SUPER_ADMIN`, `PARTNER`, `LAWYER`, `ACCOUNTANT` |
| Team | `id`, `name`, `description?`, `leader_id?`, `is_active`, `member_count`, timestamps | Một Project có tối đa một Team |
| TeamMember | `user_id`, `username`, `email`, `role`, `team_role`, `is_active`, `joined_at` | Team role: `LEADER`, `MEMBER`, `VIEWER` |

### 2.2 Customer, Project và Task

| Entity | Fields UI cần dùng | Ghi chú |
| --- | --- | --- |
| Customer | `id`, `name`, `tax_code?`, contact fields, archive state, timestamps, `actions?` | Chi tiết có conflict/document context |
| Project | `id`, `customer_id`, `team_id?`, `name`, `hourly_rate`, `status`, `workflow_template_id?`, `current_workflow_step_id?`, `total_contract_value`, `total_paid`, `remaining_amount`, `conflict_status`, opposing-party fields, timestamps, `actions?` | Status canonical: `OPEN`, `DONE`; `ACTIVE/CLOSED` chỉ là legacy FE type, không dùng cho build mới |
| Task | `id`, `project_id`, `parent_task_id?`, `workflow_step_id?`, `title`, `description?`, `status`, `assignee_id?`, `due_date?`, `position`, `is_required`, timestamps, `actions?` | Status: `TODO`, `DOING`, `DONE`, `CANCELLED`; list phẳng, FE build one-level child tree từ `parent_task_id` |
| Dependency | `depends_on_task_id`, `title`, `status`, `created_by`, `created_at` | Cùng Project/tenant; không self/cycle; blocker chưa DONE chặn target chuyển DOING/DONE |
| Comment | `id`, `task_id`, `content`, `author`, timestamps, `edited`, `actions` | `author`: id/name/avatar shape từ BE |
| Review | `id`, `task_id`, `review_request_id`, `reviewer`, `decision`, `content`, `created_at` | Request status: `NOT_REQUESTED`, `PENDING`, `CHANGES_REQUESTED`, `APPROVED` |

### 2.3 Documents, time và finance

| Entity | Fields UI cần dùng | Ghi chú |
| --- | --- | --- |
| Document/ProfileDocument | id, entity/project relation, filename/title, MIME/size, uploader, created time, lock state/actions | Upload multipart; content không đi qua JSON API |
| TimeEntry | `id`, `project_id`, `user_id`, `duration_minutes`, `description`, date/timestamps, billable/invoice-lock data nếu BE trả | Đừng quyết định editability từ UI; dùng BE 423/error/action data |
| Invoice | `id`, `customer_id`, `total_amount`, `status`, `issued_at`, timestamps, `actions?` | `DRAFT`, `UNPAID`, `PAID`, `VOID` |
| ProjectPayment | `id`, `project_id`, type, amount, paid/time metadata | Payment ledger là nguồn `total_paid`/`remaining_amount`, không suy từ Task |

### 2.4 Audit, workflow, dashboard

| Entity | Fields UI cần dùng | Ghi chú |
| --- | --- | --- |
| AuditLog | `id`, actor/user, `entity_type`, `entity_id`, `action`, `before`, `after`, time/hash metadata | Hiển thị actor, time, action, diff; actor null = System |
| WorkflowTemplate/Step | template identity/name/active state; step `id`, `key`, `name`, macro column, sort order, financial trigger config | Workflow step tổ chức board; không phải Project lifecycle |
| DashboardSummary | range, KPIs, issue/task status counts, workflow counts, attention, workload, OKR, billing, due items, attention projects, activity | Aggregate endpoint là nguồn duy nhất cho KPI tổng |

---

## 3. API catalog theo domain

Ký hiệu quyền ở đây là route guard source-level. Handler-level entity/action authorization vẫn có thể
hạn chế hơn. Tất cả non-GET nên gửi Idempotency-Key.

### 3.1 Authentication và profile

| API | Request data | Response data/consumer | Guard |
| --- | --- | --- | --- |
| `POST /auth/login` | `{ username, password, totp_code? }` | token/session response; `LoginForm`, `auth.store` | Public |
| `GET /auth/me` | — | compatibility/diagnostic identity; không dùng làm current-user product source | Auth |
| `GET /users/me` | — | CurrentUser canonical; `auth.store`, Profile | Auth |
| `PUT /users/me` | profile fields + `version` khi contract yêu cầu | Updated CurrentUser; `ProfilePage` | Auth |
| `POST /auth/mfa/enable` | no body | enrollment response (QR/secret shape cần bảo mật) | Auth |
| `POST /auth/mfa/verify` | MFA verification code | MFA verification result | Auth |
| `POST /auth/mfa/disable` | backend contract body/proof cần chốt trước product UX | Updated MFA state | Auth |

**UI data flow:** Login → lưu access token tối thiểu → `GET /users/me` → App Shell/nav/action gates.
Không cache MFA secret/QR vào local storage, query cache log hoặc QA screenshots.

### 3.2 User administration

| API | Query/body | Response/use |
| --- | --- | --- |
| `GET /users` | pagination, search/filter theo implemented contract | User list; `UsersListPage`, Team member selectors |
| `POST /users` | user profile/role/password fields theo contract | Created user; `UserFormModal` |
| `GET /users/{id}` | — | User 360; `UserDetailPage` |
| `PUT /users/{id}` | editable fields + version when required | Updated user; User 360/form |
| `POST /users/{id}/activate` | `{ version }` | Updated user |
| `POST /users/{id}/deactivate` | `{ version }` | Updated user |
| `POST /users/{id}/reset-password` | reset password payload | message/audit |
| `POST /users/{id}/mfa/reset` | — | message/audit |

**Route guard:** all mutations/list are `PARTNER` or `SUPER_ADMIN`; get detail is authenticated at
router, therefore UI must respect response action data and 403/not-found.

### 3.2.1 Employee profile records

Legacy API surface — xác minh route và quyền trên backend hiện hành trước khi dùng:

| API | Query/body | Response/use |
| --- | --- | --- |
| `GET /users/{id}/records` | — | `{ data: EmployeeRecord[] }` |
| `POST /users/{id}/records` | kind, title, issuer, reference, issue/expiry date, note | Tạo metadata record |
| `PUT /users/{id}/records/{record_id}` | metadata như trên | Cập nhật metadata |
| `POST /users/{id}/records/{record_id}/file` | multipart `file` | Gắn PDF/JPEG/PNG tối đa 10 MiB |
| `GET /users/{id}/records/{record_id}/file` | — | URL tải xuống có chữ ký, hạn 15 phút |
| `DELETE /users/{id}/records/{record_id}` | — | Xóa mềm record |

Các route hồ sơ này yêu cầu `admin`. File được lưu trong private object storage; file key không xuất hiện trong response. Metadata bị xóa mềm, không xóa vật lý object trong storage.

### 3.3 Teams

| API | Query/body | Response/use |
| --- | --- | --- |
| `GET /teams` | `include_inactive=true|false` | `{ data: Team[] }`; `TeamsPage`, Project selectors |
| `POST /teams` | `{ name, description?, leader_id? }` | Created Team. Leader phải active cùng org và tự thành `LEADER` member |
| `GET /teams/{id}` | — | Team + members |
| `PUT /teams/{id}` | `{ name?, description?, leader_id?, is_active? }` | Chỉ cập nhật trường được gửi. `description: null` xóa mô tả; `leader_id: null` bỏ trưởng nhóm; `is_active: true` kích hoạt lại. Đổi trưởng nhóm upsert `LEADER`, chuyển trưởng nhóm cũ về `MEMBER` |
| `DELETE /teams/{id}` | — | Archive, không hard delete; 409 `TEAM_HAS_OPEN_PROJECTS` nếu còn Project OPEN |
| `GET /teams/{id}/members` | — | `{ data: TeamMember[] }` |
| `POST /teams/{id}/members` | `{ user_id, team_role }` | Add **hoặc update/upsert** member; không có PATCH member endpoint |
| `DELETE /teams/{id}/members/{user_id}` | — | 409 `TEAM_MEMBER_HAS_OPEN_TASKS` nếu còn task TODO/DOING được giao |

**Route guard mutation:** `PARTNER`, `SUPER_ADMIN`. **Màn hình:** `TeamsPage`; `ProjectsPage` chỉ đọc
Team list; Work Board/Task drawer phải dùng assignable-user API chứ không dùng toàn bộ Team member list.

### 3.4 Customers

| API | Query/body | Response/use |
| --- | --- | --- |
| `GET /customers` | pagination/search, deleted filter theo adapter | Customer list; `CustomersListPage`, Create Project selector |
| `POST /customers` | CustomerRequest (name/tax/contact fields) | Created Customer |
| `GET /customers/{id}` | — | Customer detail |
| `PUT /customers/{id}` | CustomerRequest | Updated Customer |
| `DELETE /customers/{id}` | — | Soft delete/archive message |
| `POST /customers/{id}/restore` | — | Restore message |
| `GET /customers/{id}/conflicts` | — | Conflict list |
| `POST /customers/{id}/conflicts` | opposing party/conflict payload | Created conflict/message |

**Màn hình:** `CustomersListPage`, `CustomerDetailPage`, `CustomerProjectsTab`, `CreateProjectModal`.
Project list must call `GET /projects?customer_id={id}`, not derive from local Customer cache.

### 3.5 Projects và compatibility workflow

| API | Query/body | Response/use |
| --- | --- | --- |
| `GET /projects` | `customer_id?`, `status?`, pagination | Project list; Projects, Customer detail, Work Board metadata |
| `POST /projects` | `{ customer_id, team_id?, name, hourly_rate, workflow_template_id?, total_contract_value, opposing_party_*? }` | Created Project → deep link Project detail |
| `GET /projects/{id}` | — | Project aggregate/detail header |
| `PUT /projects/{id}` | editable Project fields | Updated Project |
| `POST /projects/{id}/complete` | `{}` | Project DONE or 409 `PROJECT_COMPLETION_BLOCKED` meta: incomplete required task count, remaining amount, conflict status |
| `POST /projects/{id}/close` | compatibility alias | Do not use as canonical FE action: router authorization currently weaker than `/complete` |
| `PATCH /projects/{id}/team` | `{ team_id: UUID | null }` | Team assignment; 409 assignment conflict |
| `GET /projects/{id}/assignable-users` | — | `{ data: [{ id, username, email, role, team_role }] }`; sole assignee selector source |
| `GET /projects/{id}/tasks` | pagination/filter | Flat Task list for Project detail/tree |
| `GET /projects/{id}/history` | `limit`, `offset` | Entity audit history |
| `GET /projects/board` | `workflow_template_id` | Legacy/compatibility Project workflow board |
| `PATCH /projects/{id}/workflow-step` | legacy target step + financial payload | Compatibility workflow mutation |
| `POST /projects/{id}/override-conflict` | `{ override_justification }` | Conflict override; UI requires ≥50 chars, BE contract/error must be smoke-tested |

**Route guard:** create/update/list/get authenticated; team/override/complete require `PARTNER` or
`SUPER_ADMIN`; compatibility `/close` is documented security drift. **Màn hình:** Projects list/detail,
Customer Projects tab, legacy `WorkflowBoardPage`.

### 3.6 Tasks / Work Board (canonical)

| API | Query/body | Response/use |
| --- | --- | --- |
| `GET /tasks` | `project_id?`, `assignee_id?`, `status?`, `q?`, paging | Flat Task list; user assigned work, dependency candidates |
| `POST /tasks` | `{ project_id, parent_task_id?, is_required?, workflow_step_id?, title, description?, status?, assignee_id?, due_date?, position? }` | Created Task |
| `GET /tasks/{id}` | — | Task detail/drawer |
| `PUT /tasks/{id}` | Complete Task payload | Updated Task |
| `PATCH /tasks/{id}/status` | `{ status }` | Updated Task; 409 if incomplete dependency on DOING/DONE |
| `PATCH /tasks/{id}/workflow-step` | `{ workflow_step_id?, position? }` | Updated Task/board column |
| `PATCH /tasks/{id}/assignee` | `{ assignee_id: UUID | null }` | Updated Task; validates Project Team member |
| `PATCH /tasks/reorder` | `{ items: [{ id, position }] }` | Reordered message |
| `DELETE /tasks/{id}` | — | Deletes Task; parent deletion cascades child task |
| `GET /tasks/board` | `workflow_template_id`, board filters as implemented | `{ workflow_template_id, columns[], unassigned_tasks? }`; Work Board |
| `GET /tasks/{id}/dependencies` | — | `{ data: Dependency[] }` |
| `POST /tasks/{id}/dependencies` | `{ depends_on_task_id }` | Dependency; checks same Project/tenant/self/cycle |
| `DELETE /tasks/{id}/dependencies/{dependency_id}` | — | message |
| `GET/POST /tasks/{id}/comments` | list query / `{ content }` | Task comments |
| `PATCH/DELETE /tasks/{id}/comments/{comment_id}` | `{ content }` / — | Update/delete comment |
| `GET /tasks/{id}/reviews` | pagination | reviews + aggregate review status |
| `POST /tasks/{id}/review-requests` | `{ reviewer_ids: UUID[] }` | review request |
| `POST /tasks/{id}/reviews` | `{ decision: APPROVE|REQUEST_CHANGES, content }` | review decision + status |
| `GET /tasks/{id}/history` | paging | Task audit history |

`/issues/*` supports the equivalent Task API including `/issues/{id}/move`; it is compatibility only.
Do not make a second React Query key family or separate UI feature for it.

**Màn hình:** `WorkBoardPage`, `IssueDrawer` (should be renamed TaskDrawer in rebuild),
`TaskDependenciesPanel`, Project detail Tasks tab, User Detail Assigned Work, Entity History panel.

### 3.7 Workflow templates

| API | Query/body | Response/use |
| --- | --- | --- |
| `GET /workflow-templates` | `active?` | Templates/steps for board and Project create |
| `POST /workflow-templates` | template name, macro columns, steps, triggers | Created template |
| `GET /workflow-templates/{id}` | — | Template + steps, Work Board metadata |
| `PUT /workflow-templates/{id}` | template update payload | Updated template |
| `DELETE /workflow-templates/{id}` | — | Archive template |

Mutations: `PARTNER`/`SUPER_ADMIN`. Consumers: `WorkflowTemplateSettingsPage`, Project create,
Work Board, Dashboard filter and compatibility Project workflow board.

### 3.8 Documents and profile documents

| API | Request data | Response/use |
| --- | --- | --- |
| `GET /documents` | Project/context query | Document list |
| `POST /documents` | multipart FormData: project/entity identifiers, file, optional title per contract | Created document/scan result |
| `GET /documents/{id}` | — | Metadata |
| `GET /documents/{id}/download` | — | Blob + content-disposition filename |
| `DELETE /documents/{id}` | — | Delete message; may return lock error |
| `POST /documents/{id}/lock` | — | WORM lock; route guard is `PARTNER` only |
| `GET/POST /profile-documents` | entity-type/id query; multipart upload | Profile document list/upload |
| `GET /profile-documents/{id}/download` | — | Blob download |
| `DELETE /profile-documents/{id}` | — | Delete message |

Consumers: `DocumentsPage`, `ProfileDocumentsPanel`, Project/Customer/User context. Never call
download through JSON parser; use blob/download adapter.

### 3.9 Time entries, invoices and payments

| API | Request data | Response/use |
| --- | --- | --- |
| `GET /time-entries` | Project/user/date filters, pagination | Time entry list |
| `POST /time-entries` | `{ project_id, duration_minutes, description, ... }` | Created time entry |
| `GET /time-entries/{id}` | — | Entry detail |
| `PUT /time-entries/{id}` | editable time entry data | Updated entry or 423 billing lock |
| `DELETE /time-entries/{id}` | — | Delete or 423 billing lock |
| `GET /invoices` | customer/status/paging filters | Invoice list |
| `POST /invoices/generate` | generation payload, normally Project/source entry context | Invoice; guard `PARTNER`/`ACCOUNTANT` |
| `GET /invoices/{id}` | — | Invoice detail |
| `GET /invoices/{id}/time-entries` | — | Source time entries |
| `PUT /invoices/{id}/status` | `{ status }` | Invoice transition result; router currently authenticated |
| `GET /project-payments` | Project filters/paging | Payment ledger list |
| `GET /project-payments/{id}` | — | Payment detail |

Consumers: `TimeEntriesPage`, `InvoicesPage`, `InvoiceDetailPage`, Project detail Billing/Time sections.
Rebuild UX must start flows from Project context and expose source records, even though old pages allow raw ID input.

### 3.10 Labels, audit, dashboard, reports, OKR, admin and metadata

| Domain | APIs | Main consumers/data |
| --- | --- | --- |
| Labels | `GET/POST /labels`, `GET/PUT/DELETE /labels/{id}`, `GET/POST /label-assignments`, `DELETE /label-assignments/{id}` | `LabelsPage`, Work Board label filter/display. Label assignment payload contains label and target entity relationship. |
| Audit | `GET /audit-logs`, `GET /audit-logs/{id}`, `POST /audit-logs/verify`; plus Task/Issue/Project history endpoints | `AuditLogsPage`, `EntityHistoryPanel`; verify route authenticated in BE source, not admin-only. |
| Dashboard | `GET /dashboard/summary` with `range`, custom date pair, `workflow_template_id`, limits | `DashboardPage`; render response aggregate directly. |
| Reports | `GET /reports/tasks/summary`, `/by-assignee`, `/by-status`, `/overdue`, `/reports/workload`, `/reports/okr/summary` | `ReportsPage`, optional dashboard/OKR data. |
| OKR | cycles/objectives/key-results CRUD endpoints | `OkrPage`; create/update/delete guarded Partner/Super Admin as routed. |
| Admin | `POST /admin/purge`, `GET/PUT /admin/tenant-settings` | `PurgePage`, `TenantSettingsPage`; Super Admin only. |
| Metadata | `GET /metadata/schemas/{entity}` | Diagnostic/dynamic schema only; do not make global form dependency without product decision. |

---

## 4. UI → API → data mapping

| UI area / canonical route | Read APIs | Mutation APIs | Data displayed/edited |
| --- | --- | --- | --- |
| Login `/login` | — then `GET /users/me` | `POST /auth/login` | credentials → token → current user role/flags |
| Dashboard `/dashboard` | dashboard summary, workflow templates filter | — | range/KPI/workload/attention/due/billing/OKR aggregate |
| Customers `/customers`, `/customers/{id}` | customers, customer, conflicts, projects by customer | customer CRUD, restore, conflict create | Customer identity/contact, conflicts, Project summary |
| Projects `/projects`, `/projects/{id}` | projects, project, teams, assignable users, project tasks, payments, time entries, history | create/update/complete/team/override; later task/time/document mutations | Project finance/conflict/team, Task tree, billing/history |
| Teams `/teams` | teams, team members, users selector | team CRUD/archive, member POST upsert/delete | Team details, leader and memberships |
| Work `/work` | tasks board, tasks/detail, Project metadata, assignable users, workflow templates, labels, comments/reviews/dependencies | Task mutations, comment/review/dependency mutations | Task board/drawer, child tree, assignee, status, step, dependency, review |
| Workflow templates settings | templates/template | template create/update/archive | macro columns, steps, financial triggers |
| Documents | documents/profile documents | upload/delete/lock | metadata, file/blob download, lock/scan state |
| Time entries | time entries | create/update/delete | Project, duration, description, billing lock state |
| Invoices | invoices, invoice/time entries, Project payments | generate/update status | invoice amounts/status and source time entries |
| Users/Profile | users/user/current user/tasks by assignee | user lifecycle/profile/MFA actions | profile, role, active status, assigned work |
| Audit/Reports/OKR/Admin | respective list/summary/settings APIs | verify, OKR CRUD, admin mutations | immutable audit, aggregate reports, objectives/settings |

---

## 5. Query and cache rules for rebuild

- Query keys are resource-centric and canonical: `task(id)`, `taskList(filters)`, `taskBoard(template, filters)`,
  `project(id)`, `projectTasks(id)`, `projectAssignableUsers(id)`, `team(id)`, `documentList(context)`.
- Never key the same Task data independently as `issue` and `task`.
- After Task mutation invalidate/refetch affected task, list/board, Project task summary and history. After Team
  assignment also invalidate `projectAssignableUsers`, Project detail and relevant Task selectors.
- On version conflict or 423, do not discard local draft; refetch canonical entity, mark stale and require a user decision.
- Dashboard/report cache must not be manually patched from partial list changes unless a verified aggregate invalidation policy exists.

---

## 6. Contract test checklist

For every Release-1 endpoint used by UI, capture a real response/error fixture from local integration or staging:

1. Valid response and envelope shape.
2. Unauthorized and forbidden response.
3. Tenant boundary/not-found behavior.
4. Validation failure and stable error `code`.
5. Idempotent replay for each mutation.
6. Role-specific flow, lock/version conflict and business blocker where applicable.
7. Pagination/filter semantics for lists.
8. Audit event created for material mutation.

Minimum high-risk fixtures: Project complete blocked, Project Team assignment conflict, Task dependency cycle/
incomplete blocker, time entry billing lock, document malware/WORM lock, user version conflict and invoice transition.
