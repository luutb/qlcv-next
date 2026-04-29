export interface Budget {
  id: number;
  name: string;
  description: string;
  budget_type: 'project' | 'department' | 'task' | 'contract';
  reference_id?: number;
  reference_name: string;
  total_budget: number;
  allocated_budget: number;
  spent_amount: number;
  committed_amount: number;
  remaining_budget: number;
  start_date: string; // ISO date
  end_date: string; // ISO date
  fiscal_year: number;
  quarter: number;
  currency: string;
  alert_threshold: number;
  status: 'draft' | 'approved' | 'active' | 'closed' | 'cancelled';
  approved_by?: number;
  approved_at?: string;
  owner_id: number;
  department_id?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  
  // Relations (optional)
  owner?: UserResponse;
  creator?: UserResponse;
  approver?: UserResponse;
  department?: string;
  categories?: BudgetCategory[];
  expenses?: Expense[];
  alerts?: BudgetAlert[];
  forecasts?: BudgetForecast[];
}

export interface BudgetCategory {
  id: number;
  budget_id: number;
  category_name: string;
  category_type: string;
  allocated_amount: number;
  spent_amount: number;
  committed_amount: number;
  remaining_amount: number;
  percentage: number;
  description: string;
  created_at: string;
  updated_at: string;
  expenses?: Expense[];
}

export interface Expense {
  id: number;
  budget_id: number;
  category_id?: number;
  title: string;
  description: string;
  amount: number;
  currency: string;
  exchange_rate: number;
  amount_in_base_currency: number;
  expense_type: 'actual' | 'committed' | 'forecast';
  expense_category: string;
  expense_date: string;
  period_start?: string;
  period_end?: string;
  task_id?: number;
  contract_id?: number;
  time_entry_id?: number;
  invoice_id?: number;
  vendor_name: string;
  vendor_id?: number;
  invoice_number: string;
  purchase_order_no: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approved_by?: number;
  approved_at?: string;
  paid_at?: string;
  receipt_url: string;
  attachment_urls: string;
  created_by: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  budget?: Budget;
  category?: BudgetCategory;
  creator?: UserResponse;
  approver?: UserResponse;
  attachments?: ExpenseAttachment[];
}

export interface ExpenseAttachment {
  id: number;
  expense_id: number;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

export interface BudgetAlert {
  id: number;
  budget_id: number;
  alert_type: 'threshold_exceeded' | 'over_budget' | 'forecast';
  alert_level: 'info' | 'warning' | 'critical';
  threshold: number;
  current_value: number;
  message: string;
  is_active: boolean;
  acknowledged_by?: number;
  acknowledged_at?: string;
  created_at: string;
  budget?: Budget;
  acknowledger?: UserResponse;
}

export interface BudgetForecast {
  id: number;
  budget_id: number;
  forecast_date: string;
  forecast_period: 'monthly' | 'quarterly' | 'annual';
  projected_spend: number;
  projected_total: number;
  variance_amount: number;
  variance_percent: number;
  confidence_level: number;
  forecast_method: string;
  assumptions: string;
  notes: string;
  created_by: number;
  created_at: string;
  budget?: Budget;
  creator?: UserResponse;
}

export interface CostCenter {
  id: number;
  code: string;
  name: string;
  description: string;
  department_id?: number;
  parent_id?: number;
  is_active: boolean;
  cost_center_type: string;
  annual_budget: number;
  current_spend: number;
  manager_id?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  department?: string;
  parent?: CostCenter;
  children?: CostCenter[];
  manager?: UserResponse;
  creator?: UserResponse;
  budgets?: Budget[];
}

// Request/Response DTOs
export interface CreateBudgetRequest {
  name: string;
  description?: string;
  budget_type: Budget['budget_type'];
  reference_id?: number;
  reference_name?: string;
  total_budget: number;
  start_date: string; // ISO date
  end_date: string; // ISO date
  fiscal_year: number;
  quarter?: number;
  currency?: string;
  department_id?: number;
  categories?: CreateBudgetCategoryRequest[];
}

export interface CreateBudgetCategoryRequest {
  category_name: string;
  category_type: string;
  allocated_amount: number;
  percentage: number;
  description?: string;
}

export interface CreateExpenseRequest {
  title: string;
  description?: string;
  amount: number;
  currency: string;
  expense_date: string;
  vendor_name?: string;
  category_id?: number;
  expense_type: Expense['expense_type'];
  task_id?: number;
  contract_id?: number;
}

// Response interfaces
export interface BudgetListResponse {
  budgets: Budget[];
  total: number;
  page: number;
  limit: number;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  total: number;
  page: number;
  limit: number;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface CategorySpendingResponse {
  category_name: string;
  category_type: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface BudgetQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  budget_type?: Budget['budget_type'];
  status?: Budget['status'];
  fiscal_year?: number;
  quarter?: number;
  department_id?: number;
  owner_id?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ExpenseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  status?: Expense['status'];
  expense_type?: Expense['expense_type'];
  start_date?: string;
  end_date?: string;
  vendor?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface BudgetSummaryData {
  total_budgets: number;
  total_amount: number;
  total_spent: number;
  total_remaining: number;
  over_budget_count: number;
  alert_count: number;
  utilization_rate: number;
}

export interface BudgetAnalyticsRequest {
  budget_ids?: number[];
  start_date: string;
  end_date: string;
  group_by: 'department' | 'category' | 'month' | 'quarter' | 'year';
  include_forecasts: boolean;
}

export interface BudgetAnalyticsResponse {
  period: string;
  total_budget: number;
  total_spent: number;
  total_committed: number;
  total_remaining: number;
  utilization_rate: number;
  variance_amount: number;
  variance_percent: number;
  category_breakdown: CategorySpendingResponse[];
}

// UI State interfaces
export interface BudgetState {
  budgets: Budget[];
  currentBudget: Budget | null;
  expenses: Expense[];
  categories: BudgetCategory[];
  alerts: BudgetAlert[];
  summary: BudgetSummaryData | null;
  loading: boolean;
  error: string | null;
}

export interface ExpenseFormData {
  title: string;
  description: string;
  amount: number;
  currency: string;
  expense_date: string;
  vendor_name: string;
  category_id: number | null;
  expense_type: Expense['expense_type'];
  task_id?: number;
  contract_id?: number;
  attachments: File[];
}

export interface BudgetFormData {
  name: string;
  description: string;
  budget_type: Budget['budget_type'];
  total_budget: number;
  currency: string;
  start_date: string;
  end_date: string;
  fiscal_year: number;
  quarter?: number;
  department_id?: number;
  reference_id?: number;
  reference_name?: string;
  categories: CreateBudgetCategoryRequest[];
}