# SRS Frontend - API Contract

Nguon xac thuc: `internal/server/router.go`, `internal/server/workflow_handlers.go`, `internal/server/dashboard_handlers.go`, `internal/models/models.go`, `internal/metadata/schema_engine.go`.

Tai lieu nay mo ta contract BE hien tai de FE Next.js xay dung tang repository. Khi co mau thuan voi `docs/openapi.yaml`, uu tien source code handler.

## 1. Quy uoc chung

Base URL local: `http://localhost:8080`

Prefix API: `/api/v1`

Content type mac dinh:

- Request JSON: `Content-Type: application/json`
- Response JSON: `Content-Type: application/json`
- Error: `Content-Type: application/problem+json`
- Upload tai lieu: `multipart/form-data`
- Download tai lieu: `application/octet-stream`

Authentication:

- Tat ca endpoint `/api/v1/*` deu can `Authorization: Bearer <token>`, tru `POST /api/v1/auth/login`.
- Token lay tu `POST /api/v1/auth/login`.
- JWT payload duoc BE dung de lay `user_id`, `organization_id`, `role`, `tenant_plan`, `feature_flags`.
- FE co the dung `/api/v1/users/me` de build route guard, nhung BE van la source of truth cho phan quyen.

Idempotency:

- Middleware ap dung cho `POST`, `PUT`, `PATCH`, `DELETE`.
- FE nen gui `Idempotency-Key` cho moi mutation.
- Do dai key: 16 den 255 ky tu.
- Neu replay thanh cong, BE tra header `X-Idempotency-Replay: true`.
- Key duoc hash theo `Idempotency-Key + request path`, retention 24 gio.

Loi RFC 7807:

```json
{
  "type": "https://api.legaltech.com/errors/bad-request",
  "title": "Bad Request",
  "status": 400,
  "detail": "Invalid request body",
  "code": "BAD_REQUEST"
}
```

Repository layer phai parse theo `status`, `detail`, `code`. Khong parse message tu plain text.

Phan trang:

```json
{
  "data": [],
  "pagination": {
    "total": 0,
    "limit": 20,
    "offset": 0,
    "count": 0
  }
}
```

Luu y: mot so endpoint dang tinh `total` theo ket qua da loc/da phan trang, chua phai total toan bo dataset. FE khong nen dung `total` lam so lieu bao cao nghiep vu.

Ngay gio:

- Date-time response thuong la RFC3339/string, vi du `2026-06-15T10:30:00Z`.
- Dashboard date dung `YYYY-MM-DD`.
- `client_created_at` gui RFC3339.

## 2. Enum va role

Role:

- `SUPER_ADMIN`
- `PARTNER`
- `LAWYER`
- `ACCOUNTANT`
- Cac role khac co the ton tai trong DB/JWT nhung handler chi check cac role tren cho quyen dac biet.

Page/action permission source:

- Page access FE nen dua tren role tu `/api/v1/users/me`.
- Record action FE phai dua tren `actions` cua tung record.
- Endpoint co role guard tren BE:
  - `GET /api/v1/users`: `PARTNER`, `SUPER_ADMIN`.
  - `POST /api/v1/users`: `PARTNER`, `SUPER_ADMIN`.
  - `PUT /api/v1/users/{id}`: `PARTNER`, `SUPER_ADMIN`.
  - `POST /api/v1/users/{id}/activate`: `PARTNER`, `SUPER_ADMIN`.
  - `POST /api/v1/users/{id}/deactivate`: `PARTNER`, `SUPER_ADMIN`.
  - `POST /api/v1/users/{id}/reset-password`: `PARTNER`, `SUPER_ADMIN`.
  - `POST /api/v1/users/{id}/mfa/reset`: `PARTNER`, `SUPER_ADMIN`.
  - `POST /api/v1/workflow-templates`: `PARTNER`, `SUPER_ADMIN`.
  - `POST /api/v1/projects/{id}/override-conflict`: `PARTNER`, `SUPER_ADMIN`.
  - `POST /api/v1/documents/{id}/lock`: `PARTNER`.
  - `POST /api/v1/invoices/generate`: `PARTNER`, `ACCOUNTANT`.
  - `POST /api/v1/admin/purge`: `SUPER_ADMIN`.
- Cac endpoint con lai can authenticated user; permission chi tiet neu co duoc the hien bang `actions`.

Project status:

- `ACTIVE`
- `CLOSED`

Conflict status:

- `CLEARED`
- `CONFLICT_DETECTED`
- `OVERRIDDEN_CLEARED`

Workflow macro column:

- `INTAKE`
- `IN_PROGRESS`
- `BILLING`
- `ARCHIVED`

Invoice status:

- `DRAFT`
- `UNPAID`
- `PAID`
- `VOID`

Workflow financial trigger payment type:

- `NONE`
- `FIXED_AMOUNT`
- `PERCENTAGE`
- `REMAINING`

Payment ledger type FE co the gui khi move workflow:

- BE chap nhan string bat ky neu `payment_type` co gia tri.
- Neu khong gui, BE suy dien: `DEPOSIT` cho percentage, `FINAL` cho remaining, mac dinh `PARTIAL`.

## 3. Shared DTO

### Actions

BE tra `actions` tren nhieu record. FE phai coi day la nguon truth cho button/action.

```ts
type Actions = {
  edit: boolean;
  delete: boolean;
  download?: boolean;
  lock?: boolean;
  restore?: boolean;
  move?: boolean;
  assign?: boolean;
  override_conflict?: boolean;
};
```

