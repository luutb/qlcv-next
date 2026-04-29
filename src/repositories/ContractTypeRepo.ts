import apiClient from '@/api/client';
import { ContractType, CreateContractTypeRequest, UpdateContractTypeRequest } from '@/types';

export class ContractTypeRepository {
  private static instance: ContractTypeRepository;
  private constructor() {}

  static getInstance(): ContractTypeRepository {
    if (!ContractTypeRepository.instance) {
      ContractTypeRepository.instance = new ContractTypeRepository();
    }
    return ContractTypeRepository.instance;
  }

  async getAll(): Promise<ContractType[]> {
    try {
      const response = await apiClient.get<ContractType[] | { data: ContractType[] }>('/contract-types');
      
      // Handle both direct array response and wrapped response
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      
      // Return empty array if no valid data
      return [];
    } catch (error) {
      console.error('Error fetching contract types:', error);
      return [];
    }
  }

  async create(data: CreateContractTypeRequest): Promise<ContractType> {
    try {
      const response = await apiClient.post<ContractType | { data: ContractType }>('/contract-types', data);
      
      // Handle both direct response and wrapped response
      if (response.data && typeof response.data === 'object') {
        return 'data' in response.data ? response.data.data : response.data as ContractType;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error creating contract type:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateContractTypeRequest): Promise<ContractType> {
    try {
      const response = await apiClient.put<ContractType | { data: ContractType }>(`/contract-types/${id}`, data);
      
      // Handle both direct response and wrapped response
      if (response.data && typeof response.data === 'object') {
        return 'data' in response.data ? response.data.data : response.data as ContractType;
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error updating contract type:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClient.delete(`/contract-types/${id}`);
    } catch (error) {
      console.error('Error deleting contract type:', error);
      throw error;
    }
  }
}

export const contractTypeRepo = ContractTypeRepository.getInstance();
