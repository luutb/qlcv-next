import apiClient from '@/api/client';

export interface RepeatingTask {
  id?: number;
  task_id: number;
  repeat_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeat_interval: number;
  repeat_days?: number[];
  repeat_day_of_month?: number;
  end_type: 'never' | 'after' | 'on_date';
  end_after?: number;
  end_on_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface RepeatingTaskRequest {
  task_id: number;
  repeat_type: RepeatingTask['repeat_type'];
  repeat_interval: number;
  repeat_days?: number[];
  repeat_day_of_month?: number;
  end_type: RepeatingTask['end_type'];
  end_after?: number;
  end_on_date?: string;
  is_active?: boolean;
}

export class RepeatingTasksRepository {
  private static instance: RepeatingTasksRepository;
  private constructor() {}

  static getInstance(): RepeatingTasksRepository {
    if (!RepeatingTasksRepository.instance) {
      RepeatingTasksRepository.instance = new RepeatingTasksRepository();
    }
    return RepeatingTasksRepository.instance;
  }

  async getAll(): Promise<RepeatingTask[]> {
    const response = await apiClient.get<RepeatingTask[]>('/repeating-tasks');
    return response.data;
  }

  async create(task: RepeatingTaskRequest): Promise<RepeatingTask> {
    const response = await apiClient.post<RepeatingTask>('/repeating-tasks', task);
    return response.data;
  }

  async update(id: number, task: RepeatingTaskRequest): Promise<RepeatingTask> {
    const response = await apiClient.put<RepeatingTask>(`/repeating-tasks/${id}`, task);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/repeating-tasks/${id}`);
  }

  async trigger(id: number): Promise<RepeatingTask> {
    const response = await apiClient.post<RepeatingTask>(`/repeating-tasks/${id}/trigger`);
    return response.data;
  }
}

export const repeatingTasksRepo = RepeatingTasksRepository.getInstance();
