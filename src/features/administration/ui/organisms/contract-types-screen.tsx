"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Alert, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Stack, TextField } from "@mui/material";
import { ApiProblem } from "@/services/http";
import { administrationApi, type ContractType } from "../../api/administration.api";
import { useAdministrationQuery, useRefreshAdministration } from "../../hooks/use-administration";
import { AdministrationLayout, AdministrationError } from "./administration-layout";

export function ContractTypesScreen() {
  const query = useAdministrationQuery(["contract-types"], "tenant-settings.manage", administrationApi.contractTypes);
  const [editing, setEditing] = useState<{ item?: ContractType } | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [success, setSuccess] = useState("");
  const rows = query.data?.filter((row) => row.name.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")) && (status === "all" || row.is_active === (status === "active")));
  return <AdministrationLayout title="Loại hợp đồng" description="Quản lý danh mục dùng chung. Ngừng sử dụng để giữ lại lịch sử hợp đồng." href="/admin/contract-types" actions={query.access.allowed && <Button variant="contained" onClick={() => { setSuccess(""); setEditing({}); }}>Thêm loại hợp đồng</Button>}>
    {!query.access.allowed ? <Alert severity="warning">Bạn chưa được cấp quyền quản lý danh mục.</Alert> : <section className="directory-panel">
      {success && <Alert severity="success" role="status" onClose={() => setSuccess("")}>{success}</Alert>}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ p: 2 }}><TextField label="Tìm loại hợp đồng" value={search} onChange={(event) => setSearch(event.target.value)} size="small" /><TextField select label="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value)} size="small" sx={{ minWidth: 180 }}><MenuItem value="all">Tất cả</MenuItem><MenuItem value="active">Đang sử dụng</MenuItem><MenuItem value="inactive">Ngừng sử dụng</MenuItem></TextField><Button disabled={query.isFetching} onClick={() => query.refetch()}>Tải lại</Button></Stack>
      {query.isPending && <p role="status">Đang tải danh mục…</p>}<AdministrationError error={query.error} retry={() => query.refetch()} />
      {rows && (rows.length ? <div className="directory-table-wrap"><table className="directory-table"><caption className="sr-only">Danh mục loại hợp đồng, {rows.length} kết quả</caption><thead><tr><th>Tên loại</th><th>Mô tả</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><th scope="row">{row.name}</th><td style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", maxWidth: 480 }}>{row.description || "—"}</td><td>{row.is_active ? "Đang sử dụng" : "Ngừng sử dụng"}</td><td><Button onClick={() => { setSuccess(""); setEditing({ item: row }); }} aria-label={`Sửa ${row.name}`}>Sửa</Button></td></tr>)}</tbody></table></div> : <p className="directory-empty">{query.data?.length ? "Không có loại hợp đồng khớp bộ lọc." : "Chưa có loại hợp đồng. Thêm danh mục đầu tiên để sử dụng."}</p>)}
    </section>}
    {editing && query.access.allowed && <ContractTypeEditor key={`${query.access.token}:${editing.item?.id ?? "new"}`} item={editing.item} items={query.data ?? []} reload={async () => { const result = await query.refetch(); if (result.error) throw result.error; return result.data ?? []; }} close={() => setEditing(null)} saved={(name) => { setSuccess(`Đã lưu loại hợp đồng “${name}”.`); setEditing(null); }} />}
  </AdministrationLayout>;
}
function ContractTypeEditor({ item, items, reload, close, saved }: { item?: ContractType; items: ContractType[]; reload: () => Promise<ContractType[]>; close: () => void; saved: (name: string) => void }) {
  const [base, setBase] = useState(item);
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [active, setActive] = useState(item?.is_active ?? true);
  const [confirmation, setConfirmation] = useState<"close" | "deactivate" | "reload" | null>(null);
  const [conflict, setConflict] = useState(false);
  const refresh = useRefreshAdministration();
  const dirty = name.trim() !== (base?.name ?? "") || description.trim() !== (base?.description ?? "") || active !== (base?.is_active ?? true);
  const duplicate = items.some((row) => row.id !== base?.id && row.name.trim().toLocaleLowerCase("vi") === name.trim().toLocaleLowerCase("vi"));
  const save = useMutation({ mutationFn: () => administrationApi.saveContractType({ name: name.trim(), description: description.trim(), is_active: active, ...(base ? { version: base.version } : {}) }, base?.id), onSuccess: async () => { await refresh(); saved(name.trim()); }, onError: (error) => { setConfirmation(null); if (error instanceof ApiProblem && error.problem.code === "VERSION_CONFLICT") setConflict(true); } });
  const load = useMutation({ mutationFn: async () => { const latest = (await reload()).find((row) => row.id === base?.id); if (!latest) throw Error("Contract type unavailable"); return latest; }, onSuccess: (latest) => { setBase(latest); setName(latest.name); setDescription(latest.description ?? ""); setActive(latest.is_active); setConflict(false); setConfirmation(null); save.reset(); } });
  const pending = save.isPending || load.isPending;
  const requestClose = () => dirty ? setConfirmation("close") : close();
  const submit = () => { if (pending || conflict || duplicate || !name.trim() || (base && !dirty)) return; if (base?.is_active && !active) setConfirmation("deactivate"); else save.mutate(); };
  return <><Dialog open fullWidth maxWidth="sm" onClose={pending ? undefined : requestClose} aria-labelledby="contract-type-title"><form onSubmit={(event) => { event.preventDefault(); submit(); }}><DialogTitle id="contract-type-title">{base ? "Sửa loại hợp đồng" : "Thêm loại hợp đồng"}</DialogTitle><DialogContent>
    <TextField autoFocus fullWidth required margin="normal" label="Tên loại" value={name} error={duplicate} helperText={duplicate ? "Tên này đã tồn tại, kể cả trong danh mục ngừng sử dụng." : undefined} disabled={pending} onChange={(event) => { setName(event.target.value); save.reset(); }} slotProps={{ htmlInput: { maxLength: 100 } }} />
    <TextField fullWidth multiline minRows={3} margin="normal" label="Mô tả" value={description} disabled={pending} onChange={(event) => { setDescription(event.target.value); save.reset(); }} slotProps={{ htmlInput: { maxLength: 2000 } }} />
    {base && <FormControlLabel control={<Checkbox checked={active} disabled={pending} onChange={(event) => { setActive(event.target.checked); save.reset(); }} />} label="Đang sử dụng" />}
    {conflict ? <Alert severity="warning" action={<Button disabled={pending} onClick={() => setConfirmation("reload")}>Tải bản mới</Button>}>Danh mục đã được cập nhật ở phiên khác. Bản nháp của bạn được giữ lại.</Alert> : <AdministrationError error={save.error} />}
    <AdministrationError error={load.error} retry={() => setConfirmation("reload")} />
  </DialogContent><DialogActions><Button disabled={pending} onClick={requestClose}>Hủy</Button><Button type="submit" variant="contained" disabled={pending || conflict || duplicate || !name.trim() || Boolean(base && !dirty)}>{save.isPending ? "Đang lưu…" : "Lưu"}</Button></DialogActions></form></Dialog>
  <Dialog open={confirmation !== null} onClose={pending ? undefined : () => setConfirmation(null)} aria-labelledby="contract-type-confirm-title"><DialogTitle id="contract-type-confirm-title">{confirmation === "deactivate" ? "Ngừng sử dụng loại hợp đồng?" : confirmation === "reload" ? "Tải bản mới nhất?" : "Bỏ thay đổi chưa lưu?"}</DialogTitle><DialogContent>{confirmation === "deactivate" ? "Các hợp đồng đã có vẫn giữ lịch sử loại hợp đồng này." : confirmation === "reload" ? "Bản nháp hiện tại sẽ được thay bằng thông tin mới nhất." : "Các thay đổi trong biểu mẫu sẽ bị bỏ."}<AdministrationError error={load.error} /></DialogContent><DialogActions><Button disabled={pending} onClick={() => setConfirmation(null)}>Quay lại</Button><Button variant="contained" disabled={pending} onClick={() => confirmation === "deactivate" ? save.mutate() : confirmation === "reload" ? load.mutate() : close()}>{pending ? "Đang xử lý…" : "Xác nhận"}</Button></DialogActions></Dialog></>;
}
