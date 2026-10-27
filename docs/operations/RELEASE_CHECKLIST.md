# Checklist phát hành public

Checklist hành động thay cho các biên bản rà soát cũ. Các điểm dưới đây được ghi nhận ngày 2026-10-27 và **chưa được xác minh lại** sau lần ghi nhận đó. Chỉ đánh dấu hoàn tất khi có bằng chứng mới trên artifact và môi trường đích.

## Trước khi build

- [ ] Đặt `NEXT_PUBLIC_API_BASE_URL` thành API HTTPS hoặc đường dẫn same-origin của môi trường đích; build lại và kiểm tra bundle không còn URL localhost.
- [ ] Cập nhật Go toolchain và dependency theo advisory hiện hành; chạy `govulncheck` và regression suite trên đúng phiên bản chuẩn bị phát hành.
- [ ] Hoàn thiện hướng dẫn triển khai cho toàn bộ migration hiện hành, khởi tạo/backup/restore KMS, bootstrap Super Admin, cấu hình plan, CORS, proxy và TLS.
- [ ] Chốt phạm vi sử dụng: một tổ chức hay SaaS nhiều tenant. Không đưa dữ liệu nhiều tổ chức vào runtime chưa có tenant isolation được xác minh.

## Hạ tầng và cấu hình

- [ ] Cấu hình đúng proxy tin cậy, ghi đè client IP tại gateway và chặn truy cập trực tiếp tới BE; xác minh rate limit không dùng chung nhầm cho mọi người sau proxy.
- [ ] Cấu hình CORS/domain đích, HTTPS cho API và endpoint presigned storage; không mở PostgreSQL hoặc MinIO Console ra Internet.
- [ ] Đặt timeout, giới hạn kết nối/request, pool DB, monitoring và cảnh báo tại gateway/runtime.
- [ ] Xác nhận secret, quyền DB/storage tối thiểu, KMS key bền vững, backup và diễn tập restore cả metadata lẫn object đã mã hoá.

## Kiểm thử staging

- [ ] Kiểm thử admin và nhân viên trên domain/TLS/proxy thật: login, quyền, logout/thu hồi phiên, plan/quota, upload và download.
- [ ] Kiểm thử từ máy ngoài server và xác nhận artifact public gọi đúng API; xác nhận download không phụ thuộc URL storage nội bộ.
- [ ] Kiểm tra MFA không được quảng bá là hoạt động nếu luồng xác minh chưa hoàn tất.
- [ ] Rà soát lại sessionStorage/CSP/XSS và quyền tải tài liệu. Backlog tenant/domain/file-download riêng nằm tại [DOCUMENT_TENANT_DOWNLOAD_BACKLOG](../BACKLOG.md).
- [ ] Xác nhận rollback và lưu bằng chứng build, scan, test, migration và smoke staging của đúng phiên bản.

## Quy tắc hoàn tất

Không đánh dấu public-ready dựa trên checklist này một mình. Ghi phiên bản/artifact, môi trường, kết quả và người xác nhận khi hoàn tất từng mục. Các mục chưa kiểm tra giữ trạng thái chưa xác minh.
