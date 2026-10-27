"use client";

import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, Alert } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { tasksApi, taskQueryKeys } from "../../api";
import { TaskEditor } from "./task-editor";

export function TaskSearch({ onClose }: { onClose: () => void }) {
  const token = useAccessToken();
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const query = useQuery({ queryKey: taskQueryKeys.list({ q: search, limit: 20 }), queryFn: ({ signal }) => tasksApi.list({ q: search, limit: 20 }, { accessToken: token!, signal }), enabled: Boolean(token && search) });
  return <><Dialog open onClose={onClose} fullWidth><DialogTitle>Tìm công việc</DialogTitle><DialogContent><form onSubmit={(event) => { event.preventDefault(); setSearch(draft.trim()); }}><TextField autoFocus fullWidth label="Tên công việc" value={draft} onChange={(event) => setDraft(event.target.value)} /><Button type="submit" disabled={!draft.trim()}>Tìm kiếm</Button><Button onClick={onClose}>Đóng</Button></form>{!token ? <Alert severity="info">Vui lòng đăng nhập.</Alert> : search && (query.isPending ? <p>Đang tìm…</p> : query.error ? <Alert severity="error">Không tìm được công việc.</Alert> : query.data?.data.length ? <><p>{query.data.pagination?.total ?? query.data.data.length} kết quả · Hiển thị tối đa 20 kết quả đầu</p>{query.data.data.map((task) => <Button key={task.id} fullWidth onClick={() => setSelected(task.id)}>{task.title}</Button>)}</> : <p>Không có kết quả.</p>)}</DialogContent></Dialog>{selected && <TaskEditor taskId={selected} projectId="" onClose={() => setSelected(null)} />}</>;
}
