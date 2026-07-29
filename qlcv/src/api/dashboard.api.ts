import { apiRequest } from "./client";
import type { DashboardQuery, DashboardSummary } from "./dashboard.types";

export function getDashboardSummary(query: DashboardQuery, signal?: AbortSignal) {
  return apiRequest<DashboardSummary>("/api/v1/dashboard/summary", {
    query: {
      range: query.range ?? "30d",
      from: query.range === "custom" ? query.from : undefined,
      to: query.range === "custom" ? query.to : undefined,
      workflow_template_id: query.workflow_template_id,
      due_limit: query.due_limit,
      attention_limit: query.attention_limit,
    },
    signal,
  });
}
