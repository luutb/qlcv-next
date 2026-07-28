# Backlog QLCV Frontend

Cập nhật: 28/07/2026. Backlog này triển khai chi tiết từ [ROADMAP.md](ROADMAP.md).

## Quy ước

- `ST-xx`: Story — một kết quả nghiệp vụ hoặc kỹ thuật có thể nghiệm thu.
- `TK-xx.y`: Task — một phần công việc tạo ra đầu ra cụ thể cho Story.
- `IS-xx.y.z`: Issue — đơn vị nhỏ nhất, nên hoàn thành trong tối đa một ngày làm việc.
- Priority: `P0` chặn toàn dự án, `P1` cần cho MVP, `P2` cần trước production.
- Trạng thái mặc định của tất cả mục bên dưới là `Todo`.
- Mỗi Issue chỉ có một owner chính; reviewer được gán riêng khi đưa lên công cụ quản lý.

## Acceptance contract theo cấp

Các checklist dưới đây là acceptance criteria bắt buộc và áp dụng cho **mọi** item tương ứng trong backlog. Nội dung sau mã Issue hoặc tiêu đề Task xác định đầu ra cụ thể cần chứng minh; checklist chung xác định điều kiện để reviewer cho `PASS`.

### Issue acceptance checklist

- Đầu ra mô tả ngay sau mã `IS-xx.y.z` đã tồn tại và có thể quan sát hoặc kiểm tra được.
- Thay đổi chỉ nằm trong phạm vi Issue và không làm sai mục tiêu của Task/Story cha.
- Có bằng chứng focused check phù hợp: test, typecheck, lint, command output hoặc inspection cho tài liệu/cấu hình.
- Không tạo regression mới so với baseline hiện hành.
- Loading, empty, error, permission và rollback được xử lý nếu Issue tác động tới các trạng thái đó.
- Diff không chứa mock, placeholder, debug log, secret hoặc thay đổi không liên quan mới.

### Task acceptance checklist

- Tất cả Issue con đã được `qa_reviewer` cho `PASS` và được đánh dấu hoàn thành.
- Kết quả mô tả bởi tiêu đề Task hoạt động như một đơn vị tích hợp, không chỉ là tổng các diff rời rạc.
- Dependency và contract giữa các Issue con đã được kiểm tra.
- Targeted regression checks của Task đã chạy và không tạo lỗi mới so với baseline.
- Commit/diff, commands, pre-review evidence và residual risks đã được chuẩn bị trong `docs/reviews/ST-xx.md`; QA verdict có thể vẫn là `TODO` trước review.

### Story acceptance checklist

- Tất cả Task con đã đạt QA `PASS` trong review record.
- Acceptance criteria ở cuối Story được chứng minh từng mục.
- Luồng end-to-end, role, failure state và phạm vi business liên quan đã được kiểm tra.
- Commit/diff, commands, acceptance evidence và residual risks đã được chuẩn bị trong `docs/reviews/ST-xx.md`; Story QA và PO verdict có thể vẫn là `TODO` trước các lượt review tương ứng.

## Trạng thái và bằng chứng review

- Checkbox trong file này lưu trạng thái Issue: chỉ đổi sang `[x]` sau Issue QA `PASS`.
- Task và Story không thêm checkbox vào tiêu đề; trạng thái chính thức được lưu trong `docs/reviews/ST-xx.md` theo mẫu tại `docs/reviews/README.md`.
- Trạng thái Task: `TODO`, `IN_PROGRESS`, `PASS`, `FAIL` hoặc `BLOCKED`.
- Trạng thái Story QA: `TODO`, `PASS`, `FAIL` hoặc `BLOCKED`.
- Trạng thái Story PO: `TODO`, `ACCEPT`, `REJECT` hoặc `BLOCKED`.
- Không được ghi Task `PASS` hoặc Story `ACCEPT` nếu thiếu commit/diff reference và verification evidence.

### Completion gates sau review

- Issue hoàn thành khi Issue QA trả `PASS`, verdict/evidence đã được ghi và checkbox Issue chuyển sang `[x]`.
- Task hoàn thành khi Task QA trả `PASS` và verdict/evidence đã được ghi trong review record.
- Story đủ điều kiện gọi PO khi Story QA trả `PASS` và verdict/evidence đã được ghi.
- Story hoàn thành khi PO trả `ACCEPT` và verdict/evidence cuối đã được ghi.

## Thứ tự thực hiện

`ST-01 → (ST-02 || ST-03) → ST-04/ST-05 → (ST-06..ST-14) → ST-15/ST-16 → ST-17 → ST-18`

Các Story nối bằng `||` có thể chạy song song sau khi dependency phía trước hoàn tất.

---

## ST-01 — Tạo baseline Git an toàn

