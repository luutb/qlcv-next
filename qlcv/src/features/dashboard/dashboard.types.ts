export type DashboardRange = "7d" | "30d" | "90d" | "custom";

export type DashboardQuery = {
  range?: DashboardRange;
  from?: string;
  to?: string;
  workflow_template_id?: string;
  due_limit?: number;
  attention_limit?: number;
};

export type DashboardIssueStatus = "BACKLOG" | "TODO" | "DOING" | "REVIEW" | "DONE";
export type DashboardMacroColumn = "INTAKE" | "IN_PROGRESS" | "BILLING" | "ARCHIVED";

export type DashboardDueItem = {
  id: string;
  title: string;
  project_id: string;
  project_name: string;
  assignee_id?: string;
  assignee_name?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  due_date: string;
  overdue: boolean;
};

export type DashboardProjectAttention = {
  id: string;
  name: string;
  customer_id: string;
  customer_name: string;
  reason: "CONFLICT_DETECTED" | "PAYMENT_PENDING" | "MISSING_WORKFLOW_STEP" | "OVERDUE_TASK" | string;
  reason_label: string;
  current_step_name?: string;
  remaining_amount: number;
};

export type DashboardSummary = {
  range: {
    from: string;
    to: string;
  };
  kpis: {
    open_issues: number;
    overdue_issues: number;
    active_projects: number;
    revenue_collected: number;
  };
  issue_status: Array<{
    status: DashboardIssueStatus;
    count: number;
  }>;
  project_workflow: Array<{
    macro_column: DashboardMacroColumn;
    title: string;
    count: number;
  }>;
  due_items: DashboardDueItem[];
  projects_need_attention: DashboardProjectAttention[];
};
