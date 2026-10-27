"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { Alert, Button } from "@mui/material";
import { platformApi } from "../../api/platform.api";
import { usePlatformQuery, useRefreshPlatform } from "../../hooks/use-platform";
import { platformHref, resolveTenantTab, tenantHref, tenantTabs } from "../../model/platform-navigation";
import { planPrice, resourceCount, storageSize, subscriptionLabels } from "../../model/tenant-format";
import { PlatformError, PlatformLoading, PlatformUnavailable, platformDate } from "./platform-feedback";
import { TenantResources } from "./tenant-resources";
import { TenantMembers } from "./tenant-members";
import { TenantActivity } from "./tenant-activity";
import { TenantSubscriptionEditor } from "./tenant-subscription-editor";
import { TenantWorkspaceView } from "./tenant-workspace-view";
import type { TenantViewSession } from "../../model/tenant-view";

export function TenantDetailScreen({ tenantId, tab: tabParam, preview }: { tenantId: string; tab?: string | string[]; preview: boolean }) {
  const tab = resolveTenantTab(tabParam), refresh = useRefreshPlatform();
  const query = usePlatformQuery(["tenant", tenantId], "platform.tenants.read", (signal) => platformApi.tenant(tenantId, signal), preview);
  const data = query.allowed && !query.error ? query.data : undefined;
  const [editing, setEditing] = useState(false), [success, setSuccess] = useState("");
  const [viewSession, setViewSession] = useState<TenantViewSession | null>(null);
  const startView = useMutation({ mutationFn: () => platformApi.startTenantView(tenantId), onSuccess: setViewSession, retry: false });
  if (viewSession && data && query.access.can("platform.tenants.manage")) return <TenantWorkspaceView key={viewSession.id} name={data.name} session={viewSession} onExit={() => { setViewSession(null); void query.refetch(); }} />;
  return <>
    <div className="tenant-detail-breadcrumb"><Link href={platformHref(preview, "tenants")}>Danh sách tenant</Link><span aria-hidden="true">/</span><span>{data?.name ?? "Chi tiết tenant"}</span></div>
    <PlatformUnavailable preview={preview} allowed={query.allowed} />
    {!preview && query.allowed && query.isPending && <PlatformLoading />}
    {!preview && query.allowed && <PlatformError error={query.error} retry={() => query.refetch()} />}
    <PlatformError error={startView.error} retry={() => startView.mutate()} />
    {data && query.access.can("platform.tenants.manage") && <div className="platform-section-toolbar"><p>Truy cập dữ liệu nghiệp vụ bằng phiên chỉ xem, có thời hạn và ghi nhật ký.</p><Button variant="contained" disabled={startView.isPending} onClick={() => startView.mutate()}>{startView.isPending ? "Đang mở phiên…" : "Truy cập tenant"}</Button></div>}
    {data && <><div className="tenant-detail-heading"><div className="tenant-detail-identity"><span className="platform-organization-avatar">{data.name.slice(0, 2).toUpperCase()}</span><div><h2>{data.name}</h2><p>{data.slug} <span className="platform-badge active">Đang hoạt động</span></p></div></div><Button disabled={query.isFetching} onClick={() => refresh()}>Làm mới tenant</Button></div>
      <nav className="tenant-detail-tabs" aria-label="Nội dung tenant">{tenantTabs.map((item) => <Link key={item.id} href={tenantHref(preview, tenantId, item.id)} aria-current={tab === item.id ? "page" : undefined}>{item.label}</Link>)}</nav>
      {success && <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>{success}</Alert>}
      <div key={`${tenantId}:${tab}`}>
        {tab === "overview" && <><div className="tenant-summary-metrics">{[["Thành viên", resourceCount(data.usage.members_total)], ["Dự án", resourceCount(data.usage.projects_total)], ["Công việc", resourceCount(data.usage.tasks_total)], ["Lưu trữ đã ghi nhận", storageSize(data.usage.storage.recorded_bytes)]].map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div><div className="tenant-overview-grid"><section className="platform-panel"><header><div><h2>Thông tin tenant</h2><p>Thông tin đơn vị đang vận hành trong hệ thống.</p></div></header><div className="platform-organization-body"><dl className="platform-detail-list">{[["ID tenant", data.id], ["Mã tenant", data.slug], ["Trạng thái", "Đang hoạt động"], ["Tên đơn vị", data.name], ["Email", data.contact.email || "Chưa cập nhật"], ["Điện thoại", data.contact.phone || "Chưa cập nhật"], ["Địa chỉ", data.contact.address || "Chưa cập nhật"], ["Ngày ghi nhận tenant", platformDate(data.created_at)], ["Cập nhật", platformDate(data.updated_at)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div></section><section className="platform-panel"><header><div><h2>Gói đang đăng ký</h2><p>Phí niêm yết, trạng thái và thời gian hiệu lực.</p></div><Button component={Link} href={tenantHref(preview, tenantId, "subscription")}>Xem gói</Button></header><div className="tenant-subscription-summary">{data.subscription ? <><h3>{data.subscription.plan.name}</h3><div className="tenant-subscription-price"><strong>{planPrice(data.subscription.plan.price_amount, data.subscription.plan.currency)}</strong>{data.subscription.plan.billing_interval && <span>/{data.subscription.plan.billing_interval === "MONTHLY" ? "tháng" : "năm"}</span>}</div><span className={`platform-badge ${data.subscription.status === "ACTIVE" ? "active" : "inactive"}`}>{subscriptionLabels[data.subscription.status]}</span><p>Ngày kết thúc: {data.subscription.ends_at ? platformDate(data.subscription.ends_at) : "Chưa đặt"}</p></> : <><h3>Chưa gán gói cước</h3><p>Tenant chưa có đăng ký gói. Các hạn mức và mức phí chưa được xác định.</p><Button component={Link} href={tenantHref(preview, tenantId, "subscription")} variant="outlined">Thiết lập gói</Button></>}</div></section></div><section className="platform-panel"><header><div><h2>Admin của tenant</h2><p>{data.admin_count} tài khoản Admin quản trị nghiệp vụ.</p></div><Button component={Link} href={tenantHref(preview, tenantId, "members")}>Xem thành viên</Button></header><div className="tenant-admins">{data.admins.length ? data.admins.map((admin) => <div key={admin.id}><span className="platform-person-avatar">{admin.display_name.slice(0, 2).toUpperCase()}</span><span><strong>{admin.display_name}</strong><small>{admin.email || admin.username}</small></span><span className={`platform-badge ${admin.is_active && !admin.is_locked ? "active" : "inactive"}`}>{admin.is_locked ? "Khóa đăng nhập" : admin.is_active ? "Hoạt động" : "Vô hiệu hóa"}</span></div>) : <p>Chưa có Admin được ghi nhận.</p>}</div></section></>}
        {tab === "members" && <TenantMembers tenantId={tenantId} />}
        {tab === "resources" && <TenantResources usage={data.usage} subscription={data.subscription} />}
        {tab === "subscription" && <section className="platform-panel"><header><div><h2>Đăng ký gói cước</h2><p>Xem và cập nhật gói, trạng thái, thời gian hiệu lực của tenant.</p></div>{query.access.can("platform.tenants.manage") && <Button variant="contained" onClick={() => setEditing(true)}>{data.subscription ? "Cập nhật đăng ký" : "Gán gói cước"}</Button>}</header><div className="platform-organization-body">{data.subscription ? <><h3>{data.subscription.plan.name}</h3><dl className="platform-detail-list">{[["Mã gói", data.subscription.plan.code], ["Phí niêm yết", planPrice(data.subscription.plan.price_amount, data.subscription.plan.currency)], ["Chu kỳ", data.subscription.plan.billing_interval === "MONTHLY" ? "Theo tháng" : data.subscription.plan.billing_interval === "YEARLY" ? "Theo năm" : "Chưa cấu hình"], ["Trạng thái", subscriptionLabels[data.subscription.status]], ["Bắt đầu", data.subscription.starts_at ? platformDate(data.subscription.starts_at) : "Chưa đặt"], ["Kết thúc", data.subscription.ends_at ? platformDate(data.subscription.ends_at) : "Chưa đặt"], ["Thành viên tối đa", data.subscription.plan.limits.members === null ? "Không giới hạn" : resourceCount(data.subscription.plan.limits.members)], ["Dự án tối đa", data.subscription.plan.limits.projects === null ? "Không giới hạn" : resourceCount(data.subscription.plan.limits.projects)], ["Lưu trữ tối đa", data.subscription.plan.limits.storage_bytes === null ? "Không giới hạn" : storageSize(data.subscription.plan.limits.storage_bytes)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{!data.subscription.plan.is_active && <Alert severity="warning" sx={{ mb: 2 }}>Gói này đã ngừng gán mới. Đăng ký hiện tại vẫn được giữ lại.</Alert>}</> : <p>Tenant chưa được gán gói cước. Hãy tạo gói trong danh mục rồi gán cho tenant.</p>}<Alert severity="info">Quyền tính năng và hạn mức được kiểm tra ở máy chủ. Gói hết hạn, bị dừng hoặc chưa cấu hình tính năng sẽ chặn nghiệp vụ. Hạ gói không xóa dữ liệu cũ. Chưa có thanh toán tự động.</Alert></div></section>}
        {tab === "activity" && <TenantActivity tenantId={tenantId} />}
      </div>
      <div className="platform-section-note">Tenant này đang sử dụng phạm vi dữ liệu của đơn vị hiện tại. Chưa có cơ chế vận hành nhiều tenant với dữ liệu nghiệp vụ được cô lập.</div>
      {editing && query.access.can("platform.tenants.manage") && <TenantSubscriptionEditor usage={data.usage} tenantId={tenantId} current={data.subscription} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); setSuccess("Đã cập nhật đăng ký gói cho tenant."); }} />}
    </>}
  </>;
}
