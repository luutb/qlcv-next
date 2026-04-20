import api from '@/api/client';
import { PaymentAction, User } from '@/types';

class TaskRepository {
  async createTask(data: {
    title: string;
    description?: string;
    amount?: number;
    deadline?: string;
    workflow_id: number;
    customer_id?: number;
  }) {
    const res = await api.post('/tasks', data);
    return res.data;
  }

  async getTaskDetail(id: string) {
    const res = await api.get(`/tasks/${id}`);
    return res.data;
  }

  async getTaskHistory(id: string) {
    const res = await api.get(`/tasks/${id}/history`);
    return res.data;
  }

  async nextStep(taskId: string, data: { note: string; current_step: number; file?: File }) {
    const formData = new FormData();
    formData.append('note', data.note);
    formData.append('current_step', String(data.current_step));
    if (data.file) {
      formData.append('file', data.file);
    }
    return await api.post(`/tasks/${taskId}/next-step`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async rejectTask(taskId: string, reason: string, current_step?: number) {
    return await api.post(`/tasks/${taskId}/reject`, { note: reason, current_step });
  }

  async approveTask(taskId: string, data: { note: string; current_step: number }) {
    return await api.post(`/tasks/${taskId}/approve`, data);
  }

  async confirmPayment(
    taskId: string,
    action: PaymentAction,
    amount: number,
    note?: string,
  ) {
    return await api.post(`/tasks/${taskId}/payment`, { action, amount, note });
  }

  async completeTask(taskId: string, note?: string) {
    return await api.post(`/tasks/${taskId}/complete`, { note: note || '' });
  }

  async assignTask(taskId: string, assigneeId: number) {
    return await api.put(`/tasks/${taskId}/assign`, { assignee_id: assigneeId });
  }

  async getUsers(): Promise<User[]> {
    const res = await api.get('/users', { params: { limit: 100 } });
    const data = res.data;
    return Array.isArray(data) ? data : data.data ?? [];
  }
}

// Export một instance duy nhất (Singleton) để sử dụng toàn web
export const taskRepo = new TaskRepository();