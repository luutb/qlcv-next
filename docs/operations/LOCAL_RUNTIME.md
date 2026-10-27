# Chạy môi trường local

## Frontend

Trong thư mục frontend:

1. Sao chép `.env.example` thành `.env.local`.
2. Đặt `NEXT_PUBLIC_API_BASE_URL=http://localhost:8083/api/v1` nếu backend local chạy cổng `8083`.
3. Chạy `npm run dev`; giao diện mặc định tại `http://localhost:3000`.

`NEXT_PUBLIC_*` được đóng vào bundle phía trình duyệt. Không đặt password, token hoặc secret vào các biến này.

## Backend

Backend nằm ngoài repo frontend. Chạy theo hướng dẫn và migration của repo backend; không dùng tài liệu này làm hướng dẫn deploy production.

```sh
SERVER_PORT=8083 go run ./cmd/server
```

PostgreSQL, object storage, migration và secret phải được cấu hình theo hướng dẫn backend hiện hành. Không thay đổi dữ liệu local hoặc migration chỉ để khớp tài liệu này.

## Tenant trên môi trường đang chạy

Migration `migrations/017_isolated_tenant_creation.sql` đã được áp dụng vào PostgreSQL local. Backend hiện chạy tại `http://127.0.0.1:8083`; frontend tại `http://localhost:3000`. Trang quản trị tenant: `http://localhost:3000/platform?section=tenants`.

DB local hiện chỉ có tenant `legacy`, chưa có gói hoặc tenant mẫu mới. Super Admin có thể chọn **Thêm tenant**, nhập Admin ban đầu, rồi gán gói ngay hoặc để trống. Người dùng tenant đăng nhập bằng `Mã đơn vị đăng nhập` tại trang `/login`. Gói chưa được gán thì tenant đăng nhập được nhưng các chức năng nghiệp vụ vẫn bị khóa theo chính sách gói.

Tạo tenant yêu cầu tài khoản DB backend có quyền `CREATEROLE` để tạo login role riêng. Khi triển khai môi trường khác, áp dụng migration 017 bằng tài khoản migration có quyền phù hợp và xác nhận backend có thể tạo role giới hạn trước khi bật tính năng.

Sơ đồ luồng thêm tenant và đăng nhập nằm tại [TENANT_CREATION.md](TENANT_CREATION.md).
