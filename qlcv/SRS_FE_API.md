# SRS FE API - Repository Layer

Ngày cập nhật: 2026-06-15

Tài liệu này dành cho FE Next.js. Nội dung bám theo BE hiện tại trong `internal/server/router.go`, handlers và `docs/BE_CURRENT_SPEC.md`.

## 1. Quy Ước Chung

Base URL:

```text
/api/v1
```

Auth header:

```http
Authorization: Bearer <token>
```

Write request nên gửi:

```http
Idempotency-Key: <uuid>
```

Error format:

```json
{
  "type": "https://api.legaltech.com/errors/bad-request",
  "title": "Bad Request",
  "status": 400,
  "detail": "Invalid request body",
  "code": "BAD_REQUEST"
}
```

Pagination response:

```json
{
  "data": [],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 0,
    "total": 0
  }
}
```

## 2. Repository Modules

FE nên chia repository:

```text
auth.repository.ts
users.repository.ts
customers.repository.ts
profile-documents.repository.ts
projects.repository.ts
workflow.repository.ts
tasks.repository.ts
issues.repository.ts
labels.repository.ts
documents.repository.ts
time-entries.repository.ts
invoices.repository.ts
payments.repository.ts
dashboard.repository.ts
reports.repository.ts
okr.repository.ts
audit.repository.ts
admin.repository.ts
metadata.repository.ts
```

`issues.repository.ts` là alias UX cho `project_tasks`, gọi `/api/v1/issues/*`.

## 3. Auth

### POST `/auth/login`

Request:

```json
{
  "username": "partner",
  "password": "password",
  "totp_code": "123456"
}
```

Response: JWT/session theo BE auth service.

### Current User

```text
GET /auth/me
GET /users/me
PUT /users/me
POST /auth/mfa/enable
POST /auth/mfa/disable
```

FE dùng `/users/me` làm nguồn role, tenant plan, feature flags nếu response có.

## 4. Users / Nhân Viên

Endpoints:

```text
GET  /users?limit=&offset=&q=&role=&is_active=
POST /users
GET  /users/{id}
PUT  /users/{id}
POST /users/{id}/activate
POST /users/{id}/deactivate
POST /users/{id}/reset-password
POST /users/{id}/mfa/reset
```

User DTO:

```json
{
  "id": "uuid",
  "organization_id": "uuid",
  "username": "lawyer1",
  "email": "lawyer1@example.com",
  "role": "LAWYER",
  "is_active": true,
  "mfa_enabled": false,
  "version": 1,
  "created_at": "2026-06-15T10:30:00Z",
  "actions": {}
}
```

Create:

```json
{
  "username": "lawyer1",
  "email": "lawyer1@example.com",
  "role": "LAWYER",
  "password": "TemporaryPassword123!",
  "send_invite": false
}
```

Update:

```json
{
  "username": "lawyer1",
  "email": "lawyer1@example.com",
  "role": "LAWYER",
  "is_active": true,
  "version": 1
}
```

Roles hợp lệ:

```text
SUPER_ADMIN
PARTNER
LAWYER
ACCOUNTANT
```

## 5. Customers / Hồ Sơ Khách Hàng

Endpoints:

```text
GET    /customers?limit=&offset=&include_deleted=&q=
POST   /customers
GET    /customers/{id}
PUT    /customers/{id}
DELETE /customers/{id}
POST   /customers/{id}/restore
GET    /customers/{id}/conflicts
POST   /customers/{id}/conflicts
```

Customer DTO:

```json
{
  "id": "uuid",
  "organization_id": "uuid",
  "name": "Công ty ABC",
  "tax_code": "0101234567",
  "email": "contact@abc.vn",
  "phone": "0900000000",
  "address": "Hà Nội",
  "representative_name": "Nguyễn Văn A",
  "notes": "Khách hàng chiến lược",
  "deleted_at": null,
  "created_at": "2026-06-15T10:30:00Z",
  "actions": {}
}
```

Create/update:

