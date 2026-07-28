# Kế hoạch hoàn thiện QLCV Frontend

Cập nhật: 28/07/2026. Đây là tài liệu giao việc hiện hành duy nhất cho giai đoạn ổn định dự án.

Backlog có thể giao việc theo cấu trúc Story → Task → Issue nằm tại [BACKLOG.md](BACKLOG.md).

## Mốc chất lượng ban đầu

| Chỉ số | Trạng thái |
|---|---:|
| TypeScript | 297 lỗi / 36 tệp |
| ESLint | 124 lỗi, 149 cảnh báo |
| Unit test | Không chạy được do sai pattern `.test.tsx` |
| Production build | Chưa đạt; phụ thuộc tải Google Fonts và còn lỗi type |
| Git worktree | 150 mục thay đổi, gồm staged/unstaged/untracked |

## Nguyên tắc giao việc

- P0 phải hoàn tất trước khi mở rộng tính năng.
- Mỗi task có một người chịu trách nhiệm chính; người phối hợp không thay thế owner.
- Không gộp refactor kiến trúc và thay đổi UI lớn trong cùng pull request.
- Mỗi pull request phải ghi rõ route/API bị ảnh hưởng và bằng chứng kiểm thử.
- Không commit hoặc xoá thay đổi hiện có của người khác nếu chưa xác định nguồn gốc.

## Nhóm A — Ổn định repository và kiến trúc nền

**Owner đề xuất:** Tech Lead / Senior Frontend  
**Ưu tiên:** P0  
**Ước lượng:** 4–6 ngày

### A1. Chuẩn hoá trạng thái Git

- [ ] Rà 150 mục thay đổi và phân loại: giữ, thay thế, hoặc loại bỏ.
- [ ] Xử lý các file có trạng thái staged delete nhưng được tạo lại ở working tree.
- [ ] Chia thay đổi thành các commit độc lập: nền tảng, migration API, feature Case, UI.
- [ ] Xác nhận các module budget, expense, file, notification, contract và workflow có chủ đích bị loại bỏ hay cần khôi phục.

**Hoàn thành khi:** `git status` chỉ còn thay đổi thuộc đúng nhánh công việc đang thực hiện và lịch sử commit có thể review độc lập.

### A2. Hợp nhất type system

- [ ] Chọn một định nghĩa duy nhất cho `User`, `Task`, `Case`, `Workflow`, `Role` và các response phân trang.
- [ ] Loại bỏ các enum/interface trùng hoặc không tương thích giữa `src/types/index.ts`, `src/types/entities` và các file domain.
- [ ] Cập nhật kiểu dữ liệu theo response thật của backend.
- [ ] Sửa toàn bộ lỗi MUI v7, đặc biệt API `Grid` cũ.
- [ ] Đưa `npx tsc --noEmit` về 0 lỗi.

**Hoàn thành khi:** TypeScript đạt 0 lỗi mà không dùng `any` để né type.

### A3. Hợp nhất tầng API

- [ ] Chọn `src/services` và `src/services/api/client.ts` làm kiến trúc đích.
- [ ] Di chuyển import còn dùng `src/repositories`, `src/api/client.ts` và `src/api/services`.
- [ ] Chuẩn hoá `ApiResponse`, lỗi API, refresh token và upload file.
- [ ] Xoá tầng cũ sau khi không còn import.
- [ ] Tắt log request/response nhạy cảm ở production.

**Hoàn thành khi:** toàn bộ API call đi qua một client và `rg "@/repositories|@/api/client|@/api/services" src` không còn kết quả.

## Nhóm B — Build, test và CI

**Owner đề xuất:** Frontend Platform / QA Automation  
**Ưu tiên:** P0  
**Ước lượng:** 3–4 ngày  
**Phụ thuộc:** A2

### B1. Khôi phục unit test

