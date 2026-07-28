# QLCV Frontend

Frontend quản lý công việc, hồ sơ và quy trình nghiệp vụ, xây dựng bằng Next.js 16, React 19, TypeScript và Material UI.

## Trạng thái

Dự án đang trong giai đoạn ổn định lại kiến trúc và chưa sẵn sàng phát hành production.

- Các màn hình chính đã có: đăng nhập, dashboard theo vai trò, hồ sơ, task, Kanban board, người dùng, labels, workflow, workload, khách hàng và kế toán.
- API hiện còn dùng lẫn `src/repositories`, `src/api` và `src/services`.
- TypeScript, ESLint, test và production build chưa đạt tiêu chuẩn phát hành.
- Kế hoạch tổng thể nằm tại [docs/ROADMAP.md](docs/ROADMAP.md); backlog chi tiết Story → Task → Issue nằm tại [docs/BACKLOG.md](docs/BACKLOG.md).

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

Một thay đổi chỉ được xem là hoàn thành khi bốn kiểm tra trên đều vượt qua và luồng liên quan đã được kiểm thử với backend thật.

## Quy ước kiến trúc mục tiêu

- API và business logic đặt trong `src/services`.
- Kiểu dùng chung đặt trong `src/types` và không định nghĩa trùng theo nhiều domain.
- Component dùng chung đặt trong `src/components/ui`; component nghiệp vụ tổ chức theo feature.
- Không thêm code mới vào `src/repositories` hoặc `src/api/services`.
- Không dùng dữ liệu mock trong luồng production.
