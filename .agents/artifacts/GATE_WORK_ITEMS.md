# QLCV Next — Gate Work Items

PO tạo các work item này sau readiness `FAIL/BLOCKED`. Chúng là đầu vào cho BA/Architect/Lead QA;
không gate nào được chuyển `PASS` chỉ vì source-level inspection hoặc build thành công.

| ID | Work item | Owner | State | Acceptance / evidence bắt buộc |
| --- | --- | --- | --- | --- |
| G-01 | Live canonical Task contract | Lead QA + Architect | blocked | Runtime `/api/v1/tasks` fixtures cho success, envelope, 401/403/404/409, dependency/review/history, idempotency và audit |
| G-02 | Legacy Project Workflow Board policy | PO + BA + Architect | doc_ready_runtime_open | Quyết định đã ghi tại `ADR-08-LEGACY-WORKFLOW-CUTOVER.md`; runtime route parity/telemetry/deprecation evidence còn mở |
| G-03 | Finance state machine | PO + BA + Architect + QA | blocked | Matrix Invoice/TimeEntry/Payment; role transition tests; `423` lock; reconciliation và audit evidence |
| G-04 | RBAC and tenant action matrix | PO + BA + Architect + QA | blocked | Role × route/action matrix; positive/negative/cross-tenant tests; drift decisions cho `/close`, audit verify, document lock |
| G-05 | Single UI design system | Architect + FE | doc_ready_implementation_pending | Chọn MUI tại `ADR-05-MUI-DESIGN-SYSTEM.md`; cần component migration và visual/a11y evidence |
| G-06 | Document security policy | Architect + BA + QA | blocked | MIME/size/retention/virus-scan/WORM policy; `422/413/415/423` fixtures; download authorization tests |
| G-07 | Migration and seed strategy | BA + Architect + Ops | blocked | Source-target mapping; seed rules; dry-run reconciliation; backup, rollback và owner rehearsal |

## G-02 decision record

Chi tiết tại `ADR-08-LEGACY-WORKFLOW-CUTOVER.md`; decision tài liệu đã được PO/BA/Architect ghi nhận,
nhưng gate chỉ PASS sau runtime compatibility evidence.

## G-05 decision record

Chọn **MUI** làm UI library duy nhất; chi tiết tại `ADR-05-MUI-DESIGN-SYSTEM.md`.

Proposal này cần được ghi vào architecture spine/ADR và component migration plan trước khi G-05 chuyển PASS.
