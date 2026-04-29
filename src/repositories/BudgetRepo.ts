import apiClient from '@/api/client';
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

// Helper function to safely extract data from API response
function extractResponseData<T>(response: any, fallback?: T): T {
  if (!response || !response.data) {
    if (fallback !== undefined) return fallback;
    throw new Error('Invalid API response: no data');
  }
  
  // If response.data has a 'data' property, use it (wrapped response)
  if (typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data;
  }
  
  // Otherwise use response.data directly (direct response)
  return response.data;
}

export class BudgetRepository {
  private static instance: BudgetRepository;
  
  private constructor() {}

  static getInstance(): BudgetRepository {
    if (!BudgetRepository.instance) {
      BudgetRepository.instance = new BudgetRepository();
    }
    return BudgetRepository.instance;
  }

  // Budget Management
  async getBudgets(params?: BudgetQueryParams): Promise<BudgetListResponse> {
    try {
      const response = await apiClient.get<BudgetListResponse>('/budgets', { params });
      // Handle both direct response and wrapped response
      if (response.data && typeof response.data === 'object') {
        // If response has data property, use it; otherwise use response directly
        return 'budgets' in response.data ? response.data : { budgets: [], total: 0, page: 1, limit: 10 };
      }
      return { budgets: [], total: 0, page: 1, limit: 10 };
    } catch (error) {
      console.error('Error fetching budgets:', error);
      return { budgets: [], total: 0, page: 1, limit: 10 };
    }
  }

  async getBudget(id: number): Promise<Budget> {
    const response = await apiClient.get<{ data: Budget } | Budget>(`/budgets/${id}`);
    // Handle both wrapped and direct response
    if (response.data && typeof response.data === 'object') {
      return 'data' in response.data ? response.data.data : response.data as Budget;
    }
    throw new Error('Invalid budget response');
  }

  async createBudget(data: CreateBudgetRequest): Promise<Budget> {
    const response = await apiClient.post<{ data: Budget } | Budget>('/budgets', data);
    if (response.data && typeof response.data === 'object') {
      return 'data' in response.data ? response.data.data : response.data as Budget;
    }
    throw new Error('Invalid budget creation response');
  }

  async updateBudget(id: number, data: Partial<CreateBudgetRequest>): Promise<Budget> {
    const response = await apiClient.put<{ data: Budget } | Budget>(`/budgets/${id}`, data);
    if (response.data && typeof response.data === 'object') {
      return 'data' in response.data ? response.data.data : response.data as Budget;
    }
    throw new Error('Invalid budget update response');
  }

  async deleteBudget(id: number): Promise<void> {
    await apiClient.delete(`/budgets/${id}`);
  }

  async approveBudget(id: number, comments?: string): Promise<Budget> {
    const response = await apiClient.post<{ data: Budget } | Budget>(`/budgets/${id}/approve`, { comments });
    if (response.data && typeof response.data === 'object') {
      return 'data' in response.data ? response.data.data : response.data as Budget;
    }
    throw new Error('Invalid budget approval response');
  }

  async updateBudgetStatus(id: number, status: Budget['status']): Promise<Budget> {
    const response = await apiClient.put<{ data: Budget } | Budget>(`/budgets/${id}/status`, { status });
    if (response.data && typeof response.data === 'object') {
      return 'data' in response.data ? response.data.data : response.data as Budget;
    }
    throw new Error('Invalid budget status update response');
  }

  async getBudgetSummary(): Promise<BudgetSummaryData> {
    try {
      const response = await apiClient.get<{ data: BudgetSummaryData } | BudgetSummaryData>('/budgets/summary');
      if (response.data && typeof response.data === 'object') {
        return 'data' in response.data ? response.data.data : response.data as BudgetSummaryData;
      }
      // Return default summary if no data
      return {
        total_budgets: 0,
        total_amount: 0,
        total_spent: 0,
        total_remaining: 0,
        over_budget_count: 0,
        alert_count: 0,
        utilization_rate: 0,
      };
    } catch (error) {
      console.error('Error fetching budget summary:', error);
      return {
        total_budgets: 0,
        total_amount: 0,
        total_spent: 0,
        total_remaining: 0,
        over_budget_count: 0,
        alert_count: 0,
        utilization_rate: 0,
      };
    }
  }

