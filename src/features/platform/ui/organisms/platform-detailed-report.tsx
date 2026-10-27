"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@mui/material";
import { platformApi } from "../../api/platform.api";
import { usePlatformQuery } from "../../hooks/use-platform";
import { platformHref, tenantHref } from "../../model/platform-navigation";
import { subscriptionLabels } from "../../model/tenant-format";
import { PlatformEmpty, PlatformError, PlatformLoading, PlatformPagination, platformDate } from "./platform-feedback";

export function PlatformDetailedReport({ preview }: { preview: boolean }) {
  const [page, setPage] = useState(1);
  const tenants = usePlatformQuery(["report-tenants", page], "platform.tenants.read", (signal) => platformApi.tenants({ page, limit: 10, q: "" }, signal), preview);
  const plans = usePlatformQuery(["report-plans", "active"], "platform.plans.read", (signal) => platformApi.plans({ page: 1, limit: 1, q: "", is_active: "true" }, signal), preview);
  const inactivePlans = usePlatformQuery(["report-plans", "inactive"], "platform.plans.read", (signal) => platformApi.plans({ page: 1, limit: 1, q: "", is_active: "false" }, signal), preview);
  const audit = usePlatformQuery(["report-audit"], "platform.audit.read", (signal) => platformApi.audit({ page: 1, limit: 5, q: "", action: "" }, signal), preview);
  const tenantData = tenants.allowed && !tenants.error ? tenants.data : undefined;
  const auditData = audit.allowed && !audit.error ? audit.data : undefined;
  return <>
    {plans.allowed && <section className="platform-panel"><header><div><h2>Thiết lập gói cước</h2><p>Số lượng trên toàn bộ danh mục gói; quyền và hạn mức được áp dụng ở máy chủ.</p></div><Button component={Link} href={platformHref(preview, "plans")}>Quản lý gói cước</Button></header>
      <PlatformError error={plans.error} retry={() => plans.refetch()} /><PlatformError error={inactivePlans.error} retry={() => inactivePlans.refetch()} />
      {(plans.isPending || inactivePlans.isPending) && <PlatformLoading />}
      <div className="tenant-summary-metrics"><article><span>Cho phép gán</span><strong>{!plans.error ? plans.data?.pagination.total.toLocaleString("vi-VN") ?? "—" : "—"}</strong></article><article><span>Ngừng gán mới</span><strong>{!inactivePlans.error ? inactivePlans.data?.pagination.total.toLocaleString("vi-VN") ?? "—" : "—"}</strong></article></div>
      {!plans.error && !inactivePlans.error && plans.data?.pagination.total === 0 && inactivePlans.data?.pagination.total === 0 && <PlatformEmpty title="Chưa thiết lập gói cước" description="Tạo gói với phí, chu kỳ và hạn mức, sau đó mở tenant để gán gói và thời gian hiệu lực." action={<Button component={Link} href={platformHref(preview, "plans")}>Thiết lập gói đầu tiên</Button>} />}
    </section>}
    {tenants.allowed && <section className="platform-panel"><header><div><h2>Báo cáo tenant và đăng ký</h2><p>Chi tiết theo từng tenant, 10 đơn vị mỗi trang. Mở tenant để xem tài nguyên và hạn mức.</p></div><Button disabled={tenants.isFetching} onClick={() => tenants.refetch()}>Cập nhật báo cáo</Button></header>
      {tenants.isPending && <PlatformLoading />}<PlatformError error={tenants.error} retry={() => tenants.refetch()} />
      {tenantData && <><div className="platform-table-scroll"><table><caption className="platform-sr-only">Thành viên, quản trị viên và hiệu lực gói của từng tenant</caption><thead><tr><th scope="col">Tenant</th><th scope="col">Thành viên</th><th scope="col">Admin</th><th scope="col">Gói cước</th><th scope="col">Trạng thái đăng ký</th><th scope="col">Kết thúc</th><th scope="col">Chi tiết</th></tr></thead><tbody>{tenantData.items.map((tenant) => <tr key={tenant.id}><td><Link href={tenantHref(preview, tenant.id)}>{tenant.name}</Link><small className="tenant-table-meta">{tenant.slug}</small></td><td>{tenant.member_count.toLocaleString("vi-VN")}</td><td>{tenant.admin_count.toLocaleString("vi-VN")}</td><td>{tenant.subscription?.plan.name ?? "Chưa gán gói"}</td><td>{tenant.subscription ? subscriptionLabels[tenant.subscription.status] : "Chưa đăng ký"}</td><td>{tenant.subscription?.ends_at ? platformDate(tenant.subscription.ends_at) : "Chưa đặt"}</td><td><Button component={Link} href={tenantHref(preview, tenant.id, "resources")}>Tài nguyên</Button><Button component={Link} href={tenantHref(preview, tenant.id, "subscription")}>Gói cước</Button></td></tr>)}</tbody></table></div>{!tenantData.items.length && <PlatformEmpty title="Chưa có tenant" description="Báo cáo sẽ xuất hiện khi có tenant được ghi nhận." />}<PlatformPagination page={tenantData.pagination.page} total={tenantData.pagination.total} limit={tenantData.pagination.limit} pending={tenants.isFetching} onPage={setPage} /></>}
    </section>}
    {audit.allowed && <section className="platform-panel"><header><div><h2>Hoạt động quản trị gần nhất</h2><p>5 bản ghi gần nhất từ nhật ký hệ thống.</p></div><Button component={Link} href={platformHref(preview, "audit")}>Xem toàn bộ nhật ký</Button></header>
      {audit.isPending && <PlatformLoading />}<PlatformError error={audit.error} retry={() => audit.refetch()} />
      {auditData && <><div className="platform-table-scroll"><table><caption className="platform-sr-only">Nhật ký quản trị gần nhất</caption><thead><tr><th scope="col">Thời gian</th><th scope="col">Người thực hiện</th><th scope="col">Thao tác</th><th scope="col">Phạm vi</th><th scope="col">Đối tượng</th></tr></thead><tbody>{auditData.items.map((event) => <tr key={event.id}><td>{platformDate(event.created_at)}</td><td>{event.actor_name || "Hệ thống"}</td><td>{event.action}</td><td className="tenant-activity-route">{event.route}</td><td>{event.entity_id || "—"}</td></tr>)}</tbody></table></div>{!auditData.items.length && <PlatformEmpty title="Chưa có hoạt động quản trị" description="Các thao tác được ghi nhận sẽ xuất hiện tại đây." />}</>}
    </section>}
  </>;
}
