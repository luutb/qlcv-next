# Roadmap hoàn thiện QLCV Frontend V1

Ngày lập: 2026-07-29

Chủ trì: PO, BA, PM

Nguồn yêu cầu: `SRS_FE_UI_NEXT_MUI.md`, `SRS_FE_API.md` và hiện trạng source code

Quyết định triển khai ngày 2026-07-29: theo chỉ đạo của project owner, không cài automated-test tooling. Các mục Vitest/RTL/Playwright và automated-test gate trong roadmap được thay bằng manual QA evidence cho đến khi có quyết định mới. Quality gate hiện tại là lint, strict typecheck và production build.

Chấp thuận rủi ro ngày 2026-07-29: project owner cho phép tiếp tục merge local dù browser smoke, GitHub branch protection và việc rotate credential remote còn pending. Không được dùng hoặc hiển thị credential đó; chấp thuận này không cho phép remote push và không được xem là đã khắc phục finding bảo mật.

## 1. Kết luận điều hành

Frontend hiện chưa đạt V1 Complete. Lớp API đã bao phủ phần lớn capability của SRS, nhưng UI thật mới tập trung ở login, dashboard, project list/create, project workflow board và workflow template. Work Board vẫn dùng dữ liệu hard-code/local state; 13 file route còn dùng `PlaceholderPage`; ba canonical route `/users`, `/reports`, `/admin/tenant-settings` chưa tồn tại.

Roadmap chọn cách hoàn thiện theo user journey và dependency:

1. Chốt contract, delivery pipeline, auth và permission.
2. Xây shared primitives cho user, customer, labels và documents.
3. Thay Work Board mock bằng API thật.
4. Khép kín Project 360 và billing.
5. Hoàn thiện OKR, reports, dashboard và admin.
6. UAT theo bốn role rồi phát hành V1.

Forecast cơ sở: Sprint 0 một tuần, sau đó bảy sprint hai tuần và hai tuần buffer tích hợp/UAT; tổng cơ sở 17 tuần, có thể tăng tới 19 tuần nếu staging/BE cần thêm buffer. Forecast giả định có 2 FE developer, QA/Reviewer dùng chung, API staging ổn định và velocity 24-28 story point/sprint. Timeline phải được hiệu chỉnh sau Sprint 1 và không phải cam kết ngày phát hành cho tới khi `ST-001` chốt contract với BE.

## 2. Hiện trạng và gap đã xác nhận

| Khu vực | Hiện trạng | Gap/ảnh hưởng | Ưu tiên |
| --- | --- | --- | --- |
| Git/delivery | Chỉ có `master`, chưa có `develop`; lịch sử 2 commit | Chưa có nhánh tích hợp, CI và branch protection | P0 |
| Quality gate | Production build pass; chưa có test/CI; `npm run lint` lỗi do `next lint` không còn phù hợp với Next 16 | Không có regression gate tin cậy | P0 |
| Auth/session | Login/logout và guard cơ bản | Thiếu MFA, session expiry hoàn chỉnh, action guard, chuẩn hóa `/users/me` và `/auth/me` | P0 |
| Work Board | UI prototype với `INITIAL_ISSUES`, workflow/project hard-code và mutation local | Không dùng dữ liệu BE; `issues.api.ts` chủ động reject; DTO/move/status lệch SRS | P0 blocker |
| Projects | List/create và workflow board có API | Thiếu edit/close, rollback và toàn bộ Project 360 | P0/P1 |
| Customers/Users | Customer và user page chưa có UI thật; `/users` thiếu | Chặn Customer/User 360, assignee và profile documents | P0 |
| Documents/Labels | API có, UI placeholder | Chặn Work/Project/Customer integration | P1 |
| Billing | API có, UI time entry/invoice placeholder | Chưa có flow time entry → invoice → payment | P1 |
| Dashboard/Reports/OKR | Dashboard partial; report route thiếu; OKR placeholder | Có metric hard-code/suy diễn, chưa có drilldown/report đầy đủ | P1 |
| Audit/Admin | API có, UI thiếu/placeholder | Chưa đáp ứng governance và SUPER_ADMIN journey | P1 |
| UI architecture | Trộn MUI, Ant Design và HTML/CSS riêng | Visual inconsistency, bundle và chi phí bảo trì | P1 decision |

