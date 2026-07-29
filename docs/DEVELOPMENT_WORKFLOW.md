# Quy trình phát triển và review

Cập nhật: 28/07/2026.

## Mô hình branch

```text
main
  └── develop
        └── story/st-xx-short-name
              ├── commits theo IS-xx.y.z
              └── task/tk-xx-y-short-name (chỉ khi cần chạy độc lập)
```

- `main`: production, chỉ nhận thay đổi đã qua toàn bộ cổng review.
- `develop`: tích hợp các Story đã hoàn thành.
- Story branch: tạo từ `develop`, chứa toàn bộ Task/Issue của một Story.
- Task branch: tuỳ chọn, tạo từ Story branch khi cần làm song song hoặc cách ly thay đổi.
- Issue: mặc định là một commit tập trung trên Story/Task branch, không tạo branch riêng hàng loạt.

Quy ước tên:

```text
story/st-02-unify-types
task/tk-02-1-domain-types
IS-02.1.1: unify user and role types
```

## Vòng đời Issue

1. Agent triển khai nhận đúng mã Issue và phạm vi file độc quyền.
2. Agent đọc backlog, `AGENTS.md` và tài liệu framework liên quan.
3. Agent triển khai thay đổi nhỏ nhất và chạy focused checks.
4. Primary agent gọi `qa_reviewer`.
5. QA trả `PASS`, `FAIL` hoặc `BLOCKED`.
6. Primary agent ghi verdict/evidence vào `docs/reviews/ST-xx.md`.
7. Chỉ khi `PASS`, primary agent mới đánh dấu checkbox Issue hoàn thành.

## Vòng đời Task

1. Tất cả Issue con đã được QA `PASS`.
2. Primary agent chạy kiểm tra tích hợp trong phạm vi Task.
3. Primary agent gọi `qa_reviewer` ở cấp Task.
4. QA kiểm tra integration, regression và Task acceptance criteria.
5. Primary agent ghi Task status và evidence vào `docs/reviews/ST-xx.md`.
6. Chỉ khi `PASS`, Task mới được xem là hoàn thành hoặc merge về Story branch.

## Vòng đời Story

1. Tất cả Task con đã được QA `PASS`.
2. Primary agent chạy full Story checks và chuẩn bị bằng chứng hành vi.
3. `qa_reviewer` review end-to-end Story và trả verdict.
4. Primary agent ghi Story QA verdict và evidence vào `docs/reviews/ST-xx.md`.
5. Nếu QA `PASS`, `po_reviewer` đọc review record và thực hiện product acceptance cuối.
6. Primary agent ghi Story PO verdict và evidence vào review record.
7. Chỉ khi PO `ACCEPT`, Story mới đủ điều kiện đề xuất merge vào `develop`.
8. Việc merge/push vẫn phải nằm trong quyền được người dùng cấp ở request hiện tại.

## Quality gate chuyển tiếp

- Trước khi ST-05 đạt Story QA `PASS`: chạy kiểm tra phù hợp phạm vi, so với `docs/QUALITY_BASELINE.md` và không chấp nhận regression mới. Lệnh toàn cục đang hỏng theo baseline không tự động làm BLOCKED một Issue không liên quan.
- Sau khi ST-05 đạt Story QA `PASS`: lint, typecheck, unit test và production build phải cùng thành công cho mọi thay đổi implementation.
- Kiểm thử backend thật chỉ bắt buộc khi Issue thay đổi contract/luồng tích hợp và môi trường cần thiết sẵn sàng.
- Mọi ngoại lệ phải có command, kết quả, lý do và residual risk trong Story review record.

## Ma trận agent

| Phạm vi | Agent triển khai | Reviewer |
|---|---|---|
| ST-01 | `repo_stabilizer` | `qa_reviewer` |
| ST-02 | `core_types` | `qa_reviewer` |
| ST-03 | `api_services` | `qa_reviewer` |
| ST-04–ST-05 | `qa_platform` | `qa_reviewer` |
| ST-06–ST-07 | `auth_security` | `qa_reviewer` |
| ST-08–ST-10 | `core_features` | `qa_reviewer` |
| ST-11–ST-14 | `admin_features` | `qa_reviewer` |
| ST-15–ST-16 | `ux_accessibility` | `qa_reviewer` |
| ST-17–ST-18 | `release_qa` | `qa_reviewer` |
| Story đã QA PASS | Không áp dụng | `po_reviewer` |

`qa_platform` và `release_qa` có thể triển khai test/release tooling nhưng không được tự review thay đổi của chính mình; `qa_reviewer` là vai trò độc lập.

## Quy tắc chạy song song

- Tối đa ba subagent chạy đồng thời theo `.codex/config.toml`.
- Không chạy hai agent ghi lên cùng file hoặc cùng module trong một lượt.
- Ưu tiên chạy song song các tác vụ đọc, phân tích và review.
- Khi hai Story có type/service dùng chung, primary agent phải chốt ownership trước khi spawn.
- Primary agent chịu trách nhiệm tổng hợp, giải quyết conflict và chạy integration checks.

## Xử lý review thất bại

```text
Implementation → QA review
                    ├── PASS → cấp tiếp theo
                    ├── FAIL → trả findings về implementation agent
                    └── BLOCKED → giữ item mở và làm rõ dependency

Story QA PASS → PO review
                    ├── ACCEPT → đề xuất merge develop
                    ├── REJECT → trả product gaps về implementation agent
                    └── BLOCKED → chờ quyết định/evidence còn thiếu
```

Không sửa trực tiếp finding trong thread review. Reviewer giữ read-only; primary agent giao finding trở lại agent triển khai và gọi review lại sau khi sửa.

## Review record

Mỗi Story tạo một file `docs/reviews/ST-xx.md` từ mẫu `docs/reviews/README.md`. File này là nguồn trạng thái chính thức cho Task, Story QA và Story PO; backlog chỉ giữ checkbox Issue.
