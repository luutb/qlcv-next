// Canonical Label admin/domain types. Board labels remain a feature projection.

export enum LabelCategory {
  WORKFLOW = 'workflow',
  PAYMENT = 'payment',
  STATUS = 'status',
  PRIORITY = 'priority',
  CUSTOMER = 'customer',
  CONTRACT = 'contract',
  SPECIAL = 'special',
  CUSTOM = 'custom'
}

export interface Label {
  id: number;
  name: string;
  color: string;
  bg_color: string;
  icon?: string;
  description?: string;
  category: LabelCategory;
  is_system: boolean;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export interface SystemLabels {
  workflow: Label[];
  payment: Label[];
  status: Label[];
  priority: Label[];
}

export interface LabelsResponse {
  system_labels: SystemLabels;
  custom_labels: Label[];
}

export interface TaskLabels {
  workflow_step?: Label;
  payment_status?: Label;
  task_status?: Label;
  priority?: Label;
  custom_labels: Label[];
}

export interface CreateLabelData {
  name: string;
  color: string;
  bg_color: string;
  icon?: string;
  description?: string;
  category: Exclude<LabelCategory, LabelCategory.WORKFLOW | LabelCategory.PAYMENT | LabelCategory.STATUS | LabelCategory.PRIORITY>;
}

export interface UpdateLabelData {
  name?: string;
  color?: string;
  bg_color?: string;
  icon?: string;
  description?: string;
}

export interface UpdateTaskLabelsData {
  custom_labels?: number[];
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface LabelStatistics {
  label_usage: Record<string, {
    total_tasks: number;
    active_tasks: number;
    completed_tasks: number;
    avg_completion_time: string;
  }>;
  most_used_labels: Array<{
    id: number;
    name: string;
    usage_count: number;
  }>;
}
