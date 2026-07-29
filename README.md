# QLCV Frontend

Frontend quản lý công việc, hồ sơ và quy trình nghiệp vụ, xây dựng bằng Next.js 16, React 19, TypeScript và Material UI.

## Trạng thái

Dự án đang trong giai đoạn ổn định lại kiến trúc và chưa sẵn sàng phát hành production.

- Các màn hình chính đã có: đăng nhập, dashboard theo vai trò, hồ sơ, task, Kanban board, người dùng, labels, workflow, workload, khách hàng và kế toán.
- API hiện còn dùng lẫn `src/repositories`, `src/api` và `src/services`.
- TypeScript, ESLint, test và production build chưa đạt tiêu chuẩn phát hành.
- Kế hoạch tổng thể nằm tại [docs/ROADMAP.md](docs/ROADMAP.md); backlog chi tiết Story → Task → Issue nằm tại [docs/BACKLOG.md](docs/BACKLOG.md).
- Quy trình branch và các cổng QA/PO nằm tại [docs/DEVELOPMENT_WORKFLOW.md](docs/DEVELOPMENT_WORKFLOW.md).

## Chạy dự án

```bash
npm install
npm run dev
```

Ứng dụng chạy mặc định tại `http://localhost:6060`.

Các biến môi trường cần thiết:

```text
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_DISABLE_NOTIFICATIONS
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

Không commit giá trị thật của các biến môi trường.

## Kiểm tra chất lượng

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

Trong giai đoạn ST-01 đến khi ST-05 được QA xác nhận hoàn thành, mỗi thay đổi phải chạy kiểm tra phù hợp phạm vi, không tạo thêm lỗi so với [quality baseline](docs/QUALITY_BASELINE.md) và phải lưu bằng chứng cho các kiểm tra chưa thể chạy. Sau khi ST-05 đạt QA `PASS`, cả bốn lệnh trên trở thành quality gate bắt buộc.

Kiểm thử với backend thật là bắt buộc cho Issue thay đổi contract hoặc luồng tích hợp khi môi trường tương ứng sẵn sàng. Các Issue thuần tài liệu, cấu hình hoặc kiểm thử cô lập dùng evidence phù hợp với phạm vi thay vì giả lập một lần kiểm thử backend không liên quan.

## Quy ước kiến trúc mục tiêu

- API và business logic đặt trong `src/services`.
- Kiểu dùng chung đặt trong `src/types` và không định nghĩa trùng theo nhiều domain.
- Component dùng chung đặt trong `src/components/ui`; component nghiệp vụ tổ chức theo feature.
- Không thêm code mới vào `src/repositories` hoặc `src/api/services`.
- Không dùng dữ liệu mock trong luồng production.
