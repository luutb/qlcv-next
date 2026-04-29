import apiClient from '@/api/client';

export class TaskAssigneesRepository {
  private static instance: TaskAssigneesRepository;
  private constructor() {}

  static getInstance(): TaskAssigneesRepository {
    if (!TaskAssigneesRepository.instance) {
      TaskAssigneesRepository.instance = new TaskAssigneesRepository();
    }
    return TaskAssigneesRepository.instance;
  }

  async getUsers(): Promise<any[]> {
    const response = await apiClient.get('/users');
    return response.data;
  }

  async assignTask(taskId: string | number, userId: number): Promise<void> {
    await apiClient.post(`/tasks/${taskId}/assignees`, { user_id: userId });
  }

  async getAssignees(taskId: string | number): Promise<any[]> {
    const response = await apiClient.get(`/tasks/${taskId}/assignees`);
    return response.data;
  }
}

export const taskAssigneesRepo = TaskAssigneesRepository.getInstance();
