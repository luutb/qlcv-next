import dayjs from "dayjs";
import type { DashboardDueItem, DashboardQuery, DashboardRange } from "@/api/dashboard.types";

export type WorkloadItem = { id: string; name: string; open: number; overdue: number; capacity: number };

export function parseDashboardQuery(searchParams: URLSearchParams): DashboardQuery {
  const rangeParam = searchParams.get("range");
  return {
    range: isDashboardRange(rangeParam) ? rangeParam : "30d",
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    workflow_template_id: searchParams.get("workflow_template_id") ?? undefined,
    due_limit: 10,
    attention_limit: 10,
  };
}

export function applyDashboardQuery(params: URLSearchParams, query: DashboardQuery, next: Partial<DashboardQuery>) {
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
  return params;
}

export function buildWorkload(items: DashboardDueItem[]): WorkloadItem[] {
  const map = new Map<string, WorkloadItem>();
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

export const formatNumber = (value: number) => new Intl.NumberFormat("vi-VN").format(value);

export function formatVnd(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}

export function formatCompactVnd(value: number) {
  if (Math.abs(value) >= 1_000_000_000) return `${trimNumber(value / 1_000_000_000)}B`;
  if (Math.abs(value) >= 1_000_000) return `${trimNumber(value / 1_000_000)}M`;
  return formatNumber(value);
}

export const formatDate = (value: string) => dayjs(value).format("DD/MM/YYYY");
export const getDefaultCustomRange = () => ({
  from: dayjs().subtract(30, "day").format("YYYY-MM-DD"),
  to: dayjs().format("YYYY-MM-DD"),
});

export function rangeLabel(range: DashboardRange) {
  return ({ "7d": "7 ngày", "30d": "30 ngày", "90d": "90 ngày", custom: "kỳ tùy chọn" })[range];
}

export function reasonLabel(reason: string) {
  return ({ CONFLICT_DETECTED: "Conflict", PAYMENT_PENDING: "Payment", MISSING_WORKFLOW_STEP: "Workflow", OVERDUE_TASK: "Overdue" } as Record<string, string>)[reason] ?? reason;
}

export function reasonTone(reason: string) {
  return ({ CONFLICT_DETECTED: "danger", PAYMENT_PENDING: "warn", MISSING_WORKFLOW_STEP: "warn", OVERDUE_TASK: "danger" } as Record<string, string>)[reason] ?? "";
}

export function priorityLabel(priority: DashboardDueItem["priority"]) {
  return ({ LOW: "Low", MEDIUM: "Medium", HIGH: "High", URGENT: "Urgent" })[priority];
}

function isDashboardRange(value: string | null): value is DashboardRange {
  return value === "7d" || value === "30d" || value === "90d" || value === "custom";
}

function setOptionalParam(params: URLSearchParams, key: string, value?: string) {
  if (value) params.set(key, value);
  else params.delete(key);
}

function trimNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