**Priority:** P0  
**Owner:** Tech Lead  
**Ước lượng:** 1–2 ngày  
**Phụ thuộc:** Không

**Story:** Là maintainer, tôi muốn toàn bộ thay đổi hiện tại được phân loại và bảo toàn để nhóm có thể tiếp tục phát triển mà không làm mất code.

### TK-01.1 — Kiểm kê worktree

- [x] `IS-01.1.1` Xuất danh sách staged, unstaged và untracked theo từng domain.
- [x] `IS-01.1.2` Xác định các file có trạng thái xung đột kiểu add/delete hoặc staged-delete/recreated.
- [x] `IS-01.1.3` Gắn người sở hữu hoặc nguồn gốc cho từng nhóm thay đổi.
- [x] `IS-01.1.4` Ghi lại các file không được phép mất trước khi dọn staging.

### TK-01.2 — Chốt phạm vi module

- [x] `IS-01.2.1` Quyết định giữ hay loại bỏ module budget và expenses.
- [x] `IS-01.2.2` Quyết định giữ hay loại bỏ module files và notifications.
- [x] `IS-01.2.3` Quyết định giữ hay loại bỏ module contract và workflow cũ.
- [x] `IS-01.2.4` Ghi quyết định phạm vi vào pull request hoặc decision log.

### TK-01.3 — Tạo lịch sử commit có thể review

- [x] `IS-01.3.1` Tách thay đổi nền tảng và dependency thành commit riêng.
- [x] `IS-01.3.2` Tách migration API/types thành commit riêng.
- [x] `IS-01.3.3` Tách Case/Task/Board thành các commit theo feature.
- [x] `IS-01.3.4` Kiểm tra lại diff và xác nhận không mất file ngoài phạm vi.

**Acceptance criteria:** Không còn trạng thái Git nhập nhằng; mọi thay đổi còn lại có owner, mục đích và commit review được.

---

## ST-02 — Hợp nhất type system và tương thích MUI v7

**Priority:** P0  
**Owner:** Senior Frontend — Core  
**Ước lượng:** 3–5 ngày  
**Phụ thuộc:** ST-01

**Story:** Là developer, tôi muốn có một nguồn type duy nhất để ứng dụng được kiểm tra tĩnh chính xác và không còn contract xung đột.

### TK-02.1 — Chuẩn hoá domain types

- [x] `IS-02.1.1` Hợp nhất `Role`, `User` và `UserDetail`.
- [x] `IS-02.1.2` Hợp nhất `Task`, trạng thái Task và workflow step.
- [x] `IS-02.1.3` Hợp nhất `Case`, trạng thái Case, member và label.
- [ ] `IS-02.1.4` Hợp nhất Workflow, Workload, Budget và Payment types.

### TK-02.2 — Chuẩn hoá API response types

- [ ] `IS-02.2.1` Chốt `ApiResponse<T>` theo response backend thật.
- [ ] `IS-02.2.2` Chốt `PaginatedResponse<T>` và quy ước page/offset.
- [ ] `IS-02.2.3` Thay các response `{}` hoặc `unknown` bằng type cụ thể.
- [ ] `IS-02.2.4` Xoá interface/enum trùng sau khi migration consumer hoàn tất.

### TK-02.3 — Migration type consumers

- [ ] `IS-02.3.1` Sửa type errors trong `src/app` theo từng route group.
- [ ] `IS-02.3.2` Sửa type errors trong Case và Board components.
- [ ] `IS-02.3.3` Sửa type errors trong Task, User và Budget components.
- [ ] `IS-02.3.4` Sửa type errors trong hooks, repositories và services còn giữ.

### TK-02.4 — Nâng code lên API MUI v7

- [ ] `IS-02.4.1` Đọc hướng dẫn MUI đang cài và lập danh sách API cũ.
- [ ] `IS-02.4.2` Thay cách dùng `Grid item/xs` không còn hợp lệ.
- [ ] `IS-02.4.3` Sửa prop/type thay đổi ở DataGrid, Select và Tree View.
- [ ] `IS-02.4.4` Chạy typecheck và xử lý regression theo từng nhóm component.

**Acceptance criteria:** `npx tsc --noEmit` đạt 0 lỗi và không dùng `any` để che lỗi contract.

---

## ST-03 — Hợp nhất tầng API và service

**Priority:** P0  
**Owner:** Senior Frontend — Data  
**Ước lượng:** 3–5 ngày  
**Phụ thuộc:** ST-01

**Story:** Là developer, tôi muốn mọi request đi qua một client và service layer để authentication, error handling và response mapping nhất quán.

### TK-03.1 — Chốt API client chuẩn

