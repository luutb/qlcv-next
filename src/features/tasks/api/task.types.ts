export type TaskStatus = "TODO" | "DOING" | "DONE" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export type ReviewRequestStatus =
  | "NOT_REQUESTED"
  | "PENDING"
  | "CHANGES_REQUESTED"
  | "APPROVED";

export type ReviewDecision = "APPROVE" | "REQUEST_CHANGES";

export type TaskActor = {
  id: string;
  name?: string;
  full_name?: string;
  avatar?: string;
};

/** Canonical Task entity. `/issues` is deliberately not represented here. */
export type Task = {
  paid_amount?: number;
  is_paid?: boolean;
  paid_at?: string | null;
  amount?: number;
  collected_amount?: number;
  issue_type?: "WORK" | "PAYMENT_COLLECTION";
  payment_stage?: string | null;
  expected_amount?: number | null;
  id: string;
  project_id: string;
  parent_task_id?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string | null;
  due_date?: string | null;
  due_at?: string | null;
  workflow_step_id?: string | null;
  step_key?: string | null;
  step_name?: string | null;
  workflow_sort_order?: number | null;
  labels?: Array<{ id: string; title: string; color: string; label_type?: string }>;
  comment_count?: number;
  checklist?: { completed: number; total: number };
  assignee?: { id: string; display_name: string; avatar_url?: string | null } | null;
  position: number;
  is_required: boolean;
  created_at?: string;
  updated_at?: string;
  actions?: { edit?: boolean; move?: boolean; comment?: boolean; request_review?: boolean; review?: boolean };
};

export type TaskDependency = {
  depends_on_task_id: string;
  title: string;
  status: TaskStatus;
  created_by: string;
  created_at: string;
};

export type TaskComment = {
  id: string;
  task_id: string;
  content: string;
  author: TaskActor;
  created_at?: string;
  updated_at?: string;
  edited: boolean;
  actions?: unknown;
};

export type TaskReview = {
  id: string;
  task_id: string;
  review_request_id: string;
  reviewer: { id: string; full_name: string; avatar_url?: string | null };
  decision: ReviewDecision;
  content: string;
  created_at: string;
};

export type TaskHistoryItem = {
  id: string;
  user_id?: string | null;
  action: string;
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type Pagination = {
  limit: number;
  offset: number;
  count: number;
  total: number;
};

export type ApiList<T> = {
  data: T[];
  pagination?: Pagination;
};

export type TaskListFilters = {
  project_id?: string;
  assignee_id?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  q?: string;
  limit?: number;
  offset?: number;
};

export type TaskBoardFilters = TaskListFilters & {
  workflow_template_id?: string;
  include_unassigned?: boolean;
  label_id?: string;
};

export type TaskBoardColumn = {
  id: string;
  key?: string;
  name: string;
  sort_order: number;
  macro_column?: string;
  count?: number;
  tasks: Task[];
};

export type TaskBoardResponse = {
  workflow_template_id?: string;
  columns: TaskBoardColumn[];
};

export type TaskPagingParams = Pick<Pagination, "limit" | "offset">;

export type CreateTaskInput = {
  amount?: number;
  issue_type?: "WORK" | "PAYMENT_COLLECTION";
  payment_stage?: string | null;
  expected_amount?: number | null;
  due_at?: string | null;
  project_id: string;
  workflow_step_id?: string | null;
  parent_task_id?: string | null;
  is_required?: boolean;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignee_id?: string | null;
  due_date?: string;
  position?: number;
};

/** PUT replaces editable fields; callers must preserve existing task metadata. */
export type UpdateTaskInput = Partial<Omit<CreateTaskInput, "project_id">>;

export type UpdateTaskStatusInput = { status: TaskStatus };
export type UpdateTaskWorkflowStepInput = { workflow_step_id: string; position?: number };
export type MoveTaskInput = { workflow_step_id: string; before_task_id?: string };
export type UpdateTaskAssigneeInput = { assignee_id: string | null };
export type ReorderTasksInput = { items: Array<{ id: string; position: number }> };
export type CreateDependencyInput = { depends_on_task_id: string };
export type CreateCommentInput = { content: string };
export type UpdateCommentInput = { content: string };
export type CreateReviewRequestInput = { reviewer_ids: string[] };
export type CreateReviewInput = {
  decision: ReviewDecision;
  content: string;
};


export type TaskReviewListResponse = ApiList<TaskReview> & { review_status?: ReviewRequestStatus };
export type TaskHistoryListResponse = ApiList<TaskHistoryItem>;
