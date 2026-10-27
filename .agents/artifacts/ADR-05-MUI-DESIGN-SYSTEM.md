# ADR-05 — MUI là UI library duy nhất

- **Status:** Accepted for implementation; visual tokens vẫn lấy từ `design-system/qlcv-next/MASTER.md`.
- **Owners:** Architect + FE.
- **Date:** 2026-09-07.

QLCV Next dùng MUI làm component/accessibility primitive duy nhất. Không thêm Ant Design hoặc library thứ
hai. CSS tokens có thể tạo visual override, nhưng component behavior, focus, modal, form và responsive
patterns phải ưu tiên MUI. Migration evidence và visual/a11y QA vẫn thuộc G-05.