Baseline kỹ thuật ngày 2026-07-29:

- `npm run build`: pass, sinh 24 route.
- `npm run lint`: fail với `Invalid project directory .../qlcv/lint`.
- Không có test file hoặc test script.
- 13 file route dùng `PlaceholderPage`.
- Canonical V1 có 20 route; thiếu `/users`, `/reports`, `/admin/tenant-settings`.

## 3. Mục tiêu sản phẩm và phạm vi

### Mục tiêu V1

- Bốn role `SUPER_ADMIN`, `PARTNER`, `LAWYER`, `ACCOUNTANT` dùng được đúng quyền.
- Hoàn tất hành trình Customer → Project → Workflow → Issue/Task.
- Hoàn tất hành trình Document/Profile Document.
- Hoàn tất hành trình Time Entry → Invoice → Project Payment.
- Dashboard, Reports và OKR dùng API thật, có drilldown.
- Admin quản lý workflow, tenant, purge và audit.
- Không còn placeholder hoặc dữ liệu nghiệp vụ demo cho capability BE đã có.

### Ngoài phạm vi V1

- Saved board views server-side.
- Comment/activity thread riêng cho issue.
- Multi-assignee, sprint/iteration/milestone riêng.
- Invoice line-item CRUD riêng.
- CRUD từng workflow step sau khi template đã tạo.
- Advanced revenue-contribution dashboard khi BE chưa hỗ trợ.

## 4. Các quyết định phải chốt trong Sprint 0

PO và BA phải lấy xác nhận từ BE/staging cho các mục sau trước khi story liên quan đạt Definition of Ready:

1. `/issues/*` có production-ready hay `/work` phải dùng adapter `/tasks/*`.
2. Nguồn current user canonical là `/users/me` hay `/auth/me`.
3. Contract MFA/TOTP, gồm login challenge và enable/disable.
4. DTO `actions`, `version`, pagination và mã lỗi `401/403/423/428` thực tế.
5. Schema board động, `unassigned_tasks`, reorder và move issue.
6. Payload payment/financial trigger; enum phải dùng `FIXED_AMOUNT`, không dùng `FIXED`.
7. Chính sách UI: chuẩn hóa dần về MUI hay cho phép giữ Ant Design trong V1.
8. Staging accounts/fixtures cho đủ bốn role và dữ liệu conflict/financial/document/billing.

Mỗi endpoint trong capability matrix phải được đánh dấu một trong bốn trạng thái: `available`, `changed`, `diagnostic-only`, `blocked`.

## 5. Kế hoạch sprint

| Giai đoạn | Dự kiến | Mục tiêu | Stories | Exit gate |
| --- | --- | --- | --- | --- |
| Sprint 0 | 03-07/08/2026 | Delivery foundation và contract | ST-000, ST-001 | CI xanh; contract matrix được PO/BA/BE duyệt |
| Sprint 1 | 10-21/08/2026 | Identity và reusable profile documents | ST-010, ST-011, ST-012 | Auth/RBAC và User 360 chạy staging |
| Sprint 2 | 24/08-04/09/2026 | Customer, labels, documents primitives | ST-020, ST-021, ST-022 | Customer 360 và shared panels đạt QA |
| Sprint 3 | 07-18/09/2026 | Work Board API thật | ST-030, ST-031 | Không còn fixture; board/lifecycle/DnD đạt E2E |
| Sprint 4 | 21/09-02/10/2026 | Project lifecycle và Project 360 | ST-040, ST-041, ST-042 | Project journey, guard tài chính/conflict đạt E2E |
| Sprint 5 | 05-16/10/2026 | Billing end-to-end | ST-050, ST-051 | Time entry → invoice → payment đạt E2E |
| Sprint 6 | 19-30/10/2026 | OKR, Reports, Dashboard | ST-060, ST-061 | Không còn metric fake; drilldown hoạt động |
| Sprint 7 | 02-13/11/2026 | Audit, Admin và V1 hardening | ST-070, ST-071 | Full regression, accessibility và performance pass |
| UAT/buffer | 16-27/11/2026 | BE integration, PO UAT, release V1 | Bugfix có kiểm soát | PO sign-off, release/rollback/smoke pass |

Critical path:

`ST-000/001 → ST-010/011/012 → ST-020/021/022 → ST-030/031 → ST-041 → ST-050/051 → ST-061 → ST-071`

