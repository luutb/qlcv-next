# Dashboard Design Prompt

## Bối Cảnh

Thiết kế màn hình **Dashboard** cho hệ thống nội bộ **Lean Legal Engine**.

Đây là ứng dụng vận hành cho công ty pháp lý, dùng bởi các vai trò:

- `SUPER_ADMIN`
- `PARTNER`
- `LAWYER`
- `ACCOUNTANT`

Dashboard là màn hình đầu tiên sau khi đăng nhập thành công. Mục tiêu là giúp người dùng nắm nhanh tình hình vận hành: công việc đang mở, việc quá hạn, vụ việc đang xử lý, doanh thu đã thu, workload theo nhân sự, tiến độ OKR và các project cần chú ý.

## Mục Tiêu UX

Dashboard không phải landing page. Đây là màn hình làm việc hằng ngày.

Người dùng cần:

- Scan nhanh tình hình tổng thể trong 10-20 giây.
- Nhận ra ngay việc nào đang quá hạn hoặc cần xử lý.
- Bấm nhanh sang Work Board, Project Detail, Reports hoặc Billing.
- Lọc dữ liệu theo khoảng thời gian.
- Dễ dùng trên desktop, vẫn đọc được trên tablet/mobile.

Phong cách nên là **quiet operational dashboard**: rõ ràng, gọn, chuyên nghiệp, ít trang trí, ưu tiên mật độ thông tin và khả năng đọc.

## Layout Tổng Thể

Dashboard nằm bên trong app shell đã đăng nhập:

- Sidebar trái.
- Topbar trên cùng.
- Content area chính.

Không thiết kế dashboard như trang marketing. Không dùng hero lớn. Không dùng minh họa trang trí.

### Desktop Layout

Gợi ý bố cục:

1. Header nhỏ gọn:
   - Tiêu đề: `Dashboard`
   - Subtitle: `Tổng quan vận hành công việc pháp lý`
   - Bộ lọc thời gian: `7 ngày`, `30 ngày`, `90 ngày`, `Tùy chọn`
   - Nút reload hoặc refresh icon.

2. KPI row:
   - 4-6 KPI cards nằm cùng hàng hoặc grid.

3. Main content grid:
   - Cột trái rộng hơn: biểu đồ trạng thái công việc, workflow distribution.
   - Cột phải: danh sách việc đến hạn/quá hạn, project cần chú ý.

4. Section dưới:
   - Workload by assignee.
   - OKR summary.
   - Revenue collected hoặc billing snapshot.

### Mobile Layout

- Header và filter xếp dọc.
- KPI cards thành 2 cột hoặc 1 cột tùy chiều rộng.
- Các chart/list xếp thành single column.
- Sidebar chuyển thành drawer.
- Tránh bảng rộng ngang; dùng list/card compact.

## Thành Phần Chính

### 1. Header

Copy đề xuất:

- Title: `Dashboard`
- Subtitle: `Tổng quan công việc, vụ việc, deadline và doanh thu`

Controls:

- Date range segmented control:
  - `7 ngày`
  - `30 ngày`
  - `90 ngày`
  - `Tùy chọn`
- Nếu chọn tùy chọn, hiển thị 2 input date:
  - `Từ ngày`
  - `Đến ngày`
- Icon button refresh.

### 2. KPI Cards

Cần thiết kế các KPI card nhỏ gọn, dễ scan:

1. `Công việc đang mở`
   - Số lượng issue/task chưa hoàn tất.
   - Click sang `/work`.

2. `Quá hạn`
   - Số lượng công việc đã quá hạn.
   - Dùng màu cảnh báo/error.
   - Click sang `/work?overdue=true`.

3. `Project active`
   - Số vụ việc đang xử lý.
   - Click sang `/projects`.

4. `Đã thu`
   - Tổng tiền đã thu trong kỳ.
   - Định dạng VND.
   - Click sang billing/invoices nếu phù hợp.

5. `Workload cao`
   - Số nhân sự đang quá tải hoặc người có nhiều task nhất.

6. `OKR progress`
   - Phần trăm tiến độ OKR tổng quan.

KPI card nên có:

- Label nhỏ.
- Số chính lớn vừa phải.
- Optional delta hoặc status text.
- Icon nhỏ.
- Trạng thái màu rõ nhưng tiết chế.

Không dùng card quá cao hoặc decorative gradient.

### 3. Task Status Chart

Mục đích:

- Cho biết task/issue đang phân bổ theo trạng thái.

Trạng thái:

- `TODO`
- `DOING`
- `DONE`
- `CANCELLED`

Thiết kế có thể dùng:

- Horizontal bar chart.
- Stacked bar.
- Simple list with progress bars.

