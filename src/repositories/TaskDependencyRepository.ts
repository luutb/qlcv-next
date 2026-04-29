import apiClient from '@/api/client';

export interface TaskDependency {
  id: number;
  from_task_id: number;
  to_task_id: number;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
}

export interface DependencyRequest {
  from_task_id: number;
  to_task_id: number;
  type?: TaskDependency['type'];
}

export class TaskDependencyRepository {
  private static instance: TaskDependencyRepository;
  private constructor() {}

  static getInstance(): TaskDependencyRepository {
    if (!TaskDependencyRepository.instance) {
      TaskDependencyRepository.instance = new TaskDependencyRepository();
    }
    return TaskDependencyRepository.instance;
  }

  async getByTask(taskId: string | number): Promise<TaskDependency[]> {
    const response = await apiClient.get<TaskDependency[]>(`/tasks/${taskId}/dependencies`);
    return response.data;
  }

  async create(taskId: string | number, data: DependencyRequest): Promise<TaskDependency> {
    const response = await apiClient.post<TaskDependency>(`/tasks/${taskId}/dependencies`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/dependencies/${id}`);
  }

  async validateStart(taskId: string | number): Promise<boolean> {
    const response = await apiClient.post<{ valid: boolean }>(`/tasks/${taskId}/validate-start`);
    return response.data.valid;
  }
}

export const taskDependencyRepo = TaskDependencyRepository.getInstance();
