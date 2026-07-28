import type { WorkflowStepConfig } from './task.types';
import type { Role, User } from './user.types';

/** Retained core Workflow definition exposed by list endpoints. */
export interface Workflow {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  step_count: number;
  created_at: string;
}

/** Core Workflow detail; templates and version-history UI are not part of this contract. */
export interface WorkflowDetail extends Workflow {
  steps: WorkflowStepConfig[];
  creator?: Pick<User, 'id' | 'full_name'>;
  updated_at: string;
}

/** Editable custom step accepted by the current core Workflow form. */
export interface CreateWorkflowStep {
  step_name: string;
  required_role: Role;
  require_file?: boolean;
  require_approval?: boolean;
  description?: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  steps_before_payment: CreateWorkflowStep[];
  processing_steps: CreateWorkflowStep[];
}

export interface UpdateWorkflowRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
  steps_before_payment?: CreateWorkflowStep[];
  processing_steps?: CreateWorkflowStep[];
}
