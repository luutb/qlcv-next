import {
  Budget,
  BudgetCategory,
  Expense,
  BudgetAlert,
  BudgetForecast,
  CostCenter,
  CreateBudgetRequest,
  CreateExpenseRequest,
  BudgetQueryParams,
  ExpenseQueryParams,
  BudgetSummaryData,
  BudgetAnalyticsRequest,
  BudgetAnalyticsResponse,
  BudgetListResponse,
  ExpenseListResponse,
  CreateBudgetCategoryRequest,
} from '@/types/budget';

// Mock data for testing
const mockBudgets: Budget[] = [
  {
    id: 1,
    name: 'Ngân sách Marketing Q1 2024',
    description: 'Ngân sách cho hoạt động marketing quý 1',
    budget_type: 'department',
    reference_id: 1,
    reference_name: 'Phòng Marketing',
    total_budget: 500000000,
    allocated_budget: 450000000,
    spent_amount: 320000000,
    committed_amount: 80000000,
    remaining_budget: 100000000,
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-03-31T23:59:59Z',
    fiscal_year: 2024,
    quarter: 1,
    currency: 'VND',
    alert_threshold: 80,
    status: 'active',
    owner_id: 1,
    department_id: 1,
    created_by: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    name: 'Ngân sách Dự án ABC',
    description: 'Ngân sách cho dự án phát triển sản phẩm ABC',
    budget_type: 'project',
    reference_id: 1,
    reference_name: 'Dự án ABC',
    total_budget: 1000000000,
    allocated_budget: 800000000,
    spent_amount: 450000000,
    committed_amount: 200000000,
    remaining_budget: 350000000,
    start_date: '2024-01-01T00:00:00Z',
    end_date: '2024-12-31T23:59:59Z',
    fiscal_year: 2024,
    quarter: 0,
    currency: 'VND',
    alert_threshold: 85,
    status: 'active',
    owner_id: 2,
    department_id: 2,
    created_by: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T14:15:00Z',
  },
];

const mockCategories: BudgetCategory[] = [
  {
    id: 1,
    budget_id: 1,
    category_name: 'Quảng cáo trực tuyến',
    category_type: 'marketing',
    allocated_amount: 200000000,
    spent_amount: 150000000,
    committed_amount: 30000000,
    remaining_amount: 20000000,
    percentage: 40,
    description: 'Chi phí quảng cáo Facebook, Google Ads',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    budget_id: 1,
    category_name: 'Sự kiện & Hội thảo',
    category_type: 'marketing',
    allocated_amount: 150000000,
    spent_amount: 100000000,
    committed_amount: 25000000,
    remaining_amount: 25000000,
    percentage: 30,
    description: 'Tổ chức sự kiện, hội thảo khách hàng',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z',
  },
];

const mockExpenses: Expense[] = [
  {
    id: 1,
    budget_id: 1,
    category_id: 1,
    title: 'Quảng cáo Facebook tháng 1',
    description: 'Chi phí quảng cáo Facebook cho chiến dịch sản phẩm mới',
    amount: 50000000,
    currency: 'VND',
    exchange_rate: 1,
    amount_in_base_currency: 50000000,
    expense_type: 'actual',
    expense_category: 'marketing',
    expense_date: '2024-01-15T00:00:00Z',
    vendor_name: 'Facebook Inc.',
    invoice_number: 'FB-2024-001',
    purchase_order_no: 'PO-2024-001',
    status: 'approved',
    receipt_url: '/receipts/fb-2024-001.pdf',
    attachment_urls: '/receipts/fb-2024-001.pdf',
    created_by: 1,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-16T09:00:00Z',
  },
];

const mockAlerts: BudgetAlert[] = [
  {
    id: 1,
    budget_id: 1,
    alert_type: 'threshold_exceeded',
    alert_level: 'warning',
    threshold: 80,
    current_value: 85,
    message: 'Ngân sách Marketing Q1 đã sử dụng 85% (vượt ngưỡng 80%)',
    is_active: true,
    created_at: '2024-01-20T10:00:00Z',
  },
];

export class BudgetRepositoryMock {
  private static instance: BudgetRepositoryMock;
  
  private constructor() {}

  static getInstance(): BudgetRepositoryMock {
    if (!BudgetRepositoryMock.instance) {
      BudgetRepositoryMock.instance = new BudgetRepositoryMock();
    }
    return BudgetRepositoryMock.instance;
  }

  // Simulate API delay
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Budget Management
  async getBudgets(params?: BudgetQueryParams): Promise<BudgetListResponse> {
    await this.delay();
    return {
      budgets: mockBudgets,
      total: mockBudgets.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
    };
  }