- [ ] `IS-03.1.1` So sánh `src/api/client.ts` với `src/services/api/client.ts`.
- [ ] `IS-03.1.2` Hợp nhất base URL, timeout, headers và multipart handling.
- [ ] `IS-03.1.3` Hợp nhất access-token/refresh-token behavior.
- [ ] `IS-03.1.4` Chuẩn hoá API error thành một kiểu lỗi dùng chung.
- [ ] `IS-03.1.5` Tắt log payload/token trong production.

### TK-03.2 — Hoàn thiện service theo domain

- [ ] `IS-03.2.1` Hoàn thiện auth, user và customer services.
- [ ] `IS-03.2.2` Hoàn thiện case, task và label services.
- [ ] `IS-03.2.3` Hoàn thiện workflow và workload services.
- [ ] `IS-03.2.4` Hoàn thiện budget, payment và reporting services trong phạm vi được giữ.

### TK-03.3 — Migration consumers

- [ ] `IS-03.3.1` Di chuyển imports từ `@/api/client` sang service layer.
- [ ] `IS-03.3.2` Di chuyển imports từ `@/api/services` sang service layer.
- [ ] `IS-03.3.3` Di chuyển imports từ `@/repositories` sang service layer.
- [ ] `IS-03.3.4` Thay các `fetch` trực tiếp trong page bằng service tương ứng.

### TK-03.4 — Loại bỏ tầng cũ

- [ ] `IS-03.4.1` Xác nhận không còn import tới API client cũ.
- [ ] `IS-03.4.2` Xác nhận không còn import tới repositories cũ.
- [ ] `IS-03.4.3` Xoá code cũ sau khi typecheck và smoke test đạt.
- [ ] `IS-03.4.4` Thêm lint restriction để ngăn import kiến trúc cũ quay lại.

**Acceptance criteria:** Mọi request production đi qua `src/services`; tìm kiếm import kiến trúc cũ không còn kết quả.

---

## ST-04 — Khôi phục unit test

**Priority:** P0  
**Owner:** QA Automation / Frontend Platform  
**Ước lượng:** 2–3 ngày  
**Phụ thuộc:** ST-02

**Story:** Là maintainer, tôi muốn test runner hoạt động và bảo vệ logic nền để refactor không tạo regression âm thầm.

### TK-04.1 — Sửa test infrastructure

- [ ] `IS-04.1.1` Cập nhật Vitest include cho `.test.ts` và `.test.tsx`.
- [ ] `IS-04.1.2` Cài Testing Library và jest-dom đúng phiên bản.
- [ ] `IS-04.1.3` Chuẩn hoá `vitest.setup.ts`, alias và jsdom.
- [ ] `IS-04.1.4` Thêm script test watch và coverage nếu cần cho CI.

### TK-04.2 — Khôi phục test hiện có

- [ ] `IS-04.2.1` Sửa SkeletonLoader test theo markup thật của MUI.
- [ ] `IS-04.2.2` Loại bỏ assertion phụ thuộc class nội bộ không ổn định.
- [ ] `IS-04.2.3` Đảm bảo test accessibility dùng role/aria phù hợp.

### TK-04.3 — Bổ sung test nền

- [ ] `IS-04.3.1` Viết test cho API response/error mapping.
- [ ] `IS-04.3.2` Viết test cho auth context login/logout/session restore.
- [ ] `IS-04.3.3` Viết test cho permission và route mapping thuần.
- [ ] `IS-04.3.4` Viết test cho mapping Task/Case status.

**Acceptance criteria:** `npm test` chạy thành công, có test thực sự được thực thi và không có test bị bỏ qua không lý do.

---

## ST-05 — Đưa lint, build và CI về trạng thái xanh

**Priority:** P0  
**Owner:** Frontend Platform / DevOps  
**Ước lượng:** 3–4 ngày  
**Phụ thuộc:** ST-02, ST-04

**Story:** Là release owner, tôi muốn có quality gates tự động để code không đạt chuẩn không thể đi vào nhánh phát hành.

### TK-05.1 — Sửa ESLint

- [ ] `IS-05.1.1` Sửa nhóm lỗi `no-explicit-any`.
- [ ] `IS-05.1.2` Sửa nhóm lỗi React hooks và setState trong effect.
- [ ] `IS-05.1.3` Sửa JSX unescaped entities.
- [ ] `IS-05.1.4` Xoá import, state và handler không dùng.
- [ ] `IS-05.1.5` Rà warning còn lại và tạo ticket cho ngoại lệ hợp lệ.

### TK-05.2 — Ổn định production build

- [ ] `IS-05.2.1` Đọc hướng dẫn font/build của Next.js 16 đang cài.
- [ ] `IS-05.2.2` Chuyển Google Fonts sang local font hoặc cơ chế build offline.
- [ ] `IS-05.2.3` Kiểm tra biến môi trường bắt buộc khi build.
- [ ] `IS-05.2.4` Chạy production build trên môi trường sạch.

### TK-05.3 — Thiết lập CI

