import type { Role, User } from './user.types';

/** Server-level lifecycle states used by the retained Task workflow. */
export type TaskStatus = 'ACTIVE' | 'REJECTED' | 'DONE';

/** Progress state of the Task's current workflow step. */
export type TaskStepStatus = 'PROCESSING' | 'PENDING_APPROVAL';

/** Configuration required by current Task transition consumers. */
export interface WorkflowStepConfig {
  step: number;
  step_name: string;
  required_role: Role;
  require_file: boolean;
  require_payment: boolean;
  require_approval?: boolean;
  is_active?: boolean;
  is_fixed?: boolean;
  description?: string;
}

/** Task shape shared by the current repository, service, and workflow consumers. */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;

  workflow_id?: number;
  workflow_name?: string;
  current_step: number;
  current_step_config?: WorkflowStepConfig | null;
  step_status?: TaskStepStatus;
  current_step_role?: Role;
  is_last_step?: boolean;
  total_steps?: number;

  is_paid: boolean;
  is_collected: boolean;
  amount?: number | null;
  paid_amount?: number | null;
  collected_amount?: number | null;
  paid_at?: string | null;
  collected_at?: string | null;

  assignee?: User | null;
  assignee_id?: number | null;
  created_by?: number | User | null;

  deadline?: string | null;
  created_at?: string;
  updated_at?: string;

  /** Legacy consumer aliases retained until TK-02.3 migrates those consumers. */
  taskCode?: string;
  caseId?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  reporter?: User;
  tags?: string[];
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
}

export type TaskHistoryAction =
  | 'NEXT_STEP'
  | 'REJECT'
  | 'APPROVE'
  | 'ASSIGN'
  | 'UPLOAD'
  | 'PAYMENT';

/** Auditable transition record returned by the current Task history endpoint. */
export interface TaskHistory {
  id: number;
  action_type: TaskHistoryAction;
  note?: string | null;
  file_url?: string | null;
  created_by?: number | null;
  user_id?: number | null;
  actor_name?: string | null;
  user?: Pick<User, 'id' | 'full_name'> | null;
  created_at?: string | null;
}

/** Payment command accepted by the retained Task transition endpoint. */
export type PaymentAction = 'confirm_paid' | 'confirm_collected';