```json
{
  "name": "Công ty ABC",
  "tax_code": "0101234567",
  "email": "contact@abc.vn",
  "phone": "0900000000",
  "address": "Hà Nội",
  "representative_name": "Nguyễn Văn A",
  "notes": "Ghi chú hồ sơ"
}
```

Conflict request:

```json
{
  "conflict_name": "Công ty đối thủ"
}
```

## 6. Profile Documents

Dùng cho tài liệu hồ sơ user/customer.

```text
GET    /profile-documents?entity_type=user|customer&entity_id={uuid}
POST   /profile-documents
GET    /profile-documents/{id}/download
DELETE /profile-documents/{id}
```

Upload: `multipart/form-data`

```text
entity_type = user | customer
entity_id   = uuid
title       = string
file        = binary
```

Response:

```json
{
  "id": "uuid",
  "organization_id": "uuid",
  "entity_type": "customer",
  "entity_id": "uuid",
  "title": "Hồ sơ pháp lý",
  "file_size": 123456,
  "uploaded_by": "uuid",
  "created_at": "2026-06-15T10:30:00Z"
}
```

## 7. Projects / Vụ Việc

Endpoints:

```text
GET    /projects?limit=&offset=&customer_id=&status=
POST   /projects
GET    /projects/{id}
PUT    /projects/{id}
POST   /projects/{id}/close
PATCH  /projects/{id}/workflow-step
POST   /projects/{id}/override-conflict
GET    /projects/board?workflow_template_id={uuid}
```

Project DTO:

```json
{
  "id": "uuid",
  "organization_id": "uuid",
  "customer_id": "uuid",
  "name": "Tư vấn hợp đồng",
  "hourly_rate": 1000000,
  "status": "ACTIVE",
  "workflow_template_id": "uuid",
  "current_workflow_step_id": "uuid",
  "total_contract_value": 50000000,
  "total_paid": 10000000,
  "conflict_status": "CLEARED",
  "opposing_party_name": "Công ty XYZ",
  "opposing_party_tax_code": "0109999999",
  "created_at": "2026-06-15T10:30:00Z",
  "updated_at": "2026-06-15T10:30:00Z",
  "actions": {}
}
```

Create/update:

```json
{
  "customer_id": "uuid",
  "name": "Tư vấn hợp đồng",
  "hourly_rate": 1000000,
  "workflow_template_id": "uuid",
  "current_workflow_step_id": "uuid",
  "total_contract_value": 50000000,
  "opposing_party_name": "Công ty XYZ",
  "opposing_party_tax_code": "0109999999"
}
```

Move workflow step:

```json
{
  "target_step_key": "billing",
  "incoming_payment_confirmation": 10000000,
  "payment_method": "bank_transfer",
  "payment_note": "Khách đã thanh toán",
  "payment_type": "DEPOSIT"
}
```

Project board response:

```json
{
  "macro_columns": [
    {
      "key": "IN_PROGRESS",
      "title": "In Progress",
      "steps": [
        {
          "step_id": "uuid",
          "step_key": "soan_thao",
          "step_name": "Soạn thảo",
          "sort_order": 2,
          "projects": []
        }
      ]
    }
  ]
}
```

## 8. Workflow Templates

```text
GET    /workflow-templates?active=true|false
POST   /workflow-templates
GET    /workflow-templates/{id}
PUT    /workflow-templates/{id}
DELETE /workflow-templates/{id}
```

Create:

```json
{
  "template_name": "Quy trình dịch vụ pháp lý",
  "description": "Mô tả",
  "is_default": true,
  "steps": [
    {
      "step_key": "intake",
      "step_name": "Tiếp nhận",
      "macro_column": "INTAKE",
      "sort_order": 1,
      "financial_trigger": null,
      "security_trigger": null,
      "task_trigger": {},
      "is_terminal": false
    }
  ]
}
```

Valid macro columns:

```text
INTAKE
IN_PROGRESS
BILLING
ARCHIVED
```

## 9. Tasks / Issues / GitLab-Style Board

Trong BE, issue của FE chính là `project_tasks`.

Task endpoints:

