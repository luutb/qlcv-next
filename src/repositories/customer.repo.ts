import api from '@/api/client';
import { Customer, CreateCustomerRequest, CustomerQueryParams, PaginatedResponse } from '@/types';

class CustomerRepository {
  async getAll(params?: CustomerQueryParams): Promise<PaginatedResponse<Customer>> {
    const res = await api.get('/customers', { params });
    return res.data;
  }

  async getById(id: number): Promise<Customer> {
    const res = await api.get(`/customers/${id}`);
    return res.data.data ?? res.data;
  }

  async create(data: CreateCustomerRequest): Promise<Customer> {
    const res = await api.post('/customers', data);
    return res.data.data ?? res.data;
  }

  async update(id: number, data: Partial<CreateCustomerRequest>): Promise<Customer> {
    const res = await api.put(`/customers/${id}`, data);
    return res.data.data ?? res.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/customers/${id}`);
  }
}

export const customerRepo = new CustomerRepository();