  async getBudget(id: number): Promise<Budget> {
    await this.delay();
    const budget = mockBudgets.find(b => b.id === id);
    if (!budget) throw new Error('Budget not found');
    return budget;
  }

  async createBudget(data: CreateBudgetRequest): Promise<Budget> {
    await this.delay();
    const newBudget: Budget = {
      id: Date.now(),
      name: data.name,
      description: data.description || '',
      budget_type: data.budget_type,
      reference_id: data.reference_id,
      reference_name: data.reference_name || '',
      total_budget: data.total_budget,
      allocated_budget: data.total_budget,
      spent_amount: 0,
      committed_amount: 0,
      remaining_budget: data.total_budget,
      start_date: data.start_date,
      end_date: data.end_date,
      fiscal_year: data.fiscal_year,
      quarter: data.quarter || 0,
      currency: data.currency || 'VND',
      alert_threshold: 80,
      status: 'draft',
      owner_id: 1,
      department_id: data.department_id,
      created_by: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockBudgets.push(newBudget);
    return newBudget;
  }

  async updateBudget(id: number, data: Partial<CreateBudgetRequest>): Promise<Budget> {
    await this.delay();
    const budget = mockBudgets.find(b => b.id === id);
    if (!budget) throw new Error('Budget not found');
    
    Object.assign(budget, data, { updated_at: new Date().toISOString() });
    return budget;
  }

  async deleteBudget(id: number): Promise<void> {
    await this.delay();
    const index = mockBudgets.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Budget not found');
    mockBudgets.splice(index, 1);
  }

  async getBudgetSummary(): Promise<BudgetSummaryData> {
    await this.delay();
    const totalBudgets = mockBudgets.length;
    const totalAmount = mockBudgets.reduce((sum, b) => sum + b.total_budget, 0);
    const totalSpent = mockBudgets.reduce((sum, b) => sum + b.spent_amount, 0);
    const totalRemaining = mockBudgets.reduce((sum, b) => sum + b.remaining_budget, 0);
    const overBudgetCount = mockBudgets.filter(b => b.spent_amount > b.total_budget).length;
    const alertCount = mockAlerts.filter(a => a.is_active).length;
    const utilizationRate = totalAmount > 0 ? (totalSpent / totalAmount) * 100 : 0;

    return {
      total_budgets: totalBudgets,
      total_amount: totalAmount,
      total_spent: totalSpent,
      total_remaining: totalRemaining,
      over_budget_count: overBudgetCount,
      alert_count: alertCount,
      utilization_rate: utilizationRate,
    };
  }

  // Budget Categories
  async getBudgetCategories(budgetId: number): Promise<BudgetCategory[]> {
    await this.delay();
    return mockCategories.filter(c => c.budget_id === budgetId);
  }

  async createBudgetCategory(budgetId: number, data: CreateBudgetCategoryRequest): Promise<BudgetCategory> {
    await this.delay();
    const newCategory: BudgetCategory = {
      id: Date.now(),
      budget_id: budgetId,
      category_name: data.category_name,
      category_type: data.category_type,
      allocated_amount: data.allocated_amount,
      spent_amount: 0,
      committed_amount: 0,
      remaining_amount: data.allocated_amount,
      percentage: data.percentage,
      description: data.description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockCategories.push(newCategory);
    return newCategory;
  }

  // Expenses
  async getBudgetExpenses(budgetId: number, params?: ExpenseQueryParams): Promise<ExpenseListResponse> {
    await this.delay();
    const expenses = mockExpenses.filter(e => e.budget_id === budgetId);
    return {
      expenses,
      total: expenses.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
    };
  }

  // Alerts
  async getActiveAlerts(): Promise<BudgetAlert[]> {
    await this.delay();
    return mockAlerts.filter(a => a.is_active);
  }

  async getBudgetAlerts(budgetId: number): Promise<BudgetAlert[]> {
    await this.delay();
    return mockAlerts.filter(a => a.budget_id === budgetId);
  }

  async acknowledgeAlert(alertId: number): Promise<void> {
    await this.delay();
    const alert = mockAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.is_active = false;
      alert.acknowledged_at = new Date().toISOString();
    }
  }

  // Forecasts
  async getBudgetForecasts(budgetId: number): Promise<BudgetForecast[]> {
    await this.delay();
    return [];
  }

  // Cost Centers
  async getCostCenters(): Promise<CostCenter[]> {
    await this.delay();
    return [];
  }

  // Analytics
  async getBudgetAnalytics(request: BudgetAnalyticsRequest): Promise<BudgetAnalyticsResponse> {
    await this.delay();
    return {
      period: `${request.start_date} - ${request.end_date}`,
      total_budget: 1500000000,
      total_spent: 770000000,
      total_committed: 280000000,
      total_remaining: 450000000,
      utilization_rate: 51.3,
      variance_amount: -730000000,
      variance_percent: -48.7,
      category_breakdown: [
        {
          category_name: 'Quảng cáo trực tuyến',
          category_type: 'marketing',
          allocated: 200000000,
          spent: 150000000,
          remaining: 50000000,
          percentage: 75,
        },
        {
          category_name: 'Sự kiện & Hội thảo',
          category_type: 'marketing',
          allocated: 150000000,
          spent: 100000000,
          remaining: 50000000,
          percentage: 66.7,
        },
      ],
    };
  }

  // Placeholder methods for other operations
  async approveBudget(id: number, comments?: string): Promise<Budget> {
    const budget = await this.getBudget(id);
    budget.status = 'approved';
    return budget;
  }

  async updateBudgetStatus(id: number, status: Budget['status']): Promise<Budget> {
    const budget = await this.getBudget(id);
    budget.status = status;
    return budget;
  }

  async updateBudgetCategory(categoryId: number, data: Partial<CreateBudgetCategoryRequest>): Promise<BudgetCategory> {
    await this.delay();
    const category = mockCategories.find(c => c.id === categoryId);
    if (!category) throw new Error('Category not found');
    Object.assign(category, data);
    return category;
  }

  async deleteBudgetCategory(categoryId: number): Promise<void> {
    await this.delay();
    const index = mockCategories.findIndex(c => c.id === categoryId);
    if (index !== -1) mockCategories.splice(index, 1);
  }

  async createExpense(budgetId: number, data: CreateExpenseRequest): Promise<Expense> {
    await this.delay();
    const newExpense: Expense = {
      id: Date.now(),
      budget_id: budgetId,
      category_id: data.category_id,
      title: data.title,
      description: data.description || '',
      amount: data.amount,
      currency: data.currency,
      exchange_rate: 1,
      amount_in_base_currency: data.amount,
      expense_type: data.expense_type,
      expense_category: 'general',
      expense_date: data.expense_date,
      vendor_name: data.vendor_name || '',
      invoice_number: '',
      purchase_order_no: '',
      status: 'pending',
      receipt_url: '',
      attachment_urls: '',
      created_by: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockExpenses.push(newExpense);
    return newExpense;
  }

  async acknowledgeAlerts(alertIds: number[]): Promise<void> {
    await this.delay();
    alertIds.forEach(id => {
      const alert = mockAlerts.find(a => a.id === id);
      if (alert) {
        alert.is_active = false;
        alert.acknowledged_at = new Date().toISOString();
      }
    });
  }

  // Add other placeholder methods as needed
  async getExpense(id: number): Promise<Expense> { throw new Error('Not implemented'); }
  async updateExpense(id: number, data: Partial<CreateExpenseRequest>): Promise<Expense> { throw new Error('Not implemented'); }
  async deleteExpense(id: number): Promise<void> { throw new Error('Not implemented'); }
  async approveExpense(id: number, note?: string): Promise<Expense> { throw new Error('Not implemented'); }
  async rejectExpense(id: number, reason: string): Promise<Expense> { throw new Error('Not implemented'); }
  async uploadExpenseAttachment(expenseId: number, file: File): Promise<{ file_url: string }> { throw new Error('Not implemented'); }
  async getLatestForecast(budgetId: number): Promise<BudgetForecast | null> { return null; }
  async createForecast(budgetId: number, data: any): Promise<BudgetForecast> { throw new Error('Not implemented'); }
  async getCostCenter(id: number): Promise<CostCenter> { throw new Error('Not implemented'); }
  async createCostCenter(data: any): Promise<CostCenter> { throw new Error('Not implemented'); }
  async updateCostCenter(id: number, data: any): Promise<CostCenter> { throw new Error('Not implemented'); }
  async deleteCostCenter(id: number): Promise<void> { throw new Error('Not implemented'); }
  async exportBudgets(params?: BudgetQueryParams): Promise<Blob> { throw new Error('Not implemented'); }
  async exportExpenses(budgetId: number, params?: ExpenseQueryParams): Promise<Blob> { throw new Error('Not implemented'); }
  async bulkDeleteBudgets(budgetIds: number[]): Promise<void> { throw new Error('Not implemented'); }
  async bulkApproveExpenses(expenseIds: number[]): Promise<void> { throw new Error('Not implemented'); }
  async bulkRejectExpenses(expenseIds: number[], reason: string): Promise<void> { throw new Error('Not implemented'); }
}

export const budgetRepoMock = BudgetRepositoryMock.getInstance();