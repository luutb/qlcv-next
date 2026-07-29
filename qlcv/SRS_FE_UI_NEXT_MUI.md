# SRS FE UI/UX - Next.js + MUI

Ngày cập nhật: 2026-06-15

Tài liệu này mô tả UI/UX cho FE dựa trên BE hiện tại và `docs/SRS_FE_API.md`.

## 1. Mục Tiêu FE

Xây dựng app nội bộ cho công ty pháp lý:

- Dashboard tổng quan vận hành.
- Quản lý khách hàng và hồ sơ khách hàng.
- Quản lý project/vụ việc theo workflow.
- Quản lý công việc bằng Work Board giống GitLab.
- Quản lý tài liệu.
- Quản lý user/nhân viên.
- Quản lý task reports, workload, OKR.
- Quản lý billing/time entries/invoices.
- Quản trị workflow, labels, tenant settings, audit.

Yêu cầu UI:

- Dùng Next.js App Router + TypeScript.
- Dùng MUI Material và MUI X Data Grid.
- Giao diện trực quan, dễ scan, ít trang trí thừa.
- App shell rõ ràng: sidebar, topbar, content area.
- Màn hình nghiệp vụ ưu tiên thao tác nhanh, filter nhanh, drawer detail.

Ghi chú kỹ thuật:

- Next.js + MUI là technical decision theo yêu cầu dự án hiện tại.
- SRS này vẫn là UI/UX SRS, nhưng có ghi rõ component MUI để FE implement thống nhất.
- Nếu team sau này đổi design system, phần nghiệp vụ/flow vẫn giữ; phần MUI component mapping sẽ cần cập nhật.

## 1.1 Thuật Ngữ Chuẩn Trong Tài Liệu

Để tránh lệch tầng giữa route, API và entity BE, dùng thống nhất các thuật ngữ sau:

| Thuật ngữ FE | Ý nghĩa | Route/API/BE |
| --- | --- | --- |
| `Work Board` | Màn hình quản lý công việc hằng ngày, lấy cảm hứng từ GitLab | Route canonical: `/work` |
| `Issue` | Tên gọi UX cho một công việc trên Work Board | API canonical: `/api/v1/issues/*` |
| `Task` | Entity BE thật phía sau issue | DB/BE model: `project_tasks` |
| `Project Task` | Cách gọi task khi nằm trong project detail | API có thể dùng `/api/v1/projects/{id}/tasks` hoặc `/api/v1/tasks` |
| `Project Workflow Board` | Board theo dõi vụ việc/project qua workflow | API: `/api/v1/projects/board` |
| `Workflow Step` | Column động của Work Board và Project Board | BE: `workflow_steps` |

Quy ước bắt buộc:

- UI route chỉ dùng `/work` cho Work Board.
- FE repository cho Work Board ưu tiên gọi `/api/v1/issues/*`.
- Không tạo route `/issue-board` hoặc `/tasks` trong v1 nếu không có yêu cầu riêng; nếu cần backward compatibility thì redirect về `/work`.
- Trong UI copy, dùng "Issue" hoặc "Công việc"; tên màn hình chuẩn là "Work Board".
- Trong code nội bộ có thể có `tasks.repository.ts` cho project detail, nhưng màn hình vận hành chính là `features/work-board`.

## 1.2 Phạm Vi V1 Complete

V1 Complete là phạm vi hiện tại cần làm để tận dụng toàn bộ năng lực BE hiện có. Đây không phải roadmap xa.

Phạm vi bắt buộc:

- Auth đầy đủ: login, profile, MFA enable/disable, session expiry.
- Dashboard đầy đủ: KPI, workload, overdue, workflow distribution, OKR summary, projects need attention.
- Work Board giống GitLab: issues, labels, assignee, workflow columns, drag/drop, list view, drawer detail.
- Project workflow: board vụ việc, financial guard, conflict override, payments, tasks, documents, billing.
- Customer 360: hồ sơ, conflicts, projects, profile documents, labels.
- User 360: quản lý nhân viên, trạng thái hoạt động, reset password/MFA, profile documents.
- Document center: project documents, WORM lock, malware error handling, profile documents.
- Billing: time entries, invoice generation/status, invoice time entries, project payments.
- Labels: catalog, scoped labels, assignment vào customer/project/task/document.
- OKR: cycles, objectives, key results, summary.
- Reports: task summary, by assignee, by status, overdue, workload, OKR.
- Admin: tenant settings, purge, workflow templates, metadata schema, audit verify.

Không được để endpoint BE có thật nhưng không có nơi dùng trong FE, trừ khi ghi rõ là admin/diagnostic.

## 1.3 Ngoài Phạm Vi V1 / Roadmap

Các mục sau không được trộn vào scope bắt buộc của V1 nếu BE chưa hỗ trợ server-side:

- Saved board views server-side.
- Activity/comment thread riêng cho issue.
- Multi-assignee.
- Milestone/sprint/iteration riêng.
- Invoice line items table riêng.
- CRUD từng workflow step sau khi template đã tạo.
- Advanced performance dashboard theo revenue contribution nếu BE chưa có API.

Nếu UI cần hiển thị các mục này, chỉ được để dạng placeholder có kiểm soát hoặc ghi rõ "cần BE bổ sung".

## 1.4 BE Capability -> FE Feature Matrix