```text
GET    /tasks?limit=&offset=&project_id=&assignee_id=&workflow_step_id=&status=&q=
GET    /tasks/board?workflow_template_id=&project_id=&assignee_id=&status=&q=&include_unassigned=true
GET    /projects/{id}/tasks
POST   /tasks
GET    /tasks/{id}
PUT    /tasks/{id}
PATCH  /tasks/{id}/workflow-step
PATCH  /tasks/{id}/status
PATCH  /tasks/{id}/assignee
PATCH  /tasks/reorder
DELETE /tasks/{id}
```

Issue aliases:

```text
GET    /issues?limit=&offset=&project_id=&assignee_id=&workflow_step_id=&status=&q=
GET    /issues/board?workflow_template_id=&project_id=&assignee_id=&status=&q=&include_unassigned=true
POST   /issues
GET    /issues/{id}
PUT    /issues/{id}
PATCH  /issues/{id}/workflow-step
POST   /issues/{id}/move
PATCH  /issues/{id}/status
PATCH  /issues/{id}/assignee
PATCH  /issues/reorder
DELETE /issues/{id}
```

Task DTO:

```json
{
  "id": "uuid",
  "organization_id": "uuid",
  "project_id": "uuid",
  "workflow_step_id": "uuid",
  "title": "Soạn hợp đồng",
  "description": "Nội dung việc",
  "status": "TODO",
  "assignee_id": "uuid",
  "due_date": "2026-06-30",
  "position": 0,
  "created_at": "2026-06-15T10:30:00Z",
  "updated_at": "2026-06-15T10:30:00Z"
}
```

Create/update:

```json
{
  "project_id": "uuid",
  "workflow_step_id": "uuid",
  "title": "Soạn hợp đồng",
  "description": "Nội dung việc",
  "status": "TODO",
  "assignee_id": "uuid",
  "due_date": "2026-06-30",
  "position": 0
}
```

Move issue/card:

```json
{
  "workflow_step_id": "uuid",
  "position": 10
}
```

Board response:

```json
{
  "workflow_template_id": "uuid",
  "columns": [
    {
      "workflow_step_id": "uuid",
      "step_key": "soan_thao",
      "step_name": "Soạn thảo",
      "macro_column": "IN_PROGRESS",
      "sort_order": 2,
      "tasks": []
    }
  ],
  "unassigned_tasks": []
}
```

Valid status:

```text
TODO
DOING
DONE
CANCELLED
```

Lưu ý quan trọng:

- Column board lấy từ `workflow_steps`, không lấy từ status.
- `status` chỉ là trạng thái nội bộ của task.
- FE nên dùng `PATCH /issues/{id}/workflow-step` hoặc `POST /issues/{id}/move` khi kéo thả.
- `PUT /tasks/{id}` vẫn là full update.

## 10. Labels

```text
GET    /labels?project_id=&archived=
POST   /labels
GET    /labels/{id}
PUT    /labels/{id}
DELETE /labels/{id}
GET    /label-assignments?entity_type=&entity_id=
POST   /label-assignments
DELETE /label-assignments/{id}
```

Label request:

```json
{
  "project_id": "uuid",
  "title": "priority::high",
  "description": "Độ ưu tiên cao",
  "color": "#d73a4a",
  "scoped_key": "priority",
  "scoped_value": "high",
  "priority": 10
}
```

Assignment:

```json
{
  "label_id": "uuid",
  "entity_type": "task",
  "entity_id": "uuid"
}
```

Valid `entity_type`: `customer`, `project`, `task`, `document`.

## 11. Documents

```text
GET    /documents?project_id=&limit=&offset=
POST   /documents
GET    /documents/{id}
GET    /documents/{id}/download
DELETE /documents/{id}
POST   /documents/{id}/lock
```

Upload: `multipart/form-data`

```text
project_id = uuid
title = string
file = binary
client_created_at = RFC3339 optional
```

## 12. Time Entries

```text
GET    /time-entries?project_id=&user_id=&billable=
POST   /time-entries
GET    /time-entries/{id}
PUT    /time-entries/{id}
DELETE /time-entries/{id}
```

