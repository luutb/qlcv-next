# QLCV Next — Workflow Run Log

Đây là nhật ký điều phối thực tế theo `.agents/workflow.yaml`; file này không thay thế hai master docs.

## Run hiện tại

| Work item | BMAD state | Owner | Evidence | Kết luận |
| --- | --- | --- | --- | --- |
| QLCV planning baseline | `architecture_review` | `architect` | `ARCHITECTURE_SPINE.md`, `REQUIREMENTS_TRACEABILITY.md`, `QUALITY_AND_READINESS_PLAN.md` | `CONCERNS`; G-01…G-07 còn mở |
| Foundation exploratory slice | `returned_to_development` | `dev-1..3` | Next app shell, auth/task/customer/project/team adapters; lint/typecheck/build pass | Không phải release Done; chờ readiness gate và contract evidence |
| Work Board UI slice | `returned_to_development` | `dev-2` | `/work`, canonical `/tasks/board`, loading/error/empty states | Không tuyên bố runtime contract pass |

| Gate work items | `discovery` | `po` | `GATE_WORK_ITEMS.md` | Đã tạo; G-02 sẵn sàng cho decision workshop, các gate runtime vẫn blocked |
| Architecture decisions | `architecture_review` | `architect` | `ADR-08-LEGACY-WORKFLOW-CUTOVER.md`, `ADR-05-MUI-DESIGN-SYSTEM.md` | G-02/G-05 đạt mức tài liệu; runtime/visual evidence vẫn mở |
| G-05 UI foundation story context | `architecture_review` | `po + ba + architect` | `ST-01-01-MUI-DESIGN-SYSTEM-CONTEXT.md` | Đã chuẩn bị traceability, AC, UX states và QA approach; chưa giao dev vì readiness tổng thể còn `FAIL/BLOCKED` |
| ST-01.01 typography/token foundation | `ready_for_qa` | `dev-1` | `src/app/layout.tsx`, `src/shared/ui/theme.ts`, `src/app/globals.css`; lint/typecheck/build + route smoke | Đã triển khai trong waiver G-05 độc lập; QA còn phải kiểm tra axe/keyboard/contrast/responsive |
| ST-01.01 QA handoff | `in_qa` | `qa-1` | `QA-ST-01-01-RESULT.md` (đang chờ) | Handoff chính thức từ dev-1; QA không sửa production code và chưa chuyển reviewer |
| ST-01.01 defect remediation | `ready_for_qa` | `dev-1` | `src/api/client.ts`, `src/features/auth/ui/login-form.tsx`, `src/features/customers/ui/customers-list.tsx`, `src/features/tasks/ui/work-board.tsx`, `src/app/globals.css`; lint/typecheck/build pass | QA-001 touch target và QA-002 raw error detail đã được sửa; đã gửi lại qa-1 để retest |
| G-02 compatibility checklist | `discovery` | `architect` | `G-02-RUNTIME-COMPATIBILITY-CHECKLIST.md` (đang chờ) | Sidecar analysis độc lập; không tự đóng gate |
| G-04 RBAC matrix draft | `planning` | `ba` | `G-04-RBAC-ACTION-MATRIX-DRAFT.md` (đang chờ) | Draft/gap analysis; cần PO + Security + BE quyết định |
| ST-01.01 QA retest | `ready_for_review` | `qa-1` | `QA-ST-01-01-RESULT.md` updated | QA-001/QA-002 resolved; static/runtime smoke pass; axe/keyboard/viewport/contrast remain blocked/not-run |
| ST-01.01 review handoff | `in_review` | `reviewer` | `REVIEW-ST-01-01.md` (đang chờ) | Reviewer độc lập đang kiểm tra AC/ADR-05/residual risk; chưa PO acceptance |
| ST-01.01 reviewer approval | `ready_for_po_acceptance` | `reviewer` | `REVIEW-ST-01-01.md` | Approved với residual risk axe/keyboard/contrast/viewport chưa chạy; chờ BA traceability rồi PO acceptance |
| ST-01.01 BA traceability | `ready_for_po_acceptance` | `ba` | `BA-ST-01-01-TRACEABILITY.md` (đang chờ) | BA được giao xác nhận FR/NFR/ADR → AC → evidence; chưa đóng story |
| ST-01.01 PO acceptance | `done` | `po` | `ST-01-01-MUI-DESIGN-SYSTEM-CONTEXT.md`, QA, reviewer và BA artifacts | Đã đóng trong waiver giới hạn; G-05 tổng thể vẫn mở do residual visual/a11y evidence |
| Backend package verification | `in_qa` | `lead-qa` | `BACKEND_EVIDENCE_2026-09-07.md` | Full `go test ./...` và scoped `go vet` pass; Docker runtime unavailable nên chưa đóng G-01/G-03/G-04/G-06 |

## Handoff bắt buộc tiếp theo

1. `PO` xác nhận thứ tự đóng G-01…G-07 và tạo story context có FR/NFR/ADR liên kết.
2. `BA` xác nhận AC, traceability, business rules, RBAC và impact của từng gate.
3. `Architect` cập nhật architecture/readiness decision; `CONCERNS` không được tự coi là PASS.
4. `Lead QA` thu runtime/contract evidence; SOURCE-VERIFIED không thay thế staging smoke.
5. Khi readiness `PASS`, PO mới chuyển story sang `ready_for_development` và giao dev owner.
6. Dev → QA → Reviewer → PO acceptance theo đúng vòng; mọi lỗi quay lại đúng state trong workflow.

## Quy tắc đóng

- Chỉ `PO` có thể chuyển `ready_for_po_acceptance → done`.
- BA phải ký xác nhận traceability trước khi PO đóng.
- Không có `human acceptance` cho handoff nội bộ, nhưng không được bỏ qua gate/owner/evidence.
- Không được ghi `done` dựa trên HTTP 200 của shell hoặc build pass; đó chỉ là evidence implementation.
