"use client";
import { useState } from "react";
import Link from "next/link";
import { Alert, Button, MenuItem, Paper, TextField } from "@mui/material";
import { hasAuthorizedAction } from "@/features/auth";
import { administrationApi } from "../../api/administration.api";
import { useAdministrationQuery } from "../../hooks/use-administration";
import { AdministrationLayout, AdministrationError } from "./administration-layout";
const statusLabels: Record<string, string> = { TODO: "Chưa thực hiện", DOING: "Đang thực hiện", DONE: "Hoàn thành", CANCELLED: "Tạm dừng / hủy" };
const number = (value: number) => new Intl.NumberFormat("vi-VN").format(value);
export function ReportsScreen() {
  const [range, setRange] = useState("30d");
  const query = useAdministrationQuery(["reports", range], "reports.read", (signal) => administrationApi.reports(range, signal));
  const summary = query.data;
  return <AdministrationLayout title="Báo cáo nghiệp vụ" description="Tổng hợp các công việc được tạo trong khoảng thời gian đã chọn, theo phạm vi tài khoản được xem." href="/reports">
    {!query.access.allowed ? <Alert severity="warning">Bạn chưa được cấp quyền xem báo cáo.</Alert> : <>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}><TextField select size="small" label="Khoảng thời gian" value={range} onChange={(event) => setRange(event.target.value)} sx={{ minWidth: 200 }}><MenuItem value="7d">7 ngày</MenuItem><MenuItem value="30d">30 ngày</MenuItem><MenuItem value="90d">90 ngày</MenuItem></TextField><Button onClick={() => query.refetch()} disabled={query.isFetching}>Tải lại báo cáo</Button></Paper>
      {query.isPending && <p role="status">Đang tổng hợp báo cáo…</p>}<AdministrationError error={query.error} retry={() => query.refetch()} />
      {summary && <>
        <p>Từ {new Date(summary.range.from).toLocaleDateString("vi-VN")} đến {new Date(summary.range.to).toLocaleDateString("vi-VN")}.</p>
        <div className="admin-module-grid">{[["Tổng công việc", summary.kpis.total_tasks], ["Đang thực hiện", summary.kpis.in_progress_tasks], ["Hoàn thành", summary.kpis.completed_tasks], ["Quá hạn", summary.kpis.overdue_issues]].map(([title, value]) => <Paper key={title} variant="outlined" className="admin-report-metric"><span>{title}</span><strong>{number(Number(value))}</strong></Paper>)}</div>
        <section className="directory-panel admin-report-section"><h2>Trạng thái công việc</h2>{summary.task_status.map((row) => <div className="admin-status-row" key={row.status}><span>{statusLabels[row.status] ?? row.status}</span><meter value={row.count} min={0} max={Math.max(summary.kpis.total_tasks, 1)} aria-label={statusLabels[row.status] ?? row.status} /><strong>{number(row.count)}</strong></div>)}</section>
        {hasAuthorizedAction(query.access.user.data, "dashboard.finance.read") && summary.billing && <section className="directory-panel admin-report-section"><h2>Tài chính công việc</h2><p>Đã thu: <strong>{number(summary.billing.revenue_collected)} VNĐ</strong></p><p>Còn phải thu: <strong>{number(summary.billing.outstanding_amount)} VNĐ</strong></p><p>Chi phí: {summary.billing.cost_total === null ? "Chưa có dữ liệu" : `${number(summary.billing.cost_total)} VNĐ`}</p></section>}
        {hasAuthorizedAction(query.access.user.data, "dashboard.people.read") && <section className="directory-panel admin-report-section"><h2>Phân bổ công việc</h2><div className="directory-table-wrap"><table className="directory-table"><caption className="sr-only">Công việc theo nhân viên</caption><thead><tr><th>Nhân viên</th><th>Tổng việc</th><th>Hoàn thành</th><th>Quá hạn</th></tr></thead><tbody>{summary.workload.map((row) => <tr key={row.user_id}><th scope="row">{row.user_name}</th><td>{number(row.task_count)}</td><td>{number(row.completed_count)}</td><td>{number(row.overdue_count)}</td></tr>)}</tbody></table></div>{!summary.workload.length && <p>Chưa có dữ liệu phân công.</p>}</section>}
        <section className="directory-panel admin-report-section"><h2>Công việc cần chú ý</h2>{summary.due_items.length ? summary.due_items.map((row) => <p key={row.id}>{hasAuthorizedAction(query.access.user.data, "tasks.access") ? <Link href={`/work?project_id=${encodeURIComponent(row.project_id)}&task_id=${encodeURIComponent(row.id)}`}>{row.title}</Link> : <span>{row.title}</span>} · {row.project_name} · {row.overdue ? "Quá hạn" : "Sắp đến hạn"}</p>) : <p>Không có công việc cần chú ý trong dữ liệu báo cáo.</p>}</section>
      </>}
    </>}
  </AdministrationLayout>;
}
