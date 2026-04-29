import apiClient from '@/api/client';

export interface Budget {
  id: number;
  name: string;
  task_id?: number;
  task_name?: string;
  total_budget: number;
  spent: number;
  remaining: number;
  percentage_used: number;
  status: 'active' | 'over_budget' | 'completed';
  currency?: string;
}

export interface BudgetRequest {
  name: string;
  task_id?: number;
  total_budget: number;
}

export interface ExpenseRequest {
  amount: number;
  description: string;
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

  async getAll(): Promise<Budget[]> {
    const response = await apiClient.get<Budget[]>('/budgets');
    return response.data;
  }

  async create(budget: BudgetRequest): Promise<Budget> {
    const response = await apiClient.post<Budget>('/budgets', budget);
    return response.data;
  }

  async update(id: number, budget: Partial<BudgetRequest>): Promise<Budget> {
    const response = await apiClient.put<Budget>(`/budgets/${id}`, budget);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/budgets/${id}`);
  }

  async getExpenses(budgetId: number): Promise<any[]> {
    const response = await apiClient.get(`/budgets/${budgetId}/expenses`);
    return response.data;
  }

  async addExpense(budgetId: number, expense: ExpenseRequest): Promise<any> {
    const response = await apiClient.post(`/budgets/${budgetId}/expenses`, expense);
    return response.data;
  }

  async deleteExpense(expenseId: number): Promise<void> {
    await apiClient.delete(`/expenses/${expenseId}`);
  }
}

export const budgetRepo = BudgetRepository.getInstance();
