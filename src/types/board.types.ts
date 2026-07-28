export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskType = 'task' | 'bug' | 'story' | 'epic';

export interface Task {
  id: string | number;
  code: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  assignee?: {
    id: string | number;
    name: string;
    avatar?: string;
  };
  labels: Label[];
  due_date?: string;
  created_at: string;
  updated_at: string;
  case_id?: string | number;
  case_code?: string;
  comments_count?: number;
  subtasks_count?: number;
  subtasks_completed?: number;
  attachments_count?: number;
  is_starred?: boolean;
  is_blocked?: boolean;
  blockers?: string[];
}

export interface Label {
  id: string | number;
  name: string;
  color: string;
}

export interface BoardColumn {
  id: TaskStatus;
  title: string;
  count: number;
  limit?: number;
  color: string;
}

export interface FilterState {
  search?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignee?: string[];
  labels?: string[];
  due_date?: {
    from?: string;
    to?: string;
  };
}

export interface QuickFilter {
  id: string;
  label: string;
  filter: Partial<FilterState>;
}
