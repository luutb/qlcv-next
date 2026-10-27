"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Alert, Button, TextField } from "@mui/material";
import { platformApi } from "../../api/platform.api";
import { usePlatformQuery } from "../../hooks/use-platform";
import { tenantViewResources, type TenantViewResource, type TenantViewSession } from "../../model/tenant-view";
import { PlatformEmpty, PlatformError, PlatformLoading, PlatformPagination, platformDate } from "./platform-feedback";

export function TenantWorkspaceView({ name, session, onExit }: { name: string; session: TenantViewSession; onExit: () => void }) {
  const [resource, setResource] = useState<TenantViewResource>("projects");
  const [page, setPage] = useState(1), [search, setSearch] = useState(""), [q, setQ] = useState("");
  const [expired, setExpired] = useState(() => Date.now() >= Date.parse(session.expires_at));
  useEffect(() => {
    const timer = window.setTimeout(() => setExpired(true), Math.max(0, Date.parse(session.expires_at) - Date.now()));
    return () => { window.clearTimeout(timer); };
  }, [session.expires_at]);
  // No cache survives the last viewer observer. TanStack owns cancellation/GC,
  // including React development effect replay; cleanup never removes an active query.
  const query = usePlatformQuery(["tenant-view", session.tenant_id, session.id, resource, page, q], "platform.tenants.manage", (signal) => platformApi.tenantViewData(session.tenant_id, session.id, resource, { page, limit: 15, q }, signal), expired, { gcTime: 0 });
  const data = !expired && query.allowed && !query.error ? query.data : undefined;
  const close = useMutation({ mutationFn: () => platformApi.closeTenantView(session.tenant_id, session.id), onSuccess: onExit, retry: false });
  return <section aria-label={`Không gian tenant ${name}`}>
    <Alert severity="info" sx={{ mb: 2 }}><strong>Đang xem tenant {name} · Chỉ xem</strong><p>Phiên của Super Admin, hết hạn lúc {platformDate(session.expires_at)}. Không thể chỉnh sửa dữ liệu nghiệp vụ.</p><Button disabled={close.isPending} onClick={() => close.mutate()}>{close.isPending ? "Đang kết thúc…" : "Thoát về quản trị tenant"}</Button></Alert>
    {close.error && <><PlatformError error={close.error} retry={() => close.mutate()} /><Button onClick={onExit}>Rời màn hình (phiên tự hết hạn)</Button></>}
    {expired ? <Alert severity="warning">Phiên xem đã hết hạn. Thoát về tenant và mở phiên mới để tiếp tục.</Alert> : <>
      <div className="tenant-detail-tabs" role="group" aria-label="Dữ liệu nghiệp vụ">{tenantViewResources.map((item) => <Button key={item.id} aria-pressed={resource === item.id} variant={resource === item.id ? "contained" : "text"} onClick={() => { setResource(item.id); setPage(1); setSearch(""); setQ(""); }}>{item.label}</Button>)}</div>
      <section className="platform-panel"><header><div><h2>{tenantViewResources.find((item) => item.id === resource)?.label} của {name}</h2><p>Mở “Chi tiết” để xem các trường dữ liệu của từng bản ghi.</p></div></header>
        <form className="platform-filters" onSubmit={(event) => { event.preventDefault(); setPage(1); setQ(search.trim()); }}><TextField label="Tìm theo tên" size="small" value={search} onChange={(event) => setSearch(event.target.value)} slotProps={{ htmlInput: { maxLength: 200 } }} /><Button type="submit">Tìm kiếm</Button><Button onClick={() => { setQ(""); setSearch(""); setPage(1); }}>Xóa bộ lọc</Button><Button disabled={query.isFetching || !query.allowed} onClick={() => query.refetch()}>Tải lại</Button></form>
        {query.isPending && query.allowed && <PlatformLoading />}<PlatformError error={query.error} retry={() => query.refetch()} />
        {!query.allowed && <Alert severity="warning">Bạn không còn quyền truy cập phiên xem tenant.</Alert>}
        {data && <>{data.unavailable_fields.length > 0 && <Alert severity="info">Chưa có dữ liệu cho các trường: {data.unavailable_fields.join(", ")}. Các trường này không được tính là 0.</Alert>}
          <div className="platform-table-scroll"><table><caption className="platform-sr-only">Dữ liệu tenant ở chế độ chỉ xem</caption><thead><tr><th scope="col">ID</th><th scope="col">Tên</th><th scope="col">Thông tin</th></tr></thead><tbody>{data.items.map((item) => <tr key={item.id}><td>{item.id}</td><td>{item.name ?? item.title ?? item.full_name ?? item.file_name ?? "—"}</td><td><details><summary>Chi tiết</summary><dl className="platform-detail-list">{data.columns.map((column) => <div key={column.key}><dt>{column.label}</dt><dd style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{item[column.key] ?? "Chưa ghi nhận"}</dd></div>)}</dl></details></td></tr>)}</tbody></table></div>
          {!data.items.length && <PlatformEmpty title="Không có bản ghi phù hợp" description="Thử thay đổi từ khóa hoặc chọn nhóm dữ liệu khác." />}<PlatformPagination page={data.pagination.page} total={data.pagination.total} limit={data.pagination.limit} pending={query.isFetching} onPage={setPage} />
        </>}
      </section><p className="platform-section-note">Tài liệu ở đây là thông tin mô tả tệp. Phiên xem không cung cấp tải tệp hoặc hồ sơ nhân sự. Nếu rời trang mà chưa kết thúc, phiên tự hết hạn sau 15 phút.</p>
    </>}
  </section>;
}