OKR và Audit/Admin có thể kéo sớm nếu critical path bị chặn bởi BE, nhưng chỉ khi owner/file boundary không xung đột.

## 6. Product backlog: Story và Issue

### Sprint 0 — Delivery foundation và contract

#### ST-000 — Thiết lập Git flow và quality pipeline — 5 SP

Giá trị: mọi thay đổi sau đó có pipeline, review và khả năng rollback.

Issues:

- `I-0001`: Tạo `develop` từ `master`; protect `develop` và `master`.
- `I-0002`: Thay `next lint` bằng ESLint CLI/config tương thích Next 16.
- `I-0003`: Thêm strict typecheck, lint, build vào CI.
- `I-0004`: Không triển khai theo quyết định owner; dùng manual smoke checklist.
- `I-0005`: Thêm PR templates, CODEOWNERS và checklist QA/Reviewer.
- `I-0006`: Chốt một package manager/lockfile và khóa các dependency đang dùng `latest`.

Acceptance criteria:

- PR không thể merge khi lint/typecheck/build fail.
- Không direct push/force push lên `develop` và `master`.
- Có manual smoke evidence cho login redirect và protected route.
- Build có thể tái lập từ lockfile được chọn.

#### ST-001 — Chốt API contract, canonical route và shared error model — 8 SP

Issues:

- `I-0011`: Lập capability matrix endpoint ↔ route ↔ trạng thái staging.
- `I-0012`: Chốt `/issues` hay `/tasks`; sửa DTO/filter/enum/move contract trên giấy.
- `I-0013`: Chốt `/users/me`/`/auth/me`, MFA, `actions`, `version`, error code.
- `I-0014`: Tạo canonical route `/users`, `/reports`, `/admin/tenant-settings` và legacy redirects.
- `I-0015`: Chuẩn hóa shared states loading/empty/error/retry và mutation feedback.
- `I-0016`: Bổ sung contract smoke với staging accounts/fixtures bốn role.

Acceptance criteria:

- Không còn open decision có thể làm đổi solution của ST-010, ST-030 hoặc ST-041.
- Legacy `/settings/users` redirect về `/users`; `/tasks` và `/issue-board` redirect `/work`.
- `403`, `423`, `428` có typed error model và UX thống nhất.

### Sprint 1 — Identity và reusable profile documents

#### ST-010 — Auth, Profile, MFA và RBAC — 8 SP

Issues:

- `I-0101`: Chuẩn hóa current-user/session cache và refresh quyền.
- `I-0102`: Hoàn thiện login MFA challenge và return URL.
- `I-0103`: Xây `/settings/profile`, update profile và optimistic version.
- `I-0104`: Enable/disable MFA với confirm/recovery state.
- `I-0105`: Route/action guard cho bốn role; handle 401/403.
- `I-0106`: Manual QA session expiry, inactive user và role matrix.

Acceptance criteria:

- Login thường và MFA hoạt động với API thật.
- `401` clear session và về login; direct URL sai quyền hiển thị No Permission.
- UI action ưu tiên DTO `actions`, vẫn xử lý an toàn nếu BE trả `403`.

#### ST-011 — User 360 — 13 SP

Issues:

- `I-0111`: User list/search/filter role/active và pagination.
- `I-0112`: Create/edit user form và validation.
- `I-0113`: Activate/deactivate với `version` và confirm.
- `I-0114`: Reset password/reset MFA với confirm và permission.
- `I-0115`: User detail tabs Overview/Security/Assigned Work.
- `I-0116`: Xử lý `428`, self-deactivate và last-admin rules.
- `I-0117`: Manual QA role matrix và security actions.

Acceptance criteria:

- `/users` là route canonical và chỉ đúng role được thao tác.
- Version conflict refetch record, không ghi đè im lặng.
- Assigned Work mở đúng filter trên `/work`.

#### ST-012 — Shared Profile Documents panel — 8 SP

Issues:

- `I-0121`: Query/list theo `entity_type` và `entity_id`.
- `I-0122`: Multipart upload và progress/duplicate-submit guard.
- `I-0123`: Download có filename và xử lý 401.
- `I-0124`: Delete với permission/confirm.
- `I-0125`: Malware/file-size/forbidden/error states và manual QA.

Acceptance criteria:

