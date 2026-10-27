# Backlog

Chỉ bổ sung việc đã xác định cần theo dõi vào tài liệu này. Handoff và đề xuất dashboard/board cũ nằm trong [lưu trữ tháng 09/2026](archive/DASHBOARD_BOARD_2026-09.md), cần rà soát lại trước khi đưa vào backlog.

## Bảo mật tải tài liệu theo tenant

Ngày ghi nhận: 2026-10-27. Trạng thái: Backlog — người dùng yêu cầu ghi chú để làm sau, chưa triển khai.

### Hiện trạng qua kiểm tra mã nguồn

- Storage backend có SSE-KMS, bucket private và kiểm tra metadata mã hoá sau upload.
- API tải tài liệu kiểm tra người dùng/vai trò/phạm vi công việc rồi cấp presigned URL có hạn 60 giây.
- Người có URL còn hạn và truy cập được storage có thể tải trực tiếp; bước này không kiểm tra lại phiên đăng nhập hay domain tenant.
- Model `BusinessDocument` chưa có `tenant_id`; JWT chưa chứa tenant. Phạm vi dữ liệu tenant hiện có cơ chế `legacy` một tổ chức, chưa chứng minh cách ly tài liệu đa tenant.
- Chưa kiểm chứng cấu hình KMS thực tế, mã hoá toàn bộ file cũ hoặc hành vi trên môi trường triển khai. Không xem ghi chú này là kết quả kiểm thử runtime.

Nguồn đã đọc trong backend sibling `../qlcv`: `internal/service/storage_service.go`, `internal/service/business_document_service.go`, `internal/middleware/auth.go`, `internal/service/tenant_management_service.go`. Cần kiểm tra lại khi bắt đầu triển khai.

### Yêu cầu cần làm rõ và triển khai sau

Mục tiêu dự kiến: người dùng chỉ được tải tài liệu thuộc tenant của mình khi truy cập domain đã xác minh của tenant và có quyền với tài liệu. Đây là hướng đề xuất, chưa phải thiết kế được duyệt.

- Ánh xạ domain đã xác minh sang tenant tại backend; xử lý Host/forwarded headers theo cấu hình proxy tin cậy. DNS/domain không thay thế xác thực và phân quyền.
- Ràng buộc phiên đăng nhập/thành viên với tenant; thêm và áp dụng tenant scope cho metadata, truy vấn và đường dẫn storage. Lập phương án chuyển dữ liệu cũ.
- Cân nhắc backend stream file từ storage private và kiểm tra quyền ở mỗi lần tải nếu cần tránh việc chia sẻ presigned URL vượt qua kiểm tra tenant/phiên đăng nhập.
- Giữ mã hoá khi lưu và TLS; đánh giá nhu cầu khoá KMS riêng theo tenant. Không mặc định SSE-KMS hiện tại đã cung cấp cách ly khoá giữa tenant.
- Kiểm chứng mã hoá file cũ và cấu hình storage/KMS đang chạy.

### Kiểm tra nghiệm thu dự kiến

- Người có quyền, đúng tenant/domain tải được tài liệu của tenant mình.
- Từ chối sai tenant, domain không đăng ký, người không có quyền và phiên hết hạn/đã thu hồi.
- Không vượt được tenant scope bằng cách đổi ID tài liệu, Host hoặc forwarded headers không tin cậy.
- Nếu chọn stream qua backend: không để lộ URL storage dùng độc lập để bỏ qua kiểm tra quyền.

Chỉ ghi nhận công việc tương lai; chưa thay đổi mã ứng dụng, backend hay cấu hình triển khai.