Request:

```json
{
  "project_id": "uuid",
  "duration_minutes": 120,
  "description": "Soạn hợp đồng",
  "billable": true,
  "client_created_at": "2026-06-15T10:30:00Z"
}
```

## 13. Invoices / Payments

```text
GET  /invoices?customer_id=&status=
POST /invoices/generate
GET  /invoices/{id}
PUT  /invoices/{id}/status
GET  /invoices/{id}/time-entries
GET  /project-payments?project_id={uuid}
GET  /project-payments/{id}
```

Generate invoice:

```json
{
  "project_id": "uuid",
  "customer_id": "uuid",
  "status": "DRAFT"
}
```

Invoice status: `DRAFT`, `UNPAID`, `PAID`, `VOID`.

## 14. Dashboard / Reports

```text
GET /dashboard/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
GET /reports/tasks/summary
GET /reports/tasks/by-assignee
GET /reports/tasks/by-status
GET /reports/tasks/overdue?limit=
GET /reports/workload
GET /reports/okr/summary
```

Dashboard response gồm:

```json
{
  "range": {},
  "kpis": {
    "open_issues": 0,
    "overdue_issues": 0,
    "active_projects": 0,
    "revenue_collected": 0
  },
  "issue_status": [],
  "project_workflow": [],
  "due_items": [],
  "projects_need_attention": []
}
```

## 15. OKR

```text
GET    /okr/cycles
POST   /okr/cycles
GET    /okr/objectives
POST   /okr/objectives
PUT    /okr/objectives/{id}
DELETE /okr/objectives/{id}
POST   /okr/objectives/{id}/key-results
PUT    /okr/key-results/{id}
```

OKR status: `ON_TRACK`, `AT_RISK`, `OFF_TRACK`, `DONE`, `CANCELLED`.

## 16. Audit / Admin / Metadata

Audit:

```text
GET  /audit-logs?limit=&offset=&user_id=&action=
GET  /audit-logs/{id}
POST /audit-logs/verify
```

Admin:

```text
POST /admin/purge
GET  /admin/tenant-settings
PUT  /admin/tenant-settings
```

Metadata:

```text
GET /metadata/schemas/{entity}
```

## 17. FE Cần Lưu Ý

- BE hiện chưa có frontend source.
- BE đã có `/issues` alias nhưng dữ liệu vẫn là `project_tasks`.
- Board công việc giống GitLab nên dùng `/issues/board`.
- Project workflow board dùng `/projects/board`, khác với issue/task board.
- Task list chưa embed `project_name`, `customer_name`, `labels`; FE cần join/fetch thêm nếu muốn hiển thị trên card.
- Chưa có saved board views/user preferences; FE có thể lưu local storage tạm.

## 18. Repository Method Contract Đầy Đủ

### `auth.repository.ts`

```ts
login(input)
getAuthMe()
getCurrentUser()
updateCurrentUser(input)
enableMfa()
disableMfa(input)
logoutLocal()
```

### `users.repository.ts`

```ts
listUsers(params)
createUser(input)
getUser(id)
updateUser(id, input)
activateUser(id, version)
deactivateUser(id, version)
resetUserPassword(id, temporaryPassword)
resetUserMfa(id)
```

### `customers.repository.ts`

```ts
listCustomers(params)
createCustomer(input)
getCustomer(id)
updateCustomer(id, input)
deleteCustomer(id)
restoreCustomer(id)
listCustomerConflicts(customerId)
addCustomerConflict(customerId, input)
```

### `profile-documents.repository.ts`

```ts
listProfileDocuments(entityType, entityId)
uploadProfileDocument(input: FormData)
downloadProfileDocument(id)
deleteProfileDocument(id)
```

### `projects.repository.ts`

```ts
listProjects(params)
createProject(input)
getProject(id)
updateProject(id, input)
closeProject(id)
moveProjectWorkflowStep(id, input)
overrideProjectConflict(id, input)
getProjectsBoard(workflowTemplateId)
```

### `workflow.repository.ts`

