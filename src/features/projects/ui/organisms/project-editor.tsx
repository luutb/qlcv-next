"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { getSafeApiErrorMessage } from "@/services/http";
import { projectQueryKeys, updateProject, type Project } from "../../api/projects.api";
export function ProjectEditor({ project, close }: { project: Project; close: () => void }) {
  const token = useAccessToken(); const user = useCurrentUserQuery(); const allowed = hasAuthorizedAction(user.data, "projects.create"); const client = useQueryClient();
  const [name, setName] = useState(project.name); const [key, setKey] = useState(project.key ?? ""); const [description, setDescription] = useState(project.description ?? "");
  const valid = Boolean(name.trim() && /^[A-Z0-9]{2,20}$/.test(key));
  const save = useMutation({ mutationFn: () => { if (!token || !allowed || !valid) throw Error("Không có quyền sửa dự án"); return updateProject({ accessToken: token }, project.id, { key, name: name.trim(), description: description.trim() }); }, onSuccess: async () => { await Promise.all([client.invalidateQueries({ queryKey: projectQueryKeys.all }), client.invalidateQueries({ queryKey: ["dashboard"] })]); close(); } });
  return <Dialog open fullWidth maxWidth="sm" onClose={save.isPending ? undefined : close} aria-labelledby="project-editor-title"><form onSubmit={(event) => { event.preventDefault(); save.mutate(); }}><DialogTitle id="project-editor-title">Sửa thông tin dự án</DialogTitle><DialogContent>
    <TextField autoFocus fullWidth required margin="normal" label="Tên dự án" value={name} onChange={(event) => setName(event.target.value)} disabled={!allowed || save.isPending} slotProps={{ htmlInput: { maxLength: 255 } }} />
    <TextField fullWidth required margin="normal" label="Mã dự án" value={key} onChange={(event) => setKey(event.target.value.toUpperCase())} disabled={!allowed || save.isPending} helperText="2–20 chữ cái A–Z hoặc chữ số." slotProps={{ htmlInput: { maxLength: 20, pattern: "[A-Z0-9]{2,20}" } }} />
    <TextField fullWidth margin="normal" multiline minRows={3} label="Mô tả" value={description} onChange={(event) => setDescription(event.target.value)} disabled={!allowed || save.isPending} slotProps={{ htmlInput: { maxLength: 2000 } }} />
    {save.error && <Alert severity="error">{getSafeApiErrorMessage(save.error, "Không lưu được dự án. Kiểm tra mã dự án có bị trùng hay không.")}</Alert>}
  </DialogContent><DialogActions><Button disabled={save.isPending} onClick={close}>Hủy</Button><Button type="submit" variant="contained" disabled={!allowed || save.isPending || !valid}>{save.isPending ? "Đang lưu…" : "Lưu thông tin"}</Button></DialogActions></form></Dialog>;
}
