import apiClient from './api/client';
import { PaginatedResponse, PaymentAction, Task, TaskHistory, ApiResponse } from '@/types';

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  step_status?: string;
  keyword?: string;
  workflow_id?: number;
}

export interface TaskNextStepData {
  note?: string;
  current_step: number;
  file?: File;
}

export interface TaskApproveData {
  note?: string;
  current_step: number;
}

export interface TaskRejectData {
  reason: string;
  current_step: number;
}

export const taskService = {
  async getAll(params: TaskQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Task>>> {
    const response = await apiClient.get<PaginatedResponse<Task>>('/tasks', { params });
    return response;
  },

  async getById(id: string | number): Promise<ApiResponse<Task>> {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response;
  },

  async create(data: any): Promise<ApiResponse<Task>> {
    const response = await apiClient.post<Task>('/tasks', data);
    return response;
  },

  async update(id: string | number, data: Partial<Task>): Promise<ApiResponse<Task>> {
    const response = await apiClient.put<Task>(`/tasks/${id}`, data);
    return response;
  },

  async delete(id: string | number): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },

  async getHistory(id: string | number): Promise<ApiResponse<TaskHistory[]>> {
    const response = await apiClient.get<TaskHistory[]>(`/tasks/${id}/history`);
    return response;
  },

  async nextStep(id: string | number, data: TaskNextStepData): Promise<void> {
    const formData = new FormData();
    if (data.note) formData.append('note', data.note);
    formData.append('current_step', data.current_step.toString());
    if (data.file) formData.append('file', data.file);

    await apiClient.post(`/tasks/${id}/next-step`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async approve(id: string | number, data: TaskApproveData): Promise<void> {
    await apiClient.post(`/tasks/${id}/approve`, data);
  },

  async reject(id: string | number, data: TaskRejectData): Promise<void> {
    await apiClient.post(`/tasks/${id}/reject`, data);
  },

  async complete(id: string | number, note?: string): Promise<void> {
    await apiClient.post(`/tasks/${id}/complete`, { note });
  },

  async assign(taskId: string | number, userId: number): Promise<void> {
    await apiClient.post(`/tasks/${taskId}/assign`, { user_id: userId });
  },

  async confirmPayment(id: string | number, action: PaymentAction, amount: number, note?: string): Promise<void> {
    await apiClient.post(`/tasks/${id}/payment`, {
      action,
      amount,
      note,
    });
  }
};