- Một panel dùng lại được cho User và Customer.
- List/upload/download/delete chạy staging và không cho thao tác trái quyền.

### Sprint 2 — Customer, labels và documents

#### ST-020 — Customer 360 — 13 SP

Issues:

- `I-0201`: Customer list/search/pagination/include-deleted.
- `I-0202`: Create/edit/soft-delete/restore theo `actions`.
- `I-0203`: Detail Overview và Projects.
- `I-0204`: Conflicts list/create và validation.
- `I-0205`: Tích hợp Profile Documents panel.
- `I-0206`: Tích hợp Customer labels.
- `I-0207`: E2E customer lifecycle và refresh persistence.

Acceptance criteria:

- Delete là soft-delete và restore dùng endpoint riêng.
- Detail đủ Overview/Projects/Conflicts/Documents/Labels.
- Refresh page luôn đọc lại state từ BE, không phụ thuộc local mock.

#### ST-021 — Label catalog và assignment manager — 8 SP

Issues:

- `I-0211`: Catalog list/filter và scoped preview.
- `I-0212`: Create/edit/archive label.
- `I-0213`: Reusable assignment manager theo entity.
- `I-0214`: Permission/confirm/error handling.
- `I-0215`: Manual QA cho scoped label và archive.

Acceptance criteria:

- Catalog và project-scoped labels dùng API thật.
- Assignment manager dùng lại cho customer/project/task/document.
- Label archived không thể được gắn mới nhưng dữ liệu lịch sử không mất.

#### ST-022 — Project Documents panel và Document Center — 13 SP

Issues:

- `I-0221`: `/documents` list/pagination/project filter.
- `I-0222`: Reusable project document panel.
- `I-0223`: Multipart upload/download với filename.
- `I-0224`: Delete và WORM lock với strong confirmation.
- `I-0225`: Locked/malware/file-too-large/403/423 states.
- `I-0226`: Uploader enrichment/cache và E2E document lifecycle.

Acceptance criteria:

- Locked document không cho delete; BE `423` được hiển thị đúng ngữ cảnh.
- Document Center và Project tab dùng cùng query/component primitives.

### Sprint 3 — Work Board API thật

#### ST-030 — Work Board board/list foundation — 13 SP

Issues:

- `I-0301`: Thay `issues.api.ts` reject bằng adapter đúng contract đã chốt.
- `I-0302`: Query keys và fetch board/list API.
- `I-0303`: Render dynamic workflow columns và `unassigned_tasks`.
- `I-0304`: Search/filter URL sync và board/list toggle.
- `I-0305`: Enrichment cache user/project/customer/label, tránh N+1.
- `I-0306`: Loading/empty/no-template/403/partial error states.
- `I-0307`: Contract verification và manual QA; xóa fixtures khỏi production flow.

Acceptance criteria:

- Không còn `INITIAL_ISSUES`, project/workflow/date nghiệp vụ hard-code.
- Column lấy từ workflow step, không lấy từ status.
- Reload/share URL giữ đúng filters; Accountant xem read-only.

#### ST-031 — Issue lifecycle, labels và drag/drop — 13 SP

Issues:

- `I-0311`: Create issue với project/workflow step/title bắt buộc.
- `I-0312`: Drawer detail/edit title/description/status/assignee/due date.
- `I-0313`: Gắn/bỏ label qua assignment API.
- `I-0314`: Move workflow step và reorder trong column.
- `I-0315`: Optimistic update/rollback và invalid-step recovery.
- `I-0316`: Delete/open project và action permission.
- `I-0317`: Manual QA happy path, rollback, unassigned và read-only.

Acceptance criteria:

- Drag/drop gọi endpoint move/workflow-step, không dùng full update.
- Reorder đúng sau reload; lỗi move rollback về state BE.
- Nút/action ẩn hoặc disabled theo `actions`; mọi destructive action có confirm.

### Sprint 4 — Project lifecycle và Project 360

#### ST-040 — Project list/create/edit/close — 8 SP

Issues:

- `I-0401`: Filter customer/status/search và pagination.
- `I-0402`: Thay raw customer ID bằng selector/cache.
- `I-0403`: Edit project và validation.
- `I-0404`: Close project với confirm/action permission.
- `I-0405`: Conflict/workflow/contract/paid fields và manual QA.

