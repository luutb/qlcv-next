"use client";

import { useState } from "react";
import { Alert, Button, TextField, MenuItem } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkspaceTemplate } from "@/components/templates";
import { WorkhubSidebar } from "@/layouts/workhub/workhub-sidebar";
import { WorkhubTopbar } from "@/layouts/workhub/workhub-topbar";
import { hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { getSafeApiErrorMessage } from "@/services/http";
import { labelsApi, type Label } from "../../api";
import { useAvailableLabels } from "../../hooks/use-task-labels";

const typeNames = { NORMAL: "Thông thường", DEPOSIT: "Cọc tiền", PAYMENT: "Thu tiền" };
const colors = ["#2563eb", "#7c3aed", "#db2777", "#dc2626", "#c2410c", "#15803d", "#0e7490", "#64748b"];

export function LabelsScreen() {
  const token = useAccessToken();
  const user = useCurrentUserQuery();
  const canManage = Boolean(token && hasAuthorizedAction(user.data, "labels.manage"));
  const labels = useAvailableLabels();
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Label | null>(null);
  const [title, setTitle] = useState("");
  const [labelType, setLabelType] = useState<Label["label_type"]>("NORMAL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [color, setColor] = useState(colors[0]);
  const [description, setDescription] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const reset = () => { setEditing(null); setLabelType("NORMAL"); setTitle(""); setColor(colors[0]); setDescription(""); };
  const refresh = () => Promise.all([client.invalidateQueries({ queryKey: ["labels"] }), client.invalidateQueries({ queryKey: ["tasks"] })]);
  const save = useMutation({ mutationFn: async () => {
    if (!canManage) throw new Error("Bạn không có quyền quản lý nhãn.");
    const input = { label_type: labelType, title: title.trim(), color, description: description.trim() };
    return editing ? labelsApi.update(editing.id, input, { accessToken: token! }) : labelsApi.create(input, { accessToken: token! });
  }, onSuccess: async () => { setNotice(editing ? "Đã cập nhật nhãn." : "Đã tạo nhãn."); reset(); await refresh(); } });
  const remove = useMutation({ mutationFn: async (id: string) => {
    if (!canManage) throw new Error("Bạn không có quyền quản lý nhãn.");
    return labelsApi.remove(id, { accessToken: token! });
  }, onSuccess: async () => { setNotice("Đã xóa nhãn và gỡ khỏi các công việc."); setDeleting(null); await refresh(); } });
  const items = (labels.data?.data ?? []).filter(label => label.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()) && (typeFilter === "ALL" || label.label_type === typeFilter));
  return <WorkspaceTemplate sidebar={<WorkhubSidebar activeHref="/labels" />} topbar={<WorkhubTopbar />}><main className="labels-screen">
    <header className="labels-page-heading"><h1>Quản lý nhãn</h1><p>Tạo bộ nhãn dùng chung để phân loại và tìm công việc nhanh hơn.</p></header>
    {notice && <Alert severity="success" onClose={() => setNotice("")}>{notice}</Alert>}
    <div className="labels-workspace"><section className="labels-catalog"><div className="labels-list-heading"><h2>Danh sách nhãn <span>{labels.data?.data.length ?? 0}</span></h2><TextField select size="small" label="Loại nhãn" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}><MenuItem value="ALL">Tất cả loại</MenuItem>{Object.entries(typeNames).map(([id, name]) => <MenuItem key={id} value={id}>{name}</MenuItem>)}</TextField><TextField size="small" label="Tìm nhãn" value={search} onChange={e => setSearch(e.target.value)} /></div>
      {labels.isPending ? <p role="status">Đang tải nhãn…</p> : labels.error ? <Alert severity="error" action={<Button onClick={() => labels.refetch()}>Thử lại</Button>}>{getSafeApiErrorMessage(labels.error, "Không tải được nhãn.")}</Alert> : !items.length ? <p>{search ? "Không có nhãn phù hợp." : "Chưa có nhãn. Tạo nhãn đầu tiên để bắt đầu phân loại công việc."}</p> : <ul className="labels-list">{items.map(label => <li key={label.id}><div className="labels-row-content"><span className="labels-preview" style={{ color: label.color, background: label.color + "18" }}><i style={{ background: label.color }} />{label.title}</span><small className={`label-kind label-kind-${label.label_type.toLowerCase()}`}>{typeNames[label.label_type]}</small><p>{label.description || "Chưa có mô tả"}</p></div>{label.is_system ? <small>Nhãn hệ thống</small> : canManage && <div className="labels-row-actions">{deleting === label.id ? <><span>Xóa và gỡ nhãn khỏi công việc?</span><Button color="error" disabled={remove.isPending} onClick={() => remove.mutate(label.id)}>Xác nhận xóa</Button><Button onClick={() => setDeleting(null)}>Hủy</Button></> : <><Button onClick={() => { setEditing(label); setLabelType(label.label_type); setTitle(label.title); setColor(label.color); setDescription(label.description ?? ""); save.reset(); }}>Sửa</Button><Button color="error" onClick={() => setDeleting(label.id)}>Xóa</Button></>}</div>}</li>)}</ul>}
      {remove.error && <Alert severity="error">{getSafeApiErrorMessage(remove.error, "Không xóa được nhãn.")}</Alert>}
    </section><aside className="labels-editor"><h2>{editing ? "Chỉnh sửa nhãn" : "Tạo nhãn mới"}</h2>{!canManage ? <Alert severity="info">Bạn có quyền xem nhãn. Tài khoản này chưa được cấp quyền quản lý nhãn.</Alert> : <form onSubmit={e => { e.preventDefault(); if (title.trim()) save.mutate(); }}>
      <TextField select fullWidth label="Loại nhãn" value={labelType} onChange={e => setLabelType(e.target.value as Label["label_type"])}>{Object.entries(typeNames).map(([id, name]) => <MenuItem key={id} value={id}>{name}</MenuItem>)}</TextField>
      {labelType !== "NORMAL" && <Alert severity="info">Nhãn {typeNames[labelType].toLocaleLowerCase()} dùng để phân loại công việc, không xác nhận đã nhận tiền. Kế toán hoặc quản trị viên được gắn và gỡ nhãn này.</Alert>}
      <TextField label="Tên nhãn" required fullWidth value={title} onChange={e => setTitle(e.target.value)} slotProps={{ htmlInput: { maxLength: 100 } }} />
      <TextField label="Mô tả" fullWidth multiline minRows={2} value={description} onChange={e => setDescription(e.target.value)} slotProps={{ htmlInput: { maxLength: 255 } }} />
      <fieldset><legend>Màu nhãn</legend><div className="label-color-options">{colors.map(value => <button key={value} type="button" style={{ background: value }} aria-label={`Màu ${value}`} aria-pressed={color === value} onClick={() => setColor(value)} />)}</div><label className="label-custom-color">Màu tùy chọn<input type="color" value={color} onChange={e => setColor(e.target.value)} /></label></fieldset>
      <div className="labels-live-preview"><small>Xem trước</small><span className="labels-preview" style={{ color, background: color + "18" }}><i style={{ background: color }} />{title.trim() || "Tên nhãn"}</span><span className="label-kind">{typeNames[labelType]}</span></div>
      {save.error && <Alert severity="error">{getSafeApiErrorMessage(save.error, "Không lưu được nhãn.")}</Alert>}<div><Button variant="contained" type="submit" disabled={!title.trim() || save.isPending}>{save.isPending ? "Đang lưu…" : editing ? "Lưu thay đổi" : "Tạo nhãn"}</Button>{editing && <Button onClick={reset}>Hủy chỉnh sửa</Button>}</div>
    </form>}</aside></div>
  </main></WorkspaceTemplate>;
}