| BE capability | FE feature bắt buộc | Route |
| --- | --- | --- |
| Auth login/MFA | Login flow, MFA challenge, profile menu | `/login`, `/settings/profile` |
| Users management | CRUD nhân viên, active/deactivate, reset password/MFA | `/users` |
| Profile documents | Hồ sơ đính kèm cho user/customer | `/users`, `/customers/[id]` |
| Customers | Customer list/detail, conflict, restore | `/customers`, `/customers/[id]` |
| Projects | Matter/project list/detail, close, conflict override | `/projects`, `/projects/[id]` |
| Project board | Workflow board cho vụ việc | `/projects/board` hoặc tab trong `/projects` |
| Workflow templates | Cấu hình workflow và steps lúc tạo template | `/settings/workflow-templates` |
| Work Board | GitLab-style issue workflow | `/work` |
| Labels | Catalog và assignment | `/labels`, entity drawers |
| Project documents | Document center, upload/download/lock/delete | `/documents`, `/projects/[id]` |
| Time entries | Timesheet/billing input | `/time-entries`, `/projects/[id]` |
| Invoices | Generate invoice, status update, invoice detail | `/invoices`, `/invoices/[id]` |
| Project payments | Payment ledger theo project/workflow | `/projects/[id]` billing tab |
| Dashboard summary | Executive/operations dashboard | `/dashboard` |
| Reports | Task/workload/OKR reports | `/reports` |
| OKR | OKR management and progress | `/okr` |
| Audit logs | Audit browsing and hash verification | `/audit-logs` |
| Tenant settings | Plan/features admin | `/admin/tenant-settings` |
| Metadata schemas | Dynamic column/filter helper, admin diagnostic | table configs/admin diagnostics |
| Admin purge | Manual purge operation | `/admin/purge` |

## 2. Routing

Canonical routes V1:

```text
/login
/dashboard
/work
/projects
/projects/[id]
/customers
/customers/[id]
/documents
/users
/labels
/time-entries
/invoices
/invoices/[id]
/okr
/reports
/audit-logs
/settings/workflow-templates
/settings/profile
/admin/tenant-settings
/admin/purge
```

Route aliases không khuyến nghị trong V1:

```text
/issue-board -> redirect /work nếu cần backward compatibility
/tasks -> không dùng làm màn hình chính; project tasks nằm trong /projects/[id] hoặc /work
/settings/users -> không dùng nếu đã chọn canonical /users
```

`/work` là route canonical cho màn hình quản lý công việc. Trải nghiệm tương tự GitLab, nhưng tên màn hình trong sản phẩm là Work Board và repository gọi `/api/v1/issues/board`.

Users route:

- Canonical route: `/users`.
- Lý do: user management là module vận hành chính, không chỉ là settings phụ.
- Nếu team shell hiện có nhóm Settings, có thể đặt navigation item trong nhóm Admin/Settings nhưng route vẫn là `/users`.

## 3. Role Và Route Guard

Roles:

```text
SUPER_ADMIN
PARTNER
LAWYER
ACCOUNTANT
```

Route access:

| Route | SUPER_ADMIN | PARTNER | LAWYER | ACCOUNTANT | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| `/dashboard` | Yes | Yes | Yes | Yes | Tổng quan |
| `/work` | Yes | Yes | Yes | Read | Issue/task board |
| `/projects` | Yes | Yes | Yes | Read | Vụ việc |
| `/customers` | Yes | Yes | Read | Read | Hồ sơ khách hàng |
| `/documents` | Yes | Yes | Yes | Read | Tài liệu |
| `/users` | Yes | Yes | No | No | Quản lý nhân viên |
| `/labels` | Yes | Yes | No | No | Quản lý labels |
| `/time-entries` | Yes | Yes | Yes | Yes | Billing/time |
| `/invoices` | Yes | Yes | Read | Yes | Hóa đơn |
| `/okr` | Yes | Yes | Read | Read | OKR |
| `/reports` | Yes | Yes | Yes | Yes | Báo cáo |
| `/audit-logs` | Yes | Yes | Read | Read | Audit |
| `/settings/workflow-templates` | Yes | Yes | No | No | Workflow config |
| `/admin/tenant-settings` | Yes | No | No | No | Tenant settings |
| `/admin/purge` | Yes | No | No | No | Admin purge |

Nguyên tắc:

- FE route guard dựa trên role từ `/users/me`.
- Record action dựa trên `actions` nếu DTO có.
- Nếu BE trả `403`, hiển thị `NoPermission` hoặc inline alert.
- Không hard-code quyền thao tác khi response có `actions`.

## 4. App Shell

Components:

- `ProtectedLayout`
- `AppSidebar`
- `TopBar`
- `UserMenu`
- `TenantBadge`
- `GlobalErrorBoundary`

Sidebar:

- Dashboard
- Work Board
- Projects
- Customers
- Documents
- Users
- Labels
- Time Entries
- Invoices
- OKR
- Reports
- Audit Logs
- Settings

MUI:

- `Drawer` cho sidebar.
- `AppBar` cho topbar.
- `ListItemButton` cho nav.
- `Chip` cho role/plan.
- `Snackbar` cho mutation result.

## 5. Dashboard `/dashboard`

Mục đích:

- Tổng quan nhanh tình hình vận hành.
- Thống kê công việc, vụ việc, doanh thu, deadline.
- Điều hướng vào màn hình xử lý.

API:

```text
GET /api/v1/dashboard/summary?from=&to=
GET /api/v1/reports/tasks/summary
GET /api/v1/reports/tasks/by-assignee
GET /api/v1/reports/tasks/by-status
GET /api/v1/reports/tasks/overdue
GET /api/v1/reports/workload
GET /api/v1/reports/okr/summary
```

Components:

- `DashboardPage`
- `DashboardDateRangeFilter`
- `KpiGrid`
- `TaskStatusChart`
- `WorkflowDistribution`
- `DueItemsList`
- `ProjectsNeedAttentionTable`
- `WorkloadPanel`
- `OkrSummaryPanel`

KPI cards:

- Open issues.
- Overdue issues.
- Active projects.
- Revenue collected.
- Workload by assignee.
- OKR progress.

UX:

- Click `overdue issues` sang `/work?overdue=true`.
- Click workflow distribution sang `/projects?workflow_template_id=...`.
- Click due item mở task drawer hoặc project detail.
- Dùng màu warning/error cho overdue/conflict/financial block.

## 6. Work Board `/work`

Đây là màn hình quản lý công việc chính. Trải nghiệm giống GitLab, nhưng tên route/screen chuẩn là Work Board.

API:

