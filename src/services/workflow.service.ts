import apiClient from './api/client';
import { Workflow, WorkflowDetail, WorkflowStepConfig, ApiResponse } from '@/types';

export const workflowService = {
  async getAll(): Promise<ApiResponse<Workflow[]>> {
    const response = await apiClient.get<Workflow[]>('/workflows');
    return response;
  },

  async getById(id: number): Promise<ApiResponse<WorkflowDetail>> {
    const response = await apiClient.get<WorkflowDetail>(`/workflows/${id}`);
    return response;
  },

  async create(data: any): Promise<ApiResponse<Workflow>> {
    const response = await apiClient.post<Workflow>('/workflows', data);
    return response;
  },

  async update(id: number, data: Record<string, any>): Promise<ApiResponse<Workflow>> {
    const response = await apiClient.put<Workflow>(`/workflows/${id}`, data);
    return response;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/workflows/${id}`);
  },

  async getConfigs(workflowId: number): Promise<ApiResponse<WorkflowStepConfig[]>> {
    const response = await apiClient.get<WorkflowStepConfig[]>(`/workflows/${workflowId}/configs`);
    return response;
  }
};