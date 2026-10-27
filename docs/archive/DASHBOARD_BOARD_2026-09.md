# Dashboard và board — tài liệu tháng 09/2026

> Tài liệu lịch sử tháng 09/2026. Endpoint, số liệu mẫu và trạng thái bên dưới cần được đối chiếu lại trước khi sử dụng; không phải backlog hiện hành.

## Nội dung

- [Yêu cầu BE cho dashboard và issue-board](#handoff)
- [UI Reference Data Completion Backlog](#backlog)

<a id="handoff"></a>

## Yêu cầu BE cho dashboard và issue-board

Ngày rà soát: 2026-09-22. Nguồn đã đọc: `/Users/sapo/golang/qlcv-work-board/internal/server/`.
Đây là handoff trong workspace FE, chưa gửi lên hệ thống giao việc bên ngoài.

### P0 — sửa chức năng đang bị chặn

### Yêu cầu gửi BE — màn Công việc

FE hiện đã gọi trực tiếp các route canonical sau:

| Chức năng | Method + endpoint | Đã nối ở FE |
| --- | --- | --- |
| Tải board theo workflow/project | `GET /api/v1/tasks/board?workflow_template_id=&project_id=&include_unassigned=true` | Có |
| Fallback tải task theo project | `GET /api/v1/tasks?project_id=&limit=&offset=` | Có |
| Chi tiết task | `GET /api/v1/tasks/{id}` | Có |
| Tạo task | `POST /api/v1/tasks` | Có |
| Sửa task | `PUT /api/v1/tasks/{id}` | Có, đang bị lỗi SQL BE nêu dưới đây |
| Đổi trạng thái | `PATCH /api/v1/tasks/{id}/status` | Có |
| Chuyển workflow step | `PATCH /api/v1/tasks/{id}/workflow-step` | Có |
| Sắp xếp | `PATCH /api/v1/tasks/reorder` | Có |
| Người nhận việc | `GET /api/v1/projects/{id}/assignable-users` | Có |
| Bình luận | `GET/POST /api/v1/tasks/{id}/comments` | Có |

Đề nghị BE xác nhận bằng OpenAPI/example payload và integration test cho toàn bộ bảng trên.
FE không dùng các route compatibility `/issues/*` khi `/tasks/*` đã đủ contract.

BE cần bổ sung/sửa:

1. Sửa placeholder SQL của `PUT /tasks/{id}` từ `WHERE id = $13 AND organization_id = $14` thành đúng tham số `taskID/orgID` ở cuối query. Hiện thao tác sửa từ board có thể trả 404 dù task tồn tại.
2. Board response cần trả `actions.edit`, `actions.comment`, `actions.request_review`, `actions.review` cho từng task, giống task detail. Nếu thiếu, FE không thể khóa drag/edit trước khi gọi API và chỉ biết lỗi sau khi bị 403.
3. `PATCH /tasks/{id}/workflow-step` phải kiểm tra step thuộc cùng `workflow_template_id` của project/task, không chỉ cùng organization. Hiện task có thể nhận step của template khác trong cùng tenant.
4. `PATCH /tasks/reorder` cần validate toàn bộ items thuộc cùng project/board, `position >= 0`, không trùng vị trí và task có cùng workflow context; trả 400/403 rõ ràng. Hiện handler transaction hóa update nhưng chưa bảo vệ các invariant này.
5. Chuyển cột và reorder đang là hai request riêng. Cần endpoint transaction nguyên tử hoặc cơ chế version/409 để không lưu trạng thái nửa chừng khi hai người cùng kéo task.
6. Board query cần hỗ trợ và tài liệu hóa `q`, `project_id`, `assignee_id`, `status`, `priority`, `label_id`, pagination/count sau filter. Hiện handler mới lọc một phần và response không có count/metadata card.
7. Board task cần thêm `labels[]`, `comment_count`, `checklist { completed, total }`, `assignee { id, display_name, avatar_url }`, `due_at`, và action flags để khớp card trong ảnh mà không N+1 query.
8. Seed workflow phải xác định rõ Review là workflow step hay status. Task status BE hiện chỉ TODO/DOING/DONE/CANCELLED; FE không tự biến Review thành status.

Tình trạng xác minh: router/handler đã được đọc trực tiếp từ `/Users/sapo/golang/qlcv-work-board`; BE HTTP chưa chạy trong phiên nên chưa thể chứng minh runtime.

### Yêu cầu bổ sung sau khi kiểm tra UI label/card (2026-09-23)

Các mục dưới đây là blocker trực tiếp khiến issue board chưa đạt trải nghiệm kiểu GitLab.
FE hiện có fallback an toàn, nhưng không nên giữ fallback này làm contract chính.

#### BE-BOARD-004 — Đăng ký route board/workflow đang bị thiếu

`internal/server/task_handlers.go` đã có `handleGetTasksBoard` và
`handleUpdateTaskWorkflowStep`, nhưng `internal/server/router.go` hiện chưa đăng ký:

```text
GET   /api/v1/tasks/board
PATCH /api/v1/tasks/{id}/workflow-step
```

BE cần đăng ký hai route dưới `requireAuth`, thêm router tests cho 200/400/401/403/404,
và cập nhật OpenAPI/example response. Nếu chưa có workflow template/step hợp lệ, endpoint
phải trả lỗi contract rõ ràng thay vì để FE rơi về board status giả lập.

#### BE-BOARD-005 — Board aggregate phải trả label/card metadata trong một response

Mở rộng `taskResponse` và `scanTaskBoardRow` trong
`internal/server/task_handlers.go` với:

```json
{
  "labels": [{ "id": "uuid", "title": "Frontend", "color": "#4f46e5", "label_type": "NORMAL" }],
  "comment_count": 3,
  "checklist": { "completed": 2, "total": 5 },
  "assignee": { "id": "uuid", "display_name": "Trần Thị Mai", "avatar_url": null },
  "actions": { "edit": true, "comment": true, "request_review": false, "review": false }
}
```

Join/aggregate labels và comment count theo tập task của board trong query hoặc batch query
transaction-scoped; không tạo một HTTP request cho từng card. Giữ `labels: []` và
`checklist: {completed: 0, total: 0}` khi không có dữ liệu. `due_at` phải là ISO-8601 có
timezone. FE hiện đang gọi `GET /label-assignments` theo task chỉ vì board response thiếu
`labels[]`; đó là workaround tạm thời, cần bỏ sau khi BE ship aggregate.

#### BE-BOARD-006 — Filter label/priority và count sau filter

Trong `handleGetTasksBoard` và `listTasks`, hỗ trợ và tài liệu hóa:

```text
q, project_id, workflow_template_id, assignee_id, status, priority, label_id,
limit, offset
```

`label_id` phải filter qua `label_assignments` với `entity_type = 'task'`, cùng
`organization_id`, và count/column count phải phản ánh kết quả sau filter. Trả metadata
phân trang rõ ràng thay vì để FE tải toàn bộ task rồi lọc cục bộ.

#### BE-LABEL-001 — Tenant/RBAC/integrity cho label assignment

Trong `internal/server/label_handlers.go`:

1. `handleCreateLabelAssignment` phải kiểm tra `label_id` thuộc cùng organization,
   label chưa archived, `entity_type = task` thì `entity_id` là task cùng organization,
   và caller có quyền edit task đó (`authorizeTaskMutation`).
2. `handleDeleteLabelAssignment` phải filter theo `organization_id` và xác minh quyền
   edit entity trước khi xóa; hiện chỉ dùng assignment ID nên có nguy cơ cross-tenant/
   cross-entity mutation nếu ID bị lộ.
3. Duplicate assignment phải trả `409 LABEL_ALREADY_ASSIGNED`, không trả 500 từ unique
   constraint. Cả POST/DELETE cần idempotency/error example và audit event.
4. Nếu labels có `project_id`, `GET /labels` cần tài liệu hóa rõ labels toàn organization
   hay chỉ labels của project; board phải không được nhận label ngoài scope được phép.

#### BE-LABEL-002 — Task detail/list đồng nhất với board

`GET /api/v1/tasks/{id}` và `GET /api/v1/tasks` cũng cần trả `labels[]` đã aggregate,
để task detail/card không phải gọi hai contract khác nhau. Thêm integration tests cho:
label assign/unassign, archived label, duplicate assignment, tenant isolation và role
không được sửa task.

#### BE-BOARD-007 — Atomic move + reorder và optimistic concurrency

FE hiện chuyển cột và reorder bằng hai request riêng. BE nên thêm một mutation nguyên tử,
ví dụ `PATCH /api/v1/tasks/{id}/move` với `{ workflow_step_id, before_task_id,
expected_version }`, hoặc hỗ trợ version/ETag cho cả hai route hiện tại. Trả `409
VERSION_CONFLICT` khi board đã stale; transaction phải cập nhật step + positions cùng lúc.

#### BE-BOARD-008 — Seed và contract smoke cho board

Cung cấp seed tối thiểu cho một project có workflow To do/In progress/Review/Done, ít nhất
6 task, 4 label màu khác nhau, assignee, comment và checklist. Gửi kèm OpenAPI/example
payload và smoke test authenticated cho board, filter label, kéo cột, reorder, 401/403/409.

#### BE-BOARD-001: PUT task dùng sai SQL placeholders

File `task_handlers.go`, hàm `handleUpdateTask`, khoảng dòng 596–606:

```sql
position = $13, is_required = $14, updated_at = NOW()
WHERE id = $13 AND organization_id = $14
```

Hai tham số cuối truyền vào query là `taskID, orgID` ở vị trí 15 và 16.
Điều kiện cần là `WHERE id = $15 AND organization_id = $16`.
Sửa và kiểm thử integration việc cập nhật title/description/priority/status/assignee/due date;
bảo toàn workflow_step_id, parent_task_id, position, is_required, issue_type/payment fields.
FE đã gửi lại các trường hiện hữu vì PUT hiện là thay thế, không phải partial update.
Không xem kiểm thử UI dùng response giả lập là bằng chứng endpoint này chạy được.

#### BE-BOARD-002: chuyển bước và reorder nguyên tử, chống ghi đè đồng thời

API hiện có:

- `GET /tasks/board?workflow_template_id=&project_id=&include_unassigned=true`
- `PATCH /tasks/{id}/workflow-step` với `{ workflow_step_id, position }`
- `PATCH /tasks/reorder` với `{ items: [{ id, position }] }`
- `PATCH /tasks/{id}/status` với `{ status }`

FE đã sửa POST reorder thành PATCH. Cột đọc từ `workflow_step_id`, `step_key`,
`step_name`, `sort_order`; không dùng `id/name` giả định trong backlog cũ.
Hai mutation riêng có thể khiến chuyển cột thành công nhưng reorder thất bại.
FE tải lại dữ liệu sau cả thành công/lỗi và báo lỗi, không giả định rollback.

Đề nghị transaction chuyển bước + thứ tự và version/ETag để phát hiện stale write (409),
trả lại task/cột bị ảnh hưởng. Kiểm tra tenant, quyền sửa từng task, step thuộc đúng
workflow của project, vị trí không âm, duplicate IDs và quyền trên mọi task reorder.
Hiện `handleUpdateTaskWorkflowStep` chỉ xác minh step cùng organization; cần xác minh
thêm template của project. Test hai người kéo cùng lúc và reorder gồm task không có quyền.

#### BE-BOARD-003: Review là workflow, không phải TaskStatus

TaskStatus hiện chỉ có TODO/DOING/DONE/CANCELLED. FE giữ nguyên semantics này.
Để có bốn cột đúng ảnh, seed/config workflow gồm To do, In progress, Review, Done.
Chuyển workflow step hiện không tự đổi status. Cần chốt và mô tả policy nếu kéo vào
Done phải hoàn thành task hoặc kéo vào Review phải tạo review request; không tự ánh xạ
tên cột thành hành động nghiệp vụ tại FE. Test dependencies/review gates khi hoàn thành.

### P1 — dữ liệu để khớp hai ảnh

#### BE-UI-002: project aggregate còn thiếu

`router.go` type `ProjectResponse` chưa có description, start/end dates, progress,
project members, labels, goals, links. Bổ sung vào `GET /projects/{id}` hoặc aggregate
được tài liệu hóa: progress phải đếm toàn bộ task; membership khác assignable-users.
Các collection dùng mảng rỗng; giá trị chưa biết dùng null. Cần endpoint cập nhật
goals/links nếu cho phép thao tác, với quyền và version rõ ràng.

#### BE-UI-003: board card metadata

`task_handlers.go` type `taskResponse` chưa có labels[], comment_count, checklist
completed/total, assignee display name/avatar trong board. Bổ sung các trường aggregate
để render card như ảnh mà không tạo N+1 query. Expose `actions.edit` trên board/list
(hiện detail có) để FE biết task nào có thể kéo. Tài liệu hóa label/priority filter,
giới hạn số task, count toàn bộ và count sau filter. FE hiện lọc title/status/priority/
assignee trên tập task đã tải; không dùng nhãn/checklist giả.

#### BE-UI-001/004/005: dashboard

FE đã nối đúng các trường BE hiện có:

| BE | View model FE |
| --- | --- |
| kpis.employee_count | kpis.active_users |
| kpis.revenue_change_percent | kpis.revenue_delta_percent |
| project_highlights | highlighted_projects |
| members.user_id/name | members.id/display_name |
| actor_name/actor_id/message/action | actor/description/action_label |
| calendar_events.start_at/end_at | starts_at/ends_at |

`cost_total` và series cost nullable, FE hiển thị chưa có dữ liệu và không vẽ đường
chi phí bằng 0. Muốn đủ hai đường như ảnh cần nguồn chi phí thực và seed.
Workload presence/avatar nullable; FE không suy diễn đang online từ task_count.

Còn cần recent_tasks độc lập với due_items, phạm vi today rõ timezone và không bị
giới hạn trước khi lọc hôm nay, timestamp due_at, avatar có dữ liệu, và calendar range
đảm bảo trả đầy đủ sự kiện trong tháng (kèm pagination nếu có). Revenue series cần
chốt granularity/ngày/tháng, range và currency; ghi rõ KPI employee_count tính người
active hay toàn bộ thành viên. Không dùng số demo 128/34/86 làm dữ liệu production.

### Điều kiện xác nhận end-to-end

Chạy BE và DB, cung cấp tài khoản/tenant kiểm thử cùng project có workflow mẫu, example
payload và OpenAPI cập nhật. HTTP localhost:8080 hiện không kết nối được trong phiên này.
Kiểm tra đăng nhập, create/edit/comment, kéo thả/reload, 401/403/409/423, dependency
blocks, task không có quyền, tenant isolation và cập nhật dashboard sau mutation.
Ảnh QA dùng response giả lập chỉ chứng minh FE theo contract đã đọc, không chứng minh BE.

<a id="backlog"></a>

## UI Reference Data Completion Backlog

> Cập nhật 2026-09-22: xem [handoff dựa trên mã BE hiện tại](DASHBOARD_BOARD_2026-09.md#handoff)
> để dùng đúng tên trường, HTTP method, lỗi SQL chặn sửa task và phần còn thiếu sau khi FE đã nối API.
> Các payload dưới đây là đề xuất cũ; không thay thế contract đã xác minh trong handoff mới.

Mục tiêu: bổ sung data contract để Dashboard và Project Board render theo đúng reference UI,
không dùng fixture/hardcode trong production UI.

### Quy ước giao việc

- Owner chính: Backend.
- Ưu tiên mở rộng aggregate/API đã có trong `API_REFERENCE.md`, không tạo endpoint trùng.
- Tất cả response phải tenant-scoped, có RBAC, empty state và contract test.
- FE chỉ thay fixture sau khi BE trả example payload và seed data tái lập được reference.

### P0 — bắt buộc

#### BE-UI-001 — Hoàn thiện `GET /dashboard/summary`

Mở rộng response hiện có với: `kpis.active_users`, `kpis.revenue_delta_percent`,
`task_status[].percent`, project progress/assignees, due item `due_at`/assignee,
workload display name/role/avatar/presence, activity actor/action/description/time và
calendar events (`id`, `title`, `starts_at`, `ends_at`, `tone`).

Reference seed bắt buộc tái lập được: `128 / 34 / 86 / 24 / 528400000`.

Acceptance criteria:

- Không còn phải lấy employee count từ fixture.
- Không còn trend/progress/percentage hardcode ở FE.
- Timestamp trả ISO-8601 có timezone; FE tự format relative time.
- `avatar_url` nullable, có fallback initials.
- Aggregate không được tính bằng cách gọi nhiều paginated list ở FE.
- Có contract/integration test cho tenant isolation, RBAC và empty state.

#### BE-UI-002 — Project aggregate cho `GET /projects/{id}`

Bổ sung/expose: `description`, `start_date`, `end_date`, `progress.percent`,
`progress.by_status[]`, `members[]`, `labels[]`, `goals[]`, `links[]`.

Progress phải do BE tính từ canonical task/workflow data. Members phải đúng project/team và
tenant. Các collection phải có empty semantics rõ ràng. FE không được hardcode tên, ngày,
status hoặc avatar.

#### BE-UI-003 — Board data động theo project/workflow

Bổ sung contract canonical board để thay `task-board-data.ts`:

```json
{
  "project": { "id": "uuid", "name": "Website thương mại điện tử" },
  "workflow_template_id": "uuid",
  "columns": [{
    "id": "uuid",
    "key": "TODO",
    "name": "To do",
    "count": 8,
    "sort_order": 1,
    "tasks": [{
      "id": "uuid",
      "title": "Thiết kế UI trang chủ",
      "description": "Thiết kế giao diện...",
      "labels": [{ "id": "uuid", "name": "FE", "color": "BLUE" }],
      "comment_count": 3,
      "checklist": { "completed": 0, "total": 4 },
      "due_at": "2025-09-12T17:00:00+07:00",
      "assignee": { "id": "uuid", "display_name": "Trần Thị Mai", "avatar_url": null },
      "priority": "HIGH"
    }]
  }]
}
```

Acceptance criteria: column order theo `sort_order`, count khớp sau filter, task card đủ
label/comment/checklist/due date/assignee/priority; document filter `q`, assignee, label,
priority, status và pagination/limit. Không dùng compatibility `/projects/board` nếu
`/tasks/board` đã đủ project context.

### P1 — hoàn thiện trải nghiệm

#### BE-UI-004 — Calendar events

Expose `calendar_events` trong dashboard aggregate hoặc `GET /calendar/events?from=&to=` với
`id`, `title`, `starts_at`, `ends_at`, `event_type`, `project_id?`, `assignee?`, `tone?`.
Timezone theo tenant/user, timestamp ISO-8601.

#### BE-UI-005 — Activity feed

Mở rộng `recent_activity` với `actor`, `action_label`, `description`, `occurred_at`,
`entity_type`, `entity_id`, `avatar_url?`. Không trả relative-time đã format sẵn.

#### BE-UI-006 — Project labels, goals và links

Labels dùng contract `labels`/`label-assignments` trong API master. Goals gồm `id`, `title`,
`completed`, `sort_order`. Links gồm `id`, `label`, `url`, `provider`, `sort_order`.
Chốt product scope trước khi tạo bảng mới chỉ để khớp ảnh.

#### BE-UI-007 — Current user/profile cho shell

Đảm bảo `GET /users/me` trả `display_name`, `email`, `role_label`, `avatar_url`, `tenant_name`,
`tier` và `plan` để sidebar/topbar không dùng user hardcode.

### Handoff bắt buộc từ BE

Mỗi task phải trả API/handler, migration nếu có, OpenAPI/response example, seed data tái lập
được hai ảnh, contract/integration test và danh sách breaking change nếu đổi field hiện có.

### Definition of Ready cho FE

FE chỉ bắt đầu thay fixture khi có response contract, example payload, seed/test data,
error/empty/forbidden semantics và endpoint smoke test pass.