- [ ] `IS-05.3.1` Thêm bước install dùng lockfile thống nhất.
- [ ] `IS-05.3.2` Thêm lint và typecheck gates.
- [ ] `IS-05.3.3` Thêm unit test và production build gates.
- [ ] `IS-05.3.4` Cấu hình branch protection yêu cầu CI thành công.

**Acceptance criteria:** lint, typecheck, test và build đều xanh trên CI và máy sạch.

---

## ST-06 — Hoàn thiện authentication và session

**Priority:** P1  
**Owner:** Frontend Auth + Backend  
**Ước lượng:** 2–3 ngày  
**Phụ thuộc:** ST-03, ST-05

**Story:** Là người dùng, tôi muốn đăng nhập và duy trì phiên an toàn để truy cập hệ thống ổn định trên nhiều lần tải trang.

### TK-06.1 — Chốt auth contract

- [ ] `IS-06.1.1` Chốt request/response `/auth/login`.
- [ ] `IS-06.1.2` Chốt `/auth/me`, `/auth/logout` và refresh token.
- [ ] `IS-06.1.3` Chốt mã lỗi session hết hạn và tài khoản bị khoá.

### TK-06.2 — Triển khai session an toàn

- [ ] `IS-06.2.1` Chuyển token sang cookie HttpOnly do backend phát hành.
- [ ] `IS-06.2.2` Loại bỏ lưu token trùng ở localStorage khi không cần.
- [ ] `IS-06.2.3` Khôi phục user bằng `/auth/me` thay vì tin dữ liệu user phía client.
- [ ] `IS-06.2.4` Xử lý refresh thất bại và redirect login chỉ một lần.

### TK-06.3 — Hoàn thiện auth UI

- [ ] `IS-06.3.1` Chuẩn hoá loading và lỗi trên form đăng nhập.
- [ ] `IS-06.3.2` Hoàn thiện hoặc ẩn quên mật khẩu.
- [ ] `IS-06.3.3` Loại bỏ sign-up action nếu sản phẩm không hỗ trợ.
- [ ] `IS-06.3.4` Kiểm thử login, reload, logout và expired session.

**Acceptance criteria:** Các luồng login/reload/refresh/logout/session expiry hoạt động với backend thật và không lộ token cho JavaScript client.

---

## ST-07 — Hoàn thiện authorization theo role

**Priority:** P1  
**Owner:** Frontend Auth  
**Ước lượng:** 2–3 ngày  
**Phụ thuộc:** ST-06

**Story:** Là quản trị viên, tôi muốn quyền truy cập được thực thi nhất quán để người dùng chỉ thấy và dùng chức năng phù hợp với role.

### TK-07.1 — Chốt permission matrix

- [ ] `IS-07.1.1` Lập ma trận route/action cho admin.
- [ ] `IS-07.1.2` Lập ma trận route/action cho manager và staff.
- [ ] `IS-07.1.3` Lập ma trận route/action cho accountant.
- [ ] `IS-07.1.4` Đối chiếu quyền frontend với backend.

### TK-07.2 — Áp quyền lên route và UI

- [ ] `IS-07.2.1` Đồng bộ role-home giữa middleware, login và root route.
- [ ] `IS-07.2.2` Bảo vệ `/cases`, `/board` và các route dùng chung.
- [ ] `IS-07.2.3` Ẩn/disable action theo permission, không chỉ ẩn menu.
- [ ] `IS-07.2.4` Xử lý màn hình 403 và redirect sai quyền.

### TK-07.3 — Kiểm thử phân quyền

- [ ] `IS-07.3.1` Viết test route matrix cho bốn role.
- [ ] `IS-07.3.2` Viết test action permission trên Case/Task.
- [ ] `IS-07.3.3` Kiểm thử URL trực tiếp không đi qua sidebar.

**Acceptance criteria:** Mọi route và action có rule rõ ràng; truy cập trực tiếp không thể vượt quyền.

---

## ST-08 — Hoàn thiện Case management

**Priority:** P1  
**Owner:** Feature Team Core — Case  
**Ước lượng:** 4–5 ngày  
**Phụ thuộc:** ST-02, ST-03, ST-07

**Story:** Là nhân viên, tôi muốn quản lý vòng đời hồ sơ đầy đủ để theo dõi khách hàng, thành viên và công việc liên quan.

### TK-08.1 — Đồng bộ Case contract

- [ ] `IS-08.1.1` Chốt Case fields và status với backend.
- [ ] `IS-08.1.2` Chốt create/update payload.
- [ ] `IS-08.1.3` Chốt pagination, search và filter query.
- [ ] `IS-08.1.4` Tạo mapper nếu API và UI dùng naming khác nhau.

### TK-08.2 — Hoàn thiện list và form