```text
GET /api/v1/issues/board?workflow_template_id=&project_id=&assignee_id=&status=&q=&include_unassigned=true
GET /api/v1/issues
POST /api/v1/issues
GET /api/v1/issues/{id}
PUT /api/v1/issues/{id}
PATCH /api/v1/issues/{id}/workflow-step
POST /api/v1/issues/{id}/move
PATCH /api/v1/issues/{id}/status
PATCH /api/v1/issues/{id}/assignee
PATCH /api/v1/issues/reorder
DELETE /api/v1/issues/{id}
GET /api/v1/workflow-templates?active=true
GET /api/v1/labels
GET /api/v1/label-assignments
```

Quan trọng:

- `Issue` trong UI chính là `project_tasks` trong BE.
- Column board lấy từ `workflow_steps`, không lấy từ `TODO/DOING/DONE`.
- `status` chỉ là trạng thái nội bộ hiển thị trong card.

Layout desktop:

```text
Toolbar: board view | search | filters | new issue | display settings
Columns: [Tiếp nhận] [Soạn thảo] [Chờ khách] [Ký kết] [Thanh toán] ...
Right drawer: issue detail
```

Layout mobile:

- Dùng segmented control/tab theo column.
- Mỗi lần hiển thị một column.
- Filter mở bằng bottom sheet/drawer.

Components:

- `WorkBoardPage`
- `IssueBoardToolbar`
- `BoardViewSelect`
- `IssueFilterBar`
- `IssueBoard`
- `IssueColumn`
- `IssueCard`
- `IssueDetailDrawer`
- `IssueCreateDialog`
- `IssueMoveConfirmDialog`
- `BoardDisplaySettings`
- `IssueStatusSelect`
- `AssigneeSelect`
- `LabelSelector`
- `DueDatePicker`

Board toolbar:

- Workflow template/board view.
- Search text.
- Project filter.
- Assignee filter.
- Status filter.
- Label filter.
- Due date/overdue filter.
- Toggle Board/List.
- Display settings.
- New issue.

Board display settings:

- Ẩn/hiện column.
- Density: compact/comfortable.
- Fields hiển thị trên card:
  - project
  - assignee
  - labels
  - due date
  - status
  - created date
- FE lưu local storage vì BE chưa có saved board views.

Issue card:

- Title.
- Project short info nếu FE fetch được.
- Assignee avatar.
- Due date.
- Labels.
- Status chip.
- Overdue indicator.

Drag/drop:

- Kéo card giữa columns gọi `PATCH /issues/{id}/workflow-step` hoặc `POST /issues/{id}/move`.
- Kéo trong cùng column gọi `PATCH /issues/reorder`.
- Nếu API lỗi, rollback vị trí card và hiện snackbar.
- Không dùng `PUT /issues/{id}` cho drag/drop nếu không cần full update.

GitLab-style:

- Board giống GitLab ở cách thao tác: issue cards, columns, filter tokens, drawer detail, drag/drop.
- Khác GitLab ở nguồn column: dùng workflow step động của BE, không dùng status list cố định.
- Label nên hỗ trợ scoped style như `priority::high`, `type::contract`.

## 7. Projects `/projects`

Mục đích:

- Quản lý vụ việc/hồ sơ công việc lớn.
- Theo dõi workflow project, conflict, payment guard.

API:

```text
GET /api/v1/projects
POST /api/v1/projects
GET /api/v1/projects/{id}
PUT /api/v1/projects/{id}
POST /api/v1/projects/{id}/close
PATCH /api/v1/projects/{id}/workflow-step
POST /api/v1/projects/{id}/override-conflict
GET /api/v1/projects/board
```

Components:

- `ProjectsPage`
- `ProjectsDataGrid`
- `ProjectCreateDialog`
- `ProjectDetailPage`
- `ProjectHeader`
- `ProjectWorkflowTab`
- `ProjectTasksTab`
- `ProjectDocumentsTab`
- `ProjectBillingTab`
- `ConflictOverrideDialog`
- `MoveWorkflowStepDialog`
- `PaymentGuardDialog`

Project list columns:

- Name.
- Customer.
- Status.
- Conflict status.
- Workflow template/current step.
- Total contract value.
- Total paid.
- Remaining amount.
- Created at.
- Actions.

Project board:

- Dùng `/projects/board?workflow_template_id=...`.
- Hiển thị macro columns: Intake, In Progress, Billing, Archived.
- Mỗi macro có workflow steps và project cards.
- Đây là board vụ việc, khác `/work` là board task/issue.

## 8. Customers `/customers`

Mục đích:

- Quản lý hồ sơ khách hàng.
- Quản lý thông tin liên hệ, mã số thuế, đại diện, ghi chú.
- Quản lý conflict và tài liệu hồ sơ khách hàng.

API:

```text
GET /api/v1/customers
POST /api/v1/customers
GET /api/v1/customers/{id}
PUT /api/v1/customers/{id}
DELETE /api/v1/customers/{id}
POST /api/v1/customers/{id}/restore
GET /api/v1/customers/{id}/conflicts
POST /api/v1/customers/{id}/conflicts
GET /api/v1/profile-documents?entity_type=customer&entity_id=
POST /api/v1/profile-documents
```

Components:

- `CustomersPage`
- `CustomersDataGrid`
- `CustomerCreateDialog`
- `CustomerDetailPage`
- `CustomerProfileForm`
- `CustomerConflictPanel`
- `CustomerProjectsTab`
- `ProfileDocumentsPanel`

Customer detail tabs:

- Overview.
- Projects.
- Conflicts.
- Profile documents.
- Audit/metadata nếu cần.

## 9. Users `/users`

Mục đích:

- Quản lý nhân viên/user.
- Quản lý role, active/inactive, reset password, reset MFA.
- Upload tài liệu hồ sơ user.

API:

```text
GET /api/v1/users
POST /api/v1/users
GET /api/v1/users/{id}
PUT /api/v1/users/{id}
POST /api/v1/users/{id}/activate
POST /api/v1/users/{id}/deactivate
POST /api/v1/users/{id}/reset-password
POST /api/v1/users/{id}/mfa/reset
GET /api/v1/profile-documents?entity_type=user&entity_id=
POST /api/v1/profile-documents
```

Components:

- `UsersPage`
- `UsersDataGrid`
- `UserCreateDialog`
- `UserEditDrawer`
- `ResetPasswordDialog`
- `ResetMfaConfirmDialog`
- `UserProfileDocumentsPanel`

DataGrid columns:

- Username.
- Email.
- Role.
- Active.
- MFA.
- Created at.
- Actions.

UX:

- Không cho deactivate admin cuối cùng; nếu BE trả lỗi thì hiển thị alert.
- Role dùng select.
- Version dùng hidden field khi update.

## 10. Documents `/documents`

Mục đích:

- Quản lý tài liệu project.
- Upload/download/delete/lock WORM.

API:

```text
GET /api/v1/documents?project_id=
POST /api/v1/documents
GET /api/v1/documents/{id}
GET /api/v1/documents/{id}/download
DELETE /api/v1/documents/{id}
POST /api/v1/documents/{id}/lock
```

Components:

- `DocumentsPage`
- `DocumentsDataGrid`
- `DocumentUploadDialog`
- `DocumentPreviewDrawer`
- `WormLockDialog`

UX:

- Upload dùng MUI dropzone/custom file picker.
- Hiển thị scan/malware error rõ ràng.
- Document locked hiển thị lock chip, disable delete.

## 11. Labels `/labels`

Mục đích:

- Quản lý label catalog giống GitLab.
- Gán label cho customer/project/task/document.

API:

```text
GET /api/v1/labels
POST /api/v1/labels
GET /api/v1/labels/{id}
PUT /api/v1/labels/{id}
DELETE /api/v1/labels/{id}
GET /api/v1/label-assignments
POST /api/v1/label-assignments
DELETE /api/v1/label-assignments/{id}
```

Components:

- `LabelsPage`
- `LabelsDataGrid`
- `LabelCreateDialog`
- `LabelColorPicker`
- `ScopedLabelPreview`

UX:

- Hiển thị label chip màu.
- Hỗ trợ scoped label `priority::high`.
- Delete là archive/soft behavior theo BE.

## 12. Time Entries `/time-entries`

Mục đích:

- Ghi nhận thời gian làm việc.
- Phục vụ billing/invoice.

API:

```text
GET /api/v1/time-entries
POST /api/v1/time-entries
GET /api/v1/time-entries/{id}
PUT /api/v1/time-entries/{id}
DELETE /api/v1/time-entries/{id}
```

Components:

- `TimeEntriesPage`
- `TimeEntriesDataGrid`
- `TimeEntryCreateDialog`
- `TimeEntryEditDialog`

UX:

- Nếu `invoice_id` có giá trị thì billing locked, disable edit/delete.
- Accountant/Partner dùng để kiểm tra billing.

## 13. Invoices `/invoices`

Mục đích:

- Quản lý hóa đơn, trạng thái thanh toán.
- Xem time entries đã đưa vào invoice.

API:

```text
GET /api/v1/invoices
POST /api/v1/invoices/generate
GET /api/v1/invoices/{id}
PUT /api/v1/invoices/{id}/status
GET /api/v1/invoices/{id}/time-entries
GET /api/v1/project-payments
GET /api/v1/project-payments/{id}
```

Components:

- `InvoicesPage`
- `InvoicesDataGrid`
- `GenerateInvoiceDialog`
- `InvoiceDetailPage`
- `InvoiceTimeEntriesTable`
- `InvoiceStatusDialog`
- `ProjectPaymentsPanel`

UX:

- Status chip: Draft, Unpaid, Paid, Void.
- Generate invoice chỉ cho billing roles.
- Invoice detail hiện time entries như line items hiện tại.

## 14. OKR `/okr`

Mục đích:

- Quản lý OKR cycles, objectives, key results.
- Xem tiến độ team/user.

API:

```text
GET /api/v1/okr/cycles
POST /api/v1/okr/cycles
GET /api/v1/okr/objectives
POST /api/v1/okr/objectives
PUT /api/v1/okr/objectives/{id}
DELETE /api/v1/okr/objectives/{id}
POST /api/v1/okr/objectives/{id}/key-results
PUT /api/v1/okr/key-results/{id}
GET /api/v1/reports/okr/summary
```

Components:

- `OkrPage`
- `OkrCycleSelect`
- `ObjectiveList`
- `ObjectiveCard`
- `KeyResultTable`
- `OkrProgressChart`

## 15. Reports `/reports`

Mục đích:

- Thống kê báo cáo task, workload, OKR.

API:

```text
GET /api/v1/reports/tasks/summary
GET /api/v1/reports/tasks/by-assignee
GET /api/v1/reports/tasks/by-status
GET /api/v1/reports/tasks/overdue
GET /api/v1/reports/workload
GET /api/v1/reports/okr/summary
```

Components:

- `ReportsPage`
- `TaskSummaryCards`
- `TaskByAssigneeTable`
- `TaskByStatusChart`
- `OverdueTasksTable`
- `WorkloadReport`
- `OkrReportPanel`

## 16. Settings

Workflow templates:

```text
/settings/workflow-templates
```

Components:

- `WorkflowTemplatesPage`
- `WorkflowTemplateDataGrid`
- `WorkflowTemplateCreateDialog`
- `WorkflowStepEditor`
- `FinancialTriggerEditor`

Admin tenant settings:

```text
/admin/tenant-settings
```

Components:

- `TenantSettingsPage`
- `PlanSelect`
- `FeatureFlagsCheckboxGroup`

Audit:

```text
/audit-logs
```

Components:

- `AuditLogsPage`
- `AuditLogsDataGrid`
- `AuditLogDetailDrawer`
- `AuditVerifyPanel`

## 17. Trải Nghiệm Trực Quan

Nguyên tắc thiết kế:

- Dùng `DataGrid` cho danh sách lớn.
- Dùng `Drawer` cho xem/sửa nhanh.
- Dùng `Dialog` cho create/confirm.
- Dùng `Chip` cho status, role, labels, conflict, lock.
- Dùng `Tabs` cho detail page.
- Dùng `Tooltip` cho icon action.
- Dùng `Skeleton` cho loading.
- Empty state phải có CTA rõ ràng.

