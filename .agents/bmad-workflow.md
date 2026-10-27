# Quy trình chuẩn BMAD cho QLCV Next

Quy trình này áp dụng **BMad Method track** cho hệ thống nhiều domain, RBAC, dữ liệu tenant và yêu cầu audit như QLCV Next; không dùng Quick Flow cho epic hoặc thay đổi cross-domain.

```text
Analysis → Planning → Solutioning → Readiness → Delivery loop → PO acceptance
 PO + BA     PO + BA    Architect       A + PO/BA/PD/QA  Dev → QA → Review
```

## Pha 1 — Analysis

Owner: PO; BA đồng sở hữu phân tích.

Đầu ra: Product Brief/research evidence, problem statement, stakeholder/persona, outcome, scope, assumptions, risks và decision log. Với QLCV, `QLCV_NEXT_BMAD_MASTER.md` là baseline hiện có; BA cập nhật/ghi addendum khi có signal thay đổi.

Gate: PO xác nhận vấn đề và outcome đủ rõ để lập kế hoạch.

## Pha 2 — Planning

Owner: PO; BA làm rõ và giữ traceability; PD xác nhận user journey và UX requirements.

Đầu ra: PRD hoặc SPEC, user journey/UX requirements, business rules, NFR, acceptance criteria dạng kiểm thử được, role/RBAC matrix, error states, data/test needs. BA liên kết requirement tới `FR-*`, `ADR-*`, API contract và expected evidence.

Gate: không có requirement mơ hồ, thiếu owner, hoặc chưa quyết định được mức sản phẩm.

## Pha 3 — Solutioning

Owner: Architect; PO/BA/PD/Lead QA là contributors.

Đầu ra bắt buộc:

- Architecture spine và ADR: module boundary, canonical model/source, integration, security/RBAC, reliability, observability và deployment.
- API/data contract và chiến lược migration/rollback khi cần.
- UX implementation constraints, component map và responsive/accessibility contract cho UI; chỉ dùng một design system theo ADR-05 của QLCV.
- Epic/story decomposition có dependency, architecture context, owner và test approach.

Trong QLCV, hai master document hiện có là đầu vào mạnh; Architect phải đóng hoặc ghi blocker cho G-01…G-07 trước implementation cross-domain.

## Pha 3.5 — Implementation readiness

Owner: Architect. Thành viên: PO, BA, PD, Lead QA.

Kết quả là `PASS`, `CONCERNS`, hoặc `FAIL`.

- `PASS`: story đáp ứng DoR và có thể vào `ready_for_development`.
- `CONCERNS`: chỉ work item không phụ thuộc blocker mới được đi tiếp; PO phải ghi acceptance of risk.
- `FAIL`: giữ ở `blocked`; BA phân tích impact, PO quyết định, Architect xác nhận lại sau khi có evidence.

## Pha 4 — Delivery loop

1. PO giao một story PASS cho một dev owner; dev độc lập có thể làm song song khi không xung đột module/contract.
2. Dev tự test và bàn giao đầy đủ cho Lead QA.
3. Lead QA giao QA đang rảnh; lỗi quay về dev, sau sửa bắt buộc retest QA.
4. QA pass chuyển reviewer. Nhận xét review quay về dev, rồi quay lại QA và reviewer.
5. Reviewer approve chuyển PO acceptance. BA xác nhận traceability; PO quyết định `done`.

`done` không đơn thuần là “code xong”: phải có AC pass, evidence QA, review approval, traceability cập nhật và PO acceptance.

## Vai trò còn nên cân nhắc khi quy mô tăng

- `researcher`: cần nếu cần nghiên cứu người dùng định tính/định lượng độc lập với PD.
- `devops-security`: cần trước release để sở hữu CI/CD, secrets, threat model, monitoring, backup và rollback rehearsal.
- `release-manager`: chỉ cần khi có nhiều team/release train; nếu chưa có, PO + Architect cùng giữ trách nhiệm release gate.