```ts
listWorkflowTemplates(params)
createWorkflowTemplate(input)
getWorkflowTemplate(id)
updateWorkflowTemplate(id, input)
archiveWorkflowTemplate(id)
```

### `issues.repository.ts`

```ts
getIssueBoard(params)
listIssues(params)
createIssue(input)
getIssue(id)
updateIssue(id, input)
moveIssueWorkflowStep(id, input)
moveIssue(id, input)
updateIssueStatus(id, status)
updateIssueAssignee(id, assigneeId)
reorderIssues(items)
deleteIssue(id)
```

### `tasks.repository.ts`

`tasks.repository.ts` có thể wrap cùng endpoint với issues nếu FE muốn dùng tên task trong project detail.

```ts
listTasks(params)
getTasksBoard(params)
listProjectTasks(projectId, params)
createTask(input)
getTask(id)
updateTask(id, input)
moveTaskWorkflowStep(id, input)
updateTaskStatus(id, status)
updateTaskAssignee(id, assigneeId)
reorderTasks(items)
deleteTask(id)
```

### `labels.repository.ts`

```ts
listLabels(params)
createLabel(input)
getLabel(id)
updateLabel(id, input)
archiveLabel(id)
listLabelAssignments(params)
assignLabel(input)
removeLabelAssignment(id)
```

### `documents.repository.ts`

```ts
listDocuments(params)
uploadDocument(input: FormData)
getDocument(id)
downloadDocument(id)
deleteDocument(id)
lockDocument(id)
```

### `time-entries.repository.ts`

```ts
listTimeEntries(params)
createTimeEntry(input)
getTimeEntry(id)
updateTimeEntry(id, input)
deleteTimeEntry(id)
```

### `invoices.repository.ts`

```ts
listInvoices(params)
generateInvoice(input)
getInvoice(id)
updateInvoiceStatus(id, status)
listInvoiceTimeEntries(id)
```

### `payments.repository.ts`

```ts
listProjectPayments(projectId)
getProjectPayment(id)
```

### `dashboard.repository.ts`

```ts
getDashboardSummary(params)
```

### `reports.repository.ts`

```ts
getTaskReportSummary()
getTaskReportByAssignee()
getTaskReportByStatus()
getTaskReportOverdue(params)
getWorkloadReport()
getOkrSummary()
```

### `okr.repository.ts`

```ts
listOkrCycles()
createOkrCycle(input)
listOkrObjectives(params)
createOkrObjective(input)
updateOkrObjective(id, input)
deleteOkrObjective(id)
createOkrKeyResult(objectiveId, input)
updateOkrKeyResult(id, input)
```

### `audit.repository.ts`

```ts
listAuditLogs(params)
getAuditLog(id)
verifyAuditChain()
```

### `admin.repository.ts`

```ts
manualPurge()
getTenantSettings()
updateTenantSettings(input)
```

### `metadata.repository.ts`

```ts
getMetadataSchema(entity)
```

## 19. FE Use-Case Coverage

FE hoàn chỉnh phải map API thành các use-case sau:

| Use-case | Repository calls |
| --- | --- |
| Login + MFA | `login`, `getCurrentUser`, `enableMfa`, `disableMfa` |
| Dashboard vận hành | `getDashboardSummary`, task reports, workload, OKR summary |
| GitLab-style work board | `getIssueBoard`, `moveIssue`, labels, users, projects |
| Project workflow board | `listWorkflowTemplates`, `getProjectsBoard`, `moveProjectWorkflowStep` |
| Project 360 detail | project, tasks, documents, time entries, invoices, payments |
| Customer 360 detail | customer, conflicts, projects, profile documents, labels |
| User 360 detail | user, profile documents, assigned issues |
| Document center | documents upload/download/delete/lock |
| Billing | time entries, generate invoice, invoice status, project payments |
| Reports | all `/reports/*` endpoints |
| OKR | cycles/objectives/key results + OKR report |
| Admin | tenant settings, purge, metadata, audit verify |

## 20. HTTP Client Requirements Chi Tiết