Tone UI:

- Gọn, nghiệp vụ, mật độ thông tin vừa phải.
- Không làm landing page.
- Không dùng card quá lớn cho màn hình vận hành.
- Board công việc ưu tiên scan nhanh như GitLab.

## 18. Những Gì FE Không Được Giả Định

- Không giả định task column là `TODO/DOING/DONE`.
- Không giả định task list đã có `project_name`, `customer_name`, `labels`.
- Không giả định mọi DTO đều có `actions`.
- Không giả định đã có saved board views server-side.
- Không dùng `/projects/board` cho issue/task board.
- Không dùng `PUT /issues/{id}` cho drag/drop nếu chỉ đổi column; dùng PATCH/POST move.

## 19. Component Architecture Đề Xuất

Thư mục FE:

```text
src/
  app/
    (auth)/login/page.tsx
    (protected)/layout.tsx
    (protected)/dashboard/page.tsx
    (protected)/work/page.tsx
    (protected)/projects/page.tsx
    (protected)/projects/[id]/page.tsx
    (protected)/customers/page.tsx
    (protected)/customers/[id]/page.tsx
    (protected)/users/page.tsx
    (protected)/documents/page.tsx
    (protected)/labels/page.tsx
    (protected)/time-entries/page.tsx
    (protected)/invoices/page.tsx
    (protected)/invoices/[id]/page.tsx
    (protected)/okr/page.tsx
    (protected)/reports/page.tsx
    (protected)/audit-logs/page.tsx
    (protected)/settings/workflow-templates/page.tsx
  repositories/
  features/
  components/
  hooks/
  lib/
```

Feature modules:

```text
features/work-board
features/projects
features/customers
features/users
features/documents
features/billing
features/dashboard
features/reports
features/okr
features/settings
```

Shared components:

- `PageHeader`: title, breadcrumbs, primary action.
- `PermissionGate`: hide/disable theo role/action.
- `ConfirmDialog`: confirm destructive action.
- `EntityStatusChip`: status/conflict/lock/payment chip.
- `ServerErrorAlert`: render problem detail từ BE.
- `DataGridToolbar`: search/filter/column density.
- `FileUploadDropzone`: dùng cho documents/profile documents.
- `JsonViewer`: audit metadata/workflow triggers.

State management:

- TanStack Query cho server state.
- React Hook Form + Zod cho form.
- URL query sync cho filters chính.
- Local storage cho board display settings khi BE chưa có saved board views.

## 20. Repository-To-Screen Mapping

| Repository | Screens dùng |
| --- | --- |
| `auth.repository.ts` | Login, ProtectedLayout |
| `users.repository.ts` | Users, Profile, AssigneeSelect |
| `customers.repository.ts` | Customers, Customer detail, Project forms |
| `profile-documents.repository.ts` | Customer detail, User detail |
| `projects.repository.ts` | Projects, Project detail, Project board, Invoice generate |
| `workflow.repository.ts` | Work board, Project board, Workflow settings |
| `issues.repository.ts` | Work board |
| `tasks.repository.ts` | Project task tab, reports drilldown |
| `labels.repository.ts` | Work board, Labels page, entity label pickers |
| `documents.repository.ts` | Documents page, Project documents tab |
| `time-entries.repository.ts` | Time entries, Project billing tab, Invoice detail |
| `invoices.repository.ts` | Invoices, Invoice detail |
| `payments.repository.ts` | Project billing tab |
| `dashboard.repository.ts` | Dashboard |
| `reports.repository.ts` | Dashboard, Reports, OKR |
| `okr.repository.ts` | OKR |
| `audit.repository.ts` | Audit logs |
| `admin.repository.ts` | Tenant settings, purge |

## 21. Dashboard Chi Tiết

Dashboard nên là màn hình đầu sau login cho user quản lý; với lawyer có thể redirect thẳng `/work` nếu product muốn ưu tiên xử lý task.

Layout:

```text
Header: Dashboard | date range | refresh
KPI row: Open Issues | Overdue | Active Projects | Revenue
Main grid:
  Left: Workload/Task status
  Center: Due items
  Right: Projects need attention
Bottom:
  Project workflow distribution | OKR summary
```

Component detail:

- `KpiCard`: số chính, delta phụ nếu BE có, icon, click action.
- `TaskStatusChart`: dùng `reports/tasks/by-status`.
- `WorkloadPanel`: dùng `reports/workload`.
- `DueItemsList`: dùng `dashboard/summary.due_items`.
- `ProjectsNeedAttentionTable`: dùng `dashboard/summary.projects_need_attention`.
- `OkrSummaryPanel`: dùng `reports/okr/summary`.

Business rules:

- Overdue = task chưa `DONE/CANCELLED` và `due_date < today`.
- Project cần chú ý nếu conflict, thiếu workflow step, overdue task, unpaid/remaining amount.
- Revenue collected lấy theo BE dashboard, không tự tính lại ở FE.

Empty/loading/error:

- KPI skeleton trong lúc load.
- Nếu không có due item, hiển thị empty "Không có việc đến hạn".
- Nếu report API lỗi, không làm sập cả dashboard; hiển thị alert ở widget lỗi.

## 22. Work Board Chi Tiết Theo GitLab

Đây là màn hình quan trọng nhất cho quản lý công việc.

Data flow:

1. Fetch `GET /workflow-templates?active=true`.
2. Chọn default template hoặc template gần nhất trong local storage.
3. Fetch `GET /issues/board?workflow_template_id=...&include_unassigned=true`.
4. Fetch labels/users/projects phụ trợ khi cần filter/card enrich.
5. Render columns theo `columns[]` từ BE.

Column:

- Header gồm step name, count, quick add.
- Dưới header có optional WIP count nếu FE tính local.
- Column có drop zone.
- Empty column hiển thị "Không có issue".
- `unassigned_tasks` hiển thị thành column riêng "Unassigned" nếu setting bật.

Issue card compact:

```text
Title
Project / Customer nếu có enrich
[priority::high] [type::contract]
Assignee avatar    Due date    Status
```

