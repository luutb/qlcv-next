import apiClient from './api/client';
import {
  LabelsResponse,
  CreateLabelData,
  UpdateLabelData,
  Label,
  TaskLabels,
  UpdateTaskLabelsData,
  LabelStatistics
} from '@/types/label.types';

export const labelService = {
  async getAll(): Promise<LabelsResponse> {
    const response = await apiClient.get<LabelsResponse>('/labels');
    return response.data;
  },

  async create(data: CreateLabelData): Promise<Label> {
    const response = await apiClient.post<Label>('/labels', data);
    return response.data;
  },

  async update(id: number, data: UpdateLabelData): Promise<Label> {
    const response = await apiClient.put<Label>(`/labels/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/labels/${id}`);
  },

  async getStatistics(): Promise<LabelStatistics> {
    const response = await apiClient.get<LabelStatistics>('/labels/statistics');
    return response.data;
  },

  async getTaskLabels(taskId: string): Promise<TaskLabels> {
    const response = await apiClient.get<TaskLabels>(`/tasks/${taskId}/labels`);
    return response.data;
  },

  async updateTaskLabels(taskId: string, data: UpdateTaskLabelsData): Promise<TaskLabels> {
    const response = await apiClient.put<TaskLabels>(`/tasks/${taskId}/labels`, data);
    return response.data;
  }
};