### Pagination

```ts
type Pagination = {
  total: number;
  limit: number;
  offset: number;
  count: number;
};
```

## 4. Health

### GET `/health`

Auth: khong can.

Response `200`:

```json
{ "status": "ok" }
```

### GET `/`

Auth: khong can.

Response `200`:

```json
{ "message": "Lean Enterprise Legal Engine API", "version": "1.0.0" }
```

## 5. Authentication va User

### POST `/api/v1/auth/login`

Auth: khong can.

Request:

```json
{
  "username": "admin",
  "password": "password",
  "totp_code": "123456"
}
```

Rules:

- `username` bat buoc.
- `password` bat buoc.
- `totp_code` chi can khi user da bat MFA.

Response `200`:

```json
{ "token": "<jwt>" }
```

Loi dang chu y:

- `401 INVALID_CREDENTIALS`
- `403 FORBIDDEN` neu account inactive.
- `400 BAD_REQUEST` voi detail `MFA code is required for this account`.
- `400 INVALID_MFA_TOKEN`

### GET `/api/v1/auth/me`

Alias cua `/api/v1/users/me`.

### GET `/api/v1/users/me`

Response `200`:

```json
{
  "id": "uuid",
  "organization_id": "uuid",
  "username": "admin",
  "email": "admin@example.com",
  "role": "PARTNER",
  "is_active": true,
  "mfa_enabled": false,
  "version": 1,
  "tenant_plan": "STARTER",
  "enabled_feature_flags": []
}
```

### PUT `/api/v1/users/me`

Headers: nen gui `Idempotency-Key`.

Request:

```json
{
  "username": "new_name",
  "email": "new@example.com",
  "version": 1
}
```

Rules:

- `version` bat buoc va `> 0`.
- Phai co it nhat mot trong `username`, `email`.
- BE dung optimistic locking.

Response `200`: User DTO moi.

Loi dang chu y:

- `428 OPTIMISTIC_LOCK_FAILED`

### GET `/api/v1/users`

Role: `PARTNER`, `SUPER_ADMIN`.

Query:

- `limit`: default `20`.
- `offset`: default `0`.
- `role`: optional, mot trong `SUPER_ADMIN`, `PARTNER`, `LAWYER`, `ACCOUNTANT`.
- `is_active`: optional boolean.
- `q`: optional search theo `username` hoac `email`.

Response `200`:

```json
{
  "data": [
    {
      "id": "uuid",
      "organization_id": "uuid",
      "username": "lawyer01",
      "email": "lawyer01@example.com",
      "role": "LAWYER",
      "is_active": true,
      "mfa_enabled": false,
      "version": 1,
      "created_at": "2026-06-15T10:30:00Z",
      "actions": {
        "edit": true,
        "delete": true,
        "restore": false
      }
    }
  ],
  "pagination": { "total": 1, "limit": 20, "offset": 0, "count": 1 }
}
```

### GET `/api/v1/users/{id}`

Role:

- User thuong duoc xem chinh minh.
- `PARTNER`, `SUPER_ADMIN` duoc xem user khac trong tenant.
- `PARTNER` khong duoc manage `SUPER_ADMIN`.

Response `200`: Managed User DTO, khong bao gom `password_hash` va `totp_secret_encrypted`.

### POST `/api/v1/users`

Role: `PARTNER`, `SUPER_ADMIN`.

Request:

```json
{
  "username": "lawyer01",
  "email": "lawyer01@example.com",
  "role": "LAWYER",
  "password": "temporary-password",
  "send_invite": false
}
```

Rules:

- `username`, `email`, `role`, `password` bat buoc.
- `password` toi thieu 8 ky tu.
- Role hop le: `SUPER_ADMIN`, `PARTNER`, `LAWYER`, `ACCOUNTANT`.
- `PARTNER` khong duoc tao `SUPER_ADMIN`.
- `send_invite` hien duoc nhan vao va audit, nhung BE hien tai chua co email invite service.

Response `201`: Managed User DTO.

Loi dang chu y:

- `409 USER_ALREADY_EXISTS`

### PUT `/api/v1/users/{id}`

Role: `PARTNER`, `SUPER_ADMIN`.

Request:

```json
{
  "username": "lawyer01",
  "email": "lawyer01@example.com",
  "role": "LAWYER",
  "is_active": true,
  "version": 1
}
```

Rules:

- `version` bat buoc.
- Co the gui subset field can update.
- `PARTNER` khong duoc update `SUPER_ADMIN` va khong duoc gan role `SUPER_ADMIN`.
- Khong duoc deactivate chinh minh.
- Khong duoc lam mat active admin cuoi cung cua tenant.

Response `200`: Managed User DTO.

Loi dang chu y:

- `428 OPTIMISTIC_LOCK_FAILED`
- `409 USER_ALREADY_EXISTS`

### POST `/api/v1/users/{id}/activate`

Role: `PARTNER`, `SUPER_ADMIN`.

Request:

```json
{ "version": 1 }
```

Response `200`: Managed User DTO.

### POST `/api/v1/users/{id}/deactivate`

Role: `PARTNER`, `SUPER_ADMIN`.

Request:

```json
{ "version": 1 }
```

Rules:

- Khong duoc deactivate chinh minh.
- Khong duoc deactivate active admin cuoi cung cua tenant.

Response `200`: Managed User DTO.

### POST `/api/v1/users/{id}/reset-password`