- [ ] `IS-08.2.1` Hoàn thiện loading, error, empty và pagination ở Case list.
- [ ] `IS-08.2.2` Hoàn thiện create form validation và error mapping.
- [ ] `IS-08.2.3` Hoàn thiện edit form và xử lý dữ liệu ban đầu.
- [ ] `IS-08.2.4` Hoàn thiện delete confirmation và refresh list.

### TK-08.3 — Hoàn thiện Case detail

- [ ] `IS-08.3.1` Hiển thị thông tin Case từ API thật.
- [ ] `IS-08.3.2` Thay lookup member giả bằng user service.
- [ ] `IS-08.3.3` Hoàn thiện add/remove member và role trong Case.
- [ ] `IS-08.3.4` Kết nối labels với Case.
- [ ] `IS-08.3.5` Kết nối activity/timeline hoặc loại bỏ UI chưa hỗ trợ.

**Acceptance criteria:** Tạo, tìm, xem, sửa, phân thành viên và xoá Case hoạt động end-to-end không dùng mock.

---

## ST-09 — Hoàn thiện Task và workflow actions

**Priority:** P1  
**Owner:** Feature Team Core — Task  
**Ước lượng:** 5–7 ngày  
**Phụ thuộc:** ST-02, ST-03, ST-07, ST-08

**Story:** Là người xử lý, tôi muốn tạo và cập nhật Task theo workflow để toàn bộ tiến độ công việc được ghi nhận chính xác.

### TK-09.1 — Đồng bộ Task contract

- [ ] `IS-09.1.1` Chốt Task fields, status và priority.
- [ ] `IS-09.1.2` Chốt assignee và multi-assignee contract.
- [ ] `IS-09.1.3` Chốt workflow step, approval, rejection và completion.
- [ ] `IS-09.1.4` Chốt history và payment action types.

### TK-09.2 — Hoàn thiện CRUD và status transition

- [ ] `IS-09.2.1` Hoàn thiện tạo Task trong Case.
- [ ] `IS-09.2.2` Hoàn thiện sửa và xoá Task.
- [ ] `IS-09.2.3` Hoàn thiện thay đổi status và rollback khi lỗi.
- [ ] `IS-09.2.4` Hoàn thiện trang duyệt Task đang là placeholder.

### TK-09.3 — Hoàn thiện tính năng phụ của Task

- [ ] `IS-09.3.1` Kết nối subtask với backend.
- [ ] `IS-09.3.2` Kết nối comment với backend.
- [ ] `IS-09.3.3` Kết nối attachment/document với backend hoặc ẩn UI.
- [ ] `IS-09.3.4` Kết nối custom fields với backend hoặc ẩn UI.
- [ ] `IS-09.3.5` Hoàn thiện time tracking nếu nằm trong MVP.

**Acceptance criteria:** Task đi được từ tạo đến hoàn thành/duyệt, history đúng và không còn action chỉ ghi console.

---

## ST-10 — Hoàn thiện Kanban Board

**Priority:** P1  
**Owner:** Feature Team Core — Board  
**Ước lượng:** 3–4 ngày  
**Phụ thuộc:** ST-09

**Story:** Là người quản lý, tôi muốn theo dõi và di chuyển Task trực quan để điều phối công việc nhanh mà dữ liệu vẫn nhất quán.

### TK-10.1 — Hoàn thiện dữ liệu Board

- [ ] `IS-10.1.1` Chuẩn hoá mapping API status sang columns.
- [ ] `IS-10.1.2` Kết nối filter Case, labels, users và milestones.
- [ ] `IS-10.1.3` Hoàn thiện loading, empty và API error states.
- [ ] `IS-10.1.4` Xoá log debug và code Board không sử dụng.

### TK-10.2 — Làm chắc drag and drop

- [ ] `IS-10.2.1` Cập nhật UI tối ưu ngay khi drop.
- [ ] `IS-10.2.2` Rollback đúng cột khi API thất bại.
- [ ] `IS-10.2.3` Chặn drop vào status không hợp lệ theo workflow.
- [ ] `IS-10.2.4` Viết test status mapping và rollback.

### TK-10.3 — Hoàn thiện Task Sidebar

- [ ] `IS-10.3.1` Kết nối save task detail.
- [ ] `IS-10.3.2` Kết nối gửi comment.
- [ ] `IS-10.3.3` Kết nối assignee và labels.
- [ ] `IS-10.3.4` Hiển thị lỗi theo từng action.

**Acceptance criteria:** Filter và drag/drop hoạt động với API thật; lỗi mạng không làm UI và server lệch trạng thái.

---

## ST-11 — Hoàn thiện User, Capacity và Workload

**Priority:** P1  
**Owner:** Feature Team Admin — People  
**Ước lượng:** 4–6 ngày  
**Phụ thuộc:** ST-02, ST-03, ST-07

