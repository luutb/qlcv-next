# QLCV Next — BMAD Master Document

**Snapshot gốc:** 2026-09-07  
**Mục đích:** product brief, yêu cầu và kiến trúc mục tiêu của QLCV Next.  
**Trạng thái:** tài liệu tham khảo; không mô tả trạng thái code hoặc môi trường hiện tại. Xem [Project Status](../PROJECT_STATUS.md).
**API companion:** [API Reference](API_REFERENCE.md) — endpoint, request/response data, quyền và UI-to-API map.

> Đây là specification cho dự án mới, không phải bản sao mặc định của code hiện tại.
> API client/UI đang tồn tại chỉ là bằng chứng khám phá, không đồng nghĩa backend đã xác minh runtime.

---

## Mục lục

1. [Product Brief](#1-product-brief)
2. [Project Context và nguyên tắc bất biến](#2-project-context-và-nguyên-tắc-bất-biến)
3. [PRD: phạm vi và yêu cầu](#3-prd-phạm-vi-và-yêu-cầu)
4. [UX Design Brief](#4-ux-design-brief)
5. [Architecture và ADR](#5-architecture-và-adr)
6. [Domain model, API và state machines](#6-domain-model-api-và-state-machines)
7. [Epics và Stories](#7-epics-và-stories)
8. [Migration và release](#8-migration-và-release)
9. [Definition of Ready / Done](#9-definition-of-ready--done)

---

## 1. Product Brief

### Vấn đề

Một văn phòng luật cần biết hồ sơ nào đang mở, ai đang chịu trách nhiệm, công việc nào quá hạn,
tiền nào chưa thu và lịch sử thay đổi nào có thể kiểm tra. Code hiện có đã chứa nhiều lát cắt cho
bài toán này nhưng đang dùng lẫn `Issue/Task`, workflow Project cũ và mô hình Team–Task mới.

### Đề xuất sản phẩm

Xây QLCV Next trên một trục dữ liệu thống nhất:

```text
Tenant → Customer → Project → Team → Task → (time, document, invoice, audit)
```

Workflow template tổ chức các step của Task; nó không thay thế lifecycle tổng thể của Project.
Dashboard và report là read-model từ backend, không suy diễn tổng từ danh sách đã phân trang.

### Personas và outcome

| Persona | Việc cần làm | Outcome |
| --- | --- | --- |
| Partner | Theo dõi danh mục hồ sơ, rủi ro, doanh thu | Nhìn thấy hồ sơ cần can thiệp từ dashboard |
| Lawyer | Nhận, làm, bàn giao công việc | Hiểu ưu tiên, hạn và dependency trong cùng ngữ cảnh |
| Accountant | Theo dõi giờ làm, hóa đơn, thanh toán | Không xuất hóa đơn sai hay sửa entry đã bị khóa |
| Super Admin | Quản trị tenant, người dùng và audit | Có quyền rõ ràng và bằng chứng thay đổi truy vết được |

### Mục tiêu Release 1

- Hoàn tất luồng Customer → Project → Team → Task → Time entry → Invoice.
- Backend thực thi quyền, audit, conflict và lock; UI phản ánh rõ kết quả.
- Dashboard chỉ hiển thị aggregate do summary endpoint trả về.
- Mọi capability release-1 đều có contract test hoặc staging evidence.

### Ngoài phạm vi Release 1

- MFA enrollment/recovery trước khi backend có proof flow an toàn.
- Hai Work Board hoặc `/issues` và `/tasks` cùng là canonical.
- Dynamic metadata form builder chung.
- Purge dữ liệu trong flow vận hành thông thường.

### Success metrics đề xuất

- Tối thiểu 95% Task mở có Project, assignee/team hợp lệ và due date khi policy yêu cầu.
- 100% mutation quan trọng có audit event và idempotency key.
- Không còn endpoint release-1 ở trạng thái “client exists but unverified”.
- P95 list/board dưới 2.5 giây với dataset mục tiêu sau khi sizing.

---

## 2. Project Context và nguyên tắc bất biến

### Quy tắc nghiệp vụ

- Tenant isolation do backend thực thi; không tin `organization_id` từ client.
- Backend là quyết định cuối cho authorization. Frontend chỉ fallback an toàn và phải xử lý rõ `401`,
  `403`, `409/428`, `423`.
- Mọi mutation mang `Idempotency-Key`; entity versioned gửi `version`.
- Entity backend canonical là `Task`; UI gọi là **Công việc**. `/issues` là alias tương thích đầy đủ
  của BE, không phải model/domain thứ hai; dự án mới chỉ sở hữu một adapter Task.
- Project chỉ có lifecycle `OPEN | DONE`; tiến độ thực thi nằm tại workflow step và Task status.
- Một Project có tối đa một Team; chỉ active member Team mới được assign Task của Project đó.
- Không log/token hóa mật khẩu, MFA secret/QR hoặc access token trong log, ảnh QA và tài liệu.

### Quy ước kỹ thuật

- Next.js App Router, TypeScript strict và React Query.
- Route chỉ là adapter; business UI nằm ở feature.
- Dependency hợp lệ: `app → feature/layout → shared/api`; `shared/api` không import feature,
  feature không import route hoặc internal của feature khác.
- Một domain có một API adapter/query-key factory canonical.
- Các screen phải có loading, empty, error, forbidden, locked/stale khi thích hợp.
- Date time theo ISO 8601; ngày nghiệp vụ `YYYY-MM-DD`. BE hiện truyền tiền bằng `float64`; không
  được tự tuyên bố integer/decimal canonical cho đến khi có ADR + migration finance riêng.

### Roles

`SUPER_ADMIN`, `PARTNER`, `LAWYER`, `ACCOUNTANT`. Action flags backend là authoritative; role
matrix frontend chỉ là display fallback an toàn.

### Anti-pattern không mang sang rebuild

- Fixture/hard-code làm nguồn sự thật của Work Board.
- Bắt người dùng dán UUID để xem Project, document, time entry hay invoice.
- Coi legacy redirect là feature canonical.
- Gọi capability “hoàn thành” khi mới chỉ có TypeScript API client.
- Dùng song song MUI và Ant Design trong cùng design system.

---

## 3. PRD: phạm vi và yêu cầu

### Functional requirements

| ID | Requirement |
| --- | --- |
| FR-01 | Người dùng login, refresh session từ một current-user endpoint canonical; logout/401 xoá session cục bộ. |
| FR-02 | RBAC áp dụng cho route/action; backend là quyết định cuối, UI không mở mutation khi bị cấm. |
| FR-03 | Partner/Super Admin quản lý user, active state và security actions có audit. |
| FR-04 | Người dùng tự quản lý profile với optimistic locking. |
| FR-05 | Quản lý Customer: search, create, edit, archive/restore, conflict, tài liệu. |
| FR-06 | Tạo/xem Project thuộc Customer và chuyển lifecycle `OPEN ↔ DONE` theo rule backend. |
| FR-07 | Partner/Super Admin quản lý Team/membership; Project có tối đa một Team. |
| FR-08 | Chỉ active Team member được assign Task của Project; đổi Team phải xử lý assignee không hợp lệ. |
| FR-09 | Người có quyền tạo/sửa/xóa Task, child Task, assignee, due date, status, workflow step và thứ tự. |
| FR-10 | Task dependency ngăn self-dependency/cycle, hiển thị blocker trước thao tác bị cấm. |
| FR-11 | Task có comment và review request/decision với reviewer xác định. |
| FR-12 | Work Board chỉ dùng Task canonical; `/issues` chỉ là alias transport tương thích; column là workflow step, không phải Task status. |
| FR-13 | Partner/Super Admin quản lý workflow template/step, không đổi lịch sử Task âm thầm. |
| FR-14 | Upload/list/download/lock document theo quyền; hiển thị malware/lock/error có thể hành động. |
| FR-15 | Ghi và quản lý time entry; invoice/lock rule chặn edit/delete trái phép. |
| FR-16 | Tạo/cập nhật invoice theo state machine; trace được source time entries. |
| FR-17 | Dashboard trả KPI, attention, due item, workload, billing bằng summary endpoint. |
| FR-18 | Reports task/workload có filter và deep-link drill-down. |
| FR-19 | OKR chỉ giữ khi được product validation; không thì loại Release 1. |
| FR-20 | Xem audit log theo entity; Super Admin kiểm tra integrity chain. |
| FR-21 | Super Admin quản lý tenant settings; purge chỉ qua flow/môi trường được phê duyệt. |

### Non-functional requirements

| ID | Requirement |
| --- | --- |
| NFR-01 | TypeScript strict, lint/typecheck/build pass trong CI. |
| NFR-02 | Problem JSON/error code thống nhất; UI state riêng cho 401/403/409/423/428. |
| NFR-03 | List server-side pagination/filter/search và request cancellation. |
| NFR-04 | Mọi capability Release 1 có API contract test hoặc staging evidence trước Done. |
| NFR-05 | Keyboard accessible, modal focus đúng, contrast WCAG AA tối thiểu. |
| NFR-06 | Vietnamese-first i18n; không render raw backend error. |
| NFR-07 | Không lộ PII nhạy cảm/token/password/MFA secret; server scan upload. |
| NFR-08 | Mutation quan trọng tạo immutable audit event gồm actor/entity/action/time/correlation. |

### Business rules

- Project: `OPEN`, `DONE`. Task: `TODO`, `DOING`, `DONE`, `CANCELLED`.
- Object khác tenant trả not-found/forbidden an toàn.
- Version mismatch trả stable error để UI reload/merge, không silent overwrite.
- Conflict override chỉ cho role được cấp quyền và cần justification ít nhất 50 ký tự; backend audit.
- Invoice/time-entry lock là backend rule, không phải UI convention. BE đã có `BILLING_LOCK_ACTIVE`/`LOCKED`; transition matrix vẫn phải test trên staging.

---

## 4. UX Design Brief

### Nguyên tắc

1. **Context trước input:** chuyển từ Customer/Project/Task context, không dán ID thô.
2. **Một tên cho một khái niệm:** UI dùng “Công việc”; workflow step và task status là hai thuộc tính riêng.
3. **Action có hậu quả phải rõ:** archive, lock, complete, invoice, override, reset, purge nêu scope/hậu quả/quyền.
4. **State đầy đủ:** không trộn loading, empty, forbidden, stale conflict, lock, error và success.

### Information architecture

```text
Dashboard
Work → Work Board / task drawer
Customers → Customer detail → Projects
Projects → Project detail → Tasks | Team | Time | Documents | Billing | History
Management → Teams | Workflow templates | Users | Tenant settings
Insights → Reports | Audit logs | OKR (nếu được giữ)
Profile
```

### Luồng bắt buộc

- Tạo Project: Customer → Team tùy chọn → xác nhận → Project detail.
- Giao Task: trong Project context; assignee selector chỉ chứa active Team member; hiển thị blocker/recovery link.
- Di chuyển Task: drag/drop workflow step, status chỉnh riêng; không mất draft khi conflict/dependency/payment/permission error.
- Tạo Invoice: từ Project/Billing và thấy time entries nguồn, không dùng nhập Project ID thô làm flow chính.
- Version conflict: giữ draft, tải bản mới, hiển thị field khác nhau rồi mới retry.

### Accessibility/design system

- Chọn **một** library UI: MUI hoặc Ant Design.
- Semantic headings, input labels, focus trap/return focus trong dialog, keyboard alternative cho drag/drop,
  `aria-live` cho mutation feedback.
- Desktop-first nhưng list/table phải có responsive strategy.
- Copy/i18n trong catalog; backend error map ra message hữu ích.

---

## 5. Architecture và ADR

| ADR | Quyết định |
| --- | --- |
| ADR-01 | Backend modular monolith theo domain, REST `/api/v1`, API contract versioned. |
| ADR-02 | Next.js App Router + TypeScript strict + React Query; routes không chứa business logic. |
| ADR-03 | Một Task/Work Item adapter; `/tasks` là transport canonical đã xác nhận trong BE. `/issues` là alias tương thích đầy đủ, không mở model/UI thứ hai. |
| ADR-04 | Project `OPEN/DONE`; workflow step/task status quản lý thực thi; legacy Project Workflow Board loại/migrate có hạn. |
| ADR-05 | Dùng một design system, không MUI + AntD song song. |
| ADR-06 | Authorization, tenant isolation, locking, transition, dependency validation ở backend. |
| ADR-07 | Contract-first: OpenAPI/JSON Schema và contract test phải có trước feature UI. |

### Logical architecture

```text
Browser
  Next.js app routes → feature modules → query hooks → domain API adapters
                                                    ↓
                                            REST API /api/v1
                                                    ↓
 Auth/RBAC | Customer | Project/Team/Task | Documents | Finance | Audit
                                                    ↓
                                              PostgreSQL + object storage
```

### Frontend module tree

```text
src/
  app/                 # route adapters only
  features/<domain>/   # page, components, model, queries
  api/                 # typed transport adapters and canonical query keys
  shared/              # reusable UI and framework-neutral utilities
  layouts/             # navigation and app shell
```

Allowed dependencies: `app → feature/layout`, `feature → api/shared`, `shared → api`.
Forbidden dependencies: `api/shared → feature`, `feature → app`, feature-to-feature internal imports.

### API/data contract baseline

- Pagination: `{ data, pagination: { limit, offset, count, total } }`.
- Error: problem JSON có HTTP status, stable `code` và safe `detail`.
- Frontend gửi Idempotency-Key cho mọi non-GET; BE hỗ trợ idempotency key nếu header có mặt và gắn key với principal/method/route/body fingerprint. Versioned entity gửi `version` theo contract riêng.
- Document upload multipart, MIME/size/virus scan do server kiểm soát; download authorize từng request.
- Dashboard là aggregate endpoint; không tổng hợp từ paginated clients lists.

---

## 6. Domain model, API và state machines

```text
Organization
├── User ──< TeamMember >── Team
├── Customer ──< Project (one assigned Team max)
│                 ├── Task (parent_task_id?, assignee?, workflow_step?)
│                 │     ├── TaskDependency / Comment / Review
│                 │     └── TimeEntry
│                 ├── Document
│                 ├── Invoice ──< InvoiceTimeEntry
│                 └── ProjectPayment
└── AuditEvent
```

Mọi quan hệ tenant-scoped. Backend transactionally validate team membership và dependency acyclicity.

| Domain | Canonical states | Cần chốt trước code |
| --- | --- | --- |
| Project | `OPEN`, `DONE` | điều kiện completion/reopen |
| Task | `TODO`, `DOING`, `DONE`, `CANCELLED` | policy dependency/review/permission |
| Invoice | `DRAFT`, `UNPAID`, `PAID`, `VOID` | transition và time-entry lock semantics |
| Document | active/locked/deleted tùy contract | lock owner, unlock/delete policy |

---

## 7. Epics và Stories

### Epic 01 — Foundation and Identity

**Outcome:** truy cập an toàn, đúng tenant/role, có nền tảng chung.

| Story | Acceptance criteria rút gọn |
| --- | --- |
| 01.01 Project spine | Một UI library, module boundary đúng, CI lint/typecheck/test/build. |
| 01.02 Session | Login/error/logout/401 rõ ràng; canonical current-user; token không lộ. |
| 01.03 Authorization | Role×route/action matrix, UI defensive action flags, server-side protection. |
| 01.04 User/Profile | User lifecycle, version conflict xử lý an toàn, security action confirmation/audit. |

### Epic 02 — Customer, Project and Team

**Outcome:** tạo/điều phối hồ sơ trong tenant với ownership rõ ràng.

| Story | Acceptance criteria rút gọn |
| --- | --- |
| 02.01 Customer lifecycle | Search/create/edit/detail/archive/restore, conflict verified và audit. |
| 02.02 Project lifecycle | Create dưới Customer, stable detail link, OPEN/DONE policy và domain tabs. |
| 02.03 Team assignment | Team/member role rules; one Team/Project; invalid assignee reassign bị chặn có recovery link. |

### Epic 03 — Task and Work Board

**Blocked by:** G-01, G-02, G-04. **Outcome:** một nguồn sự thật cho công việc.

| Story | Acceptance criteria rút gọn |
| --- | --- |
| 03.01 Canonical Task repository | Một typed adapter, contract-tested, không fixture/Issue model production. |
| 03.02 Task lifecycle | CRUD/child/assignee/comments/review, assignee eligible và draft survives error. |
| 03.03 Dependencies | Add/remove/search, server prevents cycle, board hiển thị blocker/impact. |
| 03.04 Accessible Work Board | Columns = workflow step, URL state, keyboard alternative, optimistic rollback. |

### Epic 04 — Documents, Time and Billing

**Blocked by:** G-03, G-04, G-06. **Outcome:** tài liệu/dòng tiền đúng Project và an toàn.

| Story | Acceptance criteria rút gọn |
| --- | --- |
| 04.01 Documents | Project context, upload/download/lock, policy/server scan, audit. |
| 04.02 Time entries | Log/filter/edit/delete theo server lock/invoice state, deep link từ Project. |
| 04.03 Invoice lifecycle | Generate từ eligible Project/source time entries, transition/error/audit verified. |

### Epic 05 — Insights and Governance

**Outcome:** đọc đúng tình trạng vận hành và kiểm tra được thay đổi.

| Story | Acceptance criteria rút gọn |
| --- | --- |
| 05.01 Dashboard | One verified summary contract, no derived totals, contextual deep links. |
| 05.02 Reports/OKR | Report/drilldown verified; PO xác nhận scope OKR hoặc loại bỏ. |
| 05.03 Audit/Tenant | Audit paging/permissions; integrity check hiện là authenticated BE endpoint nên cần quyết định/siết quyền trước release; settings/purge controlled. |

### Epic 06 — Migration and Release

**Outcome:** chuyển đổi kiểm soát được, có rollback.

| Story | Acceptance criteria rút gọn |
| --- | --- |
| 06.01 Migration rehearsal | Mapping approved, dry-run reconciliation, backup/rollback owner. |
| 06.02 Legacy cutover | Redirect expiry/telemetry, no competing writes, UAT and compatibility pass. |
| 06.03 Production readiness | CI/monitoring/security evidence; accessibility/RBAC/audit/finance checklist; rollback rehearsed. |

---

## 8. Migration và release

- Không port `work-board.fixtures.ts` hoặc Issue model legacy vào dự án mới.
- `/board`, `/issue-board`, `/tasks`, `/workflow-board`, `/settings/users`, `/settings/workflows` chỉ là
  redirect compatibility: có owner, telemetry, deadline xoá.
- Retire/migrate một trong hai workflow model trước khi cho phép concurrent writes.
- Mọi field raw-ID hiện có phải thay bằng selector, context route hoặc deep link hợp lệ.
- Trước production: data mapping, dry run, reconciliation, backup/rollback và role-based UAT bắt buộc.

---

## 9. Definition of Ready / Done

### Definition of Ready cho mỗi Story

1. Liên kết ít nhất một `FR-*`, domain owner rõ ràng.
2. API request/response, authorization và error code đã chốt hoặc verified.
3. UX flow cùng loading/empty/error/permission states đã nêu.
4. Acceptance criteria test độc lập được; role và test data xác định.
5. Không phụ thuộc một canonical decision còn mở.

### Definition of Done

- Code review, unit/API contract/e2e phù hợp pass.
- Acceptance criteria pass cho role có quyền và không có quyền.
- Audit/mutation/idempotency/lock behavior verified.
- Docs/ADR được cập nhật.
- Không fixture/mock nào là nguồn sự thật production.

---

## Phụ lục: cách dùng tài liệu này với BMAD

Dùng blueprint này làm tài liệu tham khảo cho yêu cầu và kiến trúc mục tiêu. Contract hiện hành và
[Project Status](../PROJECT_STATUS.md) có ưu tiên khi thông tin triển khai khác với blueprint. Khi
quyết định sản phẩm hoặc kiến trúc được duyệt thay đổi, cập nhật phần tương ứng và contract liên quan.