Phần này merge từ `SRS_OLD.md` và cập nhật theo BE hiện tại.

Content types:

- Request JSON: `Content-Type: application/json`.
- Response JSON: `Content-Type: application/json`.
- Error: `Content-Type: application/problem+json`.
- Upload tài liệu: `multipart/form-data`.
- Download tài liệu: binary/blob.

HTTP client bắt buộc:

- Tự gắn `Authorization: Bearer <token>` cho mọi private request.
- Không gắn auth cho `POST /auth/login`, `/health`, `/`.
- Tự parse `application/problem+json` thành typed error.
- Không parse lỗi từ plain text.
- Nếu response là blob, trả `{ blob, filename }`.
- Khi upload `FormData`, không tự set `Content-Type`; để browser set boundary.
- Nếu gặp `401`, clear session và redirect `/login`.
- Nếu gặp `403`, trả typed `ForbiddenError` cho UI route/action guard.
- Nếu gặp `423`, hiển thị lock reason như WORM lock hoặc billing lock.
- Nếu gặp `428`, refetch record và báo optimistic lock.

Idempotency:

- FE nên gửi `Idempotency-Key` cho mọi `POST`, `PUT`, `PATCH`, `DELETE`.
- Key nên là UUID/string 16-255 ký tự.
- Nếu BE replay, response có thể có header `X-Idempotency-Replay: true`.
- Repository không được retry mutation với key khác nếu request trước có thể đã thành công.

Pagination caveat:

- Một số endpoint hiện có `total` chưa chắc là tổng toàn bộ dataset; có thể là count sau lọc/paging.
- FE không dùng `pagination.total` làm số liệu báo cáo nghiệp vụ.
- Số liệu dashboard/report phải lấy từ `/dashboard/summary` hoặc `/reports/*`.

Date/time:

- Date-time response thường là RFC3339.
- `due_date` là `YYYY-MM-DD`.
- Dashboard date dùng `YYYY-MM-DD`.
- `client_created_at` gửi RFC3339.

## 21. Enum Và Permission Chi Tiết

Roles:

```text
SUPER_ADMIN
PARTNER
LAWYER
ACCOUNTANT
```

Project status:

```text
ACTIVE
CLOSED
```

Conflict status:

```text
CLEARED
CONFLICT_DETECTED
OVERRIDDEN_CLEARED
```

Workflow macro column:

```text
INTAKE
IN_PROGRESS
BILLING
ARCHIVED
```

Task status:

```text
TODO
DOING
DONE
CANCELLED
```

Invoice status:

```text
DRAFT
UNPAID
PAID
VOID
```

OKR status:

```text
ON_TRACK
AT_RISK
OFF_TRACK
DONE
CANCELLED
```

Role guard BE hiện tại:

| Endpoint group | Role |
| --- | --- |
| `GET/POST/PUT /users`, user activate/deactivate/reset | `PARTNER`, `SUPER_ADMIN` |
| `POST/PUT/DELETE /workflow-templates` | `PARTNER`, `SUPER_ADMIN` |
| `POST /projects/{id}/override-conflict` | `PARTNER`, `SUPER_ADMIN` |
| `POST /documents/{id}/lock` | `PARTNER` |
| `POST /labels`, `PUT/DELETE /labels/{id}` | `PARTNER`, `SUPER_ADMIN` |
| `POST /invoices/generate` | `PARTNER`, `ACCOUNTANT` |
| OKR create/update/delete | `PARTNER`, `SUPER_ADMIN` |
| Tenant settings/admin purge | `SUPER_ADMIN` |

Các endpoint task/issue hiện `requireAuth`, chưa role-guard sâu ở BE. FE vẫn phải guard theo product policy.

## 22. Endpoint Rules Và Edge Cases Quan Trọng

### Auth/User

