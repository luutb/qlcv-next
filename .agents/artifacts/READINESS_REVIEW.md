# QLCV Next — Architecture Readiness Review

**Review date:** 2026-09-07  
**Review state:** `architecture_review`  
**Owner:** `architect`  
**Inputs:** `docs-master/QLCV_NEXT_BMAD_MASTER.md`, `docs-master/QLCV_NEXT_API_MASTER.md`, `ARCHITECTURE_SPINE.md`, `REQUIREMENTS_TRACEABILITY.md`, `QUALITY_AND_READINESS_PLAN.md`, `SPRINT_STATUS.yaml`  
**Evidence boundary:** Backend source hiện có tại `/Users/sapo/golang/qlcv-work-board`; package tests đã được chạy. Chưa có live/staging HTTP, database runtime, deployment, security-runtime hoặc UAT evidence.

## Decision

**FAIL / BLOCKED — chưa được chuyển sang `ready_for_development`.**

Kiến trúc baseline đã đủ để tiếp tục chuẩn bị decision và evidence, nhưng Definition of Ready của
workflow yêu cầu `implementation_readiness_pass`. Hiện cả G-01…G-07 đều đang `open` trong
`SPRINT_STATUS.yaml`; các tài liệu hiện có chỉ là `DOC-PLANNED` hoặc `SOURCE-VERIFIED`, không thể
đóng gate runtime/contract/security/migration. Các slice frontend hiện tại được ghi nhận là
exploratory foundation, không phải release evidence.

## Evidence assessment

| Hạng mục | Bằng chứng hiện có | Mức evidence | Kết quả |
| --- | --- | --- | --- |
| Product scope, FR/NFR, UX flow | BMAD master, API master | `DOC-PLANNED` | Có baseline; chưa phải acceptance/runtime proof |
| Architecture/ADR baseline | `ARCHITECTURE_SPINE.md`, ADR-01…ADR-07 trong master | `DOC-PLANNED` | Đủ định hướng; G-02/G-03/G-04/G-05/G-06/G-07 còn decision mở |
| Requirement traceability | `REQUIREMENTS_TRACEABILITY.md` | `DOC-PLANNED` | Có mapping FR/NFR → epic/story/gate; chưa có test/evidence links |
| QA/readiness controls | `QUALITY_AND_READINESS_PLAN.md` | `DOC-PLANNED` | Đã định nghĩa tiêu chí; chưa có executable result |
| Backend route/model alignment | `/Users/sapo/golang/qlcv-work-board` và master docs | `SOURCE-VERIFIED` | Có route/handler/model source; không thay thế smoke/contract test |
| Backend package quality | `BACKEND_EVIDENCE_2026-09-07.md` | `UNIT-VERIFIED` | Full `go test ./...` + scoped `go vet` pass; live DB/HTTP path chưa xác minh |
| Frontend quality checks | Workflow log ghi nhận lint/typecheck/build pass cho exploratory slices | `DOC-PLANNED` | Chỉ chứng minh build quality; không chứng minh API/RBAC/tenant/finance |
| Current readiness status | `SPRINT_STATUS.yaml` | `DOC-PLANNED` | `CONCERNS`, phase `architecture_review`, G-01…G-07 open |

## Gate review

| Gate | Status | Exact blocker before transition |
| --- | --- | --- |
| G-01 Canonical Task contract | `OPEN` | Chưa có integration/staging smoke và contract fixtures cho `/tasks` success, `401/403/404/409`, paging, idempotency, audit, dependency/review; chưa chứng minh `/issues` chỉ là compatibility alias |
| G-02 Legacy workflow disposition | `OPEN` | Chưa có PO/BA quyết định retain/migrate/retire, write ownership, redirect expiry/telemetry, mapping, rollback và no-competing-writes |
| G-03 Finance state machine | `OPEN` | Chưa có transition/lock matrix được PO + Finance + BE phê duyệt và executable 4xx evidence (`423 BILLING_LOCK_ACTIVE` bao gồm) cho time/invoice/payment |
| G-04 RBAC action matrix | `OPEN` | Chưa có role×action authorization tests, tenant-negative evidence và disposition cho `/close` guard drift, audit verify, document lock, invoice status |
| G-05 Single design system | `OPEN` | Chưa có ADR chọn chính xác một UI library cùng migration/ownership plan và accessibility/visual baseline |
| G-06 Upload/security/retention | `OPEN` | Chưa có policy được phê duyệt và runtime evidence cho MIME/size/malware scan/download authorization/WORM lock/retention cùng `422/413/415/423` |
| G-07 Migration/seed/release | `OPEN` | Chưa có source-target mapping, seed policy, dry-run reconciliation, backup/restore, rollback owner và rehearsal |

## Required action before `ready_for_development`

1. PO/BA tạo decision records cho G-02, G-03, G-04, G-05, G-06, G-07; Architect cập nhật ADR,
   contract và architecture impact.
2. Lead QA phối hợp BE tạo test environment hoặc integration harness và gắn evidence theo chuẩn
   `QUALITY_AND_READINESS_PLAN.md`; mọi capture phải dùng synthetic tenant-isolated data và redact secrets.
3. Đóng G-01 và G-04 trước Epic 03; đóng G-03, G-04, G-06 trước Epic 04. G-07 vẫn chặn migration/release.
4. Sau khi tất cả acceptance criteria của transition `architecture_review → ready_for_development`
   có evidence/link (FR/ADR, AC, dependencies, API/permission, UX states, test data và BA traceability),
   Architect chạy lại review và cập nhật verdict. Chỉ khi verdict `PASS` PO mới phân task cho dev.

## Allowed work while blocked

Chỉ được chuẩn bị contract fixtures, decision records, test harness, static checks và story context
độc lập với gate mở. Không được tuyên bố Epic 03/04 hoặc production UI là `Done`, không được thêm
Issue model/query-key family, và không được coi HTTP 200 của app shell hoặc build pass là runtime proof.

## Sign-off

| Role | Decision | Evidence/signature |
| --- | --- | --- |
| Architect | `FAIL / BLOCKED` | Review này, 2026-09-07 |
| PO | `PENDING` | Cần quyết định các gate mở |
| BA | `PENDING` | Cần cập nhật traceability/impact |
| Lead QA | `PENDING` | Cần executable contract/runtime evidence |
