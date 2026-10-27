# Story context — ST-01.01 UI foundation và accessibility baseline

**Epic:** E01 — Foundation and Identity  
**Gate:** G-05 — Single UI design system  
**State:** `done` (waiver giới hạn cho G-05 độc lập)  
**Risk:** Medium  
**Owner:** dev-1  
**Ngày context:** 2026-09-08

## Technology and dependency policy

- Ưu tiên API/convention mới nhất được hỗ trợ bởi phiên bản framework đang khóa trong
  `package.json`/`package-lock.json`; trước khi viết code phải đọc guide tương ứng trong
  `node_modules/next/dist/docs/`.
- Không thêm package mới cho đến khi chứng minh capability đó không thể đáp ứng bằng Next.js, React,
  MUI, React Query hoặc Web Platform hiện có.
- Nếu bắt buộc phải thêm dependency: chỉ chọn package chính thức hoặc package có maintainer/repository
  rõ ràng, kiểm tra license, release/security history, lockfile diff và `npm audit`; không dùng package
  tải từ nguồn không xác định, package trùng tên đáng ngờ hoặc package chỉ để thay thế vài dòng code.
- Không tự ý upgrade major version trong story UI foundation. Upgrade framework/library là work item
  riêng với compatibility plan, changelog, test và rollback evidence.
- Mọi thư viện UI mới đều bị từ chối nếu làm vi phạm ADR-05 hoặc tạo thêm component/accessibility
  primitive cạnh tranh với MUI.

## Traceability

- `FR-01`, `FR-02` — nền tảng session/RBAC cần primitive UI nhất quán.
- `NFR-01` — TypeScript strict, lint/typecheck/build.
- `NFR-05` — keyboard, semantic labels/headings, focus, contrast và responsive.
- `NFR-06` — Vietnamese-first copy và không render raw backend error.
- `ADR-05-MUI-DESIGN-SYSTEM` — MUI là component/accessibility primitive duy nhất.
- `design-system/qlcv-next/MASTER.md` — visual tokens: navy/gold, EB Garamond + Lato, dense dashboard.

## Business outcome

QLCV Next có một UI foundation nhất quán để các story identity, customer/project/team và task dùng
cùng primitive về button, input, feedback, navigation, focus và responsive behavior; không phát sinh
Ant Design hoặc component behavior tự định nghĩa cạnh tranh với MUI.

## Scope

### In scope

- Chuẩn hóa MUI theme từ visual tokens đã được phê duyệt.
- Xác định component ownership trong `src/shared/ui` và cách route/feature sử dụng.
- Di chuyển các primitive có hành vi tương tác trước: button, form field, alert/state, navigation shell.
- Baseline manual/automated accessibility cho `/`, `/login`, `/work` và một resource list.
- Kiểm tra responsive 375px, 768px, 1024px và 1440px; kiểm tra reduced motion.

### Out of scope

- Không thay đổi API, RBAC, domain model hoặc route contract.
- Không thêm feature business, modal mutation hoặc data fixture.
- Không đóng G-01…G-04, G-06, G-07.
- Không tuyên bố visual/a11y runtime evidence nếu chưa có artifact kiểm thử.

## Acceptance criteria

1. Chỉ có MUI là UI component/accessibility primitive dependency; không thêm Ant Design hoặc thư viện
   UI cạnh tranh.
2. Theme dùng đúng token primary `#1E3A8A`, accent `#B45309`, background `#F8FAFC`, foreground
   `#0F172A`, border `#CBD5E1`; component không lặp raw color khi token đã tồn tại.
3. Các interactive control có accessible name, visible focus state, pointer cursor và kích thước
   tối thiểu phù hợp; keyboard không phụ thuộc hover hoặc drag-only.
4. Form field có label; loading, empty, error, unauthorized/forbidden và success feedback có semantic
   state phù hợp (`role`, heading hoặc `aria-live`) và không render raw backend error.
5. Layout không tạo horizontal scroll ngoài vùng table/board có chủ đích ở 375px; navigation và main
   content vẫn truy cập được bằng keyboard.
6. `prefers-reduced-motion` được tôn trọng; transition/animation không làm mất thông tin hoặc focus.
7. `npm run lint`, `npm run typecheck` và `npm run build` pass sau thay đổi; evidence được ghi vào
   handoff QA.

## Contract / authorization

- Story này không gọi API mới và không thay đổi endpoint/query key.
- Các state `401/403` chỉ phản ánh response/error mapping hiện có; backend vẫn là authority.
- Không được dùng tenant/user fixture làm nguồn render nghiệp vụ.

## UX states và test data

- Screens: dashboard shell, login, work board, customer list.
- States: initial, loading, empty, error, 401, 403, success, reduced-motion, narrow viewport.
- Data: synthetic only; không chụp token, password, MFA secret hoặc PII thật.
- Roles để kiểm tra display fallback: `PARTNER`, `LAWYER`; authorization mutation không được giả lập
  bằng việc chỉ ẩn UI, phải giữ defensive handling cho `403`.

