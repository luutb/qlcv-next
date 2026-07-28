import type { User } from './user.types';
import type { Task, TaskStatus } from './task.types';

export type {
  CreateCertificateRequest,
  CreateEducationRequest,
  CreateUserRequest,
  Role,
  UpdateProfileRequest,
  UpdateUserRequest,
  User,
  UserCertificate,
  UserDetail,
  UserEducation,
  UserQueryParams,
} from './user.types';
export type {
  PaymentAction,
  Task,
  TaskHistory,
  TaskHistoryAction,
  TaskStatus,
  TaskStepStatus,
  WorkflowStepConfig,
} from './task.types';
export type {
  Case,
  CaseMember,
  CaseStatus,
  MemberRole,
} from './case.types';
export { LabelCategory } from './label.types';
export type {
  Label,
} from './label.types';
export type {
  Budget,
  BudgetAlert,
  BudgetCategory,
  BudgetListResponse,
  BudgetQueryParams,
  BudgetSummaryData,
  CostCenter,
  CreateBudgetCategoryRequest,
  CreateBudgetRequest,
  CreateExpenseRequest,
  Expense,
  ExpenseAttachment,
  ExpenseListResponse,
  ExpenseQueryParams,
} from './budget';
export type {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from './payment.types';
export type {
  CreateWorkflowRequest,
  CreateWorkflowStep,
  UpdateWorkflowRequest,
  Workflow,
  WorkflowDetail,
} from './workflow.types';
export type {
  UserCapacity,
  WorkloadDistribution,
  WorkloadMetrics,
  WorkloadUser,
} from './workload.types';

// Core Domain Types
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Core Interfaces
export interface Permission {
  id: string;
  resource: string;
  actions: string[];
  conditions?: {
    ownedOnly?: boolean;
    departmentOnly?: boolean;
    timeRestricted?: boolean;
  };
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  caseId: string;
  clientId: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: User;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface WorkLog {
  id: string;
  taskId: string;
  userId: string;
  description: string;
  timeSpent: number; // in minutes
  date: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// API Request Types
export interface LoginRequest {
  username: string;
  password: string;
}

// API Response Types
export interface LoginResponse {
  token: string;
  refresh_token: string;
  user: User;
}

export interface TaskForm {
  title: string;
  description: string;
  priority: Priority;
  assigneeId: string;
  dueDate?: string;
  estimatedHours?: number;
  tags: string[];
  caseId: string;
}

export interface CaseForm {
  title: string;
  description: string;
  priority: Priority;
  clientId: string;
  assignedToId: string;
  dueDate?: string;
  estimatedHours?: number;
  tags: string[];
}

// Query Parameters
export interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
  caseId?: string;
  search?: string;
  tags?: string[];
  dueDate?: string;
}

// UI State Types
export interface BoardColumn {
  id: string;
  title: string;
  status: TaskStatus;
  tasks: Task[];
  limit?: number;
}

export interface FilterState {
  status: TaskStatus[];
  priority: Priority[];
  assignee: string[];
  tags: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalCases: number;
  activeCases: number;
  myTasks: number;
  overdueTasks: number;
  pendingPayments: number;
  totalRevenue: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
  }[];
}

// Error Types
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}

// Theme Types
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  fontSize: 'sm' | 'md' | 'lg';
}

// Customer Types
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

// Export all enums and types
export type FileType = 'pdf' | 'docx' | 'xlsx' | 'image' | 'video' | 'other';
export type ViewMode = 'board' | 'list' | 'calendar' | 'gantt';
