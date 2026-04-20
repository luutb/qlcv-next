export type Role = 'admin' | 'manager' | 'staff' | 'accountant';

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: Role;
  is_active?: boolean;
}

export interface AuthTokens {
  token: string;
  refresh_token?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refresh_token: string;
  user: User;
}

export type StepStatus = 'PROCESSING' | 'PENDING_APPROVAL';

export interface Customer {
  id: number;
  full_name: string;
  phone?: string;
  email?: string;
  id_number?: string;
  address?: string;
  company_name?: string;
  tax_code?: string;
  note?: string;
  created_by?: number;
  creator?: { id: number; full_name: string; role: string };
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerRequest {
  full_name: string;
  phone?: string;
  email?: string;
  id_number?: string;
  address?: string;
  company_name?: string;
  tax_code?: string;
  note?: string;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface Contract {
  id: number;
  task_id: number;
  contract_number: string;
  contract_type_id?: number;
  contract_type_name?: string;
  title: string;
  value?: number;
  signing_date?: string;
  effective_date?: string;
  expiry_date?: string;
  status: 'draft' | 'signed' | 'active' | 'expired' | 'cancelled';
  file_url?: string;
  note?: string;
  created_by?: number;
  creator?: { id: number; full_name: string; role: string };
  created_at: string;
  updated_at: string;
}

export interface CreateContractRequest {
  contract_number: string;
  contract_type_id?: number;
  title: string;
  value?: number;
  signing_date?: string;
  effective_date?: string;
  expiry_date?: string;
  status?: Contract['status'];
  file_url?: string;
  note?: string;
}

export interface ContractType {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateContractTypeRequest {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateContractTypeRequest {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface Task {
  id: number;
  workflow_id?: number;
  customer_id?: number | null;
  // customer model (nếu chưa có, đảm bảo bạn có interface Customer ở file này)
  customer?: Customer | null;

  title: string;
  description?: string;
  current_step: number;
  // step status e.g. PROCESSING
  step_status?: StepStatus | string;
  // role required for current step
  current_step_role?: string;
  // flag if this is last step
  is_last_step?: boolean;

  status: 'ACTIVE' | 'REJECTED' | 'DONE';
  is_paid: boolean;
  is_collected: boolean;
  amount?: number | null;
  paid_amount?: number | null;
  collected_amount?: number | null;
  paid_at?: string | null;
  collected_at?: string | null;

  assignee?: { id: number; full_name: string } | null;
  assignee_id?: number | null;

  // created_by can be id or user object
  created_by?: number | { id: number; full_name: string } | null;

  // documents / contracts may be null from API
  documents?: TaskDocument[] | null;
  contracts?: Contract[] | null;

  // current step config (may be present)
  current_step_config?: WorkflowStepConfig | null;

  workflow_name?: string;
  total_steps?: number;

  // API uses "deadline"
  deadline?: string | null;

  created_at: string;
  updated_at: string;
}

export interface TaskDocument {
  id: number;
  step: number;
  version: number;
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

export interface TaskHistory {
  id: number;
  action_type: 'NEXT_STEP' | 'REJECT' | 'APPROVE' | 'ASSIGN' | 'UPLOAD' | 'PAYMENT' | string;
  note?: string | null;
  file_url?: string | null;
  // actor info (API may provide one of these)
  created_by?: number | null;
  user_id?: number | null;
  actor_name?: string | null;
  // optional embedded user object (some endpoints include nested user)
  user?: {
    id?: number;
    full_name?: string | null;
    email?: string | null;
  } | null;
  created_at?: string | null;
  // extendable: any other metadata
  [key: string]: any;
}

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

// ── Workflow ──

export interface Workflow {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  step_count: number;
  created_at: string;
}

export interface WorkflowDetail extends Workflow {
  steps: WorkflowStepConfig[];
  creator?: { id: number; full_name: string };
  updated_at: string;
}

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

export interface Notification {
  id: number;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  task_id?: number;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// ── User Management ──

export interface UserCertificate {
  id: number;
  user_id: number;
  name: string;
  type: 'degree' | 'certificate';
  issuing_organization?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  file_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserEducation {
  id: number;
  user_id: number;
  institution: string;
  degree?: string;
  field_of_study?: string;
  start_year?: number;
  end_year?: number;
  gpa?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface UserDetail extends User {
  email?: string;
  phone?: string;
  avatar_url?: string;
  department?: string;
  position?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  created_by?: number;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  certificates: UserCertificate[];
  educations: UserEducation[];
}

export interface CreateUserRequest {
  username: string;
  password: string;
  full_name: string;
  email?: string;
  phone?: string;
  role: Role;
  department?: string;
  position?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  is_active?: boolean;
}

export interface UpdateUserRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  role?: Role;
  department?: string;
  position?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  is_active?: boolean;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role | '';
  is_active?: boolean | '';
  department?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CreateCertificateRequest {
  name: string;
  type: 'degree' | 'certificate';
  issuing_organization?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  file_url?: string;
}

export interface CreateEducationRequest {
  institution: string;
  degree?: string;
  field_of_study?: string;
  start_year?: number;
  end_year?: number;
  gpa?: string;
  description?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
}

export type PaymentAction = 'confirm_paid' | 'confirm_collected';

export interface PaymentRequest {
  action: PaymentAction;
  amount: number;
  note?: string;
}

export interface ApiError {
  code: string;
  message: string;
}