Role: `PARTNER`, `SUPER_ADMIN`.

Request:

```json
{
  "temporary_password": "new-temporary-password"
}
```

Rules:

- `temporary_password` toi thieu 8 ky tu.
- `PARTNER` khong duoc reset password `SUPER_ADMIN`.
- BE hien tai set truc tiep password tam thoi, chua co email reset-token flow.

Response `200`:

```json
{ "message": "Password reset successfully" }
```

### POST `/api/v1/users/{id}/mfa/reset`

Role: `PARTNER`, `SUPER_ADMIN`.

Rules:

- Xoa `totp_secret_encrypted`, set `mfa_enabled=false`.
- `PARTNER` khong duoc reset MFA `SUPER_ADMIN`.

Response `200`:

```json
{ "message": "MFA reset successfully" }
```

### Profile documents cho user

User profile co the upload/list/download/delete ho so qua generic profile document endpoints:

- `GET /api/v1/profile-documents?entity_type=user&entity_id={user_id}`
- `POST /api/v1/profile-documents` multipart
- `GET /api/v1/profile-documents/{id}/download`
- `DELETE /api/v1/profile-documents/{id}`

## 6. Customers

### Customer DTO

```ts
type Customer = {
  id: string;
  organization_id: string;
  name: string;
  tax_code?: string | null;
  deleted_at?: string | null;
  created_at: string;
  actions?: Actions;
};
```

### GET `/api/v1/customers`

Query:

- `limit`: number, default `20`, chi accept gia tri `> 0`.
- `offset`: number, default `0`, chi accept gia tri `>= 0`.

Response `200`:

```json
{
  "data": [
    {
      "id": "uuid",
      "organization_id": "uuid",
      "name": "Cong ty A",
      "tax_code": "0312345678",
      "created_at": "2026-06-15T10:30:00Z",
      "actions": { "edit": true, "delete": true, "restore": false }
    }
  ],
  "pagination": { "total": 1, "limit": 20, "offset": 0, "count": 1 }
}
```

### GET `/api/v1/customers/{id}`

Response `200`: Customer DTO.

### POST `/api/v1/customers`

Request:

```json
{
  "name": "Cong ty A",
  "tax_code": "0312345678"
}
```

Rules:

- `name` bat buoc.
- BE co check conflict of interest trong customer service.

Response `201`: Customer DTO.

Loi dang chu y:

- `409 CONFLICT_OF_INTEREST`

### PUT `/api/v1/customers/{id}`

Request:

```json
{
  "name": "Cong ty A Updated",
  "tax_code": "0312345678"
}
```

Rules:

- `name` bat buoc.

Response `200`: Customer DTO.

### DELETE `/api/v1/customers/{id}`

Soft delete.

Response `200`:

```json
{ "message": "Customer deleted successfully" }
```

### POST `/api/v1/customers/{id}/restore`

Response `200`:

```json
{ "message": "Customer restored successfully" }
```

### GET `/api/v1/customers/{id}/conflicts`

Response `200`:

```json
{
  "data": [
    {
      "id": "uuid",
      "customer_id": "uuid",
      "conflict_name": "Cong ty doi ung"
    }
  ]
}
```

### POST `/api/v1/customers/{id}/conflicts`

Request:

```json
{ "conflict_name": "Cong ty doi ung" }
```

Rules:

- `conflict_name` bat buoc.

Response `201`:

```json
{ "message": "Conflict entry added successfully" }
```

### Profile documents cho customer

Customer profile co the upload/list/download/delete ho so qua:

- `GET /api/v1/profile-documents?entity_type=customer&entity_id={customer_id}`
- `POST /api/v1/profile-documents` multipart
- `GET /api/v1/profile-documents/{id}/download`
- `DELETE /api/v1/profile-documents/{id}`

Multipart upload fields:

- `entity_type`: `user` hoac `customer`.
- `entity_id`: uuid.
- `title`: optional.
- `file`: required.

## 7. Projects

### Project DTO

```ts
type Project = {
  id: string;
  organization_id: string;
  customer_id: string;
  name: string;
  hourly_rate: number;
  status: "ACTIVE" | "CLOSED";
  workflow_template_id?: string | null;
  current_workflow_step_id?: string | null;
  total_contract_value: number;
  total_paid: number;
  remaining_amount: number;
  conflict_status: "CLEARED" | "CONFLICT_DETECTED" | "OVERRIDDEN_CLEARED";
  opposing_party_name?: string | null;
  opposing_party_tax_code?: string | null;
  created_at: string;
  updated_at?: string | null;
  actions?: Actions;
};
```

### GET `/api/v1/projects`

Query:

- `limit`: default `20`.
- `offset`: default `0`.
- `customer_id`: optional uuid.
- `status`: optional, FE nen gui `ACTIVE` hoac `CLOSED`.

Response `200`:

```json
{
  "data": [],
  "pagination": { "total": 0, "limit": 20, "offset": 0, "count": 0 }
}
```

Luu y:

- Neu co `customer_id`, BE list theo customer roi paginate bang memory.
- Neu co `status`, BE loc sau khi lay list. `total` co the khong phan anh tong dataset.

### GET `/api/v1/projects/{id}`

Response `200`: Project DTO.

### POST `/api/v1/projects`

Request:

```json
{
  "customer_id": "uuid",
  "name": "Vu viec hop dong",
  "hourly_rate": 1000000,
  "workflow_template_id": "uuid",
  "total_contract_value": 50000000,
  "opposing_party_name": "Ben doi ung",
  "opposing_party_tax_code": "0311111111"
}
```

