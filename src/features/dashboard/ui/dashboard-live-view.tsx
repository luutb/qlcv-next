"use client";

import Link from "next/link";
import { hasAuthorizedAction, useCurrentUserQuery } from "@/features/auth";
import { useState } from "react";
import { WorkhubIcon } from "@/components/atoms";
import type { DashboardSummary } from "../api/dashboard.api";
import type { TaskPriority } from "@/features/tasks/api";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccessToken } from "@/features/auth/hooks/use-access-token";
import { tasksApi } from "@/features/tasks/api";
import { TaskEditor } from "@/features/tasks";
import { invalidateTaskQueries } from "@/features/tasks/api/task.invalidation";
import { getSafeApiErrorMessage } from "@/services/http";
import { DashboardCalendar } from "./organisms/dashboard-calendar";
import { StatusDonut } from "./organisms/status-donut";
import { StatCard } from "./stat-card";
import { DashboardCategoryCharts } from "./organisms/dashboard-category-charts";


const number = (value: unknown) => typeof value === "number" ? value.toLocaleString("vi-VN") : "—";
const money = (value: number | null) => value === null ? "—" : Math.abs(value) >= 1_000_000_000 ? `${(value / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ` : Math.abs(value) >= 1_000_000 ? `${(value / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu` : number(value);
const priorityLabel: Record<TaskPriority, string> = { LOW: "Thấp", MEDIUM: "Trung bình", HIGH: "Cao", URGENT: "Khẩn cấp" };
const priorityClass: Record<TaskPriority, string> = { LOW: "p-low", MEDIUM: "p-medium", HIGH: "p-high", URGENT: "p-urgent" };
const taskStatusLabel: Record<string, string> = { TODO: "Chờ xử lý", DOING: "Đang thực hiện", DONE: "Hoàn thành", CANCELLED: "Đã huỷ" };
const taskStatusClass: Record<string, string> = { TODO: "status-todo", DOING: "status-doing", DONE: "status-done", CANCELLED: "status-cancelled" };

function initials(value: string) { return value.split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join("").toUpperCase() || "?"; }
function relativeTime(value?: string) {
  if (!value) return "";
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Vừa xong";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  return `${Math.floor(seconds / 86400)} ngày trước`;
}

function RevenueChart({ series }: { series: NonNullable<DashboardSummary["billing"]>["series"] }) {
  if (!series.length) return <div className="state-inline">Chưa có dữ liệu doanh thu.</div>;
  const max = Math.max(...series.flatMap((point) => [point.revenue, point.cost ?? 0]), 1);
  const point = (value: number, index: number) => `${50 + (565 * index) / Math.max(series.length - 1, 1)},${205 - (175 * value) / max}`;
  const revenue = series.map((item, index) => point(item.revenue, index)).join(" ");
  const cost = series.map((item, index) => point(item.cost ?? 0, index)).join(" ");
  const hasCost = series.every((item) => item.cost !== null);
  return <><svg className="revenue-chart" viewBox="0 0 640 220" role="img" aria-label="Biểu đồ doanh thu và chi phí"><defs><linearGradient id="dashboardRevenueFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#3d6df5" stopOpacity=".25" /><stop offset="1" stopColor="#3d6df5" stopOpacity="0" /></linearGradient></defs>{[25, 75, 125, 175, 215].map((y) => <line key={y} x1="50" x2="615" y1={y} y2={y} className="chart-grid" />)}<polyline points={`${revenue} 615,215 50,215`} fill="url(#dashboardRevenueFill)" stroke="none" /><polyline points={revenue} fill="none" stroke="#3266ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />{hasCost && <polyline points={cost} fill="none" stroke="#a987f7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}</svg><div className="chart-labels">{series.slice(-10).map((item) => <span key={item.period}>{item.period.slice(5)}</span>)}</div></>;
}

