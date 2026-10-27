"use client";

import Link from "next/link";
import { Button } from "@mui/material";
import { WorkhubIcon } from "@/components/atoms";
import { platformApi } from "../../api/platform.api";
import { usePlatformQuery, useRefreshPlatform } from "../../hooks/use-platform";
import { platformHref, platformSections } from "../../model/platform-navigation";
import { PlatformEmpty, PlatformError, PlatformLoading, PlatformUnavailable, platformDate } from "./platform-feedback";
import { PlatformDetailedReport } from "./platform-detailed-report";

export function PlatformOverview({ preview }: { preview: boolean }) {
  const refresh = useRefreshPlatform();
  const query = usePlatformQuery(["summary"], "platform.overview.read", platformApi.summary, preview);
  const data = query.allowed && !query.error ? query.data : undefined;
  const total = data ? data.admin_count + data.super_admin_count : 0;
  const metrics = [
    { title: "Tenant", value: data?.organization_count, icon: "folder", tone: "blue", description: "Đơn vị đang được quản trị trên nền tảng" },
    { title: "Admin", value: data?.admin_count, icon: "users", tone: "green", description: "Quản trị nghiệp vụ của đơn vị" },
    { title: "Super Admin", value: data?.super_admin_count, icon: "settings", tone: "violet", description: "Quản trị cấp nền tảng" },
    { title: "Đang hoạt động", value: data?.active_admin_count, icon: "check", tone: "amber", description: "Tài khoản quản trị đã kích hoạt, không bị khóa" },
  ];
  return <>
    <div className="platform-section-toolbar"><p>{query.dataUpdatedAt ? `Tổng quan đồng bộ lúc ${platformDate(new Date(query.dataUpdatedAt).toISOString())}` : "Số liệu được tổng hợp từ dữ liệu hệ thống."}</p><Button disabled={preview || !query.allowed || query.isFetching} onClick={() => refresh()}>{query.isFetching ? "Đang cập nhật…" : "Làm mới số liệu"}</Button></div>
    <PlatformUnavailable preview={preview} allowed={query.allowed} />
    {!preview && query.allowed && <PlatformError error={query.error} retry={() => query.refetch()} />}
    {query.allowed && query.isPending ? <PlatformLoading /> : <div className="platform-metrics">{metrics.map((item) => <article key={item.title}><div><span>{item.title}</span><i className={item.tone}><WorkhubIcon name={item.icon} size={20} /></i></div><strong aria-label={item.value === undefined ? "Chưa có dữ liệu" : undefined}>{item.value?.toLocaleString("vi-VN") ?? "—"}</strong><p>{item.description}</p></article>)}</div>}
    <div className="platform-overview-grid"><section className="platform-panel"><header><div><h2>Phân bố tài khoản quản trị</h2><p>Phân biệt phạm vi Admin và Super Admin.</p></div></header>
      {data && total > 0 ? <div className="platform-distribution"><div className="platform-account-ring" role="img" aria-label={`${data.admin_count} Admin, ${data.super_admin_count} Super Admin`} style={{ background: `conic-gradient(#5271e7 0 ${data.admin_count / total * 100}%, #8a6ac1 ${data.admin_count / total * 100}% 100%)` }}><div><strong>{total.toLocaleString("vi-VN")}</strong><span>Tài khoản</span></div></div><div className="platform-distribution-legend"><div><i /><span>Admin</span><strong>{data.admin_count.toLocaleString("vi-VN")}</strong></div><div><i /><span>Super Admin</span><strong>{data.super_admin_count.toLocaleString("vi-VN")}</strong></div><p>{data.active_admin_count.toLocaleString("vi-VN")} tài khoản đang hoạt động</p></div></div> : <PlatformEmpty title={preview ? "Biểu đồ phân bố tài khoản" : "Chưa có dữ liệu tài khoản"} description={preview ? "Dữ liệu thật sẽ được hiển thị sau khi đăng nhập bằng tài khoản Super Admin." : "Số lượng tài khoản theo vai trò sẽ xuất hiện sau khi tải dữ liệu thành công."} />}
    </section><section className="platform-panel"><header><div><h2>Truy cập nhanh</h2><p>Quản trị theo từng phạm vi.</p></div></header><div className="platform-shortcuts">{platformSections.slice(1, 4).filter((item) => preview || query.access.can(item.capability)).map((item) => <Link href={platformHref(preview, item.id)} key={item.id}><span className="platform-shortcut-icon"><WorkhubIcon name={item.icon} size={19} /></span><span><strong>{item.title}</strong><small>{item.description}</small></span><WorkhubIcon name="arrow" size={17} /></Link>)}</div></section></div>
    <PlatformDetailedReport preview={preview} />
    {data && <div className="platform-audit-total"><WorkhubIcon name="calendar" size={19} /><div><strong>{data.audit_event_count.toLocaleString("vi-VN")} thao tác quản trị được ghi nhận</strong><p>Kiểm tra người thực hiện, thời gian và đối tượng bị thay đổi.</p></div>{query.access.can("platform.audit.read") && <Link href={platformHref(preview, "audit")}>Xem nhật ký</Link>}</div>}
  </>;
}
