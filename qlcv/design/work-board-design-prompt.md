# Work Board Design Prompt

## Bối Cảnh

Thiết kế màn hình **Work Board** cho hệ thống nội bộ **Lean Legal Engine**.

Đây là màn hình quản lý công việc hằng ngày của công ty pháp lý. Trải nghiệm lấy cảm hứng từ GitLab issue board, nhưng nghiệp vụ được điều chỉnh theo hệ thống pháp lý nội bộ.

Trong UI:

- Màn hình gọi là `Work Board`.
- Một công việc có thể gọi là `Issue` hoặc `Công việc`.
- Về backend, `Issue` chính là `project_tasks`.
- Route chuẩn: `/work`.

Không thiết kế route hoặc concept chính là `/tasks` hoặc `/issue-board`. Nếu có tên trong UI, dùng `Work Board`.

## Mục Tiêu UX

Người dùng cần dùng màn này để:

- Xem toàn bộ công việc theo workflow step.
- Lọc nhanh theo project, assignee, status, label, due date.
- Kéo thả công việc giữa các workflow column.
- Tạo issue mới nhanh.
- Mở drawer để xem/sửa chi tiết issue mà không rời board.
- Chuyển sang list view khi cần scan nhiều record.

Đây là màn hình làm việc liên tục trong ngày, nên ưu tiên:

- Thao tác nhanh.
- Mật độ thông tin vừa đủ.
- Card dễ đọc.
- Filter rõ.
- Drag/drop có phản hồi tốt.
- Không trang trí thừa.

## Nguyên Tắc Nghiệp Vụ Quan Trọng

Column trên board **không lấy từ status**.

Column phải lấy từ `workflow_steps`, ví dụ:

- `Tiếp nhận`
- `Soạn thảo`
- `Chờ khách hàng`
- `Ký kết`
- `Thanh toán`
- `Hoàn tất`

Status chỉ là trạng thái nội bộ của issue:

- `TODO`
- `DOING`
- `DONE`
- `CANCELLED`

Vì vậy trên card có thể hiển thị status chip, nhưng không dùng status làm column chính.

## Layout Tổng Thể

Màn hình nằm trong app shell đã đăng nhập:

- Sidebar trái.
- Topbar trên cùng.
- Content area chính.

Không dùng hero, không dùng layout marketing.

### Desktop Layout

Gợi ý bố cục:

1. Page header:
   - Title: `Work Board`
   - Subtitle ngắn: `Quản lý công việc theo workflow`
   - Button chính: `New issue`

2. Toolbar:
   - Board/List toggle.
   - Search input.
   - Workflow template select.
   - Project filter.
   - Assignee filter.
   - Status filter.
   - Label filter.
   - Due date/overdue filter.
   - Display settings icon.

3. Board area:
   - Horizontal scroll nếu nhiều column.
   - Mỗi column có header, count và list issue card.
   - Unassigned column/section nếu BE trả `unassigned_tasks`.

4. Right drawer:
   - Issue detail.
   - Edit fields.
   - Labels, assignee, due date, status.
   - Actions.

### Mobile Layout

Không cố nhét toàn bộ kanban ngang vào mobile.

Gợi ý:

- Header compact.
- Filter mở bằng bottom sheet/drawer.
- Column switch dùng segmented tabs hoặc horizontal chips.
- Mỗi lần hiển thị một column.
- Issue card full width.
- Detail drawer thành full-screen modal.

## Thành Phần Chính

### 1. Page Header

Copy đề xuất:

- Title: `Work Board`
- Subtitle: `Theo dõi và xử lý công việc theo workflow`

Actions:

- Primary button: `New issue`
- Optional icon button: refresh.

Không đưa mô tả dài về cách dùng board trong UI.

### 2. Toolbar Và Filter

Toolbar nên hỗ trợ thao tác nhanh:

- Search placeholder: `Tìm issue, project, mô tả...`
- Workflow template select.
- Project select.
- Assignee select.
- Status select.
- Label select.
- Due date filter:
  - `All`
  - `Overdue`
  - `Due today`
  - `Due this week`
- Toggle:
  - `Board`
  - `List`
- Display settings icon.

Filter đang active nên hiển thị rõ bằng chips/tokens dưới toolbar hoặc ngay trong toolbar.

Mỗi active filter có thể remove nhanh.

### 3. Board Columns

Mỗi column đại diện một workflow step.

Column header gồm:

- Step name.
- Count issue.
- Optional macro column badge: `Intake`, `In Progress`, `Billing`, `Archived`.
- Optional column menu icon.

Column body:

- Issue cards xếp dọc.
- Có drop zone rõ khi kéo thả.
- Empty column state ngắn gọn: `Không có issue`.

Column cần có width ổn định, không co giãn thất thường.

### 4. Issue Card

Mỗi card nên đủ thông tin để xử lý nhanh nhưng không quá dày.

Thông tin đề xuất:

- Title.
- Project name hoặc mã project.
- Customer name nếu có.
- Assignee avatar/initials.
- Due date.
- Status chip.
- Labels.
- Priority hoặc overdue indicator nếu có.

States:

- Normal.
- Hover.
- Dragging.
- Selected/opened.
- Overdue.
- Blocked hoặc conflict-related nếu có dữ liệu.

Overdue cần nhìn thấy ngay nhưng không làm toàn bộ board quá đỏ.

### 5. Issue Detail Drawer

Drawer mở bên phải khi click issue card.

Nội dung:

- Issue title.
- Project.
- Workflow step.
- Status.
- Assignee.
- Due date.
- Labels.
- Description.
- Created/updated time.
- Actions:
  - Save.
  - Delete.
  - Open project.

Drawer nên cho sửa nhanh các field chính mà không cần rời board.

Không cần thiết kế comment/activity thread trong V1 nếu backend chưa hỗ trợ.

### 6. Create Issue Dialog

Dialog tạo issue mới gồm:

- Title.
- Project.
- Workflow step.
- Assignee.
- Due date.
- Status.
- Labels.
- Description.

Primary action:

- `Create issue`

Secondary:

- `Cancel`

Validation:

- Title bắt buộc.
- Project bắt buộc nếu backend yêu cầu.
- Workflow step bắt buộc nếu không có default.

### 7. List View

Ngoài board view, cần có list view để scan/filter nhiều issue.

List/table columns đề xuất:

- Title.
- Project.
- Workflow step.
- Status.
- Assignee.
- Due date.
- Labels.
- Updated at.
- Actions.

List view không thay thế board, chỉ là chế độ xem phụ.

### 8. Display Settings

Display settings cho phép chỉnh:

- Density:
  - Compact.
  - Comfortable.
- Ẩn/hiện column.
- Card fields:
  - Project.
  - Assignee.
  - Labels.
  - Due date.
  - Status.
  - Created date.

Trong V1, các setting này lưu local storage nếu backend chưa hỗ trợ saved board views.

## Drag And Drop UX

Kéo thả giữa columns:

- Gọi API move workflow step.
- UI phản hồi ngay.
- Nếu API lỗi, rollback card về vị trí cũ.
- Hiển thị snackbar lỗi.

Kéo trong cùng column:

- Dùng reorder.
- Nếu chưa ổn định, có thể giữ interaction đơn giản hơn nhưng designer vẫn nên chuẩn bị state.

Visual states cần có:

- Card đang kéo.
- Column đang được hover/drop target.
- Loading nhẹ sau drop.
- Error rollback.

## Empty, Loading, Error States

Designer cần chuẩn bị:

### Loading

- Skeleton columns.
- Skeleton cards.
- Toolbar disabled nhẹ.

### Empty Board

Copy:

- `Chưa có issue trong bộ lọc hiện tại.`

Action:

- `New issue`
- `Clear filters`

### Empty Column

Copy:

- `Không có issue`

### Error

Copy:

- `Không tải được Work Board. Vui lòng thử lại.`

Action:

- `Retry`

### Permission

Nếu user chỉ được đọc:

- Ẩn hoặc disable `New issue`.
- Disable drag/drop.
- Field edit trong drawer readonly.

## Role Behavior

Roles:

- `SUPER_ADMIN`: full access.
- `PARTNER`: full access.
- `LAWYER`: xử lý issue/project được phân quyền.
- `ACCOUNTANT`: read-only hoặc hạn chế thao tác tùy backend.

UI không nên hard-code quá sâu nếu API trả `actions`, nhưng designer cần có state readonly.

## Visual Direction

Phong cách:

- Operational.
- Compact.
- Rõ hierarchy.
- Không dùng màu quá rực.
- Không dùng gradient lớn.
- Không dùng card lồng card.
- Không biến board thành trang landing.

Card radius khoảng 6-8px.

Màu gợi ý:

- Neutral background cho page.
- Column background hơi khác page background.
- Status:
  - TODO: neutral/info.
  - DOING: primary.
  - DONE: success.
  - CANCELLED: default/disabled.
- Overdue: error.
- Due soon: warning.

## Interaction Mapping

Các điều hướng cần có:

- Click issue card -> mở drawer.
- Click project trong card/drawer -> `/projects/[id]`.
- Click customer nếu có -> `/customers/[id]`.
- Click KPI/filter từ dashboard sang -> board nhận query params.
- New issue -> create dialog.
- Board/List toggle giữ nguyên filters.
- Clear filters -> reset board về mặc định.

## Ghi Chú Cho Designer

- Đây là công cụ làm việc hằng ngày, không phải màn hình showcase.
- Ưu tiên tốc độ scan và thao tác.
- Board có thể có nhiều column nên cần thiết kế horizontal scrolling tốt trên desktop.
- Mobile không cần hiển thị tất cả column cùng lúc.
- Các thuật ngữ phải nhất quán với SRS:
  - `Work Board`
  - `Issue`
  - `Project`
  - `Workflow step`
  - `Assignee`
  - `Label`