Rules:

- `customer_id` bat buoc.
- `name` bat buoc.
- `hourly_rate >= 0`.
- `total_contract_value >= 0`.
- Neu co `workflow_template_id`, template phai active va co step dau tien.
- BE tu set `status = ACTIVE`, `total_paid = 0`.
- BE scan conflict khi tao project; neu conflict thi `conflict_status = CONFLICT_DETECTED`.

Response `201`: Project DTO.

### PUT `/api/v1/projects/{id}`

Request:

```json
{
  "name": "Vu viec hop dong updated",
  "hourly_rate": 1200000,
  "workflow_template_id": "uuid",
  "current_workflow_step_id": "uuid",
  "total_contract_value": 60000000,
  "opposing_party_name": "Ben doi ung",
  "opposing_party_tax_code": "0311111111"
}
```

Rules:

- `name` bat buoc.
- `hourly_rate >= 0`.
- `total_contract_value >= 0` neu gui.
- FE nen dung endpoint workflow-step de chuyen step thay vi update thang `current_workflow_step_id`, vi endpoint workflow-step co guard thanh toan va audit.

Response `200`: Project DTO.

### POST `/api/v1/projects/{id}/close`

Response `200`:

- Thuong tra Project DTO da `status = CLOSED`.
- Neu BE close xong nhung fetch lai fail, tra `{ "message": "Project closed successfully" }`.

## 8. Workflow

### Workflow Template DTO

```ts
type WorkflowTemplate = {
  id: string;
  organization_id: string;
  template_name: string;
  description?: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  steps?: WorkflowStep[];
  steps_count?: number;
};
```

### Workflow Step DTO

```ts
type WorkflowStep = {
  id: string;
  organization_id: string;
  template_id: string;
  step_key: string;
  step_name: string;
  macro_column: "INTAKE" | "IN_PROGRESS" | "BILLING" | "ARCHIVED";
  sort_order: number;
  financial_trigger?: Record<string, unknown>;
  security_trigger?: Record<string, unknown>;
  task_trigger?: Record<string, unknown>;
  is_terminal: boolean;
  created_at: string;
  updated_at: string;
};
```

### GET `/api/v1/workflow-templates`

Query:

- `active=true` de chi lay active template.
- Neu khong gui hoac gui `false`, BE tra tat ca template theo org.

Response `200`:

```json
{
  "data": [
    {
      "id": "uuid",
      "organization_id": "uuid",
      "template_name": "Default Workflow",
      "description": null,
      "is_default": true,
      "is_active": true,
      "created_at": "2026-06-15T10:30:00Z",
      "updated_at": "2026-06-15T10:30:00Z",
      "steps_count": 4
    }
  ]
}
```

### GET `/api/v1/workflow-templates/{id}`

Response `200`: WorkflowTemplate co `steps`.

### POST `/api/v1/workflow-templates`

Role: `PARTNER`, `SUPER_ADMIN`.

Request:

```json
{
  "template_name": "Legal Matter Workflow",
  "description": "Quy trinh xu ly vu viec",
  "is_default": true,
  "steps": [
    {
      "step_key": "intake",
      "step_name": "Tiep nhan",
      "macro_column": "INTAKE",
      "sort_order": 1,
      "financial_trigger": {
        "requires_payment": false,
        "payment_type": "NONE"
      },
      "security_trigger": {},
      "task_trigger": {},
      "is_terminal": false
    }
  ]
}
```

Rules:

- `template_name` bat buoc.
- `steps` phai co it nhat 1 item.
- `step_key` bat buoc va unique trong template.
- `step_name` bat buoc.
- `sort_order > 0` va unique trong template.
- `macro_column` chi duoc: `INTAKE`, `IN_PROGRESS`, `BILLING`, `ARCHIVED`.
- Neu co `financial_trigger.financial_tags`, moi item phai hop le.

Financial tag hop le:

- `type = FREE`: `amount` neu co phai bang `0`.
- `type = FIXED_AMOUNT`: `amount > 0`.
- `type = PERCENTAGE`: `value > 0 && value <= 100`, `base` neu co phai la `fee`, `deposit`, `total_contract_value`.
- `type = CALCULATED` hoac `MANUAL`.
- `key` phai thuoc metric hop le hoac `custom`.
- Neu `key = custom` thi can `custom_key`.

Metric hop le:

- `fee`, `deposit`, `discount`, `refund`, `paid`, `remaining`, `deposit_due`, `unpaid_fee`, `free_count`, `free_hours`, `free_projects`

Response `201`:

```json
{
  "id": "uuid",
  "template_name": "Legal Matter Workflow",
  "steps_count": 1
}
```

### PUT `/api/v1/workflow-templates/{id}`

Role: `PARTNER`, `SUPER_ADMIN`.

Request:

```json
{
  "template_name": "Legal Matter Workflow",
  "description": "Updated",
  "is_default": false,
  "is_active": true
}
```

Response `200`: WorkflowTemplate co steps.

### DELETE `/api/v1/workflow-templates/{id}`

Role: `PARTNER`, `SUPER_ADMIN`.

Behavior: archive template bang `is_active=false`, khong hard delete.

Response `200`:

```json
{ "message": "Workflow template archived successfully" }
```

### GET `/api/v1/projects/board`

Query:

- `workflow_template_id`: bat buoc uuid.

Response `200`:

