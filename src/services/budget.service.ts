import apiClient from './api/client';
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
import type { ApiResponse } from '@/types';

export const budgetService = {
  // Budget Management
  async getBudgets(params?: BudgetQueryParams): Promise<ApiResponse<BudgetListResponse>> {
    const response = await apiClient.get<BudgetListResponse>('/budgets', { params });
    return response;
  },

  async getBudget(id: number): Promise<ApiResponse<Budget>> {
    const response = await apiClient.get<Budget>(`/budgets/${id}`);
    return response;
  },

  async createBudget(data: CreateBudgetRequest): Promise<ApiResponse<Budget>> {
    const response = await apiClient.post<Budget>('/budgets', data);
    return response;
  },

  async updateBudget(id: number, data: Partial<CreateBudgetRequest>): Promise<ApiResponse<Budget>> {
    const response = await apiClient.put<Budget>(`/budgets/${id}`, data);
    return response;
  },

  async deleteBudget(id: number): Promise<void> {
    await apiClient.delete(`/budgets/${id}`);
  },

  async approveBudget(id: number, comments?: string): Promise<ApiResponse<Budget>> {
    const response = await apiClient.post<Budget>(`/budgets/${id}/approve`, { comments });
    return response;
  },

  async updateBudgetStatus(id: number, status: Budget['status']): Promise<ApiResponse<Budget>> {
    const response = await apiClient.put<Budget>(`/budgets/${id}/status`, { status });
    return response;
  },

  async getBudgetSummary(): Promise<ApiResponse<BudgetSummaryData>> {
    const response = await apiClient.get<BudgetSummaryData>('/budgets/summary');
    return response;
  },

  // Budget Categories
  async getBudgetCategories(budgetId: number): Promise<ApiResponse<BudgetCategory[]>> {
    const response = await apiClient.get<BudgetCategory[]>(`/budgets/${budgetId}/categories`);
    return response;
  },

  async createBudgetCategory(budgetId: number, data: CreateBudgetCategoryRequest): Promise<ApiResponse<BudgetCategory>> {
    const response = await apiClient.post<BudgetCategory>(`/budgets/${budgetId}/categories`, data);
    return response;
  },

  async updateBudgetCategory(categoryId: number, data: Partial<CreateBudgetCategoryRequest>): Promise<ApiResponse<BudgetCategory>> {
    const response = await apiClient.put<BudgetCategory>(`/budget-categories/${categoryId}`, data);
    return response;
  },

  async deleteBudgetCategory(categoryId: number): Promise<void> {
    await apiClient.delete(`/budget-categories/${categoryId}`);
  },

  // Expenses
  async getBudgetExpenses(budgetId: number, params?: ExpenseQueryParams): Promise<ApiResponse<ExpenseListResponse>> {
    const response = await apiClient.get<ExpenseListResponse>(`/budgets/${budgetId}/expenses`, { params });
    return response;
  },

  async getExpense(id: number): Promise<ApiResponse<Expense>> {
    const response = await apiClient.get<Expense>(`/expenses/${id}`);
    return response;
  },

  async createExpense(budgetId: number, data: CreateExpenseRequest): Promise<ApiResponse<Expense>> {
    const response = await apiClient.post<Expense>(`/budgets/${budgetId}/expenses`, data);
    return response;
  },

  async updateExpense(id: number, data: Partial<CreateExpenseRequest>): Promise<ApiResponse<Expense>> {
    const response = await apiClient.put<Expense>(`/expenses/${id}`, data);
    return response;
  },

  async deleteExpense(id: number): Promise<void> {
    await apiClient.delete(`/expenses/${id}`);
  },

  async approveExpense(id: number, note?: string): Promise<ApiResponse<Expense>> {
    const response = await apiClient.post<Expense>(`/expenses/${id}/approve`, { note });
    return response;
  },

  async rejectExpense(id: number, reason: string): Promise<ApiResponse<Expense>> {
    const response = await apiClient.post<Expense>(`/expenses/${id}/reject`, { reason });
    return response;
  },

  // File Upload for Expenses
  async uploadExpenseAttachment(expenseId: number, file: File): Promise<ApiResponse<{ file_url: string }>> {
    const response = await apiClient.upload<{ file_url: string }>(`/expenses/${expenseId}/attachments`, file);
    return response;
  },

  // Budget Alerts
  async getBudgetAlerts(budgetId: number): Promise<ApiResponse<BudgetAlert[]>> {
    const response = await apiClient.get<BudgetAlert[]>(`/budgets/${budgetId}/alerts`);
    return response;
  },

  async getActiveAlerts(): Promise<ApiResponse<BudgetAlert[]>> {
    const response = await apiClient.get<BudgetAlert[]>('/budget-alerts/active');
    return response;
  },

  async acknowledgeAlert(alertId: number): Promise<void> {
    await apiClient.post(`/budget-alerts/${alertId}/acknowledge`);
  },

  async acknowledgeAlerts(alertIds: number[]): Promise<void> {
    await apiClient.post('/budget-alerts/acknowledge', { alert_ids: alertIds });
  },

  // Budget Forecasts
  async getBudgetForecasts(budgetId: number): Promise<ApiResponse<BudgetForecast[]>> {
    const response = await apiClient.get<BudgetForecast[]>(`/budgets/${budgetId}/forecasts`);
    return response;
  },

  async getLatestForecast(budgetId: number): Promise<ApiResponse<BudgetForecast | null>> {
    const response = await apiClient.get<BudgetForecast | null>(`/budgets/${budgetId}/forecasts/latest`);
    return response;
  },

  async createForecast(budgetId: number, data: {
    forecast_date: string;
    forecast_period: BudgetForecast['forecast_period'];
    projected_spend: number;
    projected_total: number;
    confidence_level: number;
    forecast_method: string;
    assumptions: string;
    notes?: string;
  }): Promise<ApiResponse<BudgetForecast>> {
    const response = await apiClient.post<BudgetForecast>(`/budgets/${budgetId}/forecasts`, data);
    return response;
  },

  // Analytics
  async getBudgetAnalytics(request: BudgetAnalyticsRequest): Promise<ApiResponse<BudgetAnalyticsResponse>> {
    const response = await apiClient.post<BudgetAnalyticsResponse>('/budgets/analytics', request);
    return response;
  },

  // Cost Centers
  async getCostCenters(): Promise<ApiResponse<CostCenter[]>> {
    const response = await apiClient.get<CostCenter[]>('/cost-centers');
    return response;
  },

  async getCostCenter(id: number): Promise<ApiResponse<CostCenter>> {
    const response = await apiClient.get<CostCenter>(`/cost-centers/${id}`);
    return response;
  },

  async createCostCenter(data: {
    code: string;
    name: string;
    description?: string;
    department_id?: number;
    parent_id?: number;
    cost_center_type: string;
    annual_budget: number;
    manager_id?: number;
  }): Promise<ApiResponse<CostCenter>> {
    const response = await apiClient.post<CostCenter>('/cost-centers', data);
    return response;
  },

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
  }>): Promise<ApiResponse<CostCenter>> {
    const response = await apiClient.put<CostCenter>(`/cost-centers/${id}`, data);
    return response;
  },

  async deleteCostCenter(id: number): Promise<void> {
    await apiClient.delete(`/cost-centers/${id}`);
  },

  // Export functionality
  async exportBudgets(params?: BudgetQueryParams): Promise<Blob> {
    const response = await apiClient.get('/budgets/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  async exportExpenses(budgetId: number, params?: ExpenseQueryParams): Promise<Blob> {
    const response = await apiClient.get(`/budgets/${budgetId}/expenses/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Bulk operations
  async bulkDeleteBudgets(budgetIds: number[]): Promise<void> {
    await apiClient.post('/budgets/bulk-delete', { budget_ids: budgetIds });
  },

  async bulkApproveExpenses(expenseIds: number[]): Promise<void> {
    await apiClient.post('/expenses/bulk-approve', { expense_ids: expenseIds });
  },

  async bulkRejectExpenses(expenseIds: number[], reason: string): Promise<void> {
    await apiClient.post('/expenses/bulk-reject', { expense_ids: expenseIds, reason });
  }
};