## Dependencies / blockers

- `ADR-05-MUI-DESIGN-SYSTEM.md` đã accepted ở mức quyết định.
- G-05 vẫn `doc_ready_implementation_pending`; cần migration evidence và visual/a11y evidence.
- Story chưa đạt `ready_for_development` vì implementation-readiness tổng thể đang `FAIL/BLOCKED` và
  chưa có PO/BA/Architect/Lead QA sign-off.

## QA approach

- Static: lint, typecheck, build.
- Manual: keyboard tab order, focus visibility/return, labels, live feedback, contrast, responsive
  screenshots ở bốn viewport, reduced motion.
- Automated khi harness sẵn sàng: axe scan các route trên với synthetic/unauthenticated states.
- Reviewer kiểm tra dependency boundary: `app → feature/shared`, không import ngược và không thêm UI
  library thứ hai.

## Readiness decision

`CONCERNS` — PO chấp nhận waiver giới hạn để triển khai typography/token foundation độc lập với các
gate runtime. Waiver không mở scope API, RBAC, finance, upload hoặc migration; không cho phép tuyên bố
readiness tổng thể `PASS`.

| Vai trò | Quyết định | Evidence |
| --- | --- | --- |
| PO | ACCEPTED LIMITED WAIVER | Chỉ cho typography/token foundation độc lập; 2026-09-08 |
| BA | ACCEPTED FOR TRACEABILITY | Không đổi FR/API/RBAC; cập nhật evidence sau self-test |
| Architect | ACCEPTED FOR LIMITED SCOPE | Dùng Next Font Module + MUI theme; không thêm library |
| Lead QA | PASS | QA retest đã pass; residual visual/a11y evidence được ghi rõ |

## Delivery sign-off

- QA: `PASS / ready_for_review` — [QA-ST-01-01-RESULT.md](./QA-ST-01-01-RESULT.md)
- Reviewer: `APPROVED_FOR_PO_REVIEW_WITH_RESIDUAL_RISK` — [REVIEW-ST-01-01.md](./REVIEW-ST-01-01.md)
- BA: `TRACEABILITY_CONFIRMED` — [BA-ST-01-01-TRACEABILITY.md](./BA-ST-01-01-TRACEABILITY.md)
- PO: `ACCEPTED / done` — 2026-09-08

Story đã đạt DoD trong phạm vi waiver giới hạn. G-05 vẫn mở cho axe, keyboard, contrast, viewport và
reduced-motion runtime evidence; các residual risk này không bị che giấu bởi story acceptance.

## Current static evidence

Đã chạy ngày 2026-09-08 trên dependency set hiện có:

- `npm run lint` — PASS
- `npm run typecheck` — PASS
- `npm run build` — PASS; Next.js `16.3.4` hiện được resolve từ lockfile
- `npm audit --audit-level=high` — PASS; `found 0 vulnerabilities`

### Developer handoff

- Changed scope: `src/app/layout.tsx`, `src/shared/ui/theme.ts`, `src/app/globals.css`.
- Implementation: Next Font Module cho EB Garamond/Lato; MUI theme dùng CSS font variables; các heading
  chính dùng heading token; không đổi API, query key, RBAC hoặc domain model.
- Self-test sau implementation: `npm run lint` PASS; `npm run typecheck` PASS; `npm run build` PASS.
- Runtime smoke sau implementation: `/`, `/login`, `/work`, `/customers` đều HTTP 200; mỗi route có
  `<main>` và `<h1>`.
- Dependency impact: không thêm package; `npm audit --audit-level=high` PASS.
- Known risk: chưa có axe/keyboard/contrast/viewport screenshot evidence; QA phải kiểm tra trước khi
  chuyển `ready_for_review`.

Các kết quả trên chỉ là static/dependency evidence. Chúng không thay thế visual/a11y manual evidence,
runtime contract smoke hoặc các gate G-01…G-04/G-06/G-07.

## Render/DOM smoke evidence

Đã chạy với Next.js dev server cục bộ ngày 2026-09-08:

- `/` — HTTP 200; có skip link, landmark `main`, heading `h1`, navigation label và action labels.
- `/login` — HTTP 200; có skip link, landmark `main` và heading `h1` có `id`.
- `/work` — HTTP 200; có skip link, landmark `main` và heading `h1`.
- `/customers` — HTTP 200; có skip link, landmark `main` và heading `h1`.

Đây chỉ là smoke evidence cho render/DOM. Chưa thực hiện axe scan, keyboard traversal, contrast
measurement, screenshot review hoặc test ở bốn viewport; do đó G-05 vẫn chưa chuyển `PASS`.
