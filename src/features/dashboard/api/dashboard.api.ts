import { apiUrl, parseApiResponse } from "@/services/http";
import type { TaskPriority, TaskStatus } from "@/features/tasks/api";

export type DashboardSummaryQuery = {
  range?: "7d" | "30d" | "90d" | "custom";
  from?: string;
  to?: string;
};

export type DashboardSummary = {
  viewer?: { name: string };
  range: { from: string; to: string };
  kpis: {
    total_tasks: number;
    in_progress_tasks: number;
    completed_tasks: number;
    open_issues: number;
    overdue_issues: number;
    active_projects: number;
    revenue_collected: number | null;
    active_users?: number;
    revenue_delta_percent?: number;
    task_change_percent?: number;
    in_progress_change_percent?: number;
    completed_change_percent?: number;
  };
  task_status: Array<{ status: string; count: number; percent?: number }>;
  issue_status: Array<{ status: TaskStatus; count: number }>;
  issue_type: Array<{ type: "WORK" | "PAYMENT_COLLECTION"; count: number }>;
  billing: {
    revenue_collected: number;
    cost_total: number | null;
    outstanding_amount: number;
    series: Array<{ period: string; revenue: number; cost: number | null }>;
  } | null;
  project_workflow: Array<{ macro_column: string; title: string; count: number }>;
  due_items: Array<{
    id: string;
    title: string;
    project_id: string;
    project_name: string;
    assignee_id?: string;
    assignee_name?: string;
    priority: TaskPriority;
    due_date: string;
    overdue: boolean;
    status?: TaskStatus;
    due_time?: string | null;
  }>;
  projects_need_attention: Array<{
    id: string;
    name: string;
    customer_id: string;
    customer_name: string;
    reason: string;
    reason_label: string;
    current_step_name?: string;
    remaining_amount: number;
  }>;
  workload: Array<{
    user_id: string;
    user_name: string;
    task_count: number;
    completed_count: number;
    overdue_count: number;
    role?: string;
    avatar_url?: string | null;
    presence?: string | null;
  }>;
  recent_activity: Array<{
    id: string;
    title: string;
    project_id: string;
    project_name: string;
    status: string;
    updated_at: string;
    actor?: { id: string; display_name: string; avatar_url?: string | null; role?: string } | null;
    action_label?: string;
    description?: string;
    occurred_at?: string;
  }>;
  highlighted_projects?: Array<{
    id: string;
    name: string;
    completed_tasks: number;
    total_tasks: number;
    progress_percent: number;
    tone?: "blue" | "purple" | "violet" | "orange";
    members?: Array<{ id: string; display_name: string; avatar_url?: string | null }>;
  }>;
  calendar_events?: Array<{
    id: string;
    title: string;
    starts_at: string;
    ends_at?: string | null;
    tone?: "blue" | "cyan" | "orange";
    related_task_id?: string | null;
    related_project_id?: string | null;
  }>;
};

