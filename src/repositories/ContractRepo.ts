import apiClient from '@/api/client';
import { Contract, CreateContractRequest } from '@/types';

export class ContractRepository {
  private static instance: ContractRepository;
  private constructor() {}

  static getInstance(): ContractRepository {
    if (!ContractRepository.instance) {
      ContractRepository.instance = new ContractRepository();
    }
    return ContractRepository.instance;
  }

  async getByTask(taskId: string | number): Promise<Contract[]> {
    const response = await apiClient.get<Contract[]>(`/tasks/${taskId}/contracts`);
    return response.data;
  }

  async create(taskId: string | number, data: CreateContractRequest): Promise<Contract> {
    const response = await apiClient.post<Contract>(`/tasks/${taskId}/contracts`, data);
    return response.data;
  }

  async update(id: number, data: Partial<CreateContractRequest>): Promise<Contract> {
    const response = await apiClient.put<Contract>(`/contracts/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/contracts/${id}`);
  }
}

export const contractRepo = ContractRepository.getInstance();
