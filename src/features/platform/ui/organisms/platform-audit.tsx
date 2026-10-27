"use client";

import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import { platformApi } from "../../api/platform.api";
import { usePlatformQuery } from "../../hooks/use-platform";
import type { AuditFilters, PlatformAuditEvent } from "../../model/platform-contracts";
import { PlatformEmpty, PlatformError, PlatformLoading, PlatformPagination, PlatformUnavailable, platformDate } from "./platform-feedback";

const actionName = (action: string) => action === "POST" ? "Tạo tài khoản" : action === "PATCH" ? "Cập nhật cấu hình" : action === "PUT" ? "Cập nhật gói tenant" : action;
export function PlatformAudit({ preview }: { preview: boolean }) {
  const [filters, setFilters] = useState<AuditFilters>({ page: 1, limit: 20, q: "", action: "" });
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<PlatformAuditEvent | null>(null);
  const query = usePlatformQuery(["audit", filters], "platform.audit.read", (signal) => platformApi.audit(filters, signal), preview);
  const data = query.allowed ? query.data : undefined;
  return <section className="platform-panel"><header><div><h2>Nhật ký quản trị hệ thống</h2><p>Các thao tác tạo, thay đổi vai trò và trạng thái tài khoản quản trị.</p></div><Button disabled={preview || !query.allowed || query.isFetching} onClick={() => query.refetch()}>Tải lại</Button></header><form className="platform-filters" onSubmit={(event) => { event.preventDefault(); setFilters({ ...filters, q: search.trim(), page: 1 }); }}><TextField size="small" label="Tìm nhật ký" placeholder="Người thực hiện, đường dẫn hoặc mã đối tượng" value={search} onChange={(event) => setSearch(event.target.value)} slotProps={{ htmlInput: { maxLength: 200 } }} /><TextField select size="small" label="Thao tác" value={filters.action} onChange={(event) => setFilters({ ...filters, action: event.target.value, page: 1 })}><MenuItem value="">Tất cả thao tác</MenuItem><MenuItem value="POST">Tạo tài khoản</MenuItem><MenuItem value="PATCH">Cập nhật cấu hình</MenuItem><MenuItem value="PUT">Cập nhật gói tenant</MenuItem></TextField><Button type="submit" variant="outlined">Tìm kiếm</Button><Button onClick={() => { setSearch(""); setFilters({ ...filters, q: "", action: "", page: 1 }); }}>Xóa bộ lọc</Button></form>
    <PlatformUnavailable preview={preview} allowed={query.allowed} />
    {query.allowed && !preview && query.isPending && <PlatformLoading />}
    {query.allowed && !preview && <PlatformError error={query.error} retry={() => query.refetch()} />}
    {data && !query.error && <><div className="platform-table-scroll"><table><caption className="platform-sr-only">Lịch sử thao tác quản trị hệ thống</caption><thead><tr><th scope="col">Thời gian</th><th scope="col">Người thực hiện</th><th scope="col">Thao tác</th><th scope="col">Đối tượng</th><th scope="col">Chi tiết</th></tr></thead><tbody>{data.items.map((event) => <tr key={event.id}><td>{platformDate(event.created_at)}</td><td><strong>{event.actor_name || "Hệ thống"}</strong></td><td><span className={`platform-badge ${event.action === "POST" ? "active" : "admin"}`}>{actionName(event.action)}</span></td><td><span className="platform-entity-id">#{event.entity_id}</span></td><td><Button size="small" onClick={() => setDetail(event)}>Xem chi tiết</Button></td></tr>)}</tbody></table></div>{!data.items.length && <PlatformEmpty title="Chưa có nhật ký phù hợp" description="Thử đổi bộ lọc hoặc quay lại sau khi có thao tác quản trị mới." />}<PlatformPagination page={data.pagination.page} total={data.pagination.total} limit={data.pagination.limit} pending={query.isFetching} onPage={(page) => setFilters({ ...filters, page })} /></>}
    {detail && query.allowed && <Dialog open fullWidth maxWidth="sm" onClose={() => setDetail(null)} aria-labelledby="platform-audit-detail-title"><DialogTitle id="platform-audit-detail-title">Chi tiết thao tác quản trị</DialogTitle><DialogContent><dl className="platform-detail-list">{[["Mã bản ghi", detail.id], ["Người thực hiện", detail.actor_name || "Hệ thống"], ["Mã người thực hiện", detail.actor_id], ["Thao tác", actionName(detail.action)], ["Đường dẫn", detail.route], ["Mã đối tượng", detail.entity_id], ["Thời gian", platformDate(detail.created_at)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></DialogContent><DialogActions><Button onClick={() => setDetail(null)}>Đóng</Button></DialogActions></Dialog>}
  </section>;
}
