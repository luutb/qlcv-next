# Mẫu review record

Tạo một file cho mỗi Story theo tên `ST-xx.md`. Không sửa file mẫu này để ghi kết quả của một Story cụ thể.

```md
# ST-xx Review Record

## Story metadata

- Story: ST-xx — Tên Story
- Branch: story/st-xx-short-name
- Story owner: agent hoặc người phụ trách
- Base commit: <sha>
- Head commit: <sha>

## Quality baseline

- Canonical baseline: `docs/QUALITY_BASELINE.md`
- Baseline commit:
- Scope-relevant command deltas:
- New regressions: none hoặc danh sách

## Issue reviews

| Issue | Commit/diff | QA verdict | Evidence | Residual risk |
|---|---|---|---|---|
| IS-xx.y.z | <sha hoặc diff> | PASS/FAIL/BLOCKED | command, test hoặc inspection | mô tả hoặc none |

## Task reviews

| Task | Status | QA verdict | Evidence | Open findings |
|---|---|---|---|---|
| TK-xx.y | TODO/IN_PROGRESS/PASS/FAIL/BLOCKED | PASS/FAIL/BLOCKED | integration/regression evidence | finding hoặc none |

## Story QA review

- Verdict: TODO/PASS/FAIL/BLOCKED
- Reviewed commit:
- Acceptance matrix:
- Commands and results:
- Regression assessment:
- Open findings:

## Story PO review

- Verdict: TODO/ACCEPT/REJECT/BLOCKED
- Reviewed commit:
- Business acceptance matrix:
- Evidence reviewed:
- Product gaps:
- Release-note requirements:

## Review history

| Time | Level | Item | Reviewer | Verdict | Notes |
|---|---|---|---|---|---|
| YYYY-MM-DD HH:mm | Issue/Task/Story QA/Story PO | ID | agent | verdict | summary |
```

Quy tắc:

- Không ghi `PASS` hoặc `ACCEPT` khi thiếu commit/diff và evidence.
- Không xoá review thất bại cũ; thêm lần review mới vào history.
- Reviewer không tự sửa implementation trong lượt review.
- Primary agent chịu trách nhiệm cập nhật record sau khi nhận verdict.
- Trước ST-05 QA `PASS`, ghi delta của các command liên quan so với `docs/QUALITY_BASELINE.md`; không tự tạo một baseline khác theo Story.
