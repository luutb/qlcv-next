"use client";
import { useState } from "react";
import { platformApi } from "../../api/platform.api";
import { usePlatformQuery } from "../../hooks/use-platform";
import { PlatformEmpty, PlatformError, PlatformLoading, PlatformPagination, platformDate } from "./platform-feedback";
export function TenantActivity({ tenantId }: { tenantId: string }) {
  const [page, setPage] = useState(1);
  const query = usePlatformQuery(["tenant-activity", tenantId, page], "platform.tenants.read", (signal) => platformApi.tenantActivity(tenantId, { page, limit: 20, q: "" }, signal), false);
  const data = query.allowed && !query.error ? query.data : undefined;
  return <section className="platform-panel"><header><div><h2>Lịch sử của tenant</h2><p>Thao tác liên quan đến đơn vị và gói cước của tenant.</p></div></header>{query.isPending && <PlatformLoading />}<PlatformError error={query.error} retry={() => query.refetch()} />{data && <><div className="platform-table-scroll"><table><caption className="platform-sr-only">Lịch sử của tenant</caption><thead><tr><th scope="col">Thời gian</th><th scope="col">Người thực hiện</th><th scope="col">Thao tác</th><th scope="col">Phạm vi</th></tr></thead><tbody>{data.items.map((item) => <tr key={item.id}><td>{platformDate(item.created_at)}</td><td>{item.actor_name || "Hệ thống"}</td><td>{item.action}</td><td className="tenant-activity-route">{item.route}</td></tr>)}</tbody></table></div>{!data.items.length && <PlatformEmpty title="Chưa có lịch sử của tenant" description="Thay đổi thông tin và đăng ký gói sẽ xuất hiện tại đây sau khi được ghi nhận." />}<PlatformPagination page={data.pagination.page} total={data.pagination.total} limit={data.pagination.limit} pending={query.isFetching} onPage={setPage} /></>}</section>;
}