  // Budget Categories
  async getBudgetCategories(budgetId: number): Promise<BudgetCategory[]> {
    try {
      const response = await apiClient.get<{ data: BudgetCategory[] } | BudgetCategory[]>(`/budgets/${budgetId}/categories`);
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching budget categories:', error);
      return [];
    }
  }

  async createBudgetCategory(budgetId: number, data: CreateBudgetCategoryRequest): Promise<BudgetCategory> {
    const response = await apiClient.post<{ data: BudgetCategory } | BudgetCategory>(`/budgets/${budgetId}/categories`, data);
    if (response.data && typeof response.data === 'object') {
      return 'data' in response.data ? response.data.data : response.data as BudgetCategory;
    }
    throw new Error('Invalid category creation response');
  }

  async updateBudgetCategory(categoryId: number, data: Partial<CreateBudgetCategoryRequest>): Promise<BudgetCategory> {
    const response = await apiClient.put<{ data: BudgetCategory } | BudgetCategory>(`/budget-categories/${categoryId}`, data);
    if (response.data && typeof response.data === 'object') {
      return 'data' in response.data ? response.data.data : response.data as BudgetCategory;
    }
    throw new Error('Invalid category update response');
  }

  async deleteBudgetCategory(categoryId: number): Promise<void> {
    await apiClient.delete(`/budget-categories/${categoryId}`);
  }

  // Expenses
  async getBudgetExpenses(budgetId: number, params?: ExpenseQueryParams): Promise<ExpenseListResponse> {
    try {
      const response = await apiClient.get<ExpenseListResponse>(`/budgets/${budgetId}/expenses`, { params });
      if (response.data && typeof response.data === 'object') {
        return 'expenses' in response.data ? response.data : { expenses: [], total: 0, page: 1, limit: 10 };
      }
      return { expenses: [], total: 0, page: 1, limit: 10 };
    } catch (error) {
      console.error('Error fetching budget expenses:', error);
      return { expenses: [], total: 0, page: 1, limit: 10 };
    }
  }

  async getExpense(id: number): Promise<Expense> {
    const response = await apiClient.get<{ data: Expense } | Expense>(`/expenses/${id}`);
    if (response.data && typeof response.data === 'object') {
      return 'data' in response.data ? response.data.data : response.data as Expense;
    }
    throw new Error('Invalid expense response');
  }

  async createExpense(budgetId: number, data: CreateExpenseRequest): Promise<Expense> {
    const response = await apiClient.post<{ data: Expense } | Expense>(`/budgets/${budgetId}/expenses`, data);
    if (response.data && typeof response.data === 'object') {
      return 'data' in response.data ? response.data.data : response.data as Expense;
    }
    throw new Error('Invalid expense creation response');
  }

  async updateExpense(id: number, data: Partial<CreateExpenseRequest>): Promise<Expense> {
    const response = await apiClient.put<{ data: Expense } | Expense>(`/expenses/${id}`, data);
    if (response.data && typeof response.data === 'object') {
      return 'data' in response.data ? response.data.data : response.data as Expense;
    }
    throw new Error('Invalid expense update response');
  }

  async deleteExpense(id: number): Promise<void> {
    await apiClient.delete(`/expenses/${id}`);
  }

  async approveExpense(id: number, note?: string): Promise<Expense> {
    const response = await apiClient.post<{ data: Expense } | Expense>(`/expenses/${id}/approve`, { note });
    if (response.data && typeof response.data === 'object') {
      return 'data' in response.data ? response.data.data : response.data as Expense;
    }
    throw new Error('Invalid expense approval response');
  }

