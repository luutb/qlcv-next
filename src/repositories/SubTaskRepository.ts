import apiClient from '@/api/client';

export interface SubTask {
  id: number;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assignee_id?: number;
  parent_task_id: number;
  order: number;
}

export interface SubTaskRequest {
  title: string;
  status?: SubTask['status'];
  assignee_id?: number;
  order?: number;
}

export class SubTaskRepository {
  private static instance: SubTaskRepository;
  private constructor() {}

  static getInstance(): SubTaskRepository {
    if (!SubTaskRepository.instance) {
      SubTaskRepository.instance = new SubTaskRepository();
    }
    return SubTaskRepository.instance;
  }

  async getByTask(taskId: string | number): Promise<SubTask[]> {
    const response = await apiClient.get<SubTask[]>(`/tasks/${taskId}/subtasks`);
    return response.data;
  }

  async create(taskId: string | number, data: SubTaskRequest): Promise<SubTask> {
    const response = await apiClient.post<SubTask>(`/tasks/${taskId}/subtasks`, data);
    return response.data;
  }

  async update(id: number, data: Partial<SubTaskRequest>): Promise<SubTask> {
    const response = await apiClient.put<SubTask>(`/subtasks/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/subtasks/${id}`);
  }

  async updateStatus(id: number, status: SubTask['status']): Promise<void> {
    await apiClient.put(`/subtasks/${id}/status`, { status });
  }
}

export const subTaskRepo = SubTaskRepository.getInstance();
