export const ISSUE_STATUSES = ["BACKLOG", "TODO", "DOING", "REVIEW", "DONE"] as const;
export const ISSUE_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[number];
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];

export type IssueLabel = {
  name: string;
  color: string;
};

export type IssueActions = {
  edit: boolean;
  delete: boolean;
  move: boolean;
  assign: boolean;
  close: boolean;
};

export type Issue = {
  id: string;
  organization_id: string;
  project_id: string;
  project_name?: string;
  title: string;
  description?: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  assignee_id?: string | null;
  assignee_name?: string | null;
  created_by?: string | null;
  due_date?: string | null;
  position: number;
  labels: IssueLabel[];
  closed_at?: string | null;
  created_at: string;
  updated_at: string;
  actions?: IssueActions;
};

export type IssueListFilters = {
  project_id?: string;
  status?: IssueStatus;
  assignee_id?: string;
  priority?: IssuePriority;
  label?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export type Pagination = {
  total: number;
  limit: number;
  offset: number;
  count: number;
};

export type IssueListResponse = {
  data: Issue[];
  pagination: Pagination;
};

export type IssueBoardColumn = {
  status: IssueStatus;
  title: string;
  issues: Issue[];
};

export type IssueBoardResponse = {
  columns: IssueBoardColumn[];
};

export type CreateIssueRequest = {
  project_id: string;
  title: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assignee_id?: string | null;
  due_date?: string | null;
  labels?: IssueLabel[];
};

export type CreateIssueResponse = {
  id: string;
  title: string;
  status: IssueStatus;
};

export type UpdateIssueRequest = {
  title?: string;
  description?: string | null;
  priority?: IssuePriority;
  assignee_id?: string | null;
  due_date?: string | null;
  labels?: IssueLabel[];
};

export type MoveIssueRequest = {
  status: IssueStatus;
  position: number;
};

export type MoveIssueResponse = {
  id: string;
  status: IssueStatus;
  position: number;
};

export type DeleteIssueResponse = {
  message: string;
};

export function listIssues(filters: IssueListFilters = {}, signal?: AbortSignal) {
  void filters;
  void signal;
  return rejectIssueBacklog<IssueListResponse>();
}

export function getIssueBoard(filters: IssueListFilters = {}, signal?: AbortSignal) {
  void filters;
  void signal;
  return rejectIssueBacklog<IssueBoardResponse>();
}

export function createIssue(payload: CreateIssueRequest) {
  void payload;
  return rejectIssueBacklog<CreateIssueResponse>();
}

export function getIssue(id: string, signal?: AbortSignal) {
  void id;
  void signal;
  return rejectIssueBacklog<Issue>();
}

export function updateIssue(id: string, payload: UpdateIssueRequest) {
  void id;
  void payload;
  return rejectIssueBacklog<Issue>();
}

export function moveIssue(id: string, payload: MoveIssueRequest) {
  void id;
  void payload;
  return rejectIssueBacklog<MoveIssueResponse>();
}

export function deleteIssue(id: string) {
  void id;
  return rejectIssueBacklog<DeleteIssueResponse>();
}

function rejectIssueBacklog<T>(): Promise<T> {
  return Promise.reject(
    new Error("Issue Board is backlog-only. Backend production flow uses project workflow board."),
  );
}