- [ ] Cho Vitest nhận cả `.test.ts` và `.test.tsx`.
- [ ] Bổ sung `@testing-library/react` và `@testing-library/jest-dom` đúng phiên bản.
- [ ] Sửa test Skeleton hiện có theo output thực tế của MUI.
- [ ] Thêm test cho auth context, API client và các component trạng thái quan trọng.

### B2. Làm sạch lint

- [ ] Sửa lỗi hooks, `no-explicit-any`, JSX escape và import không dùng.
- [ ] Không hạ rule hoặc thêm disable diện rộng để đạt kết quả giả.
- [ ] Đưa ESLint về 0 lỗi; cảnh báo phải có ticket hoặc được xử lý.

### B3. Ổn định production build

- [ ] Chuyển Google Fonts sang font local hoặc có phương án build không phụ thuộc mạng.
- [ ] Chạy build với cấu hình production tối thiểu.
- [ ] Thêm pipeline bắt buộc: lint, typecheck, test, build.

**Hoàn thành nhóm B khi:** bốn lệnh trong README đều thành công trên máy sạch và CI.

## Nhóm C — Xác thực và phân quyền

**Owner đề xuất:** Frontend Auth + Backend phối hợp  
**Ưu tiên:** P1  
**Ước lượng:** 3–4 ngày  
**Phụ thuộc:** A3

- [ ] Chốt contract `/auth/login`, `/auth/logout`, refresh token và `/auth/me`.
- [ ] Không lưu token nhạy cảm đồng thời ở cookie client-readable và localStorage nếu không cần thiết.
- [ ] Chuyển session sang cookie an toàn (`HttpOnly`, `Secure`, `SameSite`) do backend phát hành.
- [ ] Đồng bộ redirect theo role giữa middleware, root page, login và sidebar.
- [ ] Bảo vệ các route `/cases`, `/board` và route dùng chung, không chỉ các prefix theo role.
- [ ] Hoàn thiện quên mật khẩu, hoặc ẩn action cho tới khi backend hỗ trợ.
- [ ] Thêm test ma trận quyền cho admin, manager, staff và accountant.

**Hoàn thành khi:** đăng nhập, refresh, logout, session hết hạn và truy cập sai quyền đều có test tích hợp.

## Nhóm D — Case, Task và Kanban Board

**Owner đề xuất:** Feature Team Core  
**Ưu tiên:** P1  
**Ước lượng:** 6–8 ngày  
**Phụ thuộc:** A2, A3, C

### D1. Case management

- [ ] Đồng bộ model/status Case với backend.
- [ ] Hoàn thiện list, search, pagination, create, detail, edit và delete.
- [ ] Thay lookup member giả bằng API người dùng thật.
- [ ] Hoàn thiện member roles, labels và activity/timeline hoặc bỏ UI chưa được hỗ trợ.
- [ ] Xử lý loading, empty state, lỗi và optimistic update nhất quán.

### D2. Task management

- [ ] Đồng bộ task status, workflow step, assignee và payment types.
- [ ] Hoàn thiện create/update/delete/status transition trong Case.
- [ ] Kết nối subtask, comment, custom fields và attachment với backend hoặc ẩn tính năng chưa hỗ trợ.
- [ ] Hoàn thiện trang duyệt task đang là placeholder.

### D3. Kanban board

- [ ] Kết nối filter labels, users, milestones và cases.
- [ ] Hoàn thiện lưu nội dung và gửi comment trong Task Sidebar.
- [ ] Xử lý rollback khi drag/drop cập nhật API thất bại.
- [ ] Thêm test cho mapping status và drag/drop.

**Hoàn thành khi:** một Case có thể đi trọn luồng tạo → thêm thành viên/task → cập nhật trên board → hoàn thành, không cần mock.

## Nhóm E — Admin và nghiệp vụ hỗ trợ

**Owner đề xuất:** Feature Team Admin  
**Ưu tiên:** P1/P2  
**Ước lượng:** 8–12 ngày  
**Phụ thuộc:** A2, A3

