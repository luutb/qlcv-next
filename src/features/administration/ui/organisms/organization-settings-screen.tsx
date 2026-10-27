"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, TextField } from "@mui/material";
import { ApiProblem } from "@/services/http";
import { administrationApi, type Settings } from "../../api/administration.api";
import { readSettings } from "../../model/contracts";
import { useAdministrationQuery, useRefreshAdministration } from "../../hooks/use-administration";
import { AdministrationLayout, AdministrationError } from "./administration-layout";

export function OrganizationSettingsScreen() {
  const query = useAdministrationQuery(["settings"], "tenant-settings.manage", administrationApi.settings);
  return <AdministrationLayout title="Thông tin tổ chức" description="Thông tin hiển thị trong không gian làm việc." href="/admin/tenant-settings">
    {!query.access.allowed ? <Alert severity="warning">Bạn chưa được cấp quyền cấu hình tổ chức.</Alert> : <>
      {query.isPending && <p role="status">Đang tải thông tin…</p>}
      <AdministrationError error={query.error} retry={() => query.refetch()} />
      {query.data && <SettingsForm key={query.access.token} settings={query.data} reload={async () => { const result = await query.refetch(); if (result.error) throw result.error; if (!result.data) throw Error("Missing settings"); return result.data; }} />}
    </>}
  </AdministrationLayout>;
}
function SettingsForm({ settings, reload }: { settings: Settings; reload: () => Promise<Settings> }) {
  const [base, setBase] = useState(settings);
  const [draft, setDraft] = useState(settings);
  const [confirmReload, setConfirmReload] = useState(false);
  const [versionConflict, setVersionConflict] = useState(false);
  const refresh = useRefreshAdministration();
  const normalized = { ...draft, name: draft.name.trim(), email: draft.email.trim(), phone: draft.phone.trim(), address: draft.address.trim() };
  const dirty = normalized.name !== base.name || normalized.email !== base.email || normalized.phone !== base.phone || normalized.address !== base.address;
  const save = useMutation({
    mutationFn: async () => readSettings(await administrationApi.saveSettings(normalized)),
    onSuccess: async (saved) => { setVersionConflict(false); setBase(saved); setDraft(saved); await refresh(); },
    onError: (error) => { if (error instanceof ApiProblem && error.problem.code === "VERSION_CONFLICT") setVersionConflict(true); },
  });
  const load = useMutation({ mutationFn: reload, onSuccess: (latest) => { setBase(latest); setDraft(latest); setConfirmReload(false); setVersionConflict(false); save.reset(); } });
  const conflict = versionConflict || settings.version !== base.version;
  const pending = save.isPending || load.isPending;
  return <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}><form onSubmit={(event) => { event.preventDefault(); if (!pending && !conflict && dirty && normalized.name) save.mutate(); }}>
    <Stack spacing={2} sx={{ maxWidth: 720 }}>
      <TextField required label="Tên tổ chức" value={draft.name} disabled={pending} onChange={(event) => { save.reset(); setDraft({ ...draft, name: event.target.value }); }} slotProps={{ htmlInput: { maxLength: 200 } }} />
      <TextField type="email" label="Email liên hệ" value={draft.email} disabled={pending} onChange={(event) => { save.reset(); setDraft({ ...draft, email: event.target.value }); }} slotProps={{ htmlInput: { maxLength: 254 } }} />
      <TextField label="Số điện thoại" value={draft.phone} disabled={pending} onChange={(event) => { save.reset(); setDraft({ ...draft, phone: event.target.value }); }} slotProps={{ htmlInput: { maxLength: 50 } }} />
      <TextField multiline minRows={2} label="Địa chỉ" value={draft.address} disabled={pending} onChange={(event) => { save.reset(); setDraft({ ...draft, address: event.target.value }); }} slotProps={{ htmlInput: { maxLength: 500 } }} />
      {conflict ? <Alert severity="warning" action={<Button disabled={pending} onClick={() => setConfirmReload(true)}>Tải bản mới</Button>}>Thông tin đã thay đổi ở phiên khác. Bản nháp của bạn được giữ lại; tải bản mới trước khi lưu tiếp.</Alert> : <AdministrationError error={save.error} />}
      <AdministrationError error={load.error} retry={() => dirty ? setConfirmReload(true) : load.mutate()} />
      {save.isSuccess && !dirty && <Alert severity="success" role="status">Đã lưu thông tin tổ chức.</Alert>}
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}><Button type="submit" variant="contained" disabled={pending || conflict || !normalized.name || !dirty}>{save.isPending ? "Đang lưu…" : "Lưu thông tin"}</Button><Button disabled={pending || !dirty} onClick={() => { setDraft(base); save.reset(); }}>Hủy thay đổi</Button><Button disabled={pending} onClick={() => dirty ? setConfirmReload(true) : load.mutate()}>Tải lại thông tin</Button></Stack>
      <p>Phiên bản {base.version} · Cập nhật {new Date(base.updated_at).toLocaleString("vi-VN")}</p>
    </Stack>
  </form><Dialog open={confirmReload} onClose={pending ? undefined : () => setConfirmReload(false)} aria-labelledby="reload-settings-title"><DialogTitle id="reload-settings-title">Tải thông tin mới nhất?</DialogTitle><DialogContent>Bản nháp hiện tại sẽ được thay bằng thông tin mới nhất của tổ chức.<AdministrationError error={load.error} /></DialogContent><DialogActions><Button disabled={pending} onClick={() => setConfirmReload(false)}>Giữ bản nháp</Button><Button variant="contained" disabled={pending} onClick={() => load.mutate()}>{load.isPending ? "Đang tải…" : "Tải bản mới"}</Button></DialogActions></Dialog></Paper>;
}