export class DashboardSummaryContractError extends Error {
  constructor() {
    super("Dashboard summary response không đúng canonical contract.");
    this.name = "DashboardSummaryContractError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isDashboardSummary(value: unknown): value is DashboardSummary {
  // Dashboard is an aggregate response. Some API deployments include envelope
  // metadata (for example pagination) alongside `data`; that metadata is not
  // part of the aggregate contract and must not invalidate an otherwise valid
  // summary.
  if (!isRecord(value)) return false;
  const range = value.range;
  const kpis = value.kpis;
  if (!isRecord(range) || typeof range.from !== "string" || typeof range.to !== "string") return false;
  if (!isRecord(kpis) || ["total_tasks", "in_progress_tasks", "completed_tasks", "open_issues", "overdue_issues", "active_projects"].some((key) => typeof kpis[key] !== "number")) return false;
  if (kpis.revenue_collected !== null && typeof kpis.revenue_collected !== "number") return false;
  if (!Array.isArray(value.task_status) || !value.task_status.every((item) => isRecord(item) && typeof item.status === "string" && typeof item.count === "number" && (item.percent === undefined || typeof item.percent === "number"))) return false;
  if (!Array.isArray(value.issue_status) || !value.issue_status.every((item) => isRecord(item) && typeof item.status === "string" && typeof item.count === "number")) return false;
  if (!Array.isArray(value.issue_type) || !value.issue_type.every((item) => isRecord(item) && (item.type === "WORK" || item.type === "PAYMENT_COLLECTION") && typeof item.count === "number")) return false;
  const billing = value.billing;
  if (billing !== null && (!isRecord(billing) || ["revenue_collected", "outstanding_amount"].some((key) => typeof billing[key] !== "number") || (billing.cost_total !== null && typeof billing.cost_total !== "number") || !Array.isArray(billing.series) || !billing.series.every((item) => isRecord(item) && typeof item.period === "string" && typeof item.revenue === "number" && (item.cost === null || typeof item.cost === "number")))) return false;
  if (!Array.isArray(value.project_workflow) || !value.project_workflow.every((item) => isRecord(item) && typeof item.macro_column === "string" && typeof item.title === "string" && typeof item.count === "number")) return false;
  if (!Array.isArray(value.due_items) || !value.due_items.every((item) => isRecord(item) && typeof item.id === "string" && typeof item.title === "string" && typeof item.project_id === "string" && typeof item.project_name === "string" && ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(item.priority as string) && typeof item.due_date === "string" && typeof item.overdue === "boolean")) return false;
  if (!Array.isArray(value.projects_need_attention) || !value.projects_need_attention.every((item) => isRecord(item) && typeof item.id === "string" && typeof item.name === "string" && typeof item.customer_id === "string" && typeof item.customer_name === "string" && typeof item.reason === "string" && typeof item.reason_label === "string" && typeof item.remaining_amount === "number")) return false;
  if (!Array.isArray(value.workload) || !value.workload.every((item) => isRecord(item) && typeof item.user_id === "string" && typeof item.user_name === "string" && typeof item.task_count === "number" && typeof item.completed_count === "number" && typeof item.overdue_count === "number")) return false;
  if (!Array.isArray(value.recent_activity) || !value.recent_activity.every((item) => isRecord(item) && typeof item.id === "string" && typeof item.title === "string" && typeof item.project_id === "string" && typeof item.project_name === "string" && typeof item.status === "string" && typeof item.updated_at === "string")) return false;
  return true;
}

export function normalizeDashboardSummary(value: unknown): DashboardSummary {
  if (!isRecord(value)) throw new DashboardSummaryContractError();

  const records = (items: unknown) => Array.isArray(items) ? items.filter(isRecord) : [];
  // Keep the UI usable while older API instances are being rolled out. The
  // client never invents issue-type counts; it only represents an omitted
  // field as empty until the server returns the canonical field.
  const issueType = records(value.issue_type);
  const issueStatus = records(value.issue_status).filter((item) => item.status !== "BACKLOG" && item.status !== "REVIEW");

  const kpis = isRecord(value.kpis) ? value.kpis : {};
  const normalized = {
    ...value, issue_type: issueType, issue_status: issueStatus,
    task_status: records(value.task_status), project_workflow: records(value.project_workflow),
    due_items: records(value.due_items), projects_need_attention: records(value.projects_need_attention),
    workload: records(value.workload),
    kpis: { ...kpis, active_users: kpis.employee_count ?? kpis.active_users, revenue_delta_percent: kpis.revenue_change_percent ?? kpis.revenue_delta_percent },
    highlighted_projects: records(value.project_highlights ?? value.highlighted_projects).map((project) => ({
      ...project, members: records(project.members).map((member) => ({ ...member, id: member.user_id ?? member.id, display_name: member.name ?? member.display_name })),
    })),
    recent_activity: records(value.recent_activity).map((activity) => ({
      ...activity, actor: activity.actor ?? (activity.actor_name ? { id: activity.actor_id, display_name: activity.actor_name, avatar_url: activity.actor_avatar_url } : null),
      action_label: activity.action_label ?? activity.action, description: activity.message ?? activity.description ?? activity.target_title,
    })),
    calendar_events: records(value.calendar_events).filter((event) => typeof (event.start_at ?? event.starts_at) === "string").map((event) => ({
      ...event, starts_at: event.start_at ?? event.starts_at, ends_at: event.end_at ?? event.ends_at ?? null,
    })),
  };
  if (!isDashboardSummary(normalized)) throw new DashboardSummaryContractError();
  return normalized;
}

function queryString(query: DashboardSummaryQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, value);
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  summary: (query: DashboardSummaryQuery = {}) => [...dashboardQueryKeys.all, "summary", query] as const,
};

export async function getDashboardSummary(accessToken: string, query: DashboardSummaryQuery = {}, signal?: AbortSignal): Promise<DashboardSummary> {
  const response = await fetch(apiUrl(`/dashboard/summary${queryString(query)}` as `/${string}`), {
    headers: { Accept: "application/json", Authorization: `Bearer ${accessToken}` },
    signal,
  });
  const payload = await parseApiResponse<unknown>(response);
  const summary = isRecord(payload) && "data" in payload ? payload.data : payload;
  return normalizeDashboardSummary(summary);
}
