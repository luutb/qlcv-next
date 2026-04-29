import apiClient from '@/api/client';
import { PaginatedResponse, PaymentAction, Task, TaskHistory } from '@/types';

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  step_status?: string;
  keyword?: string;
  workflow_id?: number;
}

export class TaskRepository {
  private static instance: TaskRepository;
  private listeners = new Set<() => void>();
  private constructor() {}

  static getInstance(): TaskRepository {
    if (!TaskRepository.instance) {
      TaskRepository.instance = new TaskRepository();
    }
    return TaskRepository.instance;
  }

  async getTaskDetail(id: string | number): Promise<Task> {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  }

  async getAll(params: TaskQueryParams = {}): Promise<PaginatedResponse<Task>> {
    const response = await apiClient.get<PaginatedResponse<Task>>('/tasks', { params });
    return response.data;
  }

  async getTaskHistory(id: string | number): Promise<TaskHistory[]> {
    const response = await apiClient.get<TaskHistory[]>(`/tasks/${id}/history`);
    return response.data;
  }

  async nextStep(id: string | number, data: { note?: string; current_step: number; file?: File }): Promise<void> {
    const formData = new FormData();
    if (data.note) formData.append('note', data.note);
    formData.append('current_step', data.current_step.toString());
    if (data.file) formData.append('file', data.file);

    await apiClient.post(`/tasks/${id}/next-step`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async confirmPayment(id: string | number, action: PaymentAction, amount: number, note?: string): Promise<void> {
    await apiClient.post(`/tasks/${id}/payment`, {
      action,
      amount,
      note,
    });
  }

  async completeTask(id: string | number, note?: string): Promise<void> {
    await apiClient.post(`/tasks/${id}/complete`, { note });
  }

  async approveTask(id: string | number, data: { note?: string; current_step: number }): Promise<void> {
    await apiClient.post(`/tasks/${id}/approve`, data);
  }

  async rejectTask(id: string | number, reason: string, current_step: number): Promise<void> {
    await apiClient.post(`/tasks/${id}/reject`, {
      reason,
      current_step,
    });
  }

  async createTask(data: any): Promise<Task> {
    const response = await apiClient.post<Task>('/tasks', data);
    return response.data;
  }

  async assignTask(taskId: string | number, userId: number): Promise<void> {
    await apiClient.post(`/tasks/${taskId}/assign`, { user_id: userId });
  }

  async getUsers(): Promise<any[]> {
    const response = await apiClient.get('/users');
    return response.data;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const taskRepo = TaskRepository.getInstance();
