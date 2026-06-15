"use client";

import { ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Empty, Input, Select, Skeleton, Space, Tag, Typography } from "antd";
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
} from "./dashboard.types";

const RANGE_OPTIONS: Array<{ value: DashboardRange; label: string }> = [
  { value: "7d", label: "7 ngày" },
  { value: "30d", label: "30 ngày" },
  { value: "90d", label: "90 ngày" },
  { value: "custom", label: "Tùy chọn" },
];

const ISSUE_STATUS_LABELS: Record<DashboardIssueStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "Todo",
  DOING: "Doing",
  REVIEW: "Review",
  DONE: "Done",
};

const ISSUE_STATUS_CLASS: Record<DashboardIssueStatus, string> = {
  BACKLOG: "dashboard-bar--gray",
  TODO: "dashboard-bar--blue",
  DOING: "dashboard-bar--orange",
  REVIEW: "dashboard-bar--purple",
  DONE: "dashboard-bar--green",
};

const MACRO_LABELS: Record<DashboardMacroColumn, string> = {
  INTAKE: "Intake",
  IN_PROGRESS: "In Progress",
  BILLING: "Billing",
  ARCHIVED: "Archived",
};

const PRIORITY_COLORS: Record<DashboardDueItem["priority"], string> = {
  LOW: "default",
  MEDIUM: "blue",
  HIGH: "orange",
  URGENT: "red",
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

    if (next.workflow_template_id !== undefined) {
      setOptionalParam(params, "workflow_template_id", next.workflow_template_id);
    }

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
    <main className="app-shell">
      <section className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <Typography.Title level={2}>Dashboard</Typography.Title>
            <Typography.Text type="secondary">
              Tổng quan công việc, project cần chú ý và doanh thu đã thu.
            </Typography.Text>
          </div>

          <Space wrap>
            <Select
              value={query.range}
              options={RANGE_OPTIONS}
              onChange={(range) => updateQuery({ range })}
              className="dashboard-filter"
            />
            {query.range === "custom" ? (
              <>
                <Input
                  type="date"
                  value={query.from}
                  onChange={(event) => updateQuery({ from: event.target.value })}
                  className="dashboard-date-input"
                />
                <Input
                  type="date"
                  value={query.to}
                  onChange={(event) => updateQuery({ to: event.target.value })}
                  className="dashboard-date-input"
                />
              </>
            ) : null}
            <Button icon={<ReloadOutlined />} onClick={() => summaryQuery.refetch()}>
              Tải lại
            </Button>
          </Space>
        </header>

        {summaryQuery.isLoading ? (
          <DashboardSkeleton />
        ) : summaryQuery.isError ? (
          <Alert
            type="error"
            showIcon
            message={getUserFacingErrorMessage(summaryQuery.error)}
            description={getDebugErrorInfo(summaryQuery.error)}
            action={<Button onClick={() => summaryQuery.refetch()}>Retry</Button>}
          />
        ) : summary ? (
          <>
            <Typography.Text type="secondary">
              Dữ liệu từ {formatDate(summary.range.from)} đến {formatDate(summary.range.to)}
            </Typography.Text>

            <section className="dashboard-kpis">
              <KpiCard label="Công việc đang mở" value={formatNumber(summary.kpis.open_issues)} />
              <KpiCard label="Quá hạn" value={formatNumber(summary.kpis.overdue_issues)} />
              <KpiCard label="Project active" value={formatNumber(summary.kpis.active_projects)} />
              <KpiCard label="Đã thu" value={formatVnd(summary.kpis.revenue_collected)} />
            </section>

            <section className="dashboard-grid dashboard-grid--charts">
              <BarChartCard
                title="Trạng thái task backend"
                items={summary.issue_status.map((item) => ({
                  key: item.status,
                  label: ISSUE_STATUS_LABELS[item.status],
                  count: item.count,
                  className: ISSUE_STATUS_CLASS[item.status],
                }))}
                emptyMessage="Chưa có task backend trong khoảng thời gian này"
              />
              <BarChartCard
                title="Workflow project"
                items={summary.project_workflow.map((item) => ({
                  key: item.macro_column,
                  label: item.title || MACRO_LABELS[item.macro_column],
                  count: item.count,
                  className: "dashboard-bar--blue",
                  onClick: () => {
                    const params = new URLSearchParams({ macro_column: item.macro_column });
                    if (query.workflow_template_id) {
                      params.set("workflow_template_id", query.workflow_template_id);
                    }
                    router.push(`/projects?${params.toString()}`);
                  },
                }))}
                emptyMessage="Chưa có dữ liệu workflow project"
              />
            </section>

            <section className="dashboard-grid">
              <DueItemsList items={summary.due_items} onOpenProject={(id) => router.push(`/projects/${id}`)} />
              <ProjectsAttentionList
                items={summary.projects_need_attention}
                onOpenProject={(id) => router.push(`/projects/${id}`)}
              />
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="dashboard-kpi" size="small">
      <Typography.Text type="secondary">{label}</Typography.Text>
      <strong>{value}</strong>
    </Card>
  );
}

function BarChartCard({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: Array<{
    key: string;
    label: string;
    count: number;
    className: string;
    onClick?: () => void;
  }>;
  emptyMessage: string;
}) {
  const max = Math.max(...items.map((item) => item.count), 0);

  return (
    <Card title={title} className="dashboard-card">
      {max === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyMessage} />
      ) : (
        <div className="dashboard-bars">
          {items.map((item) => (
            <button
              key={item.key}
              className="dashboard-bar-row"
              type="button"
              onClick={item.onClick}
              disabled={!item.onClick}
            >
              <span className="dashboard-bar-row__label">{item.label}</span>
              <span className="dashboard-bar-row__track">
                <span
                  className={`dashboard-bar-row__value ${item.className}`}
                  style={{ width: `${Math.max((item.count / max) * 100, 4)}%` }}
                />
              </span>
              <strong>{formatNumber(item.count)}</strong>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

function DueItemsList({
  items,
  onOpenProject,
}: {
  items: DashboardDueItem[];
  onOpenProject: (projectId: string) => void;
}) {
  return (
    <Card title="Task cần xử lý" className="dashboard-card">
      {items.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có task backend trong khoảng thời gian này" />
      ) : (
        <div className="dashboard-list">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="dashboard-list-item"
              onClick={() => onOpenProject(item.project_id)}
            >
              <span>
                <strong>{item.title}</strong>
                <small>
                  {item.project_name}
                  {item.assignee_name ? ` - ${item.assignee_name}` : ""}
                </small>
              </span>
              <span className="dashboard-list-item__meta">
                <Tag color={item.overdue ? "red" : "blue"}>{item.overdue ? "Quá hạn" : "Sắp đến hạn"}</Tag>
                <Tag color={PRIORITY_COLORS[item.priority]}>{item.priority}</Tag>
                <small>{formatDate(item.due_date)}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

function ProjectsAttentionList({
  items,
  onOpenProject,
}: {
  items: DashboardProjectAttention[];
  onOpenProject: (projectId: string) => void;
}) {
  return (
    <Card title="Project cần chú ý" className="dashboard-card">
      {items.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có project cần chú ý" />
      ) : (
        <div className="dashboard-list">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="dashboard-list-item"
              onClick={() => onOpenProject(item.id)}
            >
              <span>
                <strong>{item.name}</strong>
                <small>
                  {item.customer_name}
                  {item.current_step_name ? ` - ${item.current_step_name}` : ""}
                </small>
              </span>
              <span className="dashboard-list-item__meta">
                <Tag color={reasonColor(item.reason)}>{item.reason_label || reasonLabel(item.reason)}</Tag>
                <small>{formatVnd(item.remaining_amount)}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <section className="dashboard-kpis">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} size="small">
            <Skeleton active paragraph={false} />
          </Card>
        ))}
      </section>
      <Skeleton active paragraph={{ rows: 12 }} />
    </>
  );
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

function formatDate(value: string) {
  return dayjs(value).format("DD/MM/YYYY");
}

function getDefaultCustomRange() {
  return {
    from: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
    to: dayjs().format("YYYY-MM-DD"),
  };
}

function reasonLabel(reason: string) {
  const labels: Record<string, string> = {
    CONFLICT_DETECTED: "Xung đột lợi ích",
    PAYMENT_PENDING: "Cần thu phí",
    MISSING_WORKFLOW_STEP: "Chưa có workflow",
    OVERDUE_TASK: "Có việc quá hạn",
  };

  return labels[reason] ?? reason;
}

function reasonColor(reason: string) {
  const colors: Record<string, string> = {
    CONFLICT_DETECTED: "red",
    PAYMENT_PENDING: "orange",
    MISSING_WORKFLOW_STEP: "purple",
    OVERDUE_TASK: "volcano",
  };

  return colors[reason] ?? "default";
}