**Story:** Là quản trị viên, tôi muốn quản lý người dùng và năng lực để phân công Task đúng người và theo dõi tải công việc.

### TK-11.1 — Hoàn thiện User CRUD

- [ ] `IS-11.1.1` Đồng bộ User/Role contract.
- [ ] `IS-11.1.2` Hoàn thiện user list, search và pagination.
- [ ] `IS-11.1.3` Hoàn thiện create user validation.
- [ ] `IS-11.1.4` Hoàn thiện detail/edit/disable user.

### TK-11.2 — Loại bỏ user mock

- [ ] `IS-11.2.1` Kết nối UserSelect với user service.
- [ ] `IS-11.2.2` Hỗ trợ search/debounce/pagination trong UserSelect.
- [ ] `IS-11.2.3` Dùng UserSelect chung ở Case, Task và Board.

### TK-11.3 — Hoàn thiện Capacity và Workload

- [ ] `IS-11.3.1` Chốt capacity/workload contract với backend.
- [ ] `IS-11.3.2` Lấy skills và task types từ API.
- [ ] `IS-11.3.3` Hoàn thiện cập nhật capacity cá nhân.
- [ ] `IS-11.3.4` Hoàn thiện workload metrics và user distribution.
- [ ] `IS-11.3.5` Xử lý loading, error và refresh workload.

**Acceptance criteria:** User và capacity dùng API thật; dữ liệu workload khớp backend và dùng chung type.

---

## ST-12 — Hoàn thiện Workflow và Labels

**Priority:** P1  
**Owner:** Feature Team Admin — Configuration  
**Ước lượng:** 4–6 ngày  
**Phụ thuộc:** ST-02, ST-03, ST-07

**Story:** Là quản trị viên, tôi muốn cấu hình workflow và labels để chuẩn hoá cách Task được xử lý và phân loại.

### TK-12.1 — Hoàn thiện Workflow

- [ ] `IS-12.1.1` Chốt Workflow/Step contract.
- [ ] `IS-12.1.2` Hoàn thiện workflow list.
- [ ] `IS-12.1.3` Hoàn thiện create workflow và step validation.
- [ ] `IS-12.1.4` Hoàn thiện detail/edit workflow.
- [ ] `IS-12.1.5` Chốt giữ hay bỏ versioning, template và auto-assign cũ.

### TK-12.2 — Hoàn thiện Labels

- [ ] `IS-12.2.1` Chuyển labels page sang label service chung.
- [ ] `IS-12.2.2` Hoàn thiện create/edit/delete label.
- [ ] `IS-12.2.3` Xử lý label đang được Case/Task sử dụng.
- [ ] `IS-12.2.4` Chuẩn hoá color/icon validation.

**Acceptance criteria:** Workflow và Label CRUD dùng service chuẩn, có permission và không gọi fetch trực tiếp trong page.

---

## ST-13 — Hoàn thiện kế toán và phạm vi tài chính

**Priority:** P1/P2  
**Owner:** Feature Team Finance  
**Ước lượng:** 5–8 ngày  
**Phụ thuộc:** ST-01, ST-02, ST-03, ST-07

**Story:** Là kế toán, tôi muốn xử lý thanh toán và theo dõi chi phí đúng phạm vi sản phẩm để dữ liệu tài chính có thể đối soát.

### TK-13.1 — Hoàn thiện Payment queue

- [ ] `IS-13.1.1` Chốt payment status/action contract.
- [ ] `IS-13.1.2` Hoàn thiện payment list, filter và pagination.
- [ ] `IS-13.1.3` Hoàn thiện confirm/reject payment.
- [ ] `IS-13.1.4` Hiển thị transaction result và xử lý retry an toàn.

### TK-13.2 — Chốt phạm vi Budget/Expense

- [ ] `IS-13.2.1` Đối chiếu module đã xoá với yêu cầu MVP.
- [ ] `IS-13.2.2` Chốt API backend hiện có cho budget và expense.
- [ ] `IS-13.2.3` Khôi phục module cần thiết hoặc xoá sạch code không còn dùng.
- [ ] `IS-13.2.4` Ghi rõ quyết định và migration dữ liệu liên quan.

### TK-13.3 — Hoàn thiện Cost Centers

- [ ] `IS-13.3.1` Thay direct fetch/debug code bằng budget service.
- [ ] `IS-13.3.2` Hoàn thiện CRUD cost center.
- [ ] `IS-13.3.3` Hoàn thiện hierarchy và validation.
- [ ] `IS-13.3.4` Kiểm thử permission và dữ liệu tiền tệ.

**Acceptance criteria:** Payment hoạt động end-to-end; Budget/Expense có quyết định phạm vi rõ và không còn module nửa xoá nửa giữ.

---

## ST-14 — Hoàn thiện Audit, Reports, Dashboard và Settings