- `POST /auth/login` trả `INVALID_CREDENTIALS` nếu sai thông tin.
- Nếu account inactive, BE trả `FORBIDDEN`.
- Nếu user bật MFA nhưng thiếu code, BE trả bad request với detail yêu cầu MFA.
- `PUT /users/me` yêu cầu `version > 0` và ít nhất một field cần update.
- User management dùng optimistic locking qua `version`.
- `PARTNER` không được quản lý `SUPER_ADMIN`.
- Không được deactivate chính mình.
- Không được deactivate active admin cuối cùng của tenant.
- Reset password yêu cầu `temporary_password` tối thiểu 8 ký tự.

### Customers

- Delete customer là soft delete.
- Restore dùng endpoint riêng.
- Customer conflict dùng cho conflict-of-interest list thủ công.
- Customer DTO hiện đã có thêm: `email`, `phone`, `address`, `representative_name`, `notes`.
- Customer profile documents dùng `profile-documents`, không dùng project documents.

### Projects

- Create project cần `customer_id`, `name`, `hourly_rate >= 0`, `total_contract_value >= 0`.
- Nếu có `workflow_template_id`, template phải active và có step đầu tiên.
- BE tự set `status=ACTIVE`, `total_paid=0`.
- BE scan conflict khi tạo project.
- Nếu conflict, project vẫn được tạo với `conflict_status=CONFLICT_DETECTED`.
- FE nên dùng `PATCH /projects/{id}/workflow-step` để move project, không update trực tiếp `current_workflow_step_id`.
- `override_justification` tối thiểu 50 ký tự.

Financial blocked response:

```json
{
  "error_code": "ERR_WORKFLOW_FINANCIAL_BLOCKED",
  "message": "Khong the chuyen buoc. So tien tich luy chua dat han muc thanh toan.",
  "details": {
    "required_amount": 20000000,
    "current_paid": 10000000,
    "incoming_payment_confirmation": 0,
    "new_total_paid": 10000000,
    "payment_type": "PERCENTAGE",
    "project_total_contract_value": 50000000,
    "target_workflow_step_key": "billing",
    "target_workflow_step_name": "Thanh toan"
  }
}
```

Lưu ý: response financial blocked có thể không theo RFC7807, repository phải handle riêng.

### Workflow Templates

- `step_key` unique trong template.
- `sort_order > 0` và unique trong template.
- `macro_column` chỉ nhận `INTAKE`, `IN_PROGRESS`, `BILLING`, `ARCHIVED`.
- `financial_trigger`, `security_trigger`, `task_trigger` là object JSON nếu có.
- Delete workflow template là archive `is_active=false`.
- BE hiện chưa CRUD từng workflow step sau khi template đã tạo.

Financial trigger validation đáng chú ý:

- `payment_type`: `NONE`, `FIXED_AMOUNT`, `PERCENTAGE`, `REMAINING`.
- Financial tag `FREE`: amount nếu có phải bằng `0`.
- `FIXED_AMOUNT`: amount > 0.
- `PERCENTAGE`: value > 0 và <= 100.
- `PERCENTAGE.base` nếu có: `fee`, `deposit`, `total_contract_value`.
- `key` phải là metric hợp lệ hoặc `custom`; nếu `custom` cần `custom_key`.

Metric hợp lệ:

```text
fee
deposit
discount
refund
paid
remaining
deposit_due
unpaid_fee
free_count
free_hours
free_projects
```

### Issues/Tasks

- `/issues/*` là alias UX cho `project_tasks`.
- Board công việc dùng `/issues/board`.
- Column board lấy từ workflow steps, không lấy từ task status.
- `PATCH /issues/{id}/workflow-step` là endpoint đúng cho drag/drop.
- `POST /issues/{id}/move` là alias cho move.
- `PUT /issues/{id}` là full update, chỉ dùng khi edit form đầy đủ.
- `workflow_step_id` có thể null để đưa task về unassigned.
- `include_unassigned=true` trả thêm `unassigned_tasks`.

### Labels

- Label có thể tenant-scoped hoặc project-scoped.
- Scoped label nên dùng `scoped_key`, `scoped_value`, ví dụ `priority::high`.
- `DELETE /labels/{id}` là archive/soft behavior.
- Valid assignment entity types:

```text
customer
project
task
document
```

### Documents

