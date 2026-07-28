// Board Task Types - Shared across board components

export interface Label {
  id: number;
  name: string;
  color: string;
  bg_color: string;
  icon?: string;
  description?: string;
  category?: string;
}

export interface TaskLabels {
  workflow_step: Label;
  payment_status: Label;
  task_status: Label;
  priority: Label;
  custom_labels: Label[] | null;
}

export interface Task {
  id: number;
  issue_number: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  start_date: string | null;
  weight: number;
  confidential: boolean;
  milestone: {
    id: number;
    title: string;
    due_date: string | null;
  } | null;
  assignees: Array<{
    id: number;
    username: string;
    name: string;
    avatar_url: string;
  }>;
  labels: TaskLabels;
  customer: {
    full_name: string;
    company_name: string;
    phone?: string;
    email?: string;
  };
  subtasks_count?: number;
  subtasks_completed?: number;
  due_date_status?: 'none' | 'due_soon' | 'overdue';
  created_at: string;
  updated_at: string;
  reporter?: {
    id: number;
    username: string;
    name: string;
    avatar_url: string;
  };
}
