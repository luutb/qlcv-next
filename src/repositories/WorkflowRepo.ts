import apiClient from '@/api/client';
import { Workflow, WorkflowDetail, WorkflowStepConfig } from '@/types';

export class WorkflowRepository {
  private static instance: WorkflowRepository;
  private constructor() {}

  static getInstance(): WorkflowRepository {
    if (!WorkflowRepository.instance) {
      WorkflowRepository.instance = new WorkflowRepository();
    }
    return WorkflowRepository.instance;
  }

  async getAll(): Promise<Workflow[]> {
    const response = await apiClient.get<any>('/workflows');
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }

  async getConfigs(workflowId: number): Promise<WorkflowStepConfig[]> {
    const response = await apiClient.get<any>(`/workflows/${workflowId}/configs`);
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }

  async getById(id: number): Promise<WorkflowDetail> {
    const response = await apiClient.get<WorkflowDetail>(`/workflows/${id}`);
    return response.data;
  }

  async update(id: number, data: Record<string, any>): Promise<Workflow> {
    const response = await apiClient.put<Workflow>(`/workflows/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/workflows/${id}`);
  }

  async create(data: any): Promise<Workflow> {
    const response = await apiClient.post<Workflow>('/workflows', data);
    return response.data;
  }
}

export const workflowRepo = WorkflowRepository.getInstance();
