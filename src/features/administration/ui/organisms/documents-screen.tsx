"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import { administrationApi, type BusinessDocument, type BusinessDocumentContext } from "../../api/administration.api";
import { useAdministrationQuery, useRefreshAdministration } from "../../hooks/use-administration";
import { AdministrationLayout, AdministrationError, AdministrationPagination } from "./administration-layout";
import { DocumentContextPicker, type DocumentContextKind, type DocumentContextOption } from "./document-context-picker";

type ScopeFilter = "all" | "general" | DocumentContextKind;
type DialogContext = { type: ScopeFilter; item: DocumentContextOption | null };

function initialScope(params: URLSearchParams): DialogContext {
  for (const type of ["customer", "project", "task"] as const) {
    const id = params.get(`${type}_id`);
    if (id && /^[1-9]\d*$/.test(id)) return { type, item: { type, id, name: `${type === "customer" ? "Khách hàng" : type === "project" ? "Dự án" : "Công việc"} #${id}` } };
  }
  return { type: "all", item: null };
}

function DocumentsContent() {
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [archived, setArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [changing, setChanging] = useState<BusinessDocument | null>(null);
  const [moving, setMoving] = useState<BusinessDocument | null>(null);
  const [moveScope, setMoveScope] = useState<DialogContext>({ type: "general", item: null });
  const [scope, setScope] = useState<DialogContext>(() => initialScope(new URLSearchParams(params.toString())));
  const queryContext: BusinessDocumentContext | undefined = scope.type === "all" ? undefined : scope.type === "general" ? { type: "general" } : scope.item ? { type: scope.type, id: scope.item.id } : undefined;
  const hasCompleteContext = scope.type === "all" || scope.type === "general" || queryContext !== undefined;
  const query = useAdministrationQuery(["documents", page, search, archived, scope.type, scope.item?.id], "documents.read", (signal) => administrationApi.documents(page, search, archived, queryContext, signal), hasCompleteContext);
  const refresh = useRefreshAdministration();
  const change = useMutation({ mutationFn: (row: BusinessDocument) => administrationApi.documentStatus(row.id, !row.is_archived), onSuccess: async () => { if (query.data?.items.length === 1 && page > 1) setPage(page - 1); await refresh(); setChanging(null); } });
  const move = useMutation({ mutationFn: ({ row, context }: { row: BusinessDocument; context: BusinessDocumentContext }) => administrationApi.documentContext(row.id, context), onSuccess: async () => { await refresh(); setMoving(null); } });
  const download = useMutation({ mutationFn: async (id: string) => { const { url } = await administrationApi.documentDownload(id); const target = new URL(url); if (!["http:", "https:"].includes(target.protocol) || target.username || target.password) throw Error("Liên kết không hợp lệ"); window.location.assign(target.href); } });

  function selectScope(type: ScopeFilter) {
    setScope({ type, item: type === scope.type && type !== "all" && type !== "general" ? scope.item : null });
    setPage(1);
  }
  function updateScopeItem(item: DocumentContextOption | null) {
    setScope((current) => ({ ...current, item }));
    setPage(1);
  }

  return <AdministrationLayout title="Tài liệu hồ sơ" description="Lưu trữ tài liệu chung hoặc gắn trực tiếp với khách hàng, dự án hay công việc." href="/documents" actions={query.access.allowed && <Button variant="contained" onClick={() => setUploading(true)}>Tải tài liệu lên</Button>}>
    {!query.access.allowed ? <Alert severity="warning">Bạn chưa được cấp quyền xem tài liệu.</Alert> : <section className="directory-panel">
      <form className="directory-toolbar" onSubmit={(event) => { event.preventDefault(); setSearch(q.trim()); setPage(1); }}>
        <TextField size="small" label="Tìm tài liệu hoặc hồ sơ" value={q} onChange={(event) => setQ(event.target.value)} slotProps={{ htmlInput: { maxLength: 200 } }} />
        <TextField size="small" select label="Phạm vi hồ sơ" value={scope.type} onChange={(event) => selectScope(event.target.value as ScopeFilter)}>
          <MenuItem value="all">Tất cả hồ sơ</MenuItem><MenuItem value="general">Tài liệu chung</MenuItem><MenuItem value="customer">Khách hàng</MenuItem><MenuItem value="project">Dự án</MenuItem><MenuItem value="task">Công việc</MenuItem>
        </TextField>
        {(scope.type === "customer" || scope.type === "project" || scope.type === "task") && <DocumentContextPicker type={scope.type} value={scope.item} onChange={updateScopeItem} />}
        <TextField size="small" select label="Trạng thái" value={String(archived)} onChange={(event) => { setArchived(event.target.value === "true"); setPage(1); }}><MenuItem value="false">Đang sử dụng</MenuItem><MenuItem value="true">Đã lưu trữ</MenuItem></TextField>
        <Button type="submit">Tìm kiếm</Button>
      </form>
      {query.isPending && <p role="status">Đang tải tài liệu…</p>}
      {!hasCompleteContext && <p className="directory-empty">Chọn hồ sơ để xem tài liệu liên quan.</p>}
      <AdministrationError error={query.error} retry={() => query.refetch()} />
      <AdministrationError error={download.error} retry={() => { if (download.variables) download.mutate(download.variables); }} />
      {query.data && <><div className="directory-table-wrap"><table className="directory-table"><caption className="sr-only">Danh sách tài liệu hồ sơ</caption><thead><tr><th>Tài liệu</th><th>Hồ sơ liên quan</th><th>Dung lượng</th><th>Ngày tải lên</th><th>Thao tác</th></tr></thead><tbody>{query.data.items.map((row) => <tr key={row.id}>
        <th scope="row">{row.name}<small>{documentFileType(row.mime_type)}</small></th>
        <td>{documentContextLabel(row)}{row.task_title && row.project_name && <small>Dự án: {row.project_name}</small>}{row.customer_name && (row.task_title || row.project_name) && <small>Khách hàng: {row.customer_name}</small>}</td>
        <td>{documentFileSize(row.size)}</td>
        <td>{new Date(row.created_at).toLocaleDateString("vi-VN")}</td>
        <td>{!archived && <Button disabled={download.isPending} onClick={() => download.mutate(row.id)} aria-label={`Tải xuống ${row.name}`}>Tải xuống</Button>}{canManageDocument(row, query.access.user.data?.id, query.access.user.data?.role) && <><Button onClick={() => { move.reset(); setMoveScope(documentScope(row)); setMoving(row); }}>Chuyển hồ sơ</Button><Button onClick={() => { change.reset(); setChanging(row); }}>{archived ? "Khôi phục" : "Lưu trữ"}</Button></>}</td>
      </tr>)}</tbody></table></div>{!query.data.items.length && <p className="directory-empty">Chưa có tài liệu phù hợp.</p>}<AdministrationPagination page={page} total={query.data.pagination.total} onChange={setPage} /></>}
    </section>}
    {uploading && query.access.allowed && <DocumentUpload initial={scope} close={() => setUploading(false)} uploaded={() => { setUploading(false); setArchived(false); setSearch(""); setQ(""); setPage(1); }} />}
    {moving && query.access.allowed && <DocumentContextDialog row={moving} value={moveScope} pending={move.isPending} error={move.error} onChange={setMoveScope} onClose={() => setMoving(null)} onSave={() => { if (moveScope.type === "general") move.mutate({ row: moving, context: { type: "general" } }); else if (moveScope.item && moveScope.type !== "all") move.mutate({ row: moving, context: { type: moveScope.type, id: moveScope.item.id } }); }} onRetry={() => { if (moveScope.type === "general") move.mutate({ row: moving, context: { type: "general" } }); else if (moveScope.item && moveScope.type !== "all") move.mutate({ row: moving, context: { type: moveScope.type, id: moveScope.item.id } }); }} />}
    {changing && query.access.allowed && <Dialog open onClose={change.isPending ? undefined : () => setChanging(null)} aria-labelledby="document-status-title"><DialogTitle id="document-status-title">{changing.is_archived ? "Khôi phục tài liệu" : "Lưu trữ tài liệu"}</DialogTitle><DialogContent><p>{changing.name}</p><p>{changing.is_archived ? "Tài liệu sẽ xuất hiện lại trong danh sách đang sử dụng." : "Tài liệu sẽ được giữ trong kho lưu trữ và ngừng cấp liên kết tải mới."}</p><AdministrationError error={change.error} /></DialogContent><DialogActions><Button disabled={change.isPending} onClick={() => setChanging(null)}>Hủy</Button><Button disabled={change.isPending} onClick={() => change.mutate(changing)}>Xác nhận</Button></DialogActions></Dialog>}
  </AdministrationLayout>;
}

function documentContextLabel(row: BusinessDocument) {
  if (row.task_title) return `Công việc: ${row.task_title}`;
  if (row.project_name) return `Dự án: ${row.project_name}`;
  if (row.customer_name) return `Khách hàng: ${row.customer_name}`;
  return "Tài liệu chung";
}

function documentScope(row: BusinessDocument): DialogContext {
  if (row.task_id) return { type: "task", item: { type: "task", id: row.task_id, name: row.task_title ?? `Công việc #${row.task_id}` } };
  if (row.project_id) return { type: "project", item: { type: "project", id: row.project_id, name: row.project_name ?? `Dự án #${row.project_id}` } };
  if (row.customer_id) return { type: "customer", item: { type: "customer", id: row.customer_id, name: row.customer_name ?? `Khách hàng #${row.customer_id}` } };
  return { type: "general", item: null };
}

function canManageDocument(row: BusinessDocument, userId?: string, role?: string) {
  return row.owner_id === userId || (role === "ADMIN" || role === "SUPER_ADMIN");
}

function documentFileType(mimeType: string) {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType === "image/jpeg") return "JPEG";
  if (mimeType === "image/png") return "PNG";
  return "Tài liệu";
}

