import apiClient from '@/api/client';

export interface WorkflowStep {
  id?: number;
  step: number;
  step_name: string;
  required_role: 'admin' | 'manager' | 'staff' | 'accountant';
  require_file?: boolean;
  require_approval?: boolean;
  auto_advance?: boolean;
  auto_advance_condition?: string;
  is_active?: boolean;
}

export interface CustomWorkflow {
  id?: number;
  name: string;
  description?: string;
  is_active: boolean;
  steps: WorkflowStep[];
  created_at: string;
}

export interface CustomWorkflowRequest {
  name: string;
  description?: string;
  is_active?: boolean;
  steps: WorkflowStep[];
}

export class CustomWorkflowRepository {
  private static instance: CustomWorkflowRepository;
  private constructor() {}

  static getInstance(): CustomWorkflowRepository {
    if (!CustomWorkflowRepository.instance) {
      CustomWorkflowRepository.instance = new CustomWorkflowRepository();
    }
    return CustomWorkflowRepository.instance;
  }

  async getAll(): Promise<CustomWorkflow[]> {
    const response = await apiClient.get<CustomWorkflow[]>('/custom-workflows');
    return response.data;
  }

  async create(workflow: CustomWorkflowRequest): Promise<CustomWorkflow> {
    const response = await apiClient.post<CustomWorkflow>('/custom-workflows', workflow);
    return response.data;
  }

  async update(id: number, workflow: CustomWorkflowRequest): Promise<CustomWorkflow> {
    const response = await apiClient.put<CustomWorkflow>(`/custom-workflows/${id}`, workflow);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/custom-workflows/${id}`);
  }

  async execute(id: number): Promise<any> {
    const response = await apiClient.post(`/custom-workflows/${id}/execute`);
    return response.data;
  }

  async getExecutions(id: number): Promise<any[]> {
    const response = await apiClient.get(`/custom-workflows/${id}/executions`);
    return response.data;
  }
}

export const customWorkflowRepo = CustomWorkflowRepository.getInstance();
