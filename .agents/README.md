# QLCV Agent Team

Thư mục này định nghĩa đội delivery 12 vai trò cho QLCV Next. Mỗi file là một prompt/charter độc lập, có thể đưa trực tiếp cho agent tương ứng khi khởi tạo phiên làm việc.

## Đội ngũ

| Nhóm | Agent | Trọng tâm |
| --- | --- | --- |
| Product | `po`, `ba`, `pd` | Giá trị sản phẩm, yêu cầu, UX/UI, quyết định và nghiệm thu |
| Solutioning | `architect` | Kiến trúc, ADR, contract và readiness gate |
| Delivery | `dev-1`, `dev-2`, `dev-3` | Thiết kế và triển khai các story đã sẵn sàng |
| Quality | `lead-qa`, `qa-1`, `qa-2`, `qa-3` | Chiến lược, kiểm thử, bằng chứng chất lượng |
| Assurance | `reviewer` | Review độc lập trước khi PO đóng story |

`workflow.yaml` là nguồn sự thật cho trạng thái, quyền chuyển trạng thái và vòng phản hồi. `bmad-workflow.md` nối team này vào bốn pha BMAD. Chi tiết về Definition of Ready/Done của sản phẩm vẫn nằm trong `docs-master/QLCV_NEXT_BMAD_MASTER.md`.

`pd` là Product Designer / UX Architect: chịu trách nhiệm review trải nghiệm, trạng thái UI,
responsive/accessibility và component map trước khi dev triển khai.

## Nguồn sự thật và quyền tự chủ

Hai file trong `docs-master/` là product, API, architecture và delivery contract bắt buộc. Team tự đọc,
phân rã và thực hiện theo chúng; không cần người dùng phê duyệt từng bước nội bộ. Không agent nào được
tự ý đảo ADR, đổi API/RBAC hoặc mở rộng scope khi chưa có evidence/decision phù hợp trong master docs.

## Nguyên tắc vận hành

1. Không giao implementation khi story chưa đạt `ready_for_development`.
2. Một task chỉ có một owner thực hiện tại một thời điểm; người nhận bàn giao phải xác nhận nhận việc.
3. Bug, yêu cầu thay đổi và nhận xét review phải có severity/priority, bước tái hiện hoặc tiêu chí chấp nhận bị vi phạm, cùng bằng chứng liên quan.
4. QA chỉ chuyển sang review khi tất cả scope kiểm thử yêu cầu đã pass; reviewer chỉ approve khi thay đổi đã phù hợp requirement, architecture và chuẩn code.
5. PO là người duy nhất đóng task/story; BA xác nhận truy vết requirement và acceptance criteria trước khi PO đóng.
6. Người dùng ủy quyền PO tự nghiệm thu/đóng work item theo `workflow.yaml`; không cần acceptance thủ công của người dùng ở từng handoff nội bộ.