```json
{
  "macro_columns": [
    {
      "key": "INTAKE",
      "title": "Intake",
      "steps": [
        {
          "step_id": "uuid",
          "step_key": "intake",
          "step_name": "Tiep nhan",
          "sort_order": 1,
          "projects": [
            {
              "id": "uuid",
              "name": "Vu viec A",
              "customer_id": "uuid",
              "status": "ACTIVE",
              "conflict_status": "CLEARED",
              "total_contract_value": 50000000,
              "total_paid": 10000000,
              "remaining_amount": 40000000
            }
          ]
        }
      ]
    }
  ]
}
```

Macro columns luon theo thu tu: `INTAKE`, `IN_PROGRESS`, `BILLING`, `ARCHIVED`.

### PATCH `/api/v1/projects/{id}/workflow-step`

Request:

```json
{
  "target_step_key": "billing",
  "incoming_payment_confirmation": 10000000,
  "payment_method": "bank_transfer",
  "payment_note": "Khach da chuyen khoan",
  "payment_type": "DEPOSIT"
}
```

Rules:

- `target_step_key` bat buoc.
- `incoming_payment_confirmation >= 0`.
- Project dang `CONFLICT_DETECTED` bi block.
- Project phai co `workflow_template_id`.
- Target step phai thuoc template cua project.
- Neu target step co financial guard, BE kiem tra nguong thanh toan.

Response `200`: Project DTO.

Financial blocked response `422`:

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

Luu y: response 422 nay khong theo RFC 7807. Repository can handle rieng.

### POST `/api/v1/projects/{id}/override-conflict`

Role: `PARTNER`, `SUPER_ADMIN`.

Request:

```json
{
  "override_justification": "Ly do override it nhat 50 ky tu, ghi ro nguoi phe duyet va can cu nghiep vu."
}
```

Rules:

- `override_justification` toi thieu 50 ky tu.
- BE set `conflict_status = OVERRIDDEN_CLEARED` va ghi audit.

Response `200`: Project DTO.

## 9. Dashboard

### GET `/api/v1/dashboard/summary`

Query:

- `range`: `7d`, `30d`, `90d`, `custom`. Default `30d`.
- Neu `range=custom`, can `from=YYYY-MM-DD` va `to=YYYY-MM-DD`.
- `workflow_template_id`: optional uuid, chi ap dung cho group workflow.
- `due_limit`: optional, default `10`, max `50`, invalid se fallback default.
- `attention_limit`: optional, default `10`, max `50`, invalid se fallback default.

Response `200`:

```json
{
  "range": { "from": "2026-05-17", "to": "2026-06-15" },
  "kpis": {
    "open_issues": 3,
    "overdue_issues": 1,
    "active_projects": 12,
    "revenue_collected": 100000000
  },
  "issue_status": [
    { "status": "OPEN", "count": 3 }
  ],
  "project_workflow": [
    { "macro_column": "INTAKE", "title": "Intake", "count": 4 }
  ],
  "due_items": [
    {
      "id": "uuid",
      "title": "Soan hop dong",
      "project_id": "uuid",
      "project_name": "Vu viec A",
      "assignee_id": "uuid",
      "assignee_name": "Nguyen Van A",
      "priority": "HIGH",
      "due_date": "2026-06-16",
      "overdue": false
    }
  ],
  "projects_need_attention": [
    {
      "id": "uuid",
      "name": "Vu viec A",
      "customer_id": "uuid",
      "customer_name": "Cong ty A",
      "reason": "CONFLICT_DETECTED",
      "reason_label": "Conflict detected",
      "current_step_name": "Tiep nhan",
      "remaining_amount": 40000000
    }
  ]
}
```

## 10. Tasks, Labels, Reports, OKR

### Task API

BE da co CRUD task tren bang `project_tasks`.

Endpoints:

- `GET /api/v1/tasks?limit=&offset=&project_id=&assignee_id=&status=&q=`
- `GET /api/v1/projects/{id}/tasks`
- `GET /api/v1/tasks/{id}`
- `POST /api/v1/tasks`
- `PUT /api/v1/tasks/{id}`
- `PATCH /api/v1/tasks/{id}/status`
- `PATCH /api/v1/tasks/{id}/assignee`
- `PATCH /api/v1/tasks/reorder`
- `DELETE /api/v1/tasks/{id}`

Task DTO:

```json
{
  "id": "uuid",
  "organization_id": "uuid",
  "project_id": "uuid",
  "workflow_step_id": "uuid",
  "title": "Soan hop dong",
  "description": "Noi dung viec",
  "status": "TODO",
  "assignee_id": "uuid",
  "due_date": "2026-06-30",
  "position": 0,
  "created_at": "2026-06-15T10:30:00Z",
  "updated_at": "2026-06-15T10:30:00Z"
}
```

Create/update request:

```json
{
  "project_id": "uuid",
  "workflow_step_id": "uuid",
  "title": "Soan hop dong",
  "description": "Noi dung viec",
  "status": "TODO",
  "assignee_id": "uuid",
  "due_date": "2026-06-30",
  "position": 0
}
```

Status hop le: `TODO`, `DOING`, `DONE`, `CANCELLED`.

### Label API

BE da co label catalog va label assignments.

Endpoints:

- `GET /api/v1/labels?project_id=&archived=`
- `POST /api/v1/labels`
- `GET /api/v1/labels/{id}`
- `PUT /api/v1/labels/{id}`
- `DELETE /api/v1/labels/{id}` soft archive
- `GET /api/v1/label-assignments?entity_type=&entity_id=`
- `POST /api/v1/label-assignments`
- `DELETE /api/v1/label-assignments/{id}`

