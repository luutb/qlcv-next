"use client";

import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { getDebugErrorInfo, getUserFacingErrorMessage } from "@/api/errors";
import { useDashboardSummary } from "./useDashboardSummary";
import type {
  DashboardDueItem,
  DashboardIssueStatus,
  DashboardMacroColumn,
  DashboardProjectAttention,
  DashboardQuery,
  DashboardRange,
  DashboardSummary,
} from "./dashboard.types";

const RANGE_OPTIONS: Array<{ value: DashboardRange; label: string }> = [
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "90d", label: "90 ngày" },
  { value: "custom", label: "Tùy chọn" },
];

const ISSUE_STATUS_LABELS: Record<DashboardIssueStatus, string> = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  DOING: "DOING",
  REVIEW: "REVIEW",
  DONE: "DONE",
};

const ISSUE_STATUS_TONE: Record<DashboardIssueStatus, string> = {
  BACKLOG: "todo",
  TODO: "todo",
  DOING: "doing",
  REVIEW: "review",
  DONE: "done",
};

const MACRO_LABELS: Record<DashboardMacroColumn, string> = {
  INTAKE: "Tiếp nhận",
  IN_PROGRESS: "Đang xử lý",
  BILLING: "Billing",
  ARCHIVED: "Lưu trữ",
};

export function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = useMemo<DashboardQuery>(() => {
    const rangeParam = searchParams.get("range");
    const range = isDashboardRange(rangeParam) ? rangeParam : "30d";

    return {
      range,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      workflow_template_id: searchParams.get("workflow_template_id") ?? undefined,
      due_limit: 10,
      attention_limit: 10,
    };
  }, [searchParams]);

  const summaryQuery = useDashboardSummary(query);
  const summary = summaryQuery.data;

  function updateQuery(next: Partial<DashboardQuery>) {
    const params = new URLSearchParams(searchParams.toString());
    const nextRange = next.range ?? query.range ?? "30d";
    const defaultCustomRange = getDefaultCustomRange();

    params.set("range", nextRange);

    if (nextRange === "custom") {
      setOptionalParam(params, "from", next.from ?? query.from ?? defaultCustomRange.from);
      setOptionalParam(params, "to", next.to ?? query.to ?? defaultCustomRange.to);
    } else {
      params.delete("from");
      params.delete("to");
    }

    router.replace(`/dashboard?${params.toString()}`);
  }

  return (
    <section className="od-dashboard" aria-labelledby="dashboardTitle">
      <div className="od-dashboard__head">
        <div>
          <p className="od-dashboard__eyebrow">Operations overview</p>
          <h1 id="dashboardTitle">Dashboard</h1>
          <p className="od-dashboard__subtitle">Tổng quan công việc, vụ việc, deadline và doanh thu.</p>
        </div>
        <div className="od-dashboard__controls">
          <div className="od-dashboard__segmented" aria-label="Khoảng thời gian">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={query.range === option.value}
                onClick={() => updateQuery({ range: option.value })}
              >
                {option.label}
              </button>
            ))}
          </div>
          {query.range === "custom" ? (
            <div className="od-dashboard__date-fields">
              <input
                type="date"
                aria-label="Từ ngày"
                value={query.from ?? getDefaultCustomRange().from}
                onChange={(event) => updateQuery({ range: "custom", from: event.target.value })}
              />
              <input
                type="date"
                aria-label="Đến ngày"
                value={query.to ?? getDefaultCustomRange().to}
                onChange={(event) => updateQuery({ range: "custom", to: event.target.value })}
              />
            </div>
          ) : null}
          <button
            className="od-dashboard__icon-button"
            type="button"
            onClick={() => summaryQuery.refetch()}
            aria-label="Tải lại dashboard"
          >
            <RefreshIcon />
          </button>
        </div>
      </div>

      {summaryQuery.isLoading ? <DashboardLoading /> : null}

      {summaryQuery.isError ? (
        <StateCard
          tone="error"
          title={getUserFacingErrorMessage(summaryQuery.error)}
          description={getDebugErrorInfo(summaryQuery.error) ?? "Không tải được dữ liệu dashboard. Vui lòng thử lại."}
          actionLabel="Tải lại"
          onAction={() => summaryQuery.refetch()}
        />
      ) : null}

      {!summaryQuery.isLoading && !summaryQuery.isError && summary ? (
        <DashboardContent summary={summary} range={query.range ?? "30d"} />
      ) : null}
    </section>
  );
}