Ưu tiên kiểu dễ đọc hơn là biểu đồ phức tạp.

### 4. Workflow Distribution

Mục đích:

- Cho biết project/vụ việc đang nằm ở macro workflow nào.

Macro columns:

- `INTAKE`
- `IN_PROGRESS`
- `BILLING`
- `ARCHIVED`

Copy hiển thị:

- `Tiếp nhận`
- `Đang xử lý`
- `Billing`
- `Lưu trữ`

Mỗi item nên click được để sang `/projects` với filter tương ứng.

### 5. Due Items List

Danh sách công việc/vụ việc sắp đến hạn hoặc đã quá hạn.

Mỗi item nên hiển thị:

- Tên công việc hoặc project.
- Loại: `Issue` hoặc `Project`.
- Hạn xử lý.
- Người phụ trách.
- Mức độ ưu tiên.
- Trạng thái quá hạn hoặc còn bao nhiêu ngày.

State quan trọng:

- Overdue: nổi bật bằng màu error.
- Due soon: màu warning.
- Normal: trung tính.

Click item:

- Nếu là issue: mở issue drawer hoặc sang `/work`.
- Nếu là project: sang `/projects/[id]`.

### 6. Projects Need Attention

Danh sách project cần chú ý.

Lý do cần chú ý có thể gồm:

- Conflict chưa xử lý.
- Financial guard/payment block.
- Workflow bị kẹt lâu.
- Có task quá hạn.
- Chưa thanh toán đủ.

Mỗi row/card nên hiển thị:

- Project name.
- Customer.
- Current workflow step.
- Conflict status.
- Total contract value.
- Total paid.
- Remaining amount.
- Attention reason.
- Action: `Xem project`.

Desktop có thể dùng table compact. Mobile dùng list card.

### 7. Workload By Assignee

Mục đích:

- Xem nhanh khối lượng công việc theo nhân sự.

Hiển thị:

- Avatar hoặc initials.
- Tên nhân sự.
- Open tasks.
- Overdue tasks.
- Capacity indicator nếu có dữ liệu.

Ưu tiên horizontal bars hoặc compact list.

### 8. OKR Summary

Mục đích:

- Tóm tắt tiến độ OKR hiện tại.

Hiển thị:

- Cycle hiện tại.
- Progress percent.
- Objectives at risk.
- Key results completed.

Không cần chiếm quá nhiều diện tích.

## State Cần Thiết Kế

Designer cần chuẩn bị:

- Loading state: skeleton cho KPI, chart, list.
- Empty state: chưa có dữ liệu trong khoảng thời gian.
- Error state: API lỗi, có nút retry.
- Permission state: user không có quyền xem một phần dữ liệu.
- Long content state: tên project/customer dài.
- Mobile state.

Copy ví dụ:

- Empty: `Chưa có dữ liệu trong khoảng thời gian này.`
- Error: `Không tải được dữ liệu dashboard. Vui lòng thử lại.`
- No permission: `Bạn không có quyền xem dữ liệu này.`

## Visual Direction

Phong cách:

- Chuyên nghiệp.
- Gọn.
- Ít trang trí.
- Tập trung vào dữ liệu vận hành.
- Không dùng màu quá rực.
- Không dùng gradient nền lớn.
- Không dùng illustration hero.

Màu sắc:

- Neutral background.
- Error cho overdue/conflict.
- Warning cho due soon/payment pending.
- Success cho paid/done.
- Info/primary cho active workflow.

Spacing:

- Dashboard cần dense nhưng không bí.
- Card radius tối đa khoảng 8px.
- Typography rõ cấp bậc.
- Number trong KPI đủ nổi bật nhưng không quá lớn.

## Navigation Và Interaction

Các vùng nên click được:

- KPI `Công việc đang mở` -> `/work`
- KPI `Quá hạn` -> `/work?overdue=true`
- KPI `Project active` -> `/projects`
- Workflow distribution item -> `/projects?macro_column=...`
- Due item -> issue drawer hoặc project detail.
- Project need attention -> `/projects/[id]`
- Workload assignee -> `/work?assignee_id=...`

Hover/focus state cần rõ ràng vì đây là app làm việc nội bộ.

## Ghi Chú Quan Trọng

- Dashboard phải phù hợp với sản phẩm pháp lý/doanh nghiệp, không giống SaaS marketing page.
- Không đưa text hướng dẫn dài trong UI.
- Ưu tiên data thật/structure thật thay vì placeholder quá chung chung.
- Các thuật ngữ nên nhất quán:
  - `Work Board`
  - `Issue` hoặc `Công việc`
  - `Project` hoặc `Vụ việc`
  - `Customer` hoặc `Khách hàng`
  - `Workflow`
  - `Billing`