Acceptance criteria:

- List/create/edit/close dùng API thật và phản ánh đúng `actions`.
- Không còn nút hiển thị nhưng không có handler.

#### ST-041 — Project Detail 360 — 13 SP sau refinement

Nếu refinement lớn hơn 13 SP, tách thành `ST-041A Workflow/Tasks` và `ST-041B Documents/Billing/Audit`.

Issues:

- `I-0411`: Detail shell và Overview.
- `I-0412`: Workflow timeline/current step/move dialog.
- `I-0413`: Conflict block/override, justification tối thiểu 50 ký tự.
- `I-0414`: Financial guard/payment confirmation và refresh ledger/state.
- `I-0415`: Tasks tab, quick create và open `/work`.
- `I-0416`: Documents tab tái sử dụng ST-022.
- `I-0417`: Billing interfaces và Audit deep link.
- `I-0418`: E2E conflict/payment/move và tab-level errors.

Acceptance criteria:

- Đủ Overview/Workflow/Tasks/Documents/Billing/Audit.
- FE không tự bypass conflict hoặc financial block.
- Mutation lỗi không để workflow state lệch BE.

#### ST-042 — Project board và Workflow Template hardening — 8 SP

Issues:

- `I-0421`: Project board optimistic update/rollback manual QA.
- `I-0422`: Sửa `FIXED` thành `FIXED_AMOUNT` và validate trigger.
- `I-0423`: Template detail/update/archive.
- `I-0424`: Step editor chỉ trong create; detail read-only đúng giới hạn BE.
- `I-0425`: Alias redirect, permission và regression suite.

Acceptance criteria:

- Move project xử lý conflict/payment/rollback đúng contract.
- Không cung cấp UI edit/delete step mà BE không hỗ trợ.

### Sprint 5 — Billing end-to-end

#### ST-050 — Time Entries — 13 SP

Issues:

- `I-0501`: List/pagination/filter project/user/billable.
- `I-0502`: Create/edit form và validation.
- `I-0503`: Delete với confirm.
- `I-0504`: Billing lock khi có `invoice_id`.
- `I-0505`: Project Billing panel/quick create reuse.
- `I-0506`: Permission, 423 và end-to-end manual QA.

Acceptance criteria:

- Entry đã invoiced không thể edit/delete.
- Global page và Project Billing tab dùng cùng data primitives.

#### ST-051 — Invoice lifecycle và Project Payments — 13 SP

Issues:

- `I-0511`: Invoice list/filter/pagination.
- `I-0512`: Generate invoice từ unbilled billable entries.
- `I-0513`: Invoice detail header và time-entry lines.
- `I-0514`: Status update dialog/valid transitions.
- `I-0515`: Project payment ledger.
- `I-0516`: No-entry/permission/mutation error states.
- `I-0517`: E2E time entry → invoice → status/payment.

Acceptance criteria:

- Generate không lấy entry non-billable hoặc đã invoiced.
- Invoice detail hiển thị đúng time entries; mutation lỗi không làm sai state UI.

### Sprint 6 — OKR, Reports và Dashboard

#### ST-060 — OKR management — 13 SP

Issues:

- `I-0601`: Cycle list/select/create.
- `I-0602`: Objective list/create/edit/delete.
- `I-0603`: Key Result create/update.
- `I-0604`: Progress và summary API.
- `I-0605`: Permission/loading/empty/error states.
- `I-0606`: Component và end-to-end manual QA.

Acceptance criteria:

- Cycle, Objective và Key Result CRUD cơ bản hoạt động với API thật.
- Progress/summary không dùng số liệu hard-code.

#### ST-061 — Reports và Dashboard completion — 13 SP

Issues:

- `I-0611`: Tạo `/reports` shell, date/filter model.
- `I-0612`: Task summary/by-assignee/by-status.
- `I-0613`: Overdue/workload/OKR summary.
- `I-0614`: Drilldown `/work`, `/users`, `/projects` và giữ filter.
- `I-0615`: Dashboard dùng đúng report APIs; widget errors độc lập.
- `I-0616`: Xóa metric `72%` và mọi fallback fake/suy diễn sai SRS.
- `I-0617`: Contract/performance verification và end-to-end manual QA.

Acceptance criteria:

- Sáu report bắt buộc có dữ liệu thật và drilldown đúng.
- Dashboard KPI/status/workload/overdue/workflow/OKR/attention không dùng fake data.

### Sprint 7 — Audit, Admin và V1 hardening

#### ST-070 — Audit Logs, Tenant Settings và Purge — 13 SP

Issues:

- `I-0701`: Audit list/filter/pagination.
- `I-0702`: Audit detail/metadata JSON viewer.
- `I-0703`: Verify hash chain result/error.
- `I-0704`: Tenant settings view/update plan/feature flags.
- `I-0705`: Purge strong confirmation/result/error.
- `I-0706`: Metadata schema admin/diagnostic integration.
- `I-0707`: SUPER_ADMIN/role guard và end-to-end manual QA.

Acceptance criteria:

- Role khác SUPER_ADMIN không thấy/truy cập tenant/purge.
- Purge không thể kích hoạt bằng click nhầm; audit verify hiển thị rõ pass/fail.

#### ST-071 — V1 hardening và release — 13 SP

Issues:

- `I-0711`: Full canonical-route và placeholder inventory.
- `I-0712`: Regression bốn role và action permissions.
- `I-0713`: Accessibility/keyboard/responsive sanity.
- `I-0714`: Board/table pagination, N+1, bundle và performance baseline.
- `I-0715`: Bốn critical journey được QA thủ công trên staging.
- `I-0716`: Dependency/security scan và xử lý finding.
- `I-0717`: UAT, release notes, runbook, rollback và production smoke.

Acceptance criteria:

- Không còn `PlaceholderPage` cho capability BE available.
- Không có dữ liệu nghiệp vụ mock ở production route.
- Không còn Sev-1/Sev-2; Sev-3 cần PO chấp nhận bằng văn bản.
- QA pass, Reviewer approve và PO UAT sign-off.

## 7. Business rules bắt buộc

- Work Board dựng column từ workflow step; status chỉ là trạng thái nội bộ task.
- Drag/drop gọi endpoint chuyên biệt và rollback khi lỗi.
- Accountant read-only trên `/work`; action dựa trên DTO `actions`, vẫn handle `403`.
- Project có conflict không được move khi chưa override; justification tối thiểu 50 ký tự.
- FE không tự bypass financial guard; payment confirmation bám error details của BE.
- Customer delete là soft-delete; restore dùng endpoint riêng.
- User mutation dùng `version`; không deactivate chính mình hoặc admin cuối cùng.
- Locked document không được delete; malware/file-too-large/423 có thông báo riêng.
- Time entry có `invoice_id` bị khóa edit/delete.
- Generate invoice chỉ dùng unbilled billable entries.
- Workflow step chỉ edit trong create flow nếu BE chưa hỗ trợ CRUD step.
- Delete/archive/lock/reset/purge luôn có confirmation phù hợp mức rủi ro.

## 8. Git flow bắt buộc

### Luồng nhánh

```text
master
  └── develop
        └── story/QLCV-ST-030-work-board-api
              ├── issue/QLCV-I-0301-issue-adapter
              ├── issue/QLCV-I-0302-board-query
              └── issue/QLCV-I-0303-dynamic-columns
```

Quy trình:

1. Bootstrap một lần: tạo `develop` từ `master` và protect cả hai nhánh.
2. Story luôn checkout từ `develop` mới nhất.
3. Issue luôn checkout từ đúng story branch, không từ `develop` hay `master`.
4. Issue PR có base là story branch; squash merge sau khi checks và DEV review pass.
5. Khi tất cả Issue xong: sync story với `develop`, chạy QA theo acceptance criteria và Reviewer review.
6. Story PR có base là `develop`; dùng merge commit để giữ boundary và hỗ trợ revert theo Story.
7. Theo yêu cầu phát hành từng Story: ngay sau khi Story đã merge vào `develop` và staging smoke/UAT pass, mở release PR `develop → master`. Vì Story chưa hoàn tất vẫn nằm trên story branch, `develop` chỉ chứa các Story đã nghiệm thu.
8. Tag SemVer và deploy đúng SHA trên `master`; xóa issue/story branch đã merge.

Không merge Issue thẳng vào `develop`; không merge Story thẳng vào `master`; không direct push vào nhánh protected.

### Quy ước tên

