import type { Role } from './user.types';

export interface WorkloadUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  department?: string;
  capacity: number;
  current_workload: number;
  utilization_rate: number;
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
  weekly_capacity: number;
  daily_capacity: number;
  overtime_limit: number;
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  time_off_dates: string[];
  skills: string[];
  hourly_rate?: number;
}

export interface WorkloadDistribution {
  user_id: number;
  user_name: string;
  tasks: Array<{
    id: string;
    title: string;
    estimated_hours: number;
    priority: string;
    due_date: string;
    status: string;
  }>;
  total_hours: number;
  capacity_percentage: number;
}