export function DashboardLiveView({ summary, range, onRange }: { summary: DashboardSummary; range: "7d" | "30d" | "90d"; onRange: (value: "7d" | "30d" | "90d") => void }) {
  const user = useCurrentUserQuery();
  const canFinance = hasAuthorizedAction(user.data, "dashboard.finance.read");
  const canPeople = hasAuthorizedAction(user.data, "dashboard.people.read");
  const canCreate = hasAuthorizedAction(user.data, "tasks.create");
  const canTasks = hasAuthorizedAction(user.data, "tasks.access");
  const projects = summary.highlighted_projects ?? [];
  const dueItems = summary.due_items.slice(0, 5);
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayItems = summary.due_items.filter((task) => task.due_date.slice(0, 10) === todayKey).slice(0, 5);
  const router = useRouter();
  const token = useAccessToken();
  const client = useQueryClient();
  const employeeCount = summary.kpis.active_users;
  
  
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const complete = useMutation({
    mutationFn: async (taskId: string) => {
      if (!token || !canTasks) throw new Error("Bạn chưa được cấp quyền truy cập công việc.");
      const task = await tasksApi.get(taskId, { accessToken: token });
      if (task.actions?.move !== true) throw new Error("Bạn không có quyền hoàn thành công việc này.");
      if (task.labels?.some((label) => label.label_type === "DEPOSIT") && !task.is_paid) throw new Error("Mở chi tiết công việc để xác nhận tiền cọc trước khi hoàn thành.");
      return tasksApi.updateStatus(taskId, { status: "DONE" }, { accessToken: token });
    },
    onSettled: () => invalidateTaskQueries(client),
  });
  const trend = (value?: number) => value === undefined ? "Theo kỳ đã chọn" : `${value >= 0 ? "↑" : "↓"} ${Math.abs(value)}% so với kỳ trước`;

  return <>
    <section className="workhub-welcome"><div><h1>Xin chào{summary.viewer?.name ? `, ${summary.viewer.name}` : ""}! <span aria-hidden="true">👋</span></h1><p>Thống kê hiện tại của các công việc được tạo trong kỳ đã chọn.</p></div><div className="workhub-welcome-actions"><div className="workhub-date-note"><strong>{new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}</strong><span>“Những đội ngũ tuyệt vời tạo nên những sản phẩm tuyệt vời.”</span></div>{canCreate && <Link className="workhub-create" href="/work"><WorkhubIcon name="plus" size={16} /> Tạo công việc <WorkhubIcon name="chevron" size={14} /></Link>}</div></section>
    <section className="workhub-metrics permission-adaptive" aria-label="Chỉ số tổng quan"><StatCard title="Tổng công việc" value={number(summary.kpis.total_tasks)} icon="briefcase" tone="blue" href="/work" trend={trend(summary.kpis.task_change_percent)} /><StatCard title="Đang thực hiện" value={number(summary.kpis.in_progress_tasks)} icon="grid" tone="blue" href="/work?status=DOING" trend={trend(summary.kpis.in_progress_change_percent)} /><StatCard title="Hoàn thành" value={number(summary.kpis.completed_tasks)} icon="check" tone="green" href="/work?status=DONE" trend={trend(summary.kpis.completed_change_percent)} />{canPeople && <StatCard title="Nhân viên" value={number(employeeCount)} icon="users" tone="purple" href="/teams" trend="Đang hoạt động" />}{canFinance && <StatCard title="Đã thu của công việc trong kỳ" value={`${money(summary.kpis.revenue_collected)} VNĐ`} icon="trend" tone="orange" href={hasAuthorizedAction(user.data,"reports.read") ? "/reports" : "/work"} trend={summary.kpis.revenue_delta_percent === undefined ? "Theo kỳ đã chọn" : `${summary.kpis.revenue_delta_percent >= 0 ? "↑" : "↓"} ${Math.abs(summary.kpis.revenue_delta_percent)}% so với kỳ trước`} />}</section>
    <DashboardCategoryCharts summary={summary} canPeople={canPeople} canFinance={canFinance} range={range} onRange={onRange} />
    {complete.error && <p role="alert">{getSafeApiErrorMessage(complete.error, "Không cập nhật được trạng thái công việc.")}</p>}
    <div className="workhub-primary-grid permission-adaptive">
      {canFinance && summary.billing !== null && <section className="workhub-card revenue-card"><div className="card-heading"><div><h2>Số tiền đã thu</h2><strong className="revenue-total">{money(summary.billing.revenue_collected)} VNĐ</strong><p className="positive">Chi phí: {summary.billing.cost_total === null ? "Chưa có dữ liệu" : `${number(summary.billing.cost_total)} VNĐ`} · Còn lại: {number(summary.billing.outstanding_amount)} VNĐ</p></div><select className="period-select" aria-label="Kỳ báo cáo" value={range} onChange={(event) => onRange(event.target.value as typeof range)}><option value="7d">7 ngày</option><option value="30d">30 ngày</option><option value="90d">90 ngày</option></select></div><div className="chart-legend"><span><i className="dot blue-dot" /> Đã thu</span>{summary.billing.series.some((point) => point.cost !== null) && <span><i className="dot purple-dot" /> Chi phí</span>}</div><RevenueChart series={summary.billing.series} /></section>}
      <section className="workhub-card status-card"><h2>Trạng thái công việc</h2><StatusDonut items={summary.task_status} /><ul className="status-legend">{summary.task_status.length ? summary.task_status.map((item) => <li key={item.status}><i className={`status-dot ${taskStatusClass[item.status] ?? "status-other"}`} /><span className="status-label">{taskStatusLabel[item.status] ?? item.status}</span><b>{number(item.count)} ({summary.kpis.total_tasks ? Math.round(item.count / summary.kpis.total_tasks * 100) : 0}%)</b></li>) : <li>Chưa có dữ liệu.</li>}</ul></section>
      <section className="workhub-card highlight-card"><div className="card-title-row"><h2>Dự án nổi bật</h2><Link href="/projects">Xem tất cả <WorkhubIcon name="arrow" size={13} /></Link></div>{projects.length ? projects.slice(0, 4).map((project, index) => { const tone = project.tone ?? ["blue", "purple", "violet", "orange"][index % 4]; return <button className="highlight-row highlight-button" type="button" key={project.id} onClick={() => router.push(`/projects/board?project_id=${project.id}`)}><span className={`project-icon ${tone}`}>{initials(project.name)}</span><div className="highlight-copy"><strong>{project.name}</strong><div><span className="progress-track"><span className={`progress-fill ${tone}`} style={{ width: `${project.progress_percent}%` }} /></span><small>{project.completed_tasks}/{project.total_tasks} công việc</small></div></div><b>{project.progress_percent}%</b></button>; }) : <div className="state-inline">Chưa có dự án để hiển thị.</div>}</section>
      <section className="workhub-card today-card"><div className="card-title-row"><h2>Việc cần làm hôm nay</h2><Link href="/work">Xem tất cả <WorkhubIcon name="arrow" size={13} /></Link></div>{todayItems.length ? <ul>{todayItems.map((task) => { const done = task.status === "DONE"; return <li className={done ? "task-completed" : ""} key={task.id}><button className="task-check-button" type="button" aria-label={`Hoàn thành: ${task.title}`} disabled={!canTasks || done || complete.isPending} onClick={() => complete.mutate(task.id)}><span className="task-check">{done ? "✓" : ""}</span></button><button className="task-copy-button" type="button" onClick={() => setSelectedTask(task.id)}><strong>{task.title}</strong><small>{task.project_name} · {task.due_date}</small></button><span className={`priority ${priorityClass[task.priority]}`}>{priorityLabel[task.priority]}</span></li>; })}</ul> : <div className="state-inline">Không có công việc cần làm.</div>}</section>
    </div>
    <div className="workhub-secondary-grid permission-adaptive">{canPeople && <section className="workhub-card employees-card"><div className="card-title-row"><h2>Nhân viên</h2><Link href="/teams">Xem tất cả <WorkhubIcon name="arrow" size={13} /></Link></div>{summary.workload.length ? summary.workload.slice(0, 5).map((person, index) => <div className="employee-row" key={person.user_id}><span className={`workhub-avatar tone-${["rose", "navy", "orange", "green", "blue"][index % 5]}`}>{initials(person.user_name)}</span><div><strong>{person.user_name}</strong><small>{person.role ?? `${person.task_count} công việc · ${person.completed_count} hoàn thành`}</small></div><span className={`presence ${person.overdue_count ? "away" : ""}`}>{person.overdue_count ? `${person.overdue_count} quá hạn` : `${person.task_count} công việc`}</span></div>) : <div className="state-inline">Chưa có dữ liệu nhân sự.</div>}</section>}
      <section className="workhub-card recent-card"><div className="card-title-row"><h2>Công việc đến hạn</h2><Link href="/work">Xem tất cả <WorkhubIcon name="arrow" size={13} /></Link></div>{dueItems.length ? dueItems.map((task) => <div className="recent-row" key={`recent-${task.id}`}><button className="task-check-button" type="button" aria-label={`Hoàn thành: ${task.title}`} disabled={!canTasks || complete.isPending || task.status === "DONE"} onClick={() => complete.mutate(task.id)}><span className="task-check">{task.status === "DONE" ? "✓" : ""}</span></button><div><button className="task-copy-button" onClick={() => setSelectedTask(task.id)}><strong>{task.title}</strong></button><small>{task.project_name}</small></div><span className={`priority ${priorityClass[task.priority]}`}>{priorityLabel[task.priority]}</span><time>{task.due_date}</time></div>) : <div className="state-inline">Chưa có công việc gần đây.</div>}</section>
      <section className="workhub-card recent-card activity-card"><div className="card-title-row"><h2>Hoạt động gần đây</h2><span>{summary.recent_activity.length} hoạt động</span></div>{summary.recent_activity.length ? summary.recent_activity.slice(0, 5).map((activity, index) => { const name = activity.actor?.display_name ?? "Hệ thống"; const copy = activity.description ?? activity.title; return <div className="recent-row" key={activity.id}><span className={`workhub-avatar tone-${["rose", "navy", "green", "orange", "blue"][index % 5]}`}>{initials(name)}</span><div><strong>{name} {activity.action_label ?? "đã cập nhật công việc"}</strong><small>{copy}</small></div><time>{relativeTime(activity.occurred_at ?? activity.updated_at)}</time></div>; }) : <div className="state-inline">Chưa có hoạt động gần đây.</div>}</section>
      <DashboardCalendar onTask={setSelectedTask} />
    </div>
    {selectedTask && <TaskEditor taskId={selectedTask} projectId="" onClose={() => setSelectedTask(null)} />}
  </>;
}