**Priority:** P2  
**Owner:** Feature Team Admin — Operations  
**Ước lượng:** 5–7 ngày  
**Phụ thuộc:** ST-03, ST-07

**Story:** Là quản trị viên, tôi muốn theo dõi hoạt động và xuất báo cáo để vận hành hệ thống dựa trên dữ liệu thật.

### TK-14.1 — Hoàn thiện Audit Logs

- [ ] `IS-14.1.1` Chốt audit log API và fields.
- [ ] `IS-14.1.2` Thay mock logs bằng API.
- [ ] `IS-14.1.3` Hoàn thiện filter, pagination và detail.
- [ ] `IS-14.1.4` Hoàn thiện export audit logs.

### TK-14.2 — Hoàn thiện Reports và Dashboard

- [ ] `IS-14.2.1` Chốt statistics/report API.
- [ ] `IS-14.2.2` Hoàn thiện dashboard theo role bằng dữ liệu thật.
- [ ] `IS-14.2.3` Hoàn thiện export PDF.
- [ ] `IS-14.2.4` Hoàn thiện export Excel.
- [ ] `IS-14.2.5` Loại bỏ widget/config code không còn tồn tại.

### TK-14.3 — Hoàn thiện Settings

- [ ] `IS-14.3.1` Chốt phạm vi system settings.
- [ ] `IS-14.3.2` Hoàn thiện personal settings đang là placeholder.
- [ ] `IS-14.3.3` Hoàn thiện lưu profile và đổi mật khẩu.
- [ ] `IS-14.3.4` Thêm permission và validation cho settings.

**Acceptance criteria:** Audit/report/settings không còn mock hoặc placeholder và export tạo file hợp lệ.

---

## ST-15 — Chuẩn hoá route, menu và trải nghiệm chung

**Priority:** P2  
**Owner:** Frontend UI/UX  
**Ước lượng:** 3–4 ngày  
**Phụ thuộc:** ST-08..ST-14 chốt phạm vi

**Story:** Là người dùng, tôi muốn điều hướng nhất quán để tìm được mọi chức năng mình có quyền sử dụng mà không gặp màn hình mồ côi.

### TK-15.1 — Làm sạch route inventory

- [ ] `IS-15.1.1` Lập danh sách mọi `page.tsx`, role và trạng thái feature.
- [ ] `IS-15.1.2` Quyết định giữ, redirect hoặc xoá từng route.
- [ ] `IS-15.1.3` Sửa route/path sai trong code và link nội bộ.
- [ ] `IS-15.1.4` Xoá route placeholder không nằm trong roadmap sản phẩm.

### TK-15.2 — Chuẩn hoá navigation

- [ ] `IS-15.2.1` Xây menu đầy đủ theo permission matrix.
- [ ] `IS-15.2.2` Chuẩn hoá active state và breadcrumbs.
- [ ] `IS-15.2.3` Kiểm tra mobile drawer và desktop sidebar.
- [ ] `IS-15.2.4` Đảm bảo mọi route hợp lệ có đường điều hướng.

### TK-15.3 — Chuẩn hoá UI states và nội dung

- [ ] `IS-15.3.1` Đồng nhất ngôn ngữ Việt/Anh và thuật ngữ.
- [ ] `IS-15.3.2` Chuẩn hoá loading, empty và error components.
- [ ] `IS-15.3.3` Xoá button/action chỉ ghi `console.log`.
- [ ] `IS-15.3.4` Chuẩn hoá toast, confirmation và destructive action.

**Acceptance criteria:** Không có route mồ côi hoặc link sai; menu đúng quyền và mọi action hiển thị đều có hành vi thật.

---

## ST-16 — Đạt chuẩn responsive và accessibility

**Priority:** P2  
**Owner:** Frontend UI/UX + QA  
**Ước lượng:** 3–5 ngày  
**Phụ thuộc:** ST-15

**Story:** Là người dùng trên mọi thiết bị hoặc dùng công nghệ hỗ trợ, tôi muốn thao tác đầy đủ mà không bị cản trở bởi layout hay khả năng truy cập.

### TK-16.1 — Responsive review

- [ ] `IS-16.1.1` Kiểm thử login và dashboard ở mobile/tablet/desktop.
- [ ] `IS-16.1.2` Kiểm thử Case/Task forms ở mobile.
- [ ] `IS-16.1.3` Kiểm thử Board và DataGrid ở viewport hẹp.
- [ ] `IS-16.1.4` Sửa overflow, dialog và touch target.

### TK-16.2 — Accessibility review

- [ ] `IS-16.2.1` Kiểm tra keyboard navigation và focus order.
- [ ] `IS-16.2.2` Kiểm tra label, role và accessible name.
- [ ] `IS-16.2.3` Kiểm tra contrast và trạng thái focus.
- [ ] `IS-16.2.4` Kiểm tra loading/error announcements cho screen reader.
- [ ] `IS-16.2.5` Thêm automated accessibility smoke test.

