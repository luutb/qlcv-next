import apiClient from '@/services/api/client';

export interface WorkloadUser {
  id: number;
  name: string;
  email: string;
  role: string;
  department?: string;
  capacity: number; // hours per week
  current_workload: number; // current hours assigned
  utilization_rate: number; // percentage
  available_hours: number;
  tasks_count: number;
  avatar?: string;
}

export interface WorkloadMetrics {
  total_users: number;
  average_utilization: number;
  overloaded_users: number;
  underutilized_users: number;
  total_capacity: number;
  total_workload: number;
  efficiency_score: number;
}

export interface UserCapacity {
  user_id: number;
  weekly_capacity: number; // hours per week
  daily_capacity: number; // hours per day
  overtime_limit: number; // max overtime hours per week
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  time_off_dates: string[]; // ISO date strings
  skills: string[];
  hourly_rate?: number;
}

export interface WorkloadDistribution {
  user_id: number;
  user_name: string;
  tasks: {
    id: string;
    title: string;
    estimated_hours: number;
    priority: string;
    due_date: string;
    status: string;
  }[];
  total_hours: number;
  capacity_percentage: number;
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

  // Get workload data for all users
  async getWorkloadUsers(): Promise<WorkloadUser[]> {
    try {
      const response = await apiClient.get<{ data: WorkloadUser[] } | WorkloadUser[]>('/workload/users');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching workload users:', error);
      return [];
    }
  }

  // Get workload metrics
  async getWorkloadMetrics(): Promise<WorkloadMetrics> {
    try {
      const response = await apiClient.get<{ data: WorkloadMetrics } | WorkloadMetrics>('/workload/metrics');
      if (response.data && typeof response.data === 'object') {
        return 'data' in response.data ? response.data.data : response.data as WorkloadMetrics;
      }
      return this.getDefaultMetrics();
    } catch (error) {
      console.error('Error fetching workload metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  // Get user capacity settings
  async getUserCapacity(userId: number): Promise<UserCapacity> {
    try {
      const response = await apiClient.get<{ data: UserCapacity } | UserCapacity>(`/users/${userId}/capacity`);
      if (response.data && typeof response.data === 'object') {
        return 'data' in response.data ? response.data.data : response.data as UserCapacity;
      }
      return this.getDefaultCapacity(userId);
    } catch (error) {
      console.error('Error fetching user capacity:', error);
      return this.getDefaultCapacity(userId);
    }
  }

  // Update user capacity settings
  async updateUserCapacity(userId: number, capacity: Partial<UserCapacity>): Promise<UserCapacity> {
    try {
      const response = await apiClient.put<{ data: UserCapacity } | UserCapacity>(`/users/${userId}/capacity`, capacity);
      if (response.data && typeof response.data === 'object') {
        return 'data' in response.data ? response.data.data : response.data as UserCapacity;
      }
      throw new Error('Invalid capacity update response');
    } catch (error) {
      console.error('Error updating user capacity:', error);
      throw error;
    }
  }

  // Get workload distribution
  async getWorkloadDistribution(): Promise<WorkloadDistribution[]> {
    try {
      const response = await apiClient.get<{ data: WorkloadDistribution[] } | WorkloadDistribution[]>('/workload/distribution');
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching workload distribution:', error);
      return [];
    }
  }

  // Rebalance workload
  async rebalanceWorkload(options: {
    target_utilization?: number;
    consider_skills?: boolean;
    respect_priorities?: boolean;
  }): Promise<{ success: boolean; message: string; changes: any[] }> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        changes: any[];
      }>('/workload/rebalance', options);
      return response.data;
    } catch (error) {
      console.error('Error rebalancing workload:', error);
      return {
        success: false,
        message: 'Failed to rebalance workload',
        changes: []
      };
    }
  }

  // Get available users for task assignment
  async getAvailableUsers(taskEstimatedHours: number, dueDate?: string): Promise<WorkloadUser[]> {
    try {
      const params = {
        estimated_hours: taskEstimatedHours,
        due_date: dueDate
      };
      const response = await apiClient.get<{ data: WorkloadUser[] } | WorkloadUser[]>('/workload/available-users', { params });
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && 'data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching available users:', error);
      return [];
    }
  }

  // Private helper methods
  private getDefaultMetrics(): WorkloadMetrics {
    return {
      total_users: 0,
      average_utilization: 0,
      overloaded_users: 0,
      underutilized_users: 0,
      total_capacity: 0,
      total_workload: 0,
      efficiency_score: 0
    };
  }

  private getDefaultCapacity(userId: number): UserCapacity {
    return {
      user_id: userId,
      weekly_capacity: 40,
      daily_capacity: 8,
      overtime_limit: 10,
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      },
      time_off_dates: [],
      skills: []
    };
  }
}

export const workloadRepo = WorkloadRepository.getInstance();