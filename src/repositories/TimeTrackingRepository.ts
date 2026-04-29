import apiClient from '@/api/client';

export interface TimeEntry {
  id?: number;
  task_id: number;
  start_time: string;
  end_time?: string;
  duration_seconds: number;
  description?: string;
  created_at: string;
}

export interface TimeEntryRequest {
  task_id: number;
  start_time: string;
  duration_seconds: number;
  description?: string;
}

export interface TimeEntryStopRequest {
  entry_id: number;
}

export class TimeTrackingRepository {
  private static instance: TimeTrackingRepository;
  private constructor() {}

  static getInstance(): TimeTrackingRepository {
    if (!TimeTrackingRepository.instance) {
      TimeTrackingRepository.instance = new TimeTrackingRepository();
    }
    return TimeTrackingRepository.instance;
  }

  async create(entry: TimeEntryRequest): Promise<TimeEntry> {
    const response = await apiClient.post<TimeEntry>('/time-entries', entry);
    return response.data;
  }

  async stop(entryId: number): Promise<void> {
    await apiClient.post(`/time-entries/${entryId}/stop`);
  }

  async getByTask(taskId: number): Promise<TimeEntry[]> {
    const response = await apiClient.get<TimeEntry[]>(`/time-entries?task_id=${taskId}`);
    return response.data;
  }

  async getTimesheetDaily(taskId: number, date: string): Promise<any> {
    const response = await apiClient.get(`/timesheet/daily?task_id=${taskId}&date=${date}`);
    return response.data;
  }

  async getTimesheetWeekly(taskId: number, year: number, week: number): Promise<any> {
    const response = await apiClient.get(`/timesheet/weekly?task_id=${taskId}&year=${year}&week=${week}`);
    return response.data;
  }

  async getTimesheetMonthly(taskId: number, year: number, month: number): Promise<any> {
    const response = await apiClient.get(`/timesheet/monthly?task_id=${taskId}&year=${year}&month=${month}`);
    return response.data;
  }
}

export const timeTrackingRepo = TimeTrackingRepository.getInstance();
