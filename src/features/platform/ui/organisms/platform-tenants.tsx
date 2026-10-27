"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, TextField } from "@mui/material";
import { platformApi } from "../../api/platform.api";
import { usePlatformQuery } from "../../hooks/use-platform";
import { tenantHref } from "../../model/platform-navigation";
import type { TenantFilters } from "../../model/tenant-contracts";
import { TenantCreationDialog } from "./tenant-creation-dialog";
import { usePlatformAccess, useRefreshPlatform } from "../../hooks/use-platform";
import { subscriptionLabels, planPrice } from "../../model/tenant-format";
import { PlatformEmpty, PlatformError, PlatformLoading, PlatformPagination, PlatformUnavailable } from "./platform-feedback";

export function PlatformTenants({ preview }: { preview: boolean }) {
  const router = useRouter(), access = usePlatformAccess(preview), refresh = useRefreshPlatform();
  const [createOpen, setCreateOpen] = useState(false);
  const [filters, setFilters] = useState<TenantFilters>({ page: 1, limit: 15, q: "" });
  const [search, setSearch] = useState("");
  const query = usePlatformQuery(["tenants", filters], "platform.tenants.read", (signal) => platformApi.tenants(filters, signal), preview);
  const data = query.allowed && !query.error ? query.data : undefined;
  return <><div className="platform-section-toolbar"><div><span className="platform-count-label">{data ? `${data.pagination.total.toLocaleString("vi-VN")} tenant` : "Danh sách tenant"}</span><p>Mở một tenant để xem thông tin, Admin, tài nguyên và gói đang sử dụng.</p></div>{access.can("platform.tenants.manage") && <Button variant="contained" onClick={() => setCreateOpen(true)}>Thêm tenant</Button>}</div>
    <section className="platform-panel"><form className="platform-filters" onSubmit={(event) => { event.preventDefault(); setFilters({ ...filters, q: search.trim(), page: 1 }); }}><TextField label="Tìm tenant" placeholder="Tên hoặc mã tenant" size="small" value={search} onChange={(event) => setSearch(event.target.value)} slotProps={{ htmlInput: { maxLength: 200 } }} /><Button type="submit" variant="outlined">Tìm kiếm</Button><Button onClick={() => { setSearch(""); setFilters({ ...filters, page: 1, q: "" }); }}>Xóa bộ lọc</Button><Button disabled={preview || !query.allowed || query.isFetching} onClick={() => query.refetch()}>Tải lại</Button></form>
      <PlatformUnavailable preview={preview} allowed={query.allowed} />
      {!preview && query.allowed && query.isPending && <PlatformLoading />}
      {!preview && query.allowed && <PlatformError error={query.error} retry={() => query.refetch()} />}
      {data && <><div className="platform-table-scroll"><table><caption className="platform-sr-only">Danh sách tenant và gói cước hiện tại</caption><thead><tr><th scope="col">Tenant</th><th scope="col">Thành viên / Admin</th><th scope="col">Gói cước</th><th scope="col">Đăng ký gói</th><th scope="col">Trạng thái tenant</th><th scope="col">Chi tiết</th></tr></thead><tbody>{data.items.map((tenant) => <tr key={tenant.id}><td><Link className="tenant-name-link" href={tenantHref(preview, tenant.id)}><span className="platform-person-avatar">{tenant.name.slice(0, 2).toUpperCase()}</span><span><strong>{tenant.name}</strong><small>{tenant.slug}</small></span></Link></td><td><strong>{tenant.member_count.toLocaleString("vi-VN")}</strong> thành viên<small className="tenant-table-meta">{tenant.admin_count} Admin</small></td><td>{tenant.subscription ? <><strong>{tenant.subscription.plan.name}</strong><small className="tenant-table-meta">{planPrice(tenant.subscription.plan.price_amount, tenant.subscription.plan.currency)}</small></> : <span className="platform-badge inactive">Chưa gán gói</span>}</td><td>{tenant.subscription ? <span className={`platform-badge ${tenant.subscription.status === "ACTIVE" ? "active" : "inactive"}`}>{subscriptionLabels[tenant.subscription.status]}</span> : "—"}</td><td><span className="platform-badge active">Đang hoạt động</span></td><td><Button component={Link} href={tenantHref(preview, tenant.id)}>Xem tenant</Button></td></tr>)}</tbody></table></div>{!data.items.length && <PlatformEmpty title="Không tìm thấy tenant" description="Thử tên hoặc mã tenant khác. Danh sách chỉ hiển thị đơn vị có phạm vi dữ liệu được hỗ trợ." />}<PlatformPagination page={data.pagination.page} total={data.pagination.total} limit={data.pagination.limit} pending={query.isFetching} onPage={(page) => setFilters({ ...filters, page })} /></>}
    </section><div className="platform-section-note">Mỗi tenant có mã đăng nhập và vùng dữ liệu riêng. Tài khoản Admin đầu tiên được tạo cùng tenant.</div>
    {createOpen && <TenantCreationDialog onClose={() => setCreateOpen(false)} onCreated={(tenant) => { setCreateOpen(false); router.push(tenantHref(false, tenant.id)); void refresh(); void query.refetch(); }} />}
  </>;
}
