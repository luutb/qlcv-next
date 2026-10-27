# ADR-08 — Canonical Task Workflow và Legacy Cutover

- **Status:** Accepted for planning; runtime compatibility evidence vẫn mở.
- **Owners:** PO, BA, Architect.
- **Date:** 2026-09-07.

## Decision

`Task` + `workflow_step` là execution model canonical. `/api/v1/tasks/*` là adapter/UI path duy nhất.
`/api/v1/issues/*` và Project Workflow Board cũ chỉ là compatibility transport/read path trong thời gian
deprecation; không tạo model, query-key hoặc concurrent write path thứ hai.

## Cutover controls

1. FE canonical gọi `/tasks`; alias chỉ được giữ để redirect/compatibility.
2. Mọi redirect/alias phải có owner, telemetry và ngày hết hạn.
3. Trước khi cho concurrent writes, phải có live contract smoke, migration mapping và rollback rehearsal.
4. Khi alias hết hạn, trả thông báo có thể hành động; không âm thầm chuyển đổi payload.

## Consequences

Giảm duplicate state/cache và tránh hai nguồn workflow cạnh tranh. Runtime route parity, telemetry và ngày
deprecation cần được xác minh ở backend/staging theo G-01/G-07.

