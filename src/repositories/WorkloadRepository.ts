import apiClient from '@/api/client';

export interface WorkloadUser {
  user_id: number;
  user_name: string;
  department: string;
  role: string;
  active_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  total_tasks: number;
  average_completion_time: number;
  workload_score: number;
  workload_level: 'low' | 'medium' | 'high' | 'overloaded';
  is_available: boolean;
  last_assigned_at: string;
  total_hours_this_week: number;
  total_hours_this_month: number;
  max_tasks_per_week: number;
  max_hours_per_week: number;
  capacity_utilization: number;
  skills: string[];
  preferred_task_types: string[];
}

export interface WorkloadMetrics {
  total_users: number;
  available_users: number;
  overloaded_users: number;
  average_workload: number;
  workload_distribution: {
    low: number;
    medium: number;
    high: number;
    overloaded: number;
  };
  department_metrics: Record<string, {
    department_name: string;
    total_users: number;
    available_users: number;
    average_workload: number;
    total_active_tasks: number;
    total_pending_tasks: number;
    workload_level: string;
  }>;
  generated_at: string;
}

export interface TaskRecommendation {
  user_id: number;
  user_name: string;
  department: string;
  role: string;
  recommendation_score: number;
  reason: string;
  workload_score: number;
  skill_match: number;
  availability_score: number;
  estimated_completion_days: number;
  workload_after_assignment: number;
  capacity_after_assignment: number;
  current_active_tasks: number;
  average_task_completion_days: number;
}

export interface UserCapacity {
  user_id: number;
  user_name: string;
  max_tasks_per_week: number;
  max_hours_per_week: number;
  is_available: boolean;
  skills: string[];
  preferences: {
    preferred_task_types: string[];
    working_hours: string;
    timezone: string;
  };
  updated_at: string;
  current_tasks_this_week: number;
  current_hours_this_week: number;
  task_utilization: number;
  hour_utilization: number;
}

export interface WorkloadHistoryPoint {
  date: string;
  active_tasks: number;
  completed_tasks: number;
  total_hours: number;
  workload_score: number;
}

export interface WorkloadHistory {
  user_id: number;
  user_name: string;
  start_date: string;
  end_date: string;
  granularity: 'daily' | 'weekly' | 'monthly';
  data_points: WorkloadHistoryPoint[];
  summary: {
    average_active_tasks: number;
    average_completed_tasks: number;
    average_total_hours: number;
    average_workload_score: number;
    peak_workload_score: number;
    peak_workload_date: string;
    total_tasks_completed: number;
    total_hours_worked: number;
  };
}

// Legacy interfaces for backward compatibility
export interface UserWorkload {
  user_id: number;
  full_name: string;
  avatar?: string;
  department_name?: string;
  total_tasks: number;
  active_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  total_hours: number;
  estimated_hours: number;
  utilization: number;
  capacity: number;
}

export interface AutoAssignRequest {
  task_id: number;
  user_id?: number;
  strategy?: 'round_robin' | 'least_busy' | 'most_available';
}

export class WorkloadRepository {
  private static instance: WorkloadRepository;
  private constructor() {}

  static getInstance(): WorkloadRepository {
    if (!WorkloadRepository.instance) {
      WorkloadRepository.instance = new WorkloadRepository();
    }
    return WorkloadRepository.instance;
  }

  // New API methods
  async getUsersWorkloadV2(params?: {
    department_id?: number;
    role?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<WorkloadUser[]> {
    const response = await apiClient.get<{ data: WorkloadUser[] }>('/workload/users', { params });
    return response.data.data;
  }
  
  async getUserWorkloadV2(userId: number): Promise<WorkloadUser> {
    const response = await apiClient.get<{ data: WorkloadUser }>(`/workload/user/${userId}`);
    return response.data.data;
  }
  
  async getMetrics(params?: { department_id?: number }): Promise<WorkloadMetrics> {
    const response = await apiClient.get<{ data: WorkloadMetrics }>('/workload/metrics', { params });
    return response.data.data;
  }

  async getRecommendationsV2(data: {
    task_id: number;
    required_skills?: string[];
    preferred_role?: string;
    department_id?: number;
    priority?: string;
    estimated_hours?: number;
    deadline?: string;
    max_recommendations?: number;
  }): Promise<TaskRecommendation[]> {
    const response = await apiClient.post<{ data: TaskRecommendation[] }>('/workload/recommendations', data);
    return response.data.data;
  }

  async getAvailableUsersV2(params?: {
    required_skills?: string;
    role?: string;
    max_workload_score?: number;
    sort_by?: string;
    limit?: number;
  }): Promise<WorkloadUser[]> {
    const response = await apiClient.get<{ data: WorkloadUser[] }>('/workload/available', { params });
    return response.data.data;
  }

  async getUserCapacity(userId: number): Promise<UserCapacity> {
    const response = await apiClient.get<{ data: UserCapacity }>(`/users/${userId}/capacity`);
    return response.data.data;
  }
  
  async updateUserCapacity(userId: number, data: Partial<UserCapacity>): Promise<UserCapacity> {
    const response = await apiClient.put<{ data: UserCapacity }>(`/users/${userId}/capacity`, data);
    return response.data.data;
  }
  
  async getCurrentUserCapacity(): Promise<UserCapacity> {
    const response = await apiClient.get<{ data: UserCapacity }>('/auth/capacity');
    return response.data.data;
  }
  
  async updateCurrentUserCapacity(data: Partial<UserCapacity>): Promise<UserCapacity> {
    const response = await apiClient.put<{ data: UserCapacity }>('/auth/capacity', data);
    return response.data.data;
  }

  async getWorkloadHistory(params: {
    user_id?: number;
    start_date: string;
    end_date: string;
    granularity?: 'daily' | 'weekly' | 'monthly';
  }): Promise<WorkloadHistory> {
    const response = await apiClient.get<{ data: WorkloadHistory }>('/workload/history', { params });
    return response.data.data;
  }

  async refreshWorkloadData(): Promise<void> {
    await apiClient.post('/workload/refresh');
  }

  // Legacy methods for backward compatibility
  async getUsersWorkload(): Promise<UserWorkload[]> {
    const response = await apiClient.get<UserWorkload[]>('/workload/users');
    return response.data;
  }

  async getUserWorkload(userId: number): Promise<UserWorkload> {
    const response = await apiClient.get<UserWorkload>(`/workload/user/${userId}`);
    return response.data;
  }

  async getAvailableUsers(): Promise<UserWorkload[]> {
    const response = await apiClient.get<UserWorkload[]>('/workload/available');
    return response.data;
  }

  async autoAssign(request: AutoAssignRequest): Promise<void> {
    await apiClient.post('/tasks/auto-assign', request);
  }

  async getRecommendations(taskId: number): Promise<any> {
    const response = await apiClient.get(`/workload/recommendations?task_id=${taskId}`);
    return response.data;
  }
}

export const workloadRepo = WorkloadRepository.getInstance();