Label request:

```json
{
  "project_id": "uuid",
  "title": "priority::high",
  "description": "Viec uu tien cao",
  "color": "#d32f2f",
  "scoped_key": "priority",
  "scoped_value": "high",
  "priority": 1,
  "is_archived": false
}
```

Label assignment request:

```json
{
  "label_id": "uuid",
  "entity_type": "task",
  "entity_id": "uuid"
}
```

`entity_type` hop le: `customer`, `project`, `task`, `document`.

### Task Reports

BE da co report endpoints rieng cho dashboard/thong ke task:

- `GET /api/v1/reports/tasks/summary`
- `GET /api/v1/reports/tasks/by-assignee`
- `GET /api/v1/reports/tasks/by-status`
- `GET /api/v1/reports/tasks/overdue?limit=`
- `GET /api/v1/reports/workload` alias cua by-assignee

Summary response:

```json
{
  "total_tasks": 10,
  "open_tasks": 6,
  "overdue_tasks": 2,
  "completed_tasks": 4,
  "completion_rate": 40
}
```

### OKR API

BE da co OKR cycle/objective/key result co ban.

Endpoints:

- `GET /api/v1/okr/cycles?status=`
- `POST /api/v1/okr/cycles`
- `GET /api/v1/okr/objectives?cycle_id=`
- `POST /api/v1/okr/objectives`
- `PUT /api/v1/okr/objectives/{id}`
- `DELETE /api/v1/okr/objectives/{id}`
- `POST /api/v1/okr/objectives/{id}/key-results`
- `PUT /api/v1/okr/key-results/{id}`
- `GET /api/v1/reports/okr/summary`

Cycle request:

```json
{
  "name": "Q3 2026",
  "period_type": "QUARTER",
  "starts_at": "2026-07-01",
  "ends_at": "2026-09-30",
  "status": "ACTIVE"
}
```

Objective request:

```json
{
  "cycle_id": "uuid",
  "owner_user_id": "uuid",
  "owner_role": "LAWYER",
  "title": "Nang cao toc do xu ly ho so",
  "description": "Muc tieu quy",
  "progress": 35,
  "status": "ON_TRACK",
  "weight": 1
}
```

Key result request:

```json
{
  "title": "Hoan thanh 30 task dung han",
  "target_value": 30,
  "current_value": 10,
  "unit": "tasks",
  "progress": 33.33,
  "status": "ON_TRACK",
  "linked_entity_type": "manual",
  "linked_entity_id": null
}
```

OKR status hop le: `ON_TRACK`, `AT_RISK`, `OFF_TRACK`, `DONE`, `CANCELLED`.

## 11. Documents

### Document DTO

```ts
type Document = {
  id: string;
  organization_id: string;
  project_id: string;
  title: string;
  file_size: number;
  is_locked_worm: boolean;
  uploaded_by?: string | null;
  deleted_at?: string | null;
  created_at: string;
  client_created_at?: string | null;
  actions?: Actions;
};
```

### GET `/api/v1/documents`

Query:

- `limit`: default `20`.
- `offset`: default `0`.
- `project_id`: optional uuid.

Response `200`: `{ data: Document[], pagination }`.

### GET `/api/v1/documents/{id}`

Response `200`: Document DTO.

### GET `/api/v1/documents/{id}/download`

Response `200`:

- Binary body.
- Header `Content-Disposition: attachment; filename="<title>"`.
- FE repository nen tra `Blob` va filename parse tu header.

### POST `/api/v1/documents`

Content type: `multipart/form-data`.

Fields:

- `file`: bat buoc.
- `project_id`: bat buoc uuid.
- `title`: optional, neu trong thi BE dung filename.
- `client_created_at`: optional RFC3339.

Response `201`: Document DTO.

Loi dang chu y:

- `FILE_TOO_LARGE`
- `MALWARE_DETECTED`

### DELETE `/api/v1/documents/{id}`

Soft delete.

Response `200`:

```json
{ "message": "Document deleted successfully" }
```

Loi dang chu y:

- `423 WORM_LOCK_ACTIVE`

### POST `/api/v1/documents/{id}/lock`

Role: `PARTNER`.

Response `200`:

```json
{ "message": "Document locked successfully" }
```

## 12. Time Entries

### TimeEntry DTO

```ts
type TimeEntry = {
  id: string;
  organization_id: string;
  project_id: string;
  user_id: string;
  duration_minutes: number;
  description: string;
  billable: boolean;
  invoice_id?: string | null;
  created_at: string;
  client_created_at?: string | null;
  actions?: Actions;
};
```

### GET `/api/v1/time-entries`

Query:

- `limit`: default `20`.
- `offset`: default `0`.
- `project_id`: optional uuid.
- `user_id`: optional uuid.
- `billable`: optional, string `true` de lay billable, moi gia tri khac voi non-empty se duoc hieu la `false`.

Response `200`: `{ data: TimeEntry[], pagination }`.

### GET `/api/v1/time-entries/{id}`

Response `200`: TimeEntry DTO.

### POST `/api/v1/time-entries`

Request:

```json
{
  "project_id": "uuid",
  "duration_minutes": 90,
  "description": "Soan hop dong",
  "billable": true,
  "client_created_at": "2026-06-15T10:30:00Z"
}
```

Rules:

- `project_id` bat buoc.
- `duration_minutes > 0`.
- `description` bat buoc.

Response `201`: TimeEntry DTO.

### PUT `/api/v1/time-entries/{id}`

Request:

```json
{
  "project_id": "uuid",
  "duration_minutes": 120,
  "description": "Cap nhat cong viec",
  "billable": true
}
```

Rules:

- `duration_minutes > 0`.
- `description` bat buoc.
- Neu time entry da co `invoice_id`, BE tra `423 BILLING_LOCK_ACTIVE`.

Response `200`: TimeEntry DTO.

### DELETE `/api/v1/time-entries/{id}`

Rules:

- Neu time entry da co `invoice_id`, BE tra `423 BILLING_LOCK_ACTIVE`.

Response `200`:

```json
{ "message": "Time entry deleted successfully" }
```

## 13. Invoices

### Invoice DTO

```ts
type Invoice = {
  id: string;
  organization_id: string;
  customer_id: string;
  total_amount: number;
  status: "DRAFT" | "UNPAID" | "PAID" | "VOID";
  issued_at: string;
  created_at: string;
  actions?: Actions;
};
```

### GET `/api/v1/invoices`

Query:

- `limit`: default `20`.
- `offset`: default `0`.
- `customer_id`: optional uuid.
- `status`: optional.

Response `200`: `{ data: Invoice[], pagination }`.

### GET `/api/v1/invoices/{id}`

Response `200`: Invoice DTO.

### GET `/api/v1/invoices/{id}/time-entries`

Response `200`:

```json
{
  "data": []
}
```

Dung endpoint nay nhu invoice line items hien tai, vi BE generate invoice tu time entries.

### POST `/api/v1/invoices/generate`

Role: `PARTNER`, `ACCOUNTANT`.

Request:

```json
{
  "project_id": "uuid",
  "customer_id": "uuid",
  "status": "DRAFT"
}
```

Rules:

- `project_id` bat buoc.
- `customer_id` bat buoc.
- `status` optional, default `DRAFT`.
- `status` phai la `DRAFT`, `UNPAID`, `PAID`, `VOID`.
- BE tao invoice tu unbilled time entries cua project.

Response `201`: Invoice DTO.

Loi dang chu y:

- `400 BAD_REQUEST`: `No unbilled time entries found for this project`.

### PUT `/api/v1/invoices/{id}/status`

Request:

```json
{ "status": "PAID" }
```

Rules:

- `status` phai la `DRAFT`, `UNPAID`, `PAID`, `VOID`.

Response `200`:

- Thuong tra Invoice DTO.
- Neu update xong nhung fetch lai fail, tra `{ "message": "Invoice status updated successfully" }`.

### GET `/api/v1/project-payments`

Query:

- `project_id`: optional uuid.

Response `200`:

```json
{
  "data": [
    {
      "id": "uuid",
      "organization_id": "uuid",
      "project_id": "uuid",
      "workflow_step_id": "uuid",
      "amount": 1000000,
      "payment_type": "DEPOSIT",
      "payment_method": "bank_transfer",
      "paid_at": "2026-06-15T10:30:00Z",
      "note": "Thanh toan coc",
      "created_by": "uuid",
      "created_at": "2026-06-15T10:30:00Z"
    }
  ]
}
```

### GET `/api/v1/project-payments/{id}`

Response `200`: project payment DTO.

## 14. Audit Logs

### AuditLog DTO

```ts
type AuditLog = {
  id: string;
  organization_id: string;
  user_id?: string | null;
  action: string;
  metadata?: Record<string, unknown>;
  previous_hash: string;
  current_hash: string;
  created_at: string;
};
```

### GET `/api/v1/audit-logs`

Query:

- `limit`: default `20`.
- `offset`: default `0`.
- `user_id`: optional uuid.
- `action`: optional string.

Response `200`: `{ data: AuditLog[], pagination }`.

Luu y:

- Khi filter `user_id` hoac `action`, BE lay list theo filter nhung `pagination.total` van count theo organization.

### GET `/api/v1/audit-logs/{id}`

Response `200`: AuditLog DTO.

### POST `/api/v1/audit-logs/verify`

Response `200`:

```json
{
  "valid": true,
  "broken_at": null,
  "message": "Audit chain is valid"
}
```

## 15. Admin

### POST `/api/v1/admin/purge`

Role: `SUPER_ADMIN`.

Response `200`:

```json
{
  "customers_deleted": 0,
  "documents_deleted": 0,
  "files_deleted": 0,
  "retention_days": 90,
  "errors": []
}
```

### GET `/api/v1/admin/tenant-settings`

Role: `SUPER_ADMIN`.

Response `200`:

```json
{
  "tier_plan": "STARTER",
  "feature_flags": ["advanced_billing"]
}
```

### PUT `/api/v1/admin/tenant-settings`

Role: `SUPER_ADMIN`.

Request:

```json
{
  "tier_plan": "PRO",
  "feature_flags": ["advanced_billing", "audit_export"]
}
```

Response `200`:

```json
{ "message": "Tenant settings updated successfully" }
```

`errors` chi xuat hien neu co loi.

## 16. Metadata Schema

### GET `/api/v1/metadata/schemas/{entity}`

Supported entity:

- `customers`
- `projects`
- `documents`
- `time_entries`
- `invoices`
- `workflow_templates`
- `workflow_steps`
- `project_payments`

Response `200`:

```json
{
  "entity": "projects",
  "columns": [
    {
      "key": "name",
      "type": "TEXT",
      "sortable": true,
      "filterable": true,
      "required": false
    }
  ]
}
```

