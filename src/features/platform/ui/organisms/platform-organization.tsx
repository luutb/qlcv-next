"use client";

import { Alert, Button } from "@mui/material";
import { platformApi } from "../../api/platform.api";
import { usePlatformQuery } from "../../hooks/use-platform";
import { PlatformError, PlatformLoading, PlatformUnavailable, platformDate } from "./platform-feedback";

export function PlatformOrganization({ preview }: { preview: boolean }) {
  const query = usePlatformQuery(["organization"], "platform.organizations.read", platformApi.organization, preview);
  const data = query.allowed ? query.data : undefined;
  return <section className="platform-panel"><header><div><h2>Thông tin đơn vị vận hành</h2><p>Thông tin được đọc trực tiếp từ cấu hình đơn vị hiện tại.</p></div><Button disabled={preview || !query.allowed || query.isFetching} onClick={() => query.refetch()}>Tải lại</Button></header>
    <PlatformUnavailable preview={preview} allowed={query.allowed} />
    {query.allowed && !preview && query.isPending && <PlatformLoading />}
    {query.allowed && !preview && <PlatformError error={query.error} retry={() => query.refetch()} />}
    {data && !query.error && <div className="platform-organization-body"><div className="platform-organization-heading"><span className="platform-organization-avatar">{data.name.slice(0, 2).toUpperCase() || "QL"}</span><div><h3>{data.name}</h3><span className="platform-badge active">Đơn vị hiện tại</span></div></div><dl className="platform-detail-list">{[["Tên đơn vị", data.name], ["Email liên hệ", data.email || "Chưa cập nhật"], ["Điện thoại", data.phone || "Chưa cập nhật"], ["Địa chỉ", data.address || "Chưa cập nhật"], ["Cập nhật gần nhất", platformDate(data.updated_at)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><Alert severity="info">Hệ thống hiện vận hành cho một đơn vị. Chưa hỗ trợ tạo nhiều tổ chức hoặc cô lập dữ liệu giữa nhiều tổ chức. Thông tin liên hệ được cập nhật trong khu Admin nghiệp vụ.</Alert></div>}
  </section>;
}
