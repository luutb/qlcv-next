# UI Review — Reference alignment

## Verdict

`RETURNED` — UI chưa đạt reference contract.

## Top findings

| Severity | Finding | Evidence | Recommendation |
| --- | --- | --- | --- |
| Blocker | Project board reference không có route tương ứng | Chưa có `src/app/projects/board/page.tsx`; `/projects/board` bị bắt bởi `[projectId]` | Tạo route adapter riêng và render project workspace board |
| High | Project workspace thiếu board composition | `ProjectWorkspaceScreen` mới chỉ có breadcrumb/header | Compose tabs, toolbar, 4-column kanban và detail panel |
| High | Dashboard welcome hierarchy lệch reference | Mô tả được render trước `h1`; CTA chưa nằm cùng khối meta bên phải | Đặt `h1 → description` bên trái, date/meta + CTA bên phải |
| Medium | Visual contract bị phân tán trong nhiều lớp CSS | `globals.css` có nhiều override cho cùng selector | Giữ selector hiện tại nhưng chốt style ở block WorkHub cuối file |

## User flow

- Dashboard: mở `/` → scan greeting/KPI → xem revenue/status → mở project/task → mở drawer chi tiết.
- Project board: mở `/projects/board` → nhận diện project → chuyển tab → lọc board → thao tác trên từng column → xem project detail ở panel phải.
- Empty/error/auth states vẫn phải đi qua API/state boundary hiện có, không đưa fetch vào route.

## Component map

| UI region | User intent | Component | Layer | State/interaction | Reuse boundary |
| --- | --- | --- | --- | --- | --- |
| App shell | Điều hướng workspace | `WorkspaceTemplate` | template | responsive shell | shared |
| Sidebar/topbar | Điều hướng và global actions | `WorkhubSidebar`, `WorkhubTopbar` | layout organisms | active route, popover | shared WorkHub |
| Project header | Nhận diện project | `ProjectWorkspaceScreen` header | organism | tabs, menu | projects |
| Board toolbar | Tìm/lọc/chuyển view | `BoardToolbar` | organism | controls | tasks public API |
| Kanban | Theo dõi task theo trạng thái | `KanbanBoard` | organism | add/menu actions | tasks public API |
| Detail panel | Xem health/project context | `ProjectDetail` | organism | tabs, links | projects |
| Buttons/icons/avatar | Primitive UI | atoms | atom | focus/touch target | shared |

## Responsive + accessibility contract

- 1440px+: sidebar + board + detail panel như reference.
- 1024px: giữ board 4 cột có horizontal overflow cục bộ, detail panel vẫn đọc được.
- 768px: ẩn sidebar project, board cuộn ngang; không làm body overflow ngoài ý muốn.
- 375px: toolbar wrap, detail panel full width; mọi icon button có accessible label.
- Heading hierarchy: một `h1` cho page, section dùng `h2`, task dùng `h3`.
