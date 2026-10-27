# Trạng thái sản phẩm

**Cập nhật:** 2026-10-27  
**Cơ sở:** tổng hợp tài liệu và trạng thái được ghi nhận đến ngày này; chưa phải kiểm tra mới trên production.

Đây là tài liệu tổng hợp duy nhất cho trạng thái cấp sản phẩm. Không dùng nó thay cho contract API hay checklist phát hành.

## Phạm vi đang có

- Frontend có các khu vực dự án, công việc, khách hàng, đội nhóm, nhân viên, tài liệu, thời gian, báo cáo và quản trị. API/model chi tiết nằm trong [API reference](product/API_REFERENCE.md).
- Phân quyền dùng action flags và phải được backend thực thi. Contract, capability và phần chưa hỗ trợ nằm trong [authorization contract](architecture/ACCESS_CONTROL.md#authorization).
- Admin nghiệp vụ và Super Admin nền tảng có scope riêng theo [Admin/Super Admin contract](architecture/ACCESS_CONTROL.md#platform-roles).
- Tenant viewer chỉ đọc phạm vi legacy. Chưa có bằng chứng triển khai cách ly nhiều tenant theo domain; xem [tenant viewer contract](architecture/TENANCY.md#viewer).

## Giới hạn cần nhớ

- Không coi hệ thống hiện tại là SaaS đa tenant độc lập. Cần thiết kế và kiểm chứng tenant isolation trước khi nhận dữ liệu nhiều tổ chức.
- Các capability có tên trong bảng quyền không đồng nghĩa đã có màn hình/API hoàn chỉnh. Contract quyền liệt kê rõ các capability dự phòng và thao tác chưa hỗ trợ.
- Gói, quota và trạng thái tài khoản cần được kiểm tra trên đúng database/môi trường trước khi nghiệm thu; không suy ra trạng thái hiện tại từ dữ liệu local hoặc tài liệu cũ.
- Không có xác nhận production-ready trong tài liệu này.

## Việc còn cần theo dõi

- Hoàn tất [backlog tải tài liệu theo tenant/domain](BACKLOG.md), hiện chưa triển khai.
- Đối chiếu [UI data completion backlog lịch sử](archive/DASHBOARD_BOARD_2026-09.md#backlog) với backend hiện tại trước khi coi các mục là đang mở.
- Trước khi public, hoàn tất và lưu bằng chứng mới cho [release checklist](operations/RELEASE_CHECKLIST.md).

## Quy tắc cập nhật

Chỉ cập nhật tài liệu này sau khi kiểm tra code hoặc môi trường hiện hành. Lưu các quyết định API/quyền trong `architecture/`, việc chưa làm trong backlog tương ứng, và không tạo report QA/audit riêng theo từng lượt; kết quả kiểm thử dùng để quyết định trạng thái rồi có thể bỏ sau khi hoàn tất handoff.
