"use client";

import { useRouter } from "next/navigation";
import type { DashboardRange, DashboardSummary } from "@/api/dashboard.types";
import { ISSUE_STATUS_LABELS, ISSUE_STATUS_TONE, MACRO_LABELS } from "../model/dashboard.constants";
import { buildWorkload, formatCompactVnd, formatDate, formatNumber, formatVnd, rangeLabel } from "../model/dashboard.utils";
import { MoneyIcon, OkrIcon, PeopleIcon, ProjectIcon, TaskIcon, WarningIcon } from "./DashboardIcons";
import { DueItemsList, ProjectsAttentionList, WorkloadList } from "./DashboardLists";
import { OkrSummary } from "./OkrSummary";
import { BarList, BillingCell, InlineEmpty, KpiCard, Panel, QuickAction, StatusNote } from "./DashboardPrimitives";

export function DashboardContent({ summary, range }: { summary: DashboardSummary; range: DashboardRange }) {
  const router = useRouter();
  const workload = buildWorkload(summary.due_items);
  const highWorkloadCount = workload.filter((item) => item.capacity >= 85).length;
  const overdueProjects = summary.projects_need_attention.filter((item) => item.reason === "OVERDUE_TASK").length;
  const paymentBlocks = summary.projects_need_attention.filter((item) => item.reason === "PAYMENT_PENDING").length;

  return <><div className="od-dashboard__status-strip" aria-label="Trạng thái vận hành"><StatusNote tone="danger">{summary.kpis.overdue_issues} công việc quá hạn cần xử lý.</StatusNote><StatusNote tone="warn">{paymentBlocks} project có payment block trong kỳ.</StatusNote><StatusNote tone="success">Dữ liệu từ {formatDate(summary.range.from)} đến {formatDate(summary.range.to)}.</StatusNote></div>
    <div className="od-dashboard__kpi-grid"><KpiCard label="Công việc đang mở" value={formatNumber(summary.kpis.open_issues)} meta="Issue chưa hoàn tất" href="/work" icon={<TaskIcon />} /><KpiCard label="Quá hạn" value={formatNumber(summary.kpis.overdue_issues)} meta={`${overdueProjects} project liên quan`} href="/work?overdue=true" tone="danger" icon={<WarningIcon />} /><KpiCard label="Project active" value={formatNumber(summary.kpis.active_projects)} meta="Vụ việc đang xử lý" href="/projects" icon={<ProjectIcon />} /><KpiCard label="Đã thu" value={formatCompactVnd(summary.kpis.revenue_collected)} meta={`VND trong ${rangeLabel(range)}`} href="/invoices" tone="success" icon={<MoneyIcon />} /><KpiCard label="Workload cao" value={formatNumber(highWorkloadCount)} meta="Nhân sự vượt 85%" href="/work?capacity=high" tone="warn" icon={<PeopleIcon />} /><KpiCard label="OKR progress" value="72%" meta="Tổng quan mục tiêu" href="/okr" icon={<OkrIcon />} /></div>
    <div className="od-dashboard__grid"><div className="od-dashboard__stack"><div className="od-dashboard__split-grid"><Panel title="Task status" subtitle="Phân bổ Issue theo trạng thái"><BarList items={summary.issue_status.map((item) => ({ key: item.status, label: ISSUE_STATUS_LABELS[item.status], count: item.count, tone: ISSUE_STATUS_TONE[item.status] }))} empty="Chưa có task backend trong khoảng thời gian này." /></Panel><Panel title="Workflow distribution" subtitle="Macro column của vụ việc">{summary.project_workflow.length === 0 ? <InlineEmpty>Chưa có dữ liệu workflow project.</InlineEmpty> : <div className="od-dashboard__workflow-list">{summary.project_workflow.map((item) => <button key={item.macro_column} className="od-dashboard__workflow-item" type="button" onClick={() => router.push(`/projects?macro_column=${item.macro_column}`)}><span><span className="od-dashboard__workflow-name">{item.title || MACRO_LABELS[item.macro_column]}</span><span className="od-dashboard__workflow-code">{item.macro_column}</span></span><span className="od-dashboard__workflow-count">{formatNumber(item.count)}</span></button>)}</div>}</Panel></div>
      <Panel title="Projects cần chú ý" subtitle="Conflict, payment block và workflow bị kẹt"><ProjectsAttentionList items={summary.projects_need_attention} /></Panel>
      <div className="od-dashboard__split-grid"><Panel title="Workload by assignee" subtitle="Open task, overdue và capacity"><WorkloadList items={workload} /></Panel><Panel title="OKR summary" subtitle="Cycle hiện tại"><OkrSummary /></Panel></div>
      <Panel title="Billing snapshot" subtitle="Doanh thu và công nợ trong kỳ" action={{ label: "Mở Billing", href: "/invoices" }}><div className="od-dashboard__billing-grid"><BillingCell label="Đã thu" value={formatVnd(summary.kpis.revenue_collected)} /><BillingCell label="Project payment block" value={`${paymentBlocks} hồ sơ`} /><BillingCell label="Project quá hạn" value={`${overdueProjects} hồ sơ`} /></div></Panel></div>
      <aside className="od-dashboard__stack" aria-label="Công việc cần xử lý"><Panel title="Đến hạn / quá hạn" subtitle="Ưu tiên xử lý hôm nay" action={{ label: "Work Board", href: "/work?sort=due_at" }}><DueItemsList items={summary.due_items} /></Panel><Panel title="Quick actions" subtitle="Điều hướng thao tác chính"><div className="od-dashboard__workflow-list"><QuickAction href="/work" name="Tạo Issue" code="WORK BOARD" /><QuickAction href="/projects" name="Mở Project mới" code="PROJECT" /><QuickAction href="/invoices" name="Kiểm tra invoice" code="BILLING" /></div></Panel></aside></div></>;
}
