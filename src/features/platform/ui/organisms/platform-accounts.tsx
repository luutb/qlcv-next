"use client";

import { useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import { platformApi } from "../../api/platform.api";
import { usePlatformQuery } from "../../hooks/use-platform";
import type { AccountFilters, PlatformAccount } from "../../model/platform-contracts";
import { PlatformAccountEditor, PlatformAccountStatusDialog } from "./platform-account-editor";
import { PlatformEmpty, PlatformError, PlatformLoading, PlatformPagination, PlatformUnavailable, platformDate } from "./platform-feedback";

export function PlatformAccounts({ preview }: { preview: boolean }) {
  const [filters, setFilters] = useState<AccountFilters>({ page: 1, limit: 15, q: "", role: "", is_active: "" });
  const [search, setSearch] = useState("");
  const query = usePlatformQuery(["accounts", filters], "platform.admins.read", (signal) => platformApi.accounts(filters, signal), preview);
  const [editing, setEditing] = useState<{ account?: PlatformAccount } | null>(null);
  const [status, setStatus] = useState<PlatformAccount | null>(null);
  const [detail, setDetail] = useState<PlatformAccount | null>(null);
  const [success, setSuccess] = useState("");
  const canManage = query.access.can("platform.admins.manage");
  const closeSaved = (message: string) => { setEditing(null); setStatus(null); setSuccess(message); };
  const reset = () => { setSearch(""); setFilters({ page: 1, limit: 15, q: "", role: "", is_active: "" }); };
  const data = query.allowed ? query.data : undefined;
  const available = !preview && query.allowed;
  return <>
    <div className="platform-section-toolbar"><div><span className="platform-count-label">{data ? `${data.pagination.total.toLocaleString("vi-VN")} tài khoản quản trị` : "Admin và Super Admin"}</span><p>Vai trò được tách riêng; chỉ Super Admin được quản lý tài khoản cấp hệ thống.</p></div><Button variant="contained" onClick={() => setEditing({})} disabled={!preview && !canManage}>Tạo tài khoản</Button></div>
    {success && <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>{success}</Alert>}
    <section className="platform-panel"><form className="platform-filters" onSubmit={(event) => { event.preventDefault(); setFilters({ ...filters, page: 1, q: search.trim() }); }}>
      <TextField label="Tìm tài khoản" placeholder="Tên, tài khoản hoặc email" size="small" value={search} onChange={(event) => setSearch(event.target.value)} slotProps={{ htmlInput: { maxLength: 200 } }} />
      <TextField select size="small" label="Vai trò" value={filters.role} onChange={(event) => { const role = event.target.value; if (role === "" || role === "ADMIN" || role === "SUPER_ADMIN") setFilters({ ...filters, role, page: 1 }); }}><MenuItem value="">Tất cả vai trò</MenuItem><MenuItem value="ADMIN">Admin</MenuItem><MenuItem value="SUPER_ADMIN">Super Admin</MenuItem></TextField>
      <TextField select size="small" label="Trạng thái" value={filters.is_active} onChange={(event) => { const value = event.target.value; if (value === "" || value === "true" || value === "false") setFilters({ ...filters, is_active: value, page: 1 }); }}><MenuItem value="">Tất cả trạng thái</MenuItem><MenuItem value="true">Đang kích hoạt</MenuItem><MenuItem value="false">Đã vô hiệu hóa</MenuItem></TextField>
      <Button type="submit" variant="outlined">Tìm kiếm</Button><Button onClick={reset}>Xóa bộ lọc</Button><Button disabled={!available || query.isFetching} onClick={() => query.refetch()}>Tải lại</Button>
    </form>
    <PlatformUnavailable preview={preview} allowed={query.allowed} />
    {available && query.isPending && <PlatformLoading />}
    {available && <PlatformError error={query.error} retry={() => query.refetch()} />}
    {data && !query.error && <><div className="platform-table-scroll"><table><caption className="platform-sr-only">Danh sách tài khoản quản trị</caption><thead><tr><th scope="col">Tài khoản</th><th scope="col">Vai trò</th><th scope="col">Trạng thái</th><th scope="col">Đăng nhập gần nhất</th><th scope="col">Thao tác</th></tr></thead><tbody>{data.items.map((account) => <tr key={account.id}>
      <td><button className="platform-person-link" onClick={() => setDetail(account)}><span className={`platform-person-avatar ${account.role === "SUPER_ADMIN" ? "system" : ""}`}>{account.display_name.slice(0, 2).toUpperCase()}</span><span><strong>{account.display_name}</strong><small>{account.username}{account.id === query.access.user.data?.id ? " · Bạn" : ""}</small><small>{account.email ?? "Chưa có email"}</small></span></button></td>
      <td><span className={`platform-badge ${account.role === "SUPER_ADMIN" ? "system" : "admin"}`}>{account.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}</span></td>
      <td><span className={`platform-badge ${account.is_active && !account.is_locked ? "active" : "inactive"}`}>{account.is_locked ? "Đã khóa đăng nhập" : account.is_active ? "Hoạt động" : "Vô hiệu hóa"}</span></td><td>{platformDate(account.last_login_at)}</td>
      <td><div className="platform-row-actions"><Button size="small" onClick={() => setDetail(account)}>Chi tiết</Button>{canManage && <><Button size="small" onClick={() => { setSuccess(""); setEditing({ account }); }}>Sửa</Button><Button size="small" color={account.is_active ? "error" : "primary"} disabled={account.id === query.access.user.data?.id || account.is_locked} onClick={() => setStatus(account)}>{account.is_active ? "Vô hiệu hóa" : "Kích hoạt"}</Button></>}</div></td>
    </tr>)}</tbody></table></div>{!data.items.length && <PlatformEmpty title="Không tìm thấy tài khoản" description="Thử thay đổi tên tìm kiếm, vai trò hoặc trạng thái lọc." action={<Button onClick={reset}>Xóa bộ lọc</Button>} />}<PlatformPagination page={data.pagination.page} total={data.pagination.total} limit={data.pagination.limit} pending={query.isFetching} onPage={(page) => setFilters({ ...filters, page })} /></>}
    </section>
    <div className="platform-section-note">Bạn không thể tự vô hiệu hóa tài khoản đang đăng nhập. Hệ thống bảo vệ Super Admin hoạt động cuối cùng.</div>
    {editing && (preview || canManage) && <PlatformAccountEditor account={editing.account} preview={preview} onClose={() => setEditing(null)} onSaved={closeSaved} />}
    {status && canManage && <PlatformAccountStatusDialog account={status} onClose={() => setStatus(null)} onSaved={closeSaved} />}
    {detail && query.allowed && <Dialog open fullWidth maxWidth="sm" onClose={() => setDetail(null)} aria-labelledby="platform-account-detail-title"><DialogTitle id="platform-account-detail-title">Chi tiết tài khoản</DialogTitle><DialogContent><dl className="platform-detail-list">{[["Tên hiển thị", detail.display_name], ["Tên đăng nhập", detail.username], ["Email", detail.email ?? "Chưa cập nhật"], ["Vai trò", detail.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"], ["Phạm vi", detail.role === "SUPER_ADMIN" ? "Quản trị nền tảng" : "Nghiệp vụ đơn vị"], ["Trạng thái", detail.is_locked ? "Đã khóa đăng nhập" : detail.is_active ? "Đang hoạt động" : "Vô hiệu hóa"], ["Ngày tạo", platformDate(detail.created_at)], ["Cập nhật gần nhất", platformDate(detail.updated_at)], ["Đăng nhập gần nhất", platformDate(detail.last_login_at)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></DialogContent><DialogActions><Button onClick={() => setDetail(null)}>Đóng</Button></DialogActions></Dialog>}
  </>;
}