Issue card states:

- Overdue: viền trái/error chip.
- Done: opacity thấp hơn, status chip success.
- Cancelled: subdued, không nổi bật.
- No assignee: avatar placeholder.
- No due date: không hiển thị due chip.

Issue drawer tabs:

- `Overview`: title, description, project, workflow step, status, assignee, due date.
- `Labels`: label assignments.
- `Project`: link nhanh sang project.
- `History`: hiện placeholder nếu chưa có activity API riêng.

Create issue flow:

1. Click `New issue` ở toolbar hoặc `+` trong column.
2. Nếu tạo từ column, prefill `workflow_step_id`.
3. Form fields:
   - Project required.
   - Title required.
   - Description optional.
   - Workflow step.
   - Status default `TODO`.
   - Assignee optional.
   - Due date optional.
   - Position default 0.
4. Submit `POST /issues`.
5. Refetch board.

Move issue flow:

1. User drag card sang column khác.
2. FE optimistic move card.
3. Call `PATCH /issues/{id}/workflow-step` hoặc `POST /issues/{id}/move`.
4. Body gồm `workflow_step_id`, optional `position`.
5. Success: giữ UI.
6. Error: rollback và snackbar từ `problem.detail`.

Filter UX giống GitLab:

- Filter bar hiển thị token chips:
  - `Project = ...`
  - `Assignee = ...`
  - `Status = ...`
  - `Label = ...`
  - `Overdue`
- Có nút clear từng chip.
- Search title dùng query `q`.
- Filter state sync URL để share/reload.

List view:

- Toggle board/list.
- List dùng MUI X DataGrid.
- Columns: title, project, workflow step, status, assignee, due date, position, updated at, actions.
- Click row mở drawer giống board.

Permissions:

- `LAWYER`: được tạo/sửa task nếu product cho phép; BE hiện chỉ require auth.
- `ACCOUNTANT`: mặc định read-only trên work board, trừ khi product cho mutation.
- Nếu route guard cho vào nhưng mutation bị BE chặn, hiển thị `No permission`.

## 23. Project Management Chi Tiết

Projects có hai trải nghiệm:

- List/detail quản lý vụ việc.
- Project workflow board theo `/projects/board`.

Project list filters:

- Search/name nếu FE tự lọc hoặc BE bổ sung sau.
- Customer.
- Status.
- Workflow template.
- Conflict status nếu FE lọc client-side.

Project detail layout:

```text
Header:
  Project name | status chip | conflict chip | actions
Summary:
  Customer | Contract value | Paid | Remaining | Current step
Tabs:
  Overview | Workflow | Tasks | Documents | Billing | Audit
```

Overview tab:

- Thông tin khách hàng.
- Opposing party.
- Contract value.
- Hourly rate.
- Conflict status.

Workflow tab:

- Timeline các workflow steps của template.
- Current step highlighted.
- Button move step nếu `actions.move`.
- Khi move, mở `MoveWorkflowStepDialog`.
- Nếu step có financial trigger, hiển thị payment fields.

Payment guard UX:

- Nếu BE trả lỗi financial blocked, show dialog/alert với detail.
- Không tự bypass guard ở FE.

Conflict UX:

- Nếu `CONFLICT_DETECTED`, hiển thị banner đỏ.
- Disable move/assign nếu actions không cho.
- Partner/Super Admin thấy `OverrideConflictDialog`.

Tasks tab:

- Dùng `GET /projects/{id}/tasks`.
- Có quick add task prefill `project_id`.
- Có link "Open in Work Board" sang `/work?project_id=...`.

Documents tab:

- Dùng documents API với `project_id`.
- Upload/download/lock/delete.

Billing tab:

- Time entries.
- Project payments.
- Invoice link.

## 24. Customer Management Chi Tiết

Customer list:

- DataGrid columns:
  - Name.
  - Tax code.
  - Email.
  - Phone.
  - Representative.
  - Deleted status.
  - Created at.
  - Actions.
- Filters:
  - Search `q`.
  - Include deleted.

Customer detail:

```text
Header: customer name | tax code | actions
Tabs: Overview | Projects | Conflicts | Profile Documents
```

Overview:

- Editable form với name, tax code, email, phone, address, representative, notes.
- Save bằng `PUT /customers/{id}`.

Projects:

- List projects của customer.
- CTA create project prefill customer.

Conflicts:

- List conflict names.
- Add conflict.
- Dùng cho conflict-of-interest.

Profile Documents:

- Upload hồ sơ khách hàng qua `profile-documents`.
- Download/delete.
- Hiển thị file size, uploader, created at.

## 25. User Management Chi Tiết

Users page:

- Dành cho `PARTNER`, `SUPER_ADMIN`.
- DataGrid có pagination.
- Filters:
  - Search `q`.
  - Role.
  - Active/inactive.

User detail/edit drawer:

- Username.
- Email.
- Role.
- Active.
- MFA enabled.
- Version hidden.

Actions:

- Create user.
- Edit user.
- Activate.
- Deactivate.
- Reset password.
- Reset MFA.
- Upload profile documents.

Business UI:

- Không cho user tự deactivate mình nếu product muốn; BE vẫn là source of truth.
- Khi optimistic lock fail, refetch user và báo "Dữ liệu đã thay đổi".
- Reset password phải dùng confirm dialog.

## 26. Documents Và Hồ Sơ

Có hai loại tài liệu:

- Project documents: `/documents`.
- Profile documents: `/profile-documents` cho user/customer.

Documents page:

- Filter theo project.
- DataGrid columns:
  - Title.
  - Project.
  - File size.
  - Locked.
  - Uploaded by.
  - Created at.
  - Actions.

Upload UX:

- Drag/drop area.
- Show selected filename and size.
- Validate title required.
- Progress indicator nếu FE có upload progress.
- Malware error hiển thị rõ.

Profile documents panel:

- Reusable component:
  - props: `entityType`, `entityId`, `canUpload`, `canDelete`.
- Dùng trong customer detail và user detail.

## 27. Billing Chi Tiết

Time entries:

- Lawyer nhập thời gian làm việc.
- Accountant/Partner xem để lập invoice.
- Nếu `invoice_id != null`, row locked.

Invoice list:

- Columns:
  - Customer.
  - Total amount.
  - Status.
  - Issued at.
  - Created at.
  - Actions.
- Generate invoice:
  - Chọn project.
  - Chọn customer.
  - Status default DRAFT.
  - BE tự lấy unbilled billable time entries.

Invoice detail:

- Summary.
- Status timeline.
- Time entries table từ `/invoices/{id}/time-entries`.
- Update status dialog.

Project payments:

- Hiển thị trong project billing tab.
- Dữ liệu phát sinh khi move workflow step có payment.

## 28. Workflow Settings Chi Tiết

Workflow templates page:

- List templates:
  - Template name.
  - Is default.
  - Is active.
  - Steps count.
  - Actions.

Create template:

- Form:
  - template_name.
  - description.
  - is_default.
  - steps[].
- Step editor:
  - step_key.
  - step_name.
  - macro_column.
  - sort_order.
  - financial_trigger JSON editor/form.
  - security_trigger JSON editor/form.
  - task_trigger JSON editor/form.
  - is_terminal.

Update/archive:

- BE hiện update template metadata.
- BE chưa CRUD từng step sau khi tạo; UI không nên hiển thị edit step riêng nếu chưa có API.

## 29. OKR Và Reports Chi Tiết

OKR page:

- Cycle selector ở đầu trang.
- Objective list theo cycle.
- Objective card gồm progress, status, owner.
- Key result table trong objective.
- Create/edit dialogs cho cycle/objective/key result theo role.

Reports page:

- Task summary cards.
- By assignee table.
- By status chart.
- Overdue tasks table.
- Workload table.
- OKR summary panel.

UX:

- Report filters có date range nếu API hỗ trợ; nếu API chưa có thì không hiển thị filter giả.
- Export CSV chỉ nên làm nếu FE tự export current table data.

## 30. Acceptance Criteria Cho FE

FE được xem là bám BE đúng khi:

- Login, route guard, logout hoạt động.
- Dashboard render được từ API thật.
- `/work` dùng `/issues/board`, không dùng hard-code status columns.
- Drag/drop issue gọi PATCH/POST move, không dùng full update.
- Project board dùng `/projects/board`, tách khỏi work board.
- Customer/user đều có profile documents.
- User management có activate/deactivate/reset password/reset MFA.
- Documents upload/download/delete/lock đúng API.
- Labels có catalog và assignment.
- Invoice detail hiện time entries.
- Empty/loading/error state có ở mọi list chính.
- Permission UI bám role/actions và vẫn handle lỗi 403 từ BE.

## 31. Full Feature Inventory Theo Màn Hình

### 31.1 `/dashboard` V1 Complete

Chức năng:

- Date range filter.
- KPI cards từ `dashboard/summary`.
- Task status chart từ `reports/tasks/by-status`.
- Workload table từ `reports/workload`.
- Overdue list từ `reports/tasks/overdue`.
- OKR summary từ `reports/okr/summary`.
- Projects need attention từ `dashboard/summary`.

Actions:

- Click KPI open filtered page.
- Click overdue item open issue drawer.
- Click project attention open project detail.
- Refresh dashboard.

Không được:

- Không dùng fake data nếu API lỗi.
- Không tự tính revenue nếu BE đã trả `revenue_collected`.

### 31.2 `/work` V1 Complete

Chức năng:

- GitLab-style board.
- Dynamic columns theo workflow steps.
- Board/list toggle.
- Search/filter tokens.
- Create issue.
- Edit issue drawer.
- Move issue by drag/drop.
- Reorder issue.
- Assign user.
- Change status.
- Add/remove labels qua label assignment.
- Show unassigned tasks nếu `include_unassigned=true`.
- Local board display settings.

Drawer actions:

- Save title/description/status/assignee/due date.
- Move workflow step.
- Delete issue.
- Open project.
- Manage labels.

Required states:

- Loading board skeleton.
- Empty board.
- Empty column.
- No workflow template.
- API 403.
- Move failed rollback.
- Invalid workflow step.

### 31.3 `/projects` V1 Complete

Chức năng:

- Project list with filters.
- Create project.
- Edit project.
- Close project.
- Conflict status display.
- Project workflow board.
- Move project step with payment confirmation.
- Financial guard error display.
- Override conflict.
- Project detail 360.

Project detail tabs bắt buộc:

- `Overview`: thông tin vụ việc, customer, opposing party, contract value.
- `Workflow`: step timeline, current step, move dialog.
- `Tasks`: project tasks, quick create, open in `/work`.
- `Documents`: project documents.
- `Billing`: time entries, invoices, project payments.
- `Audit`: link/filter audit logs theo project nếu FE có thể lọc metadata client-side.

### 31.4 `/customers` V1 Complete

Chức năng:

- Customer list.
- Include deleted toggle.
- Create/edit customer.
- Soft delete/restore.
- Conflict management.
- Customer profile documents.
- Customer projects.
- Customer labels.

Customer detail tabs:

- `Overview`
- `Projects`
- `Conflicts`
- `Documents`
- `Labels`

### 31.5 `/users` V1 Complete

Chức năng:

- User list filter by role/active/search.
- Create user.
- Edit username/email/role/active.
- Activate/deactivate.
- Reset password.
- Reset MFA.
- User profile documents.
- Show optimistic lock/version errors.

User detail tabs:

- `Overview`
- `Security`
- `Profile Documents`
- `Assigned Work` nếu FE dùng `/issues?assignee_id=...`.

### 31.6 `/documents` V1 Complete

Chức năng:

- Project document list.
- Filter by project.
- Upload encrypted document.
- Download.
- Delete.
- WORM lock.
- Show malware/file too large errors.
- Show locked state.

Project detail dùng lại `DocumentsPanel`.
Customer/user dùng `ProfileDocumentsPanel`.

### 31.7 `/labels` V1 Complete

Chức năng:

