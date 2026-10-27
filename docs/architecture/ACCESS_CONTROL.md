# Phân quyền và vai trò

## Nội dung

- [Contract phân quyền FE/BE](#authorization)
- [Contract tách Admin và Super Admin](#platform-roles)

<a id="authorization"></a>

## Contract phân quyền FE/BE

Tài liệu này định nghĩa capability flags, fallback FE và yêu cầu bảo vệ API. Đối chiếu với backend hiện hành trước khi dùng làm bằng chứng triển khai hoặc phát hành.

### API contract

Trả quyền hiệu lực của người đăng nhập trong `data.actions` của GET `/api/v1/users/me`, giữ các trường identity hiện tại. Ví dụ phần response:

```json
{
  "data": {
    "actions": {
      "users.manage": false,
      "customers.manage": true,
      "teams.manage": true
    }
  }
}
```

Ví dụ trên chỉ minh họa ba key; danh sách đầy đủ bên dưới. Key chưa có endpoint phải trả false. Quyền có endpoint phải theo giới hạn role và restriction được backend hỗ trợ. `users.manage` bao phủ quyền truy cập danh sách/chi tiết nhân viên và quản trị hồ sơ/tài liệu riêng tư; chỉ cấp khi toàn bộ phạm vi đó được phép. Nếu BE tách quyền đọc/ghi hoặc tài liệu, cần thống nhất key riêng trước khi mở quyền.

- Trả boolean thật cho từng key, kể cả `false`; không dùng null, chuỗi hoặc bỏ key khi từ chối. FE từ chối response nếu actions sai kiểu.
- Tính quyền từ chính sách hiệu lực tại server, gồm active state và phạm vi dữ liệu. Không chỉ sao chép nhãn role hoặc JSON chưa đánh giá điều kiện.
- Dùng cùng chính sách khi bảo vệ endpoint đọc/ghi tương ứng. Ẩn nút ở FE không thay thế kiểm tra server. Trả 401 khi phiên không hợp lệ, 403 khi thiếu quyền.
- Không mở rộng quyền hồ sơ nhân viên mặc định: fallback hiện chỉ SUPER_ADMIN; khách hàng/đội nhóm là SUPER_ADMIN hoặc PARTNER. Role khác chỉ mở khi BE trả true và endpoint thực sự cho phép.
- Nếu có quyền theo từng bản ghi/điều kiện, trả actions theo resource và thống nhất key/shape với FE; cờ toàn cục không đủ để cấp quyền trên mọi bản ghi.

### Toàn bộ key FE và fallback tương thích

BE cần trả rõ từng key dùng trong UI, không bỏ key để biểu diễn từ chối. Fallback chỉ phục vụ runtime legacy đang trả `{}`; chưa phải chính sách phân quyền động được BE xác nhận. Các quyền đọc mới được giới hạn theo vai trò phù hợp với dữ liệu nhạy cảm; cần đối chiếu chính sách sản phẩm khi BE triển khai.

| Key | Fallback khi thiếu key |
| --- | --- |
| `dashboard.finance.read` | SUPER_ADMIN, PARTNER, ACCOUNTANT |
| `dashboard.people.read` | SUPER_ADMIN, PARTNER |
| `projects.finance.read` | SUPER_ADMIN, PARTNER, ACCOUNTANT |
| `projects.read` | SUPER_ADMIN, PARTNER, LAWYER, ACCOUNTANT |
| `projects.create` | SUPER_ADMIN, PARTNER |
| `customers.read` | SUPER_ADMIN, PARTNER, LAWYER, ACCOUNTANT |
| `teams.read` | SUPER_ADMIN, PARTNER, LAWYER, ACCOUNTANT |
| `labels.read` | SUPER_ADMIN, PARTNER, LAWYER, ACCOUNTANT |
| `labels.manage` | SUPER_ADMIN, PARTNER |
| `labels.assign-normal` | SUPER_ADMIN, PARTNER |
| `labels.assign-financial` | SUPER_ADMIN, ACCOUNTANT |
| `tasks.create` | SUPER_ADMIN, PARTNER |
| `tasks.assign` | SUPER_ADMIN, PARTNER |
| `tasks.finance.read` | SUPER_ADMIN, PARTNER, ACCOUNTANT |
| `tasks.update-amount` | SUPER_ADMIN, PARTNER |
| `tasks.complete-deposit` | SUPER_ADMIN, ACCOUNTANT |
| `invoices.read` | SUPER_ADMIN, PARTNER, ACCOUNTANT |
| `documents.read` | SUPER_ADMIN, PARTNER, LAWYER, ACCOUNTANT |
| `time-entries.read` | SUPER_ADMIN, PARTNER, LAWYER, ACCOUNTANT |
| `reports.read` | SUPER_ADMIN, PARTNER, ACCOUNTANT |
| `users.manage` | SUPER_ADMIN |
| `customers.manage` | SUPER_ADMIN, PARTNER |
| `teams.manage` | SUPER_ADMIN, PARTNER |
| `projects.assign-team` | SUPER_ADMIN, PARTNER |
| `projects.override-conflict` | SUPER_ADMIN, PARTNER |
| `projects.complete` | SUPER_ADMIN, PARTNER |
| `tasks.access` | SUPER_ADMIN, PARTNER, LAWYER, ACCOUNTANT |
| `invoices.generate` | PARTNER, ACCOUNTANT |
| `invoices.update-status` | SUPER_ADMIN, PARTNER, LAWYER, ACCOUNTANT |
| `audit.read` | SUPER_ADMIN, PARTNER, LAWYER, ACCOUNTANT |
| `audit.verify` | SUPER_ADMIN, PARTNER, LAWYER, ACCOUNTANT |
| `documents.lock` | PARTNER |
| `tenant-settings.manage` | SUPER_ADMIN |
| `tenant-data.purge` | SUPER_ADMIN |

### Quyền theo bản ghi và trường dữ liệu

- Task API tiếp tục trả `actions.edit`, `move`, `comment`, `request_review`, `review` cho từng task. Không suy quyền edit/move từ role hoặc từ quyền tạo việc. Bảng và editor dùng các flag này. Đường PUT/đổi trạng thái phải kiểm tra lại quyền tại BE.
- Gán người và sửa số tiền tách thành `tasks.assign` và `tasks.update-amount`. Gắn nhãn thường/tài chính tách `labels.assign-normal`/`labels.assign-financial`; xác nhận tiền cọc dùng `tasks.complete-deposit`. BE phải bảo vệ cả endpoint nhãn và endpoint hoàn thành cọc; không suy quyền tiền từ quyền edit nội dung.
- Project `actions["assign-team"]` là hạn chế theo bản ghi. `false` chặn quyền toàn cục `projects.assign-team`; cờ resource không được mở lại quyền toàn cục bị từ chối. Các resource actions khác chưa có contract cụ thể thì không tự suy diễn.
- Quyền quản lý phải đi kèm quyền đọc tương ứng (ví dụ teams.manage/teams.read). Các trang đọc bị cấm sẽ bị guard chặn trước khi mount nội dung. Guard là UX; không thay thế kiểm tra BE.
- Dashboard và project phải lọc dữ liệu tài chính/nhân sự ở API theo quyền và scope. FE dùng dashboard.finance.read/projects.finance.read/tasks.finance.read cho khối tài chính và dashboard.people.read cho dữ liệu nhân sự; dữ liệu không được phép phải bị loại khỏi response.
- Với dashboard không có quyền tài chính, trả `billing: null`, `kpis.revenue_collected: null`, bỏ KPI doanh thu tùy chọn; với dashboard không có quyền nhân sự, trả `workload: []` và bỏ active_users/employee_count. Giữ chỉ số công việc hợp lệ. Project có thể trả số tiền null; task có thể bỏ amount/collected_amount/paid_amount/paid_at.
- Dashboard hoàn thành nhanh tải task hiện tại, yêu cầu task.actions.move trước khi gửi đổi trạng thái; task cọc chưa thanh toán cần mở chi tiết thay vì hoàn thành nhanh.

### Giao diện theo role

- SUPER_ADMIN: quản trị nhân viên/cấu hình; các hành động còn lại vẫn chịu flag API.
- PARTNER: fallback cho tạo dự án/công việc, quản lý nhóm/khách/nhãn, giao việc; hồ sơ nhân viên riêng tư chỉ mở khi BE cấp users.manage.
- LAWYER: mặc định xem/làm việc theo task actions; ẩn tạo nhanh và các khối tài chính/nhân sự tổng hợp, không mở trang tạo dự án/quản trị nhân viên.
- ACCOUNTANT: mặc định xem tài chính và công việc được phép, gắn nhãn tài chính/xác nhận cọc; ẩn tạo dự án, giao việc và quản trị nhân viên.
- Các mô tả trên là fallback của UI, không phải yêu cầu cấp quyền mới tại server. Quyền boolean BE có thể thay đổi giao diện cho từng tài khoản.

### Màn hình quản trị chính sách role

FE hiện có `/admin/permissions`, liên kết từ điều hướng Admin và trang nhân viên. Admin đọc `GET /api/v1/roles/:role/permissions`, sửa ma trận 34 key và lưu `PUT /api/v1/roles/:role/permissions`. Checkbox chỉ bật nếu role ceiling trong FE cho phép; giới hạn theo resource được giữ nguyên. Lưu và khôi phục đều gửi `field_level:false`, `conditions:{}` để BE có thể sửa default policy cũ chưa hỗ trợ.

Đây là màn hình thu hẹp hoặc khôi phục quyền theo role, không cấp quyền vượt ceiling, không cấu hình riêng từng nhân viên và không tạo policy theo điều kiện/trường. API BE hiện chỉ cập nhật resource `default`; policy theo resource khác tiếp tục được áp dụng. Endpoint vẫn kiểm tra role admin ở server.

### Tiêu chí nghiệm thu

1. Admin với flag false không thấy thao tác tương ứng; gọi API trực tiếp cũng bị 403.
2. Tài khoản được cấp flag true dùng được đúng endpoint/phạm vi; tài khoản inactive không được truy cập.
3. Thay đổi chính sách phản ánh ở `/users/me` và endpoint. FE query hiện có staleTime 60 giây, tách cache theo phiên và hủy request cũ bằng AbortSignal, refresh khi refocus/reconnect theo mặc định; chưa có push thu hồi quyền. Server phải chặn ngay theo chính sách hiện hành.
4. FE fallback chỉ được bỏ sau khi xác minh toàn bộ backend trả đủ các key đang dùng.

### Ranh giới

- Capability có tên không tự chứng minh đã có UI hoặc endpoint. Dùng capability table ở trên làm danh sách quyền, không phải trạng thái phát hành.
- `/invoices` và các thao tác `invoices.generate`, `invoices.update-status`, `audit.verify`, `documents.lock`, `tenant-data.purge`, `projects.complete`, `projects.override-conflict` không được bật nếu chưa có contract, endpoint và kiểm tra quyền tương ứng.
- Tách Admin/Super Admin được mô tả trong [contract riêng](ACCESS_CONTROL.md#platform-roles). Hệ thống một tổ chức không đồng nghĩa đã có tenant isolation đa tổ chức.

<a id="platform-roles"></a>

## Contract tách Admin và Super Admin

Phạm vi: hai role riêng và giao diện Super Admin. Đây là contract tham chiếu; xác minh trạng thái runtime trước khi phát hành.

### Identity và quyền

- Existing `admin` → canonical `ADMIN`, `account_scope: organization`, `organization_id: legacy`.
- New `super_admin` → canonical `SUPER_ADMIN`, `account_scope: platform`, `organization_id: null`.
- Không tự nâng bất kỳ admin hiện hữu. Super Admin bootstrap qua command operator riêng, không credential mặc định.
- Quyền platform: `platform.access`, `platform.overview.read`, `platform.organizations.read`, `platform.admins.read`, `platform.admins.manage`, `platform.audit.read`.
- Platform cần role + scope + explicit flag; thiếu key từ chối. Tenant role trả mọi platform key false; platform role không tự thừa kế tenant capabilities.
- Response legacy chưa có scope vẫn được hỗ trợ cho nghiệp vụ, nhưng không được vào `/platform`.
- Với identity mới có scope, FE từ chối capability thiếu key, không fallback theo role. Authorization unavailable cũng từ chối, ngoại trừ route sửa policy tenant vốn có repair contract riêng.

### API được phối hợp FE và BE

Prefix `/api/v1`. Mọi response thành công bọc `{data: ...}`. Danh sách data `{items: [], pagination: {page,limit,total}}`; limit1–100.

| Method | Endpoint | Capability | Input |
| --- | --- | --- | --- |
| GET | `/platform/summary` | `platform.overview.read` | — |
| GET | `/platform/organization` | `platform.organizations.read` | — |
| GET | `/platform/admin-accounts` | `platform.admins.read` | page,limit,q,role ADMIN/SUPER_ADMIN,is_active true/false |
| POST | `/platform/admin-accounts` | `platform.admins.manage` | username,display_name,email nullable,password,role |
| PATCH | `/platform/admin-accounts/:id` | `platform.admins.manage` | version string; optional display_name,email,role,is_active |
| GET | `/platform/audit-logs` | `platform.audit.read` | page,limit,q,action POST/PATCH |

Mọi endpoint còn cần `platform.access` và tài khoản active/unlocked, role super_admin xác minh lại ở DB.

- Summary: organization_count,admin_count,super_admin_count,active_admin_count,audit_event_count; active_admin_count gồm cả hai role active/unlocked.
- Organization: id legacy,name,email,phone,address,version(number),updated_at,tenancy_mode single_organization. Chỉ một đơn vị thực, chưa multi-tenant.
- Account: id,username,display_name,email(nullable),role ADMIN/SUPER_ADMIN,is_active,is_locked,version(decimal UnixMicro STRING),created_at,updated_at,last_login_at(nullable). Không password/hash/MFA secret.
- POST: username ASCII chữ/số/._-3–100; tên1–200; password ít nhất12 Unicode codepoints và tối đa72 byte; email hợp lệ nếu có. Không mật khẩu cố định.
- PATCH email:null xóa email; trường bỏ qua không thay đổi. Version cũ409 VERSION_CONFLICT. Tự đổi role/vô hiệu hóa409 SELF_PROTECTION. Super Admin active cuối cùng409 LAST_SUPER_ADMIN. Trùng username/email409 ACCOUNT_EXISTS.
- Audit: id,actor_id,actor_name,action,route,entity_id,created_at. Chỉ route platform; account write/audit cùng transaction. Không ghi payload/password. Đây là nhật ký vận hành, chưa phải ledger chống sửa đổi.
- API POST nhận Idempotency-Key từ FE nhưng BE hiện chống duplicate bằng unique username/email, chưa lưu idempotency response; retry sau khi mất response có thể trả ACCOUNT_EXISTS. FE không tự động retry mutation.
- Errors `{title,status,code}`:400 validation,401 session,403 missing authority,404 missing data,409 concurrency/invariant,500 service. Không trả SQL errors.

### Ranh giới hỗ trợ

- Organization scope hiện là `legacy`; contract này không cung cấp tenant isolation đa tổ chức.
- Không có API trong contract này cho platform password reset/delete hoặc ghi platform settings.
- Audit là log vận hành; không được xem là ledger chống sửa đổi.
