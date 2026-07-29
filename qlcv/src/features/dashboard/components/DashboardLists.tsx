import type { DashboardDueItem, DashboardProjectAttention } from "@/api/dashboard.types";
import { getInitials } from "@/shared/lib/presentation";
import type { WorkloadItem } from "../model/dashboard.utils";
import { formatCompactVnd, formatDate, priorityLabel, reasonLabel, reasonTone } from "../model/dashboard.utils";
import { InlineEmpty } from "./DashboardPrimitives";

export function ProjectsAttentionList({ items }: { items: DashboardProjectAttention[] }) {
  if (items.length === 0) return <InlineEmpty>Không có project cần chú ý.</InlineEmpty>;
  return <div className="od-dashboard__attention-list">{items.map((item) => <div key={item.id} className="od-dashboard__attention-row"><div className="od-dashboard__truncate"><strong>{item.name}</strong><span>Khách hàng: {item.customer_name}{item.current_step_name ? ` · ${item.current_step_name}` : ""}</span></div><span className={`od-dashboard__tag ${reasonTone(item.reason)}`}>{item.reason_label || reasonLabel(item.reason)}</span><span className="od-dashboard__money">{formatCompactVnd(item.remaining_amount)}</span><a className="od-dashboard__link-button" href={`/projects/${item.id}`}>Xem</a></div>)}</div>;
}

export function DueItemsList({ items }: { items: DashboardDueItem[] }) {
  if (items.length === 0) return <InlineEmpty>Chưa có task backend trong khoảng thời gian này.</InlineEmpty>;
  return <div className="od-dashboard__due-list">{items.map((item) => <a key={item.id} className="od-dashboard__due-item" href={`/projects/${item.project_id}`}><span className="od-dashboard__due-title"><span>{item.title}</span><span className={`od-dashboard__tag ${item.overdue ? "danger" : "warn"}`}>{item.overdue ? "Overdue" : "Due soon"}</span></span><span className="od-dashboard__due-meta"><span>Issue</span><span>{item.assignee_name ?? "Chưa phân công"}</span><span>{priorityLabel(item.priority)}</span><span>{formatDate(item.due_date)}</span></span></a>)}</div>;
}

export function WorkloadList({ items }: { items: WorkloadItem[] }) {
  if (items.length === 0) return <InlineEmpty>Chưa có dữ liệu workload.</InlineEmpty>;
  return <div className="od-dashboard__workload-list">{items.slice(0, 4).map((item) => <a key={item.id} className="od-dashboard__workload-row" href={`/work?assignee_id=${item.id}`}><span className="od-dashboard__avatar">{getInitials(item.name)}</span><div className="od-dashboard__truncate"><strong>{item.name}</strong><span>{item.open} open · {item.overdue} overdue</span><span className={`od-dashboard__capacity ${item.capacity >= 90 ? "over" : item.capacity >= 80 ? "warn" : ""}`}><span style={{ width: `${item.capacity}%` }} /></span></div><span className="od-dashboard__percent">{item.capacity}%</span></a>)}</div>;
}