function DashboardContent({ summary, range }: { summary: DashboardSummary; range: DashboardRange }) {
  const router = useRouter();
  const workload = buildWorkload(summary.due_items);
  const highWorkloadCount = workload.filter((item) => item.capacity >= 85).length;
  const overdueProjects = summary.projects_need_attention.filter((item) => item.reason === "OVERDUE_TASK").length;
  const paymentBlocks = summary.projects_need_attention.filter((item) => item.reason === "PAYMENT_PENDING").length;

  return (
    <>
      <div className="od-dashboard__status-strip" aria-label="Trạng thái vận hành">
        <StatusNote tone="danger">{summary.kpis.overdue_issues} công việc quá hạn cần xử lý.</StatusNote>
        <StatusNote tone="warn">{paymentBlocks} project có payment block trong kỳ.</StatusNote>
        <StatusNote tone="success">Dữ liệu từ {formatDate(summary.range.from)} đến {formatDate(summary.range.to)}.</StatusNote>
      </div>

      <div className="od-dashboard__kpi-grid">
        <KpiCard label="Công việc đang mở" value={formatNumber(summary.kpis.open_issues)} meta="Issue chưa hoàn tất" href="/work" icon={<TaskIcon />} />
        <KpiCard label="Quá hạn" value={formatNumber(summary.kpis.overdue_issues)} meta={`${overdueProjects} project liên quan`} href="/work?overdue=true" tone="danger" icon={<WarningIcon />} />
        <KpiCard label="Project active" value={formatNumber(summary.kpis.active_projects)} meta="Vụ việc đang xử lý" href="/projects" icon={<ProjectIcon />} />
        <KpiCard label="Đã thu" value={formatCompactVnd(summary.kpis.revenue_collected)} meta={`VND trong ${rangeLabel(range)}`} href="/invoices" tone="success" icon={<MoneyIcon />} />
        <KpiCard label="Workload cao" value={formatNumber(highWorkloadCount)} meta="Nhân sự vượt 85%" href="/work?capacity=high" tone="warn" icon={<PeopleIcon />} />
        <KpiCard label="OKR progress" value="72%" meta="Tổng quan mục tiêu" href="/okr" icon={<OkrIcon />} />
      </div>

      <div className="od-dashboard__grid">
        <div className="od-dashboard__stack">
          <div className="od-dashboard__split-grid">
            <Panel title="Task status" subtitle="Phân bổ Issue theo trạng thái">
              <BarList
                items={summary.issue_status.map((item) => ({
                  key: item.status,
                  label: ISSUE_STATUS_LABELS[item.status],
                  count: item.count,
                  tone: ISSUE_STATUS_TONE[item.status],
                }))}
                empty="Chưa có task backend trong khoảng thời gian này."
              />
            </Panel>

            <Panel title="Workflow distribution" subtitle="Macro column của vụ việc">
              {summary.project_workflow.length === 0 ? (
                <InlineEmpty>Chưa có dữ liệu workflow project.</InlineEmpty>
              ) : (
                <div className="od-dashboard__workflow-list">
                  {summary.project_workflow.map((item) => (
                    <button
                      key={item.macro_column}
                      className="od-dashboard__workflow-item"
                      type="button"
                      onClick={() => router.push(`/projects?macro_column=${item.macro_column}`)}
                    >
                      <span>
                        <span className="od-dashboard__workflow-name">{item.title || MACRO_LABELS[item.macro_column]}</span>
                        <span className="od-dashboard__workflow-code">{item.macro_column}</span>
                      </span>
                      <span className="od-dashboard__workflow-count">{formatNumber(item.count)}</span>
                    </button>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <Panel title="Projects cần chú ý" subtitle="Conflict, payment block và workflow bị kẹt">
            <ProjectsAttentionList items={summary.projects_need_attention} />
          </Panel>

          <div className="od-dashboard__split-grid">
            <Panel title="Workload by assignee" subtitle="Open task, overdue và capacity">
              <WorkloadList items={workload} />
            </Panel>
            <Panel title="OKR summary" subtitle="Cycle hiện tại">
              <OkrSummary />
            </Panel>
          </div>

          <Panel title="Billing snapshot" subtitle="Doanh thu và công nợ trong kỳ" action={{ label: "Mở Billing", href: "/invoices" }}>
            <div className="od-dashboard__billing-grid">
              <BillingCell label="Đã thu" value={formatVnd(summary.kpis.revenue_collected)} />
              <BillingCell label="Project payment block" value={`${paymentBlocks} hồ sơ`} />
              <BillingCell label="Project quá hạn" value={`${overdueProjects} hồ sơ`} />
            </div>
          </Panel>
        </div>

        <aside className="od-dashboard__stack" aria-label="Công việc cần xử lý">
          <Panel title="Đến hạn / quá hạn" subtitle="Ưu tiên xử lý hôm nay" action={{ label: "Work Board", href: "/work?sort=due_at" }}>
            <DueItemsList items={summary.due_items} />
          </Panel>
          <Panel title="Quick actions" subtitle="Điều hướng thao tác chính">
            <div className="od-dashboard__workflow-list">
              <QuickAction href="/work" name="Tạo Issue" code="WORK BOARD" />
              <QuickAction href="/projects" name="Mở Project mới" code="PROJECT" />
              <QuickAction href="/invoices" name="Kiểm tra invoice" code="BILLING" />
            </div>
          </Panel>
        </aside>
      </div>
    </>
  );
}

function StatusNote({ tone, children }: { tone: "danger" | "warn" | "success"; children: React.ReactNode }) {
  return (
    <div className="od-dashboard__status-note">
      <span className={`od-dashboard__status-dot od-dashboard__status-dot--${tone}`} />
      {children}
    </div>
  );
}

function KpiCard({
  label,
  value,
  meta,
  href,
  tone,
  icon,
}: {
  label: string;
  value: string;
  meta: string;
  href: string;
  tone?: "danger" | "warn" | "success";
  icon: React.ReactNode;
}) {
  return (
    <a className={`od-dashboard__kpi-card ${tone ? `od-dashboard__tone-${tone}` : ""}`} href={href}>
      <div className="od-dashboard__kpi-top">
        <span>{label}</span>
        <span className="od-dashboard__kpi-icon">{icon}</span>
      </div>
      <div>
        <div className="od-dashboard__kpi-value">{value}</div>
        <div className="od-dashboard__kpi-meta">{meta}</div>
      </div>
    </a>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <section className="od-dashboard__panel">
      <div className="od-dashboard__panel-head">
        <div>
          <h2 className="od-dashboard__panel-title">{title}</h2>
          <p className="od-dashboard__panel-sub">{subtitle}</p>
        </div>
        {action ? (
          <a className="od-dashboard__panel-action" href={action.href}>
            {action.label}
          </a>
        ) : null}
      </div>
      <div className="od-dashboard__panel-body">{children}</div>
    </section>
  );
}

function BarList({
  items,
  empty,
}: {
  items: Array<{ key: string; label: string; count: number; tone: string }>;
  empty: string;
}) {
  const max = Math.max(...items.map((item) => item.count), 0);
  if (max === 0) {
    return <InlineEmpty>{empty}</InlineEmpty>;
  }

  return (
    <div className="od-dashboard__bar-list">
      {items.map((item) => (
        <div key={item.key} className="od-dashboard__bar-row">
          <span className="od-dashboard__bar-label">{item.label}</span>
          <span className="od-dashboard__bar-track">
            <span
              className={`od-dashboard__bar-fill od-dashboard__bar-fill--${item.tone}`}
              style={{ width: `${Math.max((item.count / max) * 100, 4)}%` }}
            />
          </span>
          <span className="od-dashboard__bar-value">{formatNumber(item.count)}</span>
        </div>
      ))}
    </div>
  );
}

function ProjectsAttentionList({ items }: { items: DashboardProjectAttention[] }) {
  if (items.length === 0) {
    return <InlineEmpty>Không có project cần chú ý.</InlineEmpty>;
  }

  return (
    <div className="od-dashboard__attention-list">
      {items.map((item) => (
        <div key={item.id} className="od-dashboard__attention-row">
          <div className="od-dashboard__truncate">
            <strong>{item.name}</strong>
            <span>
              Khách hàng: {item.customer_name}
              {item.current_step_name ? ` · ${item.current_step_name}` : ""}
            </span>
          </div>
          <span className={`od-dashboard__tag ${reasonTone(item.reason)}`}>{item.reason_label || reasonLabel(item.reason)}</span>
          <span className="od-dashboard__money">{formatCompactVnd(item.remaining_amount)}</span>
          <a className="od-dashboard__link-button" href={`/projects/${item.id}`}>Xem</a>
        </div>
      ))}
    </div>
  );
}

function DueItemsList({ items }: { items: DashboardDueItem[] }) {
  if (items.length === 0) {
    return <InlineEmpty>Chưa có task backend trong khoảng thời gian này.</InlineEmpty>;
  }

  return (
    <div className="od-dashboard__due-list">
      {items.map((item) => (
        <a key={item.id} className="od-dashboard__due-item" href={`/projects/${item.project_id}`}>
          <span className="od-dashboard__due-title">
            <span>{item.title}</span>
            <span className={`od-dashboard__tag ${item.overdue ? "danger" : "warn"}`}>
              {item.overdue ? "Overdue" : "Due soon"}
            </span>
          </span>
          <span className="od-dashboard__due-meta">
            <span>Issue</span>
            <span>{item.assignee_name ?? "Chưa phân công"}</span>
            <span>{priorityLabel(item.priority)}</span>
            <span>{formatDate(item.due_date)}</span>
          </span>
        </a>
      ))}
    </div>
  );
}

function WorkloadList({ items }: { items: Array<{ id: string; name: string; open: number; overdue: number; capacity: number }> }) {
  if (items.length === 0) {
    return <InlineEmpty>Chưa có dữ liệu workload.</InlineEmpty>;
  }

  return (
    <div className="od-dashboard__workload-list">
      {items.slice(0, 4).map((item) => (
        <a key={item.id} className="od-dashboard__workload-row" href={`/work?assignee_id=${item.id}`}>
          <span className="od-dashboard__avatar">{initials(item.name)}</span>
          <div className="od-dashboard__truncate">
            <strong>{item.name}</strong>
            <span>{item.open} open · {item.overdue} overdue</span>
            <span className={`od-dashboard__capacity ${item.capacity >= 90 ? "over" : item.capacity >= 80 ? "warn" : ""}`}>
              <span style={{ width: `${item.capacity}%` }} />
            </span>
          </div>
          <span className="od-dashboard__percent">{item.capacity}%</span>
        </a>
      ))}
    </div>
  );
}

function OkrSummary() {
  return (
    <div className="od-dashboard__okr-card">
      <div className="od-dashboard__ring"><span>72%</span></div>
      <div className="od-dashboard__metric-list">
        <MetricLine label="Objectives at risk" value="2" />
        <MetricLine label="Key results completed" value="11/18" />
        <MetricLine label="Issue SLA đúng hạn" value="86%" />
        <MetricLine label="Billing collection target" value="79%" />
      </div>
    </div>
  );
}

function MetricLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="od-dashboard__metric-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function BillingCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="od-dashboard__billing-cell">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function QuickAction({ href, name, code }: { href: string; name: string; code: string }) {
  return (
    <a className="od-dashboard__workflow-item" href={href}>
      <span>
        <span className="od-dashboard__workflow-name">{name}</span>
        <span className="od-dashboard__workflow-code">{code}</span>
      </span>
      <span className="od-dashboard__workflow-count">↗</span>
    </a>
  );
}

function InlineEmpty({ children }: { children: React.ReactNode }) {
  return <div className="od-dashboard__inline-empty">{children}</div>;
}

function StateCard({
  title,
  description,
  actionLabel,
  onAction,
}: {
  tone: "error";
  title: string;
  description?: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="od-dashboard__state-card">
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      <button className="od-dashboard__link-button" type="button" onClick={onAction}>{actionLabel}</button>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="od-dashboard__loading">
      {Array.from({ length: 8 }, (_, index) => <span key={index} />)}
    </div>
  );
}

function buildWorkload(items: DashboardDueItem[]) {
  const map = new Map<string, { id: string; name: string; open: number; overdue: number; capacity: number }>();
  items.forEach((item) => {
    const id = item.assignee_id ?? "unassigned";
    const name = item.assignee_name ?? "Chưa phân công";
    const current = map.get(id) ?? { id, name, open: 0, overdue: 0, capacity: 0 };
    current.open += 1;
    current.overdue += item.overdue ? 1 : 0;
    map.set(id, current);
  });

  return Array.from(map.values())
    .map((item) => ({ ...item, capacity: Math.min(96, 48 + item.open * 8 + item.overdue * 10) }))
    .sort((a, b) => b.capacity - a.capacity);
}

function isDashboardRange(value: string | null): value is DashboardRange {
  return value === "7d" || value === "30d" || value === "90d" || value === "custom";
}

function setOptionalParam(params: URLSearchParams, key: string, value?: string) {
  if (value) {
    params.set(key, value);
    return;
  }

  params.delete(key);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactVnd(value: number) {
  if (Math.abs(value) >= 1_000_000_000) {
    return `${trimNumber(value / 1_000_000_000)}B`;
  }

  if (Math.abs(value) >= 1_000_000) {
    return `${trimNumber(value / 1_000_000)}M`;
  }

  return formatNumber(value);
}

function trimNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatDate(value: string) {
  return dayjs(value).format("DD/MM/YYYY");
}

function getDefaultCustomRange() {
  return {
    from: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
  };
}

function rangeLabel(range: DashboardRange) {
  const labels: Record<DashboardRange, string> = {
    "7d": "7 ngày",
    "30d": "30 ngày",
    "90d": "90 ngày",
    custom: "kỳ tùy chọn",
  };

  return labels[range];
}

function reasonLabel(reason: string) {
  const labels: Record<string, string> = {
    CONFLICT_DETECTED: "Conflict",
    PAYMENT_PENDING: "Payment",
    MISSING_WORKFLOW_STEP: "Workflow",
    OVERDUE_TASK: "Overdue",
  };

  return labels[reason] ?? reason;
}

function reasonTone(reason: string) {
  const tones: Record<string, string> = {
    CONFLICT_DETECTED: "danger",
    PAYMENT_PENDING: "warn",
    MISSING_WORKFLOW_STEP: "warn",
    OVERDUE_TASK: "danger",
  };

  return tones[reason] ?? "";
}

function priorityLabel(priority: DashboardDueItem["priority"]) {
  const labels: Record<DashboardDueItem["priority"], string> = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent",
  };

  return labels[priority];
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function RefreshIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 0 1-15.5 6.2" /><path d="M3 12A9 9 0 0 1 18.5 5.8" /><path d="M18 2v4h4" /><path d="M6 22v-4H2" /></svg>;
}

function TaskIcon() {
  return <svg viewBox="0 0 24 24"><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="m3 6 1 1 2-2" /></svg>;
}

function WarningIcon() {
  return <svg viewBox="0 0 24 24"><path d="M12 8v5" /><path d="M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /></svg>;
}

function ProjectIcon() {
  return <svg viewBox="0 0 24 24"><path d="M6 4h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /><path d="M8 9h8" /><path d="M8 14h6" /></svg>;
}

function MoneyIcon() {
  return <svg viewBox="0 0 24 24"><path d="M4 7h16v10H4z" /><path d="M8 11h.01" /><path d="M16 13h.01" /></svg>;
}

function PeopleIcon() {
  return <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></svg>;
}

function OkrIcon() {
  return <svg viewBox="0 0 24 24"><path d="M12 20a8 8 0 1 0-8-8" /><path d="M12 12V4" /><path d="m12 12 5 3" /></svg>;
}