**Acceptance criteria:** Luồng MVP dùng được bằng bàn phím, không có lỗi accessibility nghiêm trọng và layout đạt các breakpoint hỗ trợ.

---

## ST-17 — Thiết lập E2E và staging release candidate

**Priority:** P2  
**Owner:** QA Automation + DevOps  
**Ước lượng:** 4–6 ngày  
**Phụ thuộc:** ST-05..ST-16

**Story:** Là QA, tôi muốn kiểm thử luồng thật trên staging để phát hiện lỗi tích hợp trước khi phát hành production.

### TK-17.1 — Chuẩn bị staging data

- [ ] `IS-17.1.1` Tạo tài khoản test cho bốn role.
- [ ] `IS-17.1.2` Tạo fixtures cho Case, Task, Workflow và Payment.
- [ ] `IS-17.1.3` Tạo cơ chế reset dữ liệu test an toàn.
- [ ] `IS-17.1.4` Tách secret staging khỏi repository.

### TK-17.2 — Viết E2E smoke suite

- [ ] `IS-17.2.1` E2E login, session và permission.
- [ ] `IS-17.2.2` E2E Case lifecycle.
- [ ] `IS-17.2.3` E2E Task và Board lifecycle.
- [ ] `IS-17.2.4` E2E User/Workflow/Label administration.
- [ ] `IS-17.2.5` E2E Payment và reporting.

### TK-17.3 — Kiểm thử resilience và deployment

- [ ] `IS-17.3.1` Test API 400/401/403/404/500.
- [ ] `IS-17.3.2` Test session timeout, mạng chậm và request timeout.
- [ ] `IS-17.3.3` Test dữ liệu rỗng và payload lớn.
- [ ] `IS-17.3.4` Kiểm tra Docker build và runtime environment.
- [ ] `IS-17.3.5` Chạy full suite trên release candidate.

**Acceptance criteria:** Release candidate chạy ổn trên staging, smoke suite xanh và không còn lỗi P0/P1.

---

## ST-18 — UAT và phát hành production

**Priority:** P2  
**Owner:** Product Owner + QA Lead + DevOps  
**Ước lượng:** 2–3 ngày  
**Phụ thuộc:** ST-17

**Story:** Là Product Owner, tôi muốn bản phát hành được nghiệm thu và có khả năng giám sát/rollback để đưa hệ thống vào production an toàn.

### TK-18.1 — Chuẩn bị vận hành

- [ ] `IS-18.1.1` Thiết lập runtime error monitoring.
- [ ] `IS-18.1.2` Thiết lập health check và cảnh báo cơ bản.
- [ ] `IS-18.1.3` Viết rollback procedure.
- [ ] `IS-18.1.4` Chốt backup/migration procedure nếu có dữ liệu liên quan.

### TK-18.2 — Thực hiện UAT

- [ ] `IS-18.2.1` Chuẩn bị UAT checklist theo role.
- [ ] `IS-18.2.2` Ghi nhận và phân loại UAT defects.
- [ ] `IS-18.2.3` Sửa và retest toàn bộ defect P0/P1.
- [ ] `IS-18.2.4` Lấy xác nhận nghiệm thu từ Product Owner.

### TK-18.3 — Phát hành

- [ ] `IS-18.3.1` Chốt release notes và known issues.
- [ ] `IS-18.3.2` Chạy production release checklist.
- [ ] `IS-18.3.3` Deploy và chạy post-deploy smoke test.
- [ ] `IS-18.3.4` Theo dõi lỗi và metrics trong cửa sổ sau phát hành.

**Acceptance criteria:** Product Owner ký UAT; production smoke test xanh; monitoring và rollback sẵn sàng.

---

## Definition of Ready cho Issue

Một Issue chỉ được đưa vào sprint khi:

- [ ] Có mô tả đầu ra cụ thể và Story cha.
- [ ] Dependency đã hoàn tất hoặc có kế hoạch mock rõ ràng.
- [ ] API contract/design đã có nếu Issue phụ thuộc backend/UI.
- [ ] Có owner, reviewer, estimate và cách kiểm thử.

## Definition of Done cho Issue

Một Issue chỉ được đóng khi:

- [ ] Code hoặc tài liệu đúng phạm vi đã được review.
- [ ] Typecheck và lint không phát sinh lỗi mới.
- [ ] Test liên quan đã được thêm/cập nhật và chạy thành công.
- [ ] Loading, empty, error và permission state đã được xét nếu có UI/API.
- [ ] Bằng chứng kiểm thử được đính kèm vào Issue hoặc pull request.
- [ ] `qa_reviewer` đã trả `PASS` và review record đã được cập nhật.