- Label catalog.
- Project-scoped labels.
- Scoped labels preview.
- Archive label.
- Assignment manager for supported entities.

Entity integration:

- Issue drawer label selector.
- Customer detail labels tab.
- Project detail labels tab.
- Document detail labels if FE exposes document drawer.

### 31.8 `/time-entries` V1 Complete

Chức năng:

- List entries.
- Create entry.
- Edit entry.
- Delete entry.
- Filter by project/user/billable.
- Billing lock display if `invoice_id` exists.

Project billing tab:

- Show time entries for project.
- Quick create.
- Link to invoice if billed.

### 31.9 `/invoices` V1 Complete

Chức năng:

- Invoice list.
- Generate invoice.
- Update invoice status.
- Invoice detail.
- Invoice time entries table.
- Project payments panel.

Invoice detail:

- Header: status, customer, amount, issued at.
- Time entries as current line item substitute.
- Status update dialog.

### 31.10 `/okr` V1 Complete

Chức năng:

- Cycle list/select.
- Create cycle.
- Objective list.
- Create/edit/delete objective.
- Key result create/update.
- Progress display.
- OKR report summary.

### 31.11 `/reports` V1 Complete

Chức năng:

- Task summary.
- Task by assignee.
- Task by status.
- Overdue tasks.
- Workload.
- OKR summary.

Report UX:

- Dense tables.
- Drilldown into `/work`, `/users`, `/projects`.
- Export current table client-side optional.

### 31.12 `/settings/workflow-templates` V1 Complete

Chức năng:

- List templates.
- Create template with steps.
- View template detail.
- Update template metadata.
- Archive template.
- Step editor during create.
- JSON/form editor for financial/security/task triggers.

Important:

- BE chưa có endpoint update/delete từng step sau tạo, nên UI chỉ cho edit step trong create flow hoặc ghi rõ read-only ở detail.

### 31.13 `/audit-logs` V1 Complete

Chức năng:

- Audit list.
- Filter by user/action.
- Detail drawer.
- Metadata JSON viewer.
- Verify hash chain.

### 31.14 `/admin/tenant-settings` V1 Complete

Chức năng:

- View tier plan.
- Edit tier plan.
- Edit feature flags.
- Save settings.

### 31.15 `/admin/purge` V1 Complete

Chức năng:

- Manual purge trigger.
- Strong confirmation dialog.
- Show result/error.

## 32. Complete User Journeys

### 32.1 Tạo Vụ Việc Và Vận Hành Công Việc

1. Partner tạo customer.
2. Partner tạo project với workflow template.
3. BE tạo/check conflict.
4. User vào project detail xem workflow.
5. User tạo issue/task trong `/work` hoặc project task tab.
6. Lawyer kéo issue qua workflow columns.
7. Partner move project workflow step khi đủ điều kiện.
8. Nếu step yêu cầu payment, nhập payment confirmation.
9. Billing xem time entries và generate invoice.
10. Dashboard/reports phản ánh task/workload/revenue.

### 32.2 Hồ Sơ Khách Hàng

1. User tạo customer.
2. Upload profile documents.
3. Thêm conflict nếu có.
4. Tạo projects liên quan.
5. Gắn labels.
6. Theo dõi toàn bộ trong customer detail.

### 32.3 Quản Lý Nhân Viên

1. Partner/Super Admin tạo user.
2. Gán role.
3. User login và bật MFA.
4. Admin reset password/MFA nếu cần.
5. Upload profile documents cho user.
6. Xem assigned work qua `/work?assignee_id=...`.

### 32.4 Billing

1. Lawyer tạo time entries.
2. Accountant/Partner xem entries.
3. Generate invoice cho project/customer.
4. Time entries bị billing lock.
5. Cập nhật invoice status.
6. Project billing tab hiển thị invoice/time/payment.

## 33. Data Enrichment Strategy

Vì một số DTO chưa denormalized, FE cần enrich:

| UI cần hiển thị | API chính | API bổ sung |
| --- | --- | --- |
| Issue card project name | `/issues/board` | `/projects/{id}` hoặc cache `/projects` |
| Issue card customer name | project customer_id | `/customers/{id}` hoặc cache `/customers` |
| Issue labels | `/issues/board` | `/label-assignments?entity_type=task&entity_id=...` |
| Assignee name/avatar | task assignee_id | `/users/{id}` hoặc cache `/users` |
| Project current step name | project current_workflow_step_id | `/workflow-templates/{id}` |
| Document uploader | uploaded_by | `/users/{id}` hoặc cache `/users` |

FE nên cache users/projects/customers/labels bằng TanStack Query để tránh gọi lặp quá nhiều.

## 34. UI Quality Requirements

Performance:

- Board phải render tốt với nhiều columns và nhiều cards.
- DataGrid dùng pagination.
- Drawer lazy-load detail nếu cần.

Accessibility:

- Keyboard focus rõ.
- Buttons có aria-label nếu chỉ icon.
- Form fields có helper/error text.

Visual:

- Không dùng landing/marketing layout.
- Không dùng gradient/orb trang trí.
- Màu sắc status nhất quán.
- Table/board density phù hợp app nội bộ.

Reliability:

- Mọi mutation có loading state.
- Mọi mutation error hiển thị detail từ BE.
- Drag/drop có rollback.
- Delete/archive/lock/reset cần confirm dialog.

## 35. Definition Of Done Cho FE V1 Complete

FE V1 Complete đạt yêu cầu khi:

- Tất cả route trong section 2 có page thật.
- Tất cả capability trong section 1.2 có UI dùng được.
- `/work` giống GitLab về thao tác chính: board, issue cards, filters, labels, assignee, drawer, drag/drop.
- `/work` dùng workflow columns động từ BE.
- `/projects` có project board riêng và project detail 360.
- Customers/users đều có hồ sơ tài liệu.
- Dashboard/reports dùng API thật.
- Billing flow từ time entry tới invoice dùng được.
- OKR CRUD cơ bản dùng được.
- Audit/admin/settings dùng được theo quyền.
- Không còn màn hình chỉ là placeholder nếu BE đã có API.
