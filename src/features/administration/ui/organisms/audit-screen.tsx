"use client";
import { useState } from "react";
import { Alert, MenuItem, TextField } from "@mui/material";
import { administrationApi } from "../../api/administration.api";
import { useAdministrationQuery } from "../../hooks/use-administration";
import { AdministrationLayout, AdministrationError, AdministrationPagination } from "./administration-layout";
const labels: Record<string, string> = { POST: "Tạo / thực hiện", PUT: "Cập nhật", PATCH: "Cập nhật", DELETE: "Xóa / lưu trữ" };
function entityLabel(route: string) { for (const [prefix, label] of [["/roles/", "Chính sách quyền"], ["/users", "Nhân viên"], ["/customers", "Khách hàng"], ["/teams", "Đội nhóm"], ["/projects", "Dự án"], ["/tasks", "Công việc"], ["/labels", "Nhãn"], ["/documents", "Tài liệu"], ["/time-entries", "Giờ làm việc"], ["/contract-types", "Loại hợp đồng"], ["/admin/tenant-settings", "Thông tin tổ chức"]]) if (route.includes(prefix)) return label; return "Nghiệp vụ"; }
export function AuditScreen() {
  const [page, setPage] = useState(1); const [action, setAction] = useState("");
  const query = useAdministrationQuery(["events", page, action], "audit.read", (signal) => administrationApi.events(page, action, signal));
  return <AdministrationLayout title="Nhật ký thao tác" description="Các thay đổi thành công được ghi nhận từ khi bật chức năng nhật ký." href="/audit">
    {!query.access.allowed ? <Alert severity="warning">Bạn chưa được cấp quyền xem nhật ký.</Alert> : <section className="directory-panel"><div className="directory-toolbar"><TextField select size="small" label="Thao tác" value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }}><MenuItem value="">Tất cả</MenuItem>{Object.entries(labels).map(([value, label]) => <MenuItem key={value} value={value}>{label} ({value})</MenuItem>)}</TextField></div>
      {query.isPending && <p role="status">Đang tải nhật ký…</p>}<AdministrationError error={query.error} retry={() => query.refetch()} />
      {query.data && <><div className="directory-table-wrap"><table className="directory-table"><caption className="sr-only">Nhật ký thao tác nghiệp vụ</caption><thead><tr><th>Thời gian</th><th>Người thực hiện</th><th>Thao tác</th><th>Đối tượng</th></tr></thead><tbody>{query.data.items.map((row) => <tr key={row.id}><td>{new Date(row.created_at).toLocaleString("vi-VN")}</td><td>{row.actor_name || `#${row.actor_id}`}</td><td>{labels[row.action] ?? row.action}</td><td>{entityLabel(row.route)}{row.entity_id ? ` #${row.entity_id}` : ""}</td></tr>)}</tbody></table></div>{!query.data.items.length && <p className="directory-empty">Chưa có thao tác phù hợp.</p>}<AdministrationPagination page={page} total={query.data.pagination.total} onChange={setPage} /></>}
    </section>}
  </AdministrationLayout>;
}
