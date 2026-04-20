import api from '@/api/client';
import { Contract, CreateContractRequest } from '@/types';

class ContractRepository {
  async getByTask(taskId: string | number): Promise<Contract[]> {
    const res = await api.get(`/tasks/${taskId}/contracts`);
    return res.data.data ?? res.data;
  }

  async getById(id: number): Promise<Contract> {
    const res = await api.get(`/contracts/${id}`);
    return res.data.data ?? res.data;
  }

  async create(taskId: string | number, data: CreateContractRequest): Promise<Contract> {
    const res = await api.post(`/tasks/${taskId}/contracts`, data);
    return res.data.data ?? res.data;
  }

  async update(id: number, data: Partial<CreateContractRequest>): Promise<Contract> {
    const res = await api.put(`/contracts/${id}`, data);
    return res.data.data ?? res.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/contracts/${id}`);
  }
}

export const contractRepo = new ContractRepository();