function documentFileSize(size: number) {
  if (size < 1024) return `${size} byte`;
  const unit = size >= 1024 * 1024 ? "MB" : "KB";
  const divisor = unit === "MB" ? 1024 * 1024 : 1024;
  return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(size / divisor)} ${unit}`;
}

function DocumentContextDialog({ row, value, pending, error, onChange, onClose, onSave, onRetry }: { row: BusinessDocument; value: DialogContext; pending: boolean; error: unknown; onChange: (value: DialogContext) => void; onClose: () => void; onSave: () => void; onRetry: () => void }) {
  const contextKind = value.type === "customer" || value.type === "project" || value.type === "task" ? value.type : null;
  return <Dialog open fullWidth maxWidth="sm" onClose={pending ? undefined : onClose} aria-labelledby="document-context-title"><DialogTitle id="document-context-title">Chuyển tài liệu vào hồ sơ</DialogTitle><DialogContent><p>{row.name}</p>
    <TextField fullWidth select label="Lưu tài liệu vào" margin="normal" value={value.type} disabled={pending} onChange={(event) => onChange({ type: event.target.value as ScopeFilter, item: null })}><MenuItem value="general">Tài liệu chung</MenuItem><MenuItem value="customer">Hồ sơ khách hàng</MenuItem><MenuItem value="project">Hồ sơ dự án</MenuItem><MenuItem value="task">Hồ sơ công việc</MenuItem></TextField>
    {contextKind && <DocumentContextPicker type={contextKind} value={value.item} onChange={(item) => onChange({ ...value, item })} disabled={pending} />}
    <AdministrationError error={error} retry={onRetry} />
  </DialogContent><DialogActions><Button disabled={pending} onClick={onClose}>Hủy</Button><Button variant="contained" disabled={pending || Boolean(contextKind && !value.item)} onClick={onSave}>{pending ? "Đang lưu…" : "Lưu hồ sơ"}</Button></DialogActions></Dialog>;
}

function DocumentUpload({ initial, close, uploaded }: { initial: DialogContext; close: () => void; uploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [scope, setScope] = useState<DialogContext>(() => initial.type === "all" ? { type: "general", item: null } : initial);
  const refresh = useRefreshAdministration();
  const fileError = !file ? null : file.size === 0 ? "Tệp rỗng. Vui lòng chọn tài liệu có nội dung." : file.size > 10 * 1024 * 1024 ? "Tệp vượt quá 10 MB." : !/\.(pdf|png|jpe?g)$/i.test(file.name) ? "Chỉ chấp nhận PDF, JPG hoặc PNG." : new TextEncoder().encode(file.name).length > 255 ? "Tên tài liệu quá dài (tối đa 255 byte)." : null;
  const save = useMutation({ mutationFn: async () => {
    if (!file || fileError) throw Error(fileError ?? "Vui lòng chọn tài liệu");
    if (["customer", "project", "task"].includes(scope.type) && !scope.item) throw Error("Vui lòng chọn hồ sơ cần gắn tài liệu");
    const data = new FormData(); data.set("file", file);
    if (scope.type === "general") data.set("context", "general");
    else if (scope.item) data.set(`${scope.type}_id`, scope.item.id);
    return administrationApi.uploadDocument(data);
  }, onSuccess: async () => { await refresh(); uploaded(); } });
  const contextKind = scope.type === "customer" || scope.type === "project" || scope.type === "task" ? scope.type : null;
  return <Dialog open fullWidth maxWidth="sm" onClose={save.isPending ? undefined : close} aria-labelledby="upload-document-title"><form onSubmit={(event) => { event.preventDefault(); save.mutate(); }}>
    <DialogTitle id="upload-document-title">Tải tài liệu lên</DialogTitle>
    <DialogContent>
      <p>Chọn hồ sơ để tài liệu xuất hiện ngay trong danh sách liên quan. Chấp nhận PDF, JPG hoặc PNG; tối đa 10 MB.</p>
      <TextField fullWidth select label="Lưu tài liệu vào" margin="normal" value={scope.type} disabled={save.isPending} onChange={(event) => setScope({ type: event.target.value as ScopeFilter, item: null })}>
        <MenuItem value="general">Tài liệu chung</MenuItem><MenuItem value="customer">Hồ sơ khách hàng</MenuItem><MenuItem value="project">Hồ sơ dự án</MenuItem><MenuItem value="task">Hồ sơ công việc</MenuItem>
      </TextField>
      {contextKind && <DocumentContextPicker type={contextKind} value={scope.item} onChange={(item) => setScope((current) => ({ ...current, item }))} disabled={save.isPending} />}
      <TextField fullWidth type="file" label="Chọn tài liệu" disabled={save.isPending} onChange={(event) => { const target = event.target; if (target instanceof HTMLInputElement) { setFile(target.files?.[0] ?? null); save.reset(); } }} slotProps={{ inputLabel: { shrink: true }, htmlInput: { accept: ".pdf,.png,.jpg,.jpeg" } }} />
      {fileError && <Alert severity="error">{fileError}</Alert>}
      <AdministrationError error={save.error} />
    </DialogContent>
    <DialogActions><Button disabled={save.isPending} onClick={close}>Hủy</Button><Button type="submit" variant="contained" disabled={save.isPending || !file || Boolean(fileError) || Boolean(contextKind && !scope.item)}>{save.isPending ? "Đang tải lên…" : "Tải lên"}</Button></DialogActions>
  </form></Dialog>;
}

export function DocumentsScreen() {
  return <Suspense fallback={<p role="status">Đang mở tài liệu…</p>}><DocumentsContent /></Suspense>;
}