### E1. Người dùng và capacity

- [ ] Hoàn thiện CRUD user và role.
- [ ] Thay danh sách user mock bằng API.
- [ ] Lấy skills và task types từ backend.
- [ ] Sửa workload/capacity theo contract backend thống nhất.

### E2. Workflow và labels

- [ ] Hoàn thiện list/create/detail/edit workflow.
- [ ] Kiểm tra versioning và auto-assign; khôi phục hoặc loại bỏ UI cũ có chủ đích.
- [ ] Chuẩn hoá CRUD labels qua service chung, không gọi fetch trực tiếp.

### E3. Kế toán, báo cáo và cấu hình

- [ ] Hoàn thiện payment queue và xác nhận thanh toán.
- [ ] Chốt phạm vi budget, expenses và cost centers trước khi khôi phục/xoá module.
- [ ] Thay audit log mock bằng API và hoàn thiện export.
- [ ] Hoàn thiện dashboard/report export PDF/Excel.
- [ ] Hoàn thiện cài đặt cá nhân đang là placeholder.

**Hoàn thành khi:** mỗi màn hình hiển thị trong menu đều có API thật, xử lý lỗi và kiểm thử quyền tương ứng.

## Nhóm F — UX, điều hướng và khả năng truy cập

**Owner đề xuất:** Frontend UI/UX  
**Ưu tiên:** P2  
**Ước lượng:** 3–5 ngày  
**Phụ thuộc:** D, E xác định phạm vi

- [ ] Lập inventory route và quyết định route nào được giữ.
- [ ] Đưa các màn hình hợp lệ vào sidebar theo role; xoá route mồ côi.
- [ ] Đồng nhất ngôn ngữ Việt/Anh, breadcrumb, tiêu đề và action.
- [ ] Kiểm tra responsive ở mobile/tablet/desktop.
- [ ] Kiểm tra keyboard navigation, focus, contrast, loading và error announcement.
- [ ] Loại bỏ button chỉ `console.log` hoặc action chưa có hành vi.

## Nhóm G — Kiểm thử chấp nhận và phát hành

**Owner đề xuất:** QA + DevOps  
**Ưu tiên:** P2  
**Ước lượng:** 4–6 ngày  
**Phụ thuộc:** B–F

- [ ] Tạo dữ liệu kiểm thử cho bốn role.
- [ ] Viết smoke/E2E test cho auth, Case, Task, Board, User và Payment.
- [ ] Kiểm tra API error, session timeout, mạng chậm và dữ liệu rỗng.
- [ ] Kiểm tra Docker build và cấu hình môi trường staging.
- [ ] Theo dõi lỗi runtime và định nghĩa rollback.
- [ ] Thực hiện UAT và ký duyệt release checklist.

**Hoàn thành khi:** staging vượt qua smoke test, UAT và release checklist; không còn lỗi P0/P1.

## Thứ tự triển khai và khả năng chạy song song

1. A1 bắt đầu trước để bảo vệ code hiện có.
2. A2 và A3 chạy song song sau khi A1 chốt phạm vi.
3. B bắt đầu ngay khi type/API nền đủ ổn định.
4. C, D và E có thể chia nhóm chạy song song sau A3.
5. F đi sau khi phạm vi feature được chốt.
6. G là cổng cuối trước production.

## Definition of Done chung

Một task chỉ được đóng khi:

- [ ] Không còn dữ liệu mock hoặc action placeholder trong phạm vi task.
- [ ] TypeScript và ESLint không phát sinh lỗi mới.
- [ ] Có unit/integration test cho logic quan trọng.
- [ ] Đã kiểm tra loading, empty, error và permission state.
- [ ] Đã test với backend thật trên staging.
- [ ] Pull request có mô tả, ảnh/video nếu đổi UI và hướng dẫn kiểm thử.
- [ ] Tài liệu hiện hành được cập nhật nếu contract hoặc luồng thay đổi.
