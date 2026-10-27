# Tài liệu QLCV

Bắt đầu từ [trạng thái sản phẩm](PROJECT_STATUS.md) để nắm phạm vi và giới hạn đã ghi nhận. Tra cứu theo bảng dưới đây; tài liệu lịch sử được tách khỏi tài liệu làm việc.

## Tra cứu

| Nhu cầu | Tài liệu |
| --- | --- |
| Nghiệp vụ và phạm vi sản phẩm | [Product blueprint](product/PRODUCT_BLUEPRINT.md) |
| API, model và mapping giao diện | [API reference](product/API_REFERENCE.md) |
| Thiết kế giao diện | [Design system](product/DESIGN_SYSTEM.md) |
| Cấu trúc code frontend | [Frontend layer rules](architecture/FRONTEND_LAYER_RULES.md) |
| Quyền, Admin và Super Admin | [Phân quyền và vai trò](architecture/ACCESS_CONTROL.md) |
| Tạo tenant, đăng nhập và viewer | [Contract tenant và sơ đồ luồng](architecture/TENANCY.md) |
| Chạy local | [Local runtime](operations/LOCAL_RUNTIME.md) |
| Chuẩn bị phát hành | [Release checklist](operations/RELEASE_CHECKLIST.md) |
| Việc cần làm tiếp | [Backlog](BACKLOG.md) |
| Quy trình phát triển | [AI development](ai-development/architecture.md) |
| Tra handoff và đề xuất dashboard/board cũ | [Lưu trữ tháng 09/2026](archive/DASHBOARD_BOARD_2026-09.md) |

## Cấu trúc

```text
docs/
├── README.md          Mục lục tài liệu
├── PROJECT_STATUS.md  Trạng thái và giới hạn sản phẩm
├── BACKLOG.md         Việc cần làm tiếp
├── product/           Nghiệp vụ, API, thiết kế
├── architecture/      Kiến trúc frontend và contract quyền/tenant
├── operations/        Chạy local và phát hành
├── archive/           Handoff, đề xuất lịch sử
└── ai-development/    Quy trình, workflow và template cho agent
```

## Quy tắc duy trì

- Cập nhật tài liệu theo chủ đề hiện có; tránh tạo thêm report hoặc handoff rời cho từng lượt làm việc.
- Ghi trạng thái cấp sản phẩm tại `PROJECT_STATUS.md`, việc chưa làm tại `BACKLOG.md`, hướng dẫn chạy/phát hành tại `operations/`.
- Code và backend đang chạy quyết định hành vi thực tế. Contract và tài liệu sản phẩm cần được đối chiếu khi thay đổi API, quyền hoặc môi trường.
- `archive/` giữ ngữ cảnh cũ; endpoint, số liệu mẫu và trạng thái trong đó không tự trở thành yêu cầu hiện hành. Chỉ đưa việc đã rà soát lại vào backlog.
- Giữ `ai-development/` riêng cho quy trình agent. Không trộn template và workflow vào tài liệu sản phẩm.
- `docs-master/` và `design-system/qlcv-next/MASTER.md` ở ngoài cây này chỉ là các trang trỏ tương thích; nguồn chuẩn nằm trong `docs/product/`.
