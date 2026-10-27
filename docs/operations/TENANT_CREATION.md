# Thêm tenant và đăng nhập

Chỉ Super Admin có quyền `platform.tenants.manage` mới thấy nút **Thêm tenant**. Biểu mẫu tạo tenant, Admin đầu tiên và có thể gán gói ngay. Nếu không gán gói, Admin đăng nhập được nhưng nghiệp vụ vẫn khóa tới khi gán gói có hiệu lực.

Mã tenant được dùng khi đăng nhập. Hệ thống tự sinh vùng dữ liệu PostgreSQL và role kết nối riêng, gắn session/token với tenant, và lưu tệp theo prefix riêng. Schema, password DB và khóa lưu trữ không xuất hiện trong giao diện.

```mermaid
sequenceDiagram
    actor SA as Super Admin
    participant FE as Giao diện nền tảng
    participant API as API platform
    participant CAT as Catalog PostgreSQL
    participant TEN as Schema + role riêng
    participant OBJ as Object storage
    SA->>FE: Nhập đơn vị, Admin, gói tùy chọn
    FE->>API: POST tenant + Idempotency-Key
    API->>CAT: Kiểm tra quyền, slug và gói
    API->>TEN: Tạo schema rỗng và role giới hạn
    API->>TEN: Thêm cấu hình và Admin
    opt Có chọn gói
        API->>CAT: Gán gói và quyền tính năng
    end
    API->>CAT: Lưu tenant, audit và idempotency
    API-->>FE: Tenant mới
    FE-->>SA: Mở trang tenant
    actor A as Admin tenant
    A->>FE: Đăng nhập bằng mã tenant
    FE->>API: Username, password, tenant_slug
    API->>CAT: Tìm tenant đang hoạt động
    API->>TEN: Xác thực, tạo session gắn tenant
    API-->>FE: JWT và refresh token có tenant ID
    FE->>API: Gọi nghiệp vụ bằng JWT
    API->>CAT: Kiểm tra tenant trong JWT
    API->>TEN: Truy vấn bằng role chỉ có schema riêng
    API->>OBJ: Dùng prefix lưu trữ của tenant
    API-->>FE: Chỉ dữ liệu tenant hiện tại
```

Tạo schema, Admin, đăng ký, audit và idempotency được thực hiện trong cùng transaction. Migration 017 chỉ thêm metadata và quyền kết nối; không tạo tenant hoặc gói mẫu và không chuyển dữ liệu legacy.

Kiểm thử PostgreSQL đã tạo hai tenant có cùng username và ID nội bộ, xác nhận role tenant này không đọc được schema tenant kia và không thể `SET ROLE` sang database owner. Test cũng xác nhận idempotency, gói được gán lúc tạo giới hạn đúng tính năng, migration chạy lặp và dọn sạch schema/role. Test lưu trữ xác nhận prefix tenant và chặn traversal. Chưa chạy đăng nhập trình duyệt qua hai tenant trên môi trường local.
