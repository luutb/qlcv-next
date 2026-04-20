import api from '@/api/client';
import {
  Workflow,
  WorkflowDetail,
  WorkflowStepConfig,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
} from '@/types';

class WorkflowRepository {
  async getAll(): Promise<Workflow[]> {
    const res = await api.get('/workflows');
    return res.data.data ?? res.data;
  }

  async getById(id: number): Promise<WorkflowDetail> {
    const res = await api.get(`/workflows/${id}`);
    return res.data.data ?? res.data;
  }

  async create(data: CreateWorkflowRequest): Promise<WorkflowDetail> {
    const res = await api.post('/workflows', data);
    return res.data.data ?? res.data;
  }

  async update(id: number, data: UpdateWorkflowRequest): Promise<WorkflowDetail> {
    const res = await api.put(`/workflows/${id}`, data);
    return res.data.data ?? res.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/workflows/${id}`);
  }

  async getConfigs(workflowId: number): Promise<WorkflowStepConfig[]> {
    const res = await api.get('/workflow-configs', {
      params: { workflow_id: workflowId },
    });
    return res.data.data ?? res.data;
  }

  async updateConfig(
    step: number,
    workflowId: number,
    data: Partial<WorkflowStepConfig>,
  ): Promise<void> {
    await api.put(`/workflow-configs/${step}`, data, {
      params: { workflow_id: workflowId },
    });
  }
}

export const workflowRepo = new WorkflowRepository();