Column type hien co:

- `UUID`
- `TEXT`
- `NUMBER`
- `DATE`
- `BOOLEAN`

FE dung schema nay de render DataGrid columns/filter basic, nhung khong nen suy dien rang backend da support sort/filter server-side cho moi column. Nhieu list endpoint hien tai chi support filter rieng duoc liet ke o tren.

## 17. Repository module de xay dung o FE

De xuat cau truc:

```text
src/lib/api/http-client.ts
src/lib/api/errors.ts
src/lib/api/idempotency.ts
src/repositories/auth.repository.ts
src/repositories/users.repository.ts
src/repositories/customers.repository.ts
src/repositories/projects.repository.ts
src/repositories/workflow.repository.ts
src/repositories/dashboard.repository.ts
src/repositories/tasks.repository.ts
src/repositories/task-reports.repository.ts
src/repositories/labels.repository.ts
src/repositories/okr.repository.ts
src/repositories/documents.repository.ts
src/repositories/profile-documents.repository.ts
src/repositories/time-entries.repository.ts
src/repositories/invoices.repository.ts
src/repositories/project-payments.repository.ts
src/repositories/audit-logs.repository.ts
src/repositories/metadata.repository.ts
```

HTTP client requirements:

- Tu dong gan `Authorization`.
- Tu dong gan `Idempotency-Key` cho mutation neu caller khong truyen.
- Parse JSON response neu content-type la JSON.
- Parse `application/problem+json` thanh typed error.
- Handle `422 ERR_WORKFLOW_FINANCIAL_BLOCKED` rieng.
- Download document tra `{ blob, filename }`.
- Upload document dung `FormData`, khong set manual `Content-Type`.

## 18. BE chua co endpoint cho cac nhu cau FE thuong gap

Khong build UI phu thuoc vao cac API chua ton tai:

- Chua co endpoint search full-text customer/project/document.
- Chua co endpoint update/delete invoice ngoai update status.
- Chua co invoice line_items table rieng; hien dung invoice time entries lam line items.
- Chua co OKR dashboard nang cao theo workload/revenue contribution; OKR CRUD va summary co ban da co.

Neu UI can cac chuc nang nay, phai bo sung BE truoc hoac hien thi dang read-only/placeholder co kiem soat.

## 19. Trang thai day du chuc nang BE

Bang nay tra loi nhanh "BE da co chuc nang nay chua?" de FE khong build nham vao API chua ton tai.

| Nhom chuc nang | Trang thai BE | Ghi chu |
| --- | --- | --- |
| Xac thuc, MFA, profile ca nhan | Da co API | Login, MFA enable/disable, `/users/me`, update profile co optimistic lock |
| Phan quyen page/action | Da co mot phan | Role guard cho endpoint nhay cam; record `actions` co tren customer/project/document/time entry/invoice |
| Quan ly user/nhan vien | Da co API | List/detail/create/update/activate/deactivate/reset password/reset MFA |
| Quan ly thong tin khach hang | Da co API co ban | CRUD customer, soft delete/restore, add/list conflict entries |
| Ho so khach hang nang cao | Da co mot phan | Da co email, phone, address, representative_name, notes va profile documents; chua co contact persons nhieu dong/custom fields persisted |
| Quan ly project/vu viec | Da co API co ban | CRUD project, close, workflow board, conflict override, financial guard |
| Quan ly workflow | Da co mot phan | Create/list/get/update/archive template, move project step; chua co update/delete step rieng |
| Quan ly tai lieu | Da co API | Upload, metadata, download, soft delete, WORM lock |
| Quan ly cham cong | Da co API | Create/list/get/update/delete; billing lock khi da gan invoice |
| Quan ly hoa don | Da co mot phan | Generate/list/get/update status, invoice time entries; chua co invoice line_items table rieng va update/delete day du |
| Labels | Da co API co ban | Catalog CRUD, archive, assign/unassign label cho customer/project/task/document |
| Task/project task | Da co API co ban | CRUD task, status/assignee update, reorder, list theo project |
| Thong ke/bao cao task | Da co API co ban | Summary, by assignee, by status, overdue; chua co report theo label va on-time rate nang cao |
| OKR/performance | Da co API co ban | OKR cycles/objectives/key results va summary; chua co performance dashboard nang cao |
| Audit logs | Da co API | List/get/verify chain |
| Metadata schema | Da co mot phan | Built-in schema cho mot so entity; custom fields chua persisted |
| Tenant settings/subscription/feature flags admin | Da co API co ban | SUPER_ADMIN get/update tier_plan va enabled feature flags |

## 20. User Management da co tren BE

BE da co nhom endpoint quan ly nhan vien tai section Authentication va User:

- `GET /api/v1/users`
- `GET /api/v1/users/{id}`
- `POST /api/v1/users`
- `PUT /api/v1/users/{id}`
- `POST /api/v1/users/{id}/activate`
- `POST /api/v1/users/{id}/deactivate`
- `POST /api/v1/users/{id}/reset-password`
- `POST /api/v1/users/{id}/mfa/reset`

Moi mutation user ghi audit:

- `USER_CREATED`
- `USER_UPDATED`
- `USER_ACTIVATED`
- `USER_DEACTIVATED`
- `USER_PASSWORD_RESET`
- `USER_MFA_RESET`

Metadata nen co `target_user_id`, `before`, `after`, `actor_user_id`.
