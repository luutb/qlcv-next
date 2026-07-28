import apiClient from './api/client';
import { Case, ApiResponse } from '@/types';

export interface CaseCreateData {
  title: string;
  description: string;
  priority: string;
  client_id: number;
  assigned_to_id: number;
  tags?: string[];
}

export interface CaseQueryParams {
  page?: number;
  limit?: number;
  offset?: number;
  status?: string;
  search?: string;
}

export const caseService = {
  async getAll(params?: CaseQueryParams): Promise<ApiResponse<Case[]>> {
    const response = await apiClient.get<Case[]>('/cases', { params });
    return response;
  },

  // Alias for backward compatibility
  async getCases(params?: CaseQueryParams): Promise<ApiResponse<Case[]>> {
    return this.getAll(params);
  },

  async getById(id: string): Promise<ApiResponse<Case>> {
    const response = await apiClient.get<Case>(`/cases/${id}`);
    return response;
  },

  // Alias for backward compatibility
  async getCase(id: string): Promise<Case> {
    const response = await this.getById(id);
    return response.data;
  },

  async create(data: CaseCreateData): Promise<ApiResponse<Case>> {
    const response = await apiClient.post<Case>('/cases', data);
    return response;
  },

  // Alias for backward compatibility
  async createCase(data: CaseCreateData): Promise<Case> {
    const response = await this.create(data);
    return response.data;
  },

  async update(id: string, data: Partial<Case>): Promise<ApiResponse<Case>> {
    const response = await apiClient.put<Case>(`/cases/${id}`, data);
    return response;
  },

  // Alias for backward compatibility
  async updateCase(id: string, data: Partial<Case>): Promise<Case> {
    const response = await this.update(id, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/cases/${id}`);
  },

  // Alias for backward compatibility
  async deleteCase(id: string): Promise<void> {
    return this.delete(id);
  },

  // Task-related methods for cases
  async createTask(data: any): Promise<any> {
    const response = await apiClient.post('/tasks', data);
    return response.data;
  },

  async updateTaskStatus(taskId: string, data: { status: string }): Promise<any> {
    const response = await apiClient.put(`/tasks/${taskId}`, data);
    return response.data;
  },

  async deleteTask(taskId: string): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}`);
  },

  // Member management
  async addMember(caseId: string, data: { user_id: number; role_in_case: string }): Promise<any> {
    const response = await apiClient.post(`/cases/${caseId}/members`, data);
    return response.data;
  },

  async removeMember(caseId: string, userId: number): Promise<void> {
    await apiClient.delete(`/cases/${caseId}/members/${userId}`);
  }
};