  async rejectExpense(id: number, reason: string): Promise<Expense> {
    const response = await apiClient.post<{ data: Expense } | Expense>(`/expenses/${id}/reject`, { reason });
    if (response.data && typeof response.data === 'object') {
      return 'data' in response.data ? response.data.data : response.data as Expense;
    }
    throw new Error('Invalid expense rejection response');
  }

  // File Upload for Expenses
  async uploadExpenseAttachment(expenseId: number, file: File): Promise<{ file_url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<{ data: { file_url: string } } | { file_url: string }>(
      `/expenses/${expenseId}/attachments`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    if (response.data && typeof response.data === 'object') {
      return 'data' in response.data ? response.data.data : response.data as { file_url: string };
    }
    throw new Error('Invalid file upload response');
  }

  // Budget Alerts
  async getBudgetAlerts(budgetId: number): Promise<BudgetAlert[]> {
    try {
      const response = await apiClient.get<{ data: BudgetAlert[] } | BudgetAlert[]>(`/budgets/${budgetId}/alerts`);
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching budget alerts:', error);
      return [];
    }
  }

  async getActiveAlerts(): Promise<BudgetAlert[]> {
    try {
      const response = await apiClient.get<{ data: BudgetAlert[] } | BudgetAlert[]>('/budget-alerts/active');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching active alerts:', error);
      return [];
    }
  }

  async acknowledgeAlert(alertId: number): Promise<void> {
    await apiClient.post(`/budget-alerts/${alertId}/acknowledge`);
  }

  async acknowledgeAlerts(alertIds: number[]): Promise<void> {
    await apiClient.post('/budget-alerts/acknowledge', { alert_ids: alertIds });
  }

  // Budget Forecasts
  async getBudgetForecasts(budgetId: number): Promise<BudgetForecast[]> {
    try {
      const response = await apiClient.get<{ data: BudgetForecast[] } | BudgetForecast[]>(`/budgets/${budgetId}/forecasts`);
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching budget forecasts:', error);
      return [];
    }
  }

  async getLatestForecast(budgetId: number): Promise<BudgetForecast | null> {
    try {
      const response = await apiClient.get<{ data: BudgetForecast } | BudgetForecast>(`/budgets/${budgetId}/forecasts/latest`);
      if (response.data && typeof response.data === 'object') {
        return 'data' in response.data ? response.data.data : response.data as BudgetForecast;
      }
      return null;
    } catch (error) {
      console.error('Error fetching latest forecast:', error);
      return null;
    }
  }

  async createForecast(budgetId: number, data: {
    forecast_date: string;
    forecast_period: BudgetForecast['forecast_period'];
    projected_spend: number;
    projected_total: number;
    confidence_level: number;
    forecast_method: string;
    assumptions: string;
    notes?: string;
  }): Promise<BudgetForecast> {
    const response = await apiClient.post<{ data: BudgetForecast } | BudgetForecast>(`/budgets/${budgetId}/forecasts`, data);
    if (response.data && typeof response.data === 'object') {
      return 'data' in response.data ? response.data.data : response.data as BudgetForecast;
    }
    throw new Error('Invalid forecast creation response');
  }

  // Analytics
  async getBudgetAnalytics(request: BudgetAnalyticsRequest): Promise<BudgetAnalyticsResponse> {
    // Check if budget analytics API is disabled
    if (process.env.NEXT_PUBLIC_DISABLE_BUDGET_ANALYTICS === 'true') {
      console.log('Budget analytics API is disabled via environment variable');
      return {
        period: 'Disabled',
        total_budget: 0,
        total_spent: 0,
        total_committed: 0,
        total_remaining: 0,
        utilization_rate: 0,
        variance_amount: 0,
        variance_percent: 0,
        category_breakdown: [],
      };
    }
    
    try {
      console.log('BudgetRepository.getBudgetAnalytics() called with:', request);
      
      const response = await apiClient.post<{ data: BudgetAnalyticsResponse } | BudgetAnalyticsResponse>('/budgets/analytics', request);
      console.log('Analytics API response:', response);
      
      const defaultResponse: BudgetAnalyticsResponse = {
        period: '',
        total_budget: 0,
        total_spent: 0,
        total_committed: 0,
        total_remaining: 0,
        utilization_rate: 0,
        variance_amount: 0,
        variance_percent: 0,
        category_breakdown: [],
      };
      
      return extractResponseData(response, defaultResponse);
    } catch (error: any) {
      console.error('Error fetching budget analytics:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // Return default response instead of throwing
      return {
        period: '',
        total_budget: 0,
        total_spent: 0,
        total_committed: 0,
        total_remaining: 0,
        utilization_rate: 0,
        variance_amount: 0,
        variance_percent: 0,
        category_breakdown: [],
      };
    }
  }

  // Cost Centers
  async getCostCenters(): Promise<CostCenter[]> {
    // Check if cost centers API is disabled
    if (process.env.NEXT_PUBLIC_DISABLE_COST_CENTERS === 'true') {
      console.log('Cost centers API is disabled via environment variable');
      return [];
    }
    
    try {
      console.log('BudgetRepository.getCostCenters() called');
      console.log('Call stack:', new Error().stack);
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      
      const response = await apiClient.get<{ data: CostCenter[] } | CostCenter[]>('/cost-centers');
      console.log('getCostCenters response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error('Error in getCostCenters:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      // If it's a 500 error, return empty array to prevent crash
      if (error.response?.status === 500) {
        console.warn('Server error 500 - returning empty cost centers array');
        return [];
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  async getCostCenter(id: number): Promise<CostCenter> {
    const response = await apiClient.get<{ data: CostCenter } | CostCenter>(`/cost-centers/${id}`);
    if (response.data && typeof response.data === 'object') {
      return 'data' in response.data ? response.data.data : response.data as CostCenter;
    }
    throw new Error('Invalid cost center response');
  }

  async createCostCenter(data: {
    code: string;
    name: string;
    description?: string;
    department_id?: number;
    parent_id?: number;
    cost_center_type: string;
    annual_budget: number;
    manager_id?: number;
  }): Promise<CostCenter> {
    const response = await apiClient.post<{ data: CostCenter } | CostCenter>('/cost-centers', data);
    if (response.data && typeof response.data === 'object') {
      return 'data' in response.data ? response.data.data : response.data as CostCenter;
    }
    throw new Error('Invalid cost center creation response');
  }

  async updateCostCenter(id: number, data: Partial<{
    code: string;
    name: string;
    description?: string;
    department_id?: number;
    parent_id?: number;
    cost_center_type: string;
    annual_budget: number;
    manager_id?: number;
    is_active: boolean;
  }>): Promise<CostCenter> {
    const response = await apiClient.put<{ data: CostCenter } | CostCenter>(`/cost-centers/${id}`, data);
    if (response.data && typeof response.data === 'object') {
      return 'data' in response.data ? response.data.data : response.data as CostCenter;
    }
    throw new Error('Invalid cost center update response');
  }

  async deleteCostCenter(id: number): Promise<void> {
    await apiClient.delete(`/cost-centers/${id}`);
  }

  // Export functionality
  async exportBudgets(params?: BudgetQueryParams): Promise<Blob> {
    const response = await apiClient.get('/budgets/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  async exportExpenses(budgetId: number, params?: ExpenseQueryParams): Promise<Blob> {
    const response = await apiClient.get(`/budgets/${budgetId}/expenses/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  // Bulk operations
  async bulkDeleteBudgets(budgetIds: number[]): Promise<void> {
    await apiClient.post('/budgets/bulk-delete', { budget_ids: budgetIds });
  }

  async bulkApproveExpenses(expenseIds: number[]): Promise<void> {
    await apiClient.post('/expenses/bulk-approve', { expense_ids: expenseIds });
  }

  async bulkRejectExpenses(expenseIds: number[], reason: string): Promise<void> {
    await apiClient.post('/expenses/bulk-reject', { expense_ids: expenseIds, reason });
  }
}

export const budgetRepo = BudgetRepository.getInstance();

// Use real repository (mock is disabled)
export const budgetRepository = budgetRepo;