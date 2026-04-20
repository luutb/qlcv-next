import apiClient from '@/api/client';
import { Task, PaginatedResponse } from '@/types';

export interface TaskQueryParams {
  page: number;
  limit: number;
  status?: string;
  keyword?: string;
  workflow_id?: number;
  step_status?: string;
}

export interface TaskStats {
  total_tasks: number;
  active_tasks: number;
  completed_tasks: number;
  total_revenue: number;
}

type Listener = () => void;

class TaskRepository {
  private static instance: TaskRepository;
  private listeners: Set<Listener> = new Set();

  private constructor() {}

  static getInstance(): TaskRepository {
    if (!TaskRepository.instance) {
      TaskRepository.instance = new TaskRepository();
    }
    return TaskRepository.instance;
  }

  // --- Event system for reactive updates ---

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  // --- Data access methods ---

  async getAll(
    params: TaskQueryParams,
  ): Promise<PaginatedResponse<Task>> {
    const queryParams: Record<string, string | number> = {
      page: params.page,
      limit: params.limit,
    };
    if (params.status) queryParams.status = params.status;
    if (params.keyword) queryParams.keyword = params.keyword;
    if (params.workflow_id) queryParams.workflow_id = params.workflow_id;
    if (params.step_status) queryParams.step_status = params.step_status;

    const { data } = await apiClient.get<PaginatedResponse<Task>>('/tasks', {
      params: queryParams,
    });
    return data;
  }

  async getById(id: number): Promise<Task> {
    const { data } = await apiClient.get<Task>(`/tasks/${id}`);
    return data;
  }

  async getStats(): Promise<TaskStats> {
    const { data } = await apiClient.get<TaskStats>('/statistics/overview');
    return data;
  }
}

export default TaskRepository;
