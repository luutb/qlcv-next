"use client";

import { hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Alert, Button, Checkbox, Popover, TextField } from "@mui/material";
import { useTaskLabels } from "@/features/labels";
import { getSafeApiErrorMessage } from "@/services/http";

export function TaskLabelField({ taskId, editable: requestedEditable }: { taskId: string; editable: boolean }) {
  const user = useCurrentUserQuery();
  const editable = requestedEditable && (hasAuthorizedAction(user.data, "labels.assign-normal") || hasAuthorizedAction(user.data, "labels.assign-financial"));
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
  const [query, setQuery] = useState("");
  const { labels, assignments, assign, unassign, isSaving } = useTaskLabels(taskId, editable);
  const selected = useMemo(() => assignments.data?.data ?? [], [assignments.data?.data]);
  const selectedByLabel = useMemo(() => new Map(selected.map((assignment) => [assignment.label_id, assignment])), [selected]);
  const options = (labels.data?.data ?? []).filter((label) => label.title.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const toggle = (labelId: string) => {
    const label = options.find((item) => item.id === labelId);
    if (!editable || isSaving || !label || !hasAuthorizedAction(user.data, label.label_type === "NORMAL" ? "labels.assign-normal" : "labels.assign-financial")) return;
    const assignment = selectedByLabel.get(labelId);
    if (assignment) unassign.mutate(assignment.id);
    else assign.mutate(labelId);
  };

  return <section className="task-label-field" aria-labelledby="task-labels-title">
    <div className="task-label-heading"><div><h3 id="task-labels-title">Nhãn</h3><p>Phân loại công việc để lọc và theo dõi trên board.</p></div><Button type="button" variant="text" onClick={(event) => setAnchor(event.currentTarget)} disabled={!editable || labels.isPending}>Chỉnh sửa</Button></div>
    {assignments.isPending ? <p className="task-label-status" role="status">Đang tải nhãn…</p> : assignments.error ? <Alert severity="warning">{getSafeApiErrorMessage(assignments.error, "Không tải được nhãn của công việc.")}</Alert> : selected.length ? <div className="task-label-chips">{selected.map((assignment) => assignment.label ? <span className="task-label-chip" key={assignment.id} style={{ "--label-color": assignment.label.color } as React.CSSProperties}>{assignment.label.title}{assignment.label.label_type !== "NORMAL" ? ` · ${assignment.label.label_type === "DEPOSIT" ? "Cọc tiền" : "Thu tiền"}` : ""}</span> : null)}</div> : <p className="task-label-empty">Chưa gắn nhãn.</p>}
    {!editable ? <p className="task-label-hint">Bạn không có quyền thay đổi nhãn.</p> : null}
    {hasAuthorizedAction(user.data, "labels.read") && <Link href="/labels">Xem danh sách nhãn</Link>}
    <Popover open={Boolean(anchor)} anchorEl={anchor} onClose={() => { setAnchor(null); setQuery(""); }} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }} slotProps={{ paper: { className: "task-label-popover" } }}>
      <div className="task-label-picker"><div><strong>Chọn nhãn</strong><p>Có thể gắn nhiều nhãn cho một công việc.</p></div><TextField autoFocus fullWidth size="small" label="Tìm nhãn" value={query} onChange={(event) => setQuery(event.target.value)} />
        {labels.error ? <Alert severity="error">{getSafeApiErrorMessage(labels.error, "Không tải được danh sách nhãn.")}</Alert> : <div className="task-label-options" role="group" aria-label="Danh sách nhãn">{options.length ? options.map((label) => { const checked = selectedByLabel.has(label.id); return <label key={label.id}><Checkbox checked={checked} disabled={!editable || isSaving || (label.label_type === "NORMAL" ? !hasAuthorizedAction(user.data, "labels.assign-normal") : !hasAuthorizedAction(user.data, "labels.assign-financial"))} onChange={() => toggle(label.id)} /><span className="task-label-chip" style={{ "--label-color": label.color } as React.CSSProperties}>{label.title}{label.label_type !== "NORMAL" ? ` · ${label.label_type === "DEPOSIT" ? "Cọc tiền" : "Thu tiền"}` : ""}</span></label>; }) : <p>Không tìm thấy nhãn phù hợp.</p>}</div>}
        {(assign.error || unassign.error) ? <Alert severity="error">{getSafeApiErrorMessage(assign.error ?? unassign.error, "Không thể cập nhật nhãn. Vui lòng thử lại.")}</Alert> : null}
      </div>
    </Popover>
  </section>;
}