- Story branch: `story/QLCV-ST-###-kebab-case`.
- Issue branch: `issue/QLCV-I-####-kebab-case`.
- Hotfix branch: `hotfix/QLCV-HF-###-kebab-case` từ `master`.
- Commit: Conventional Commits, ví dụ `feat(work): load dynamic columns [QLCV-I-0303]`.
- Issue PR: `[QLCV-I-0303] feat(work): dynamic workflow columns`, base story.
- Story PR: `[QLCV-ST-030] Work Board dùng API thật`, base `develop`.
- Release PR: `release: v0.x.y`, base `master`, head `develop`.

Hotfix: `master → hotfix → master`, tag patch, sau đó back-merge cùng fix về `develop` ngay để tránh phân kỳ.

### Quality gate theo cấp

| Cấp | Gate bắt buộc |
| --- | --- |
| Issue → Story | Lint, strict typecheck, manual verification evidence, secret scan, 1 approval, resolved conversations |
| Story → Develop | Production build, API contract verification, manual end-to-end/accessibility check, QA PASS theo AC, Reviewer APPROVE, owner approval |
| Develop → Master | Staging smoke/UAT cho Story vừa merge, full impacted regression, PO sign-off, dependency/security scan, release notes, rollback plan, 2 approvals |

Nếu nhiều Story sẵn sàng cùng lúc, release PR phải liệt kê chính xác Story/SHA nằm trong `develop`. Không đưa Story chưa QA vào `develop`.

## 9. Definition of Ready

Story chỉ được checkout từ `develop` khi:

- PO nêu user value, persona, priority, out-of-scope và acceptance criteria kiểm thử được.
- BA xác nhận current behavior, endpoint/payload/DTO, role/action, errors, version/idempotency và UI states.
- API staging và account/test data sẵn sàng hoặc mock contract được PO/BA đánh dấu rõ.
- Design/copy và responsive/loading/empty/error/forbidden states đã rõ.
- Story không quá 13 SP; Issue từ 0.5-2 ngày, review/verify độc lập.
- Dependency, owner và file boundary rõ; không còn open decision làm đổi solution.
- QA scenarios đã link với acceptance criteria.

## 10. Definition of Done

### Issue Done

- Code và manual verification evidence hoàn tất; không còn mock/TODO ngoài scope.
- Lint/typecheck pass.
- DEV review resolved; PR merge vào đúng story branch.

### Story Done

- Toàn bộ acceptance criteria chạy với API staging thật.
- Loading/empty/error/403, role/action, accessibility được QA.
- Relevant integration/E2E và production build pass.
- QA PASS, Reviewer APPROVE; docs/API contract được cập nhật.
- Không còn lỗi Sev-1/Sev-2 và không còn placeholder thuộc Story.

### Release Done

- Impacted regression và staging smoke pass cho Story vừa merge.
- Bốn critical journeys không regression.
- PO UAT sign-off; release notes, rollback và environment checklist hoàn tất.
- Deploy đúng tagged SHA và production smoke pass.

## 11. PO/BA/PM governance

- PO sở hữu priority, scope, acceptance criteria và UAT sign-off.
- BA sở hữu contract matrix, business rules, edge cases và traceability SRS → Story → Issue → QA scenario.
- PM sở hữu dependency, capacity, sprint commitment, branch flow và release readiness.
- DEV chỉ bắt đầu khi Story Ready; QA nghiệm thu thủ công theo AC và lưu evidence.
- Reviewer chạy sau QA; nếu Request Changes, quay lại DEV, sau đó chạy lại QA và Reviewer.
- Refinement hàng tuần; re-estimate velocity sau Sprint 1 và review roadmap cuối mỗi sprint.

## 12. Release criteria V1

- Đủ 20 canonical routes và mọi capability `available` có UI thật.
- Không còn hard-code business data ở Dashboard/Work Board.
- Bốn SRS journeys chạy end-to-end với BE thật.
- Ma trận bốn role pass cho navigation, direct URL và mutation.
- `401/403/423/428`, network, validation và optimistic rollback đã được QA xác minh.
- Build, lint, typecheck và critical journey manual QA đều pass.
- Không còn P0/P1; P2 chỉ được giữ lại khi PO chấp nhận bằng văn bản.
- QA PASS, Reviewer APPROVE, PO UAT sign-off.
- Release notes, rollback plan, environment verification và production smoke hoàn tất.