- Project documents dùng `/documents`.
- Customer/user profile documents dùng `/profile-documents`.
- Upload document có thể trả:
  - `FILE_TOO_LARGE`
  - `MALWARE_DETECTED`
  - `WORM_LOCK_ACTIVE` khi delete locked document.
- Download repository phải parse filename từ `Content-Disposition`.

### Time Entries

- `duration_minutes > 0`.
- `description` bắt buộc.
- Nếu time entry đã có `invoice_id`, update/delete trả `BILLING_LOCK_ACTIVE`.
- `billable` query là string; `true` nghĩa billable, non-empty khác true có thể hiểu false theo BE.

### Invoices

- Generate invoice lấy unbilled billable time entries của project.
- Nếu không có unbilled time entries, BE trả bad request.
- Invoice detail hiện dùng `/invoices/{id}/time-entries` thay cho line items.
- BE chưa có CRUD invoice line items riêng.

### Audit/Admin

- Audit list có thể filter `user_id`, `action`.
- Verify audit chain trả `valid`, `broken_at`, `message`.
- Tenant settings và purge chỉ `SUPER_ADMIN`.

## 23. Detailed API Coverage Checklist

FE repository được xem là đủ khi có method cho toàn bộ endpoint sau:

```text
POST /auth/login
GET /auth/me
GET /users/me
PUT /users/me
POST /auth/mfa/enable
POST /auth/mfa/disable

GET /users
POST /users
GET /users/{id}
PUT /users/{id}
POST /users/{id}/activate
POST /users/{id}/deactivate
POST /users/{id}/reset-password
POST /users/{id}/mfa/reset

GET /customers
POST /customers
GET /customers/{id}
PUT /customers/{id}
DELETE /customers/{id}
POST /customers/{id}/restore
GET /customers/{id}/conflicts
POST /customers/{id}/conflicts

GET /profile-documents
POST /profile-documents
GET /profile-documents/{id}/download
DELETE /profile-documents/{id}

GET /projects
POST /projects
GET /projects/{id}
PUT /projects/{id}
POST /projects/{id}/close
PATCH /projects/{id}/workflow-step
POST /projects/{id}/override-conflict
GET /projects/board

GET /workflow-templates
POST /workflow-templates
GET /workflow-templates/{id}
PUT /workflow-templates/{id}
DELETE /workflow-templates/{id}

GET /issues
GET /issues/board
POST /issues
GET /issues/{id}
PUT /issues/{id}
PATCH /issues/{id}/workflow-step
POST /issues/{id}/move
PATCH /issues/{id}/status
PATCH /issues/{id}/assignee
PATCH /issues/reorder
DELETE /issues/{id}

GET /labels
POST /labels
GET /labels/{id}
PUT /labels/{id}
DELETE /labels/{id}
GET /label-assignments
POST /label-assignments
DELETE /label-assignments/{id}

GET /documents
POST /documents
GET /documents/{id}
GET /documents/{id}/download
DELETE /documents/{id}
POST /documents/{id}/lock

GET /time-entries
POST /time-entries
GET /time-entries/{id}
PUT /time-entries/{id}
DELETE /time-entries/{id}

GET /invoices
POST /invoices/generate
GET /invoices/{id}
PUT /invoices/{id}/status
GET /invoices/{id}/time-entries
GET /project-payments
GET /project-payments/{id}

GET /dashboard/summary
GET /reports/tasks/summary
GET /reports/tasks/by-assignee
GET /reports/tasks/by-status
GET /reports/tasks/overdue
GET /reports/workload
GET /reports/okr/summary

GET /okr/cycles
POST /okr/cycles
GET /okr/objectives
POST /okr/objectives
PUT /okr/objectives/{id}
DELETE /okr/objectives/{id}
POST /okr/objectives/{id}/key-results
PUT /okr/key-results/{id}

GET /audit-logs
GET /audit-logs/{id}
POST /audit-logs/verify

POST /admin/purge
GET /admin/tenant-settings
PUT /admin/tenant-settings

GET /metadata/schemas/{entity}
```
