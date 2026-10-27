# QLCV Frontend

Frontend Next.js cho WorkHub/QLCV.

## Chạy local

1. Cài dependency theo lockfile hiện có (`npm ci`).
2. Tạo `.env.local` từ `.env.example` và đặt `NEXT_PUBLIC_API_BASE_URL` trỏ tới API local.
3. Khởi động backend theo hướng dẫn của repository backend.
4. Chạy frontend:

```sh
npm run dev
```

Mặc định giao diện chạy tại `http://localhost:3000`; API mặc định là `http://localhost:8080/api/v1`.
Không lưu mật khẩu, token hoặc thông tin đăng nhập trong tài liệu hay biến `NEXT_PUBLIC_*`.

## Kiểm tra và tài liệu

```sh
npm run lint
npm run typecheck -- --incremental false
npm run architecture:check
```

Xem [mục lục tài liệu](docs/README.md) để tìm product/API, design system, contract, kiểm chứng và ghi chú bảo mật.
