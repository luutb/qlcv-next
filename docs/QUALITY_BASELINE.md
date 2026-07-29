# Quality baseline trước ST-05

Baseline này là nguồn so sánh duy nhất cho giai đoạn ổn định trước khi ST-05 đạt Story QA `PASS`.

## Baseline metadata

- Captured: 28/07/2026
- Git commit: `a714abe`
- Branch khi capture: `develop`, đồng nhất với `main`
- Runtime: Next.js 16.2.2, React 19.2.4, TypeScript 5, ESLint 9, Vitest 4.1.5
- Trạng thái: active cho đến khi ST-05 đạt Story QA `PASS`

## Kết quả chuẩn

| Gate | Command | Exit | Baseline result |
|---|---|---:|---|
| TypeScript | `npx tsc --noEmit --pretty false` | 2 | 297 lỗi trên 36 tệp |
| ESLint | `npm run lint` | 1 | 124 lỗi, 149 cảnh báo, 56 tệp có lỗi |
| Unit test | `npm test` | 1 | Không tìm thấy test vì include chỉ nhận `.test.ts`, trong khi test hiện có là `.test.tsx` |
| Production build | `npm run build` | 1 | Turbopack không tải được Geist, Geist Mono và Inter từ Google Fonts trong môi trường kiểm tra |

Production build chưa đi qua bước tải font nên baseline này không giả định rằng font là lỗi build duy nhất. Khi font được xử lý, lỗi mới được lộ ra phải được ghi bổ sung thay vì xoá lịch sử baseline.

## Quy tắc so sánh

- Issue trước ST-05 phải chạy command phù hợp với phạm vi và ghi delta trong `docs/reviews/ST-xx.md`.
- Không chấp nhận số lỗi/cảnh báo tăng, test mới thất bại hoặc build failure mới do thay đổi đang review.
- Có thể QA `PASS` một Issue không liên quan khi global command vẫn thất bại đúng theo baseline, miễn focused checks đạt và không có regression mới.
- Nếu thay đổi có chủ đích sửa một phần baseline, cập nhật kết quả mới và commit áp dụng trong bảng lịch sử bên dưới sau khi QA Issue `PASS`.
- Không được cập nhật baseline để hợp thức hoá regression.

## Lịch sử cập nhật

| Date | Commit | Gate | Trước | Sau | Issue | QA evidence |
|---|---|---|---|---|---|---|
| 28/07/2026 | `a714abe` | Initial | Không có | Kết quả chuẩn phía trên | Workflow setup | Audit ban đầu |

## Kết thúc baseline chuyển tiếp

Khi ST-05 đạt Story QA `PASS`:

1. Đổi trạng thái metadata thành `retired` và ghi commit kết thúc.
2. Lint, typecheck, unit test và production build đều phải exit `0`.
3. Từ thời điểm đó, mọi implementation Issue phải giữ cả bốn gate xanh; không tiếp tục so theo số lượng lỗi cũ.
