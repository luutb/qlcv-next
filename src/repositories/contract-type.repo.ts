import api from '@/api/client';
import { ContractType, CreateContractTypeRequest, UpdateContractTypeRequest } from '@/types';

class ContractTypeRepository {
  async getAll() {
    const res = await api.get('/contract-types');
    return res.data;
  }

  async create(data: CreateContractTypeRequest) {
    const res = await api.post('/contract-types', data);
    return res.data;
  }

  async update(id: number, data: UpdateContractTypeRequest) {
    const res = await api.put(`/contract-types/${id}`, data);
    return res.data;
  }

  async delete(id: number) {
    const res = await api.delete(`/contract-types/${id}`);
    return res.data;
  }
}

export const contractTypeRepo = new ContractTypeRepository();
