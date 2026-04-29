import apiClient from '@/api/client';
import { Customer, CreateCustomerRequest, CustomerQueryParams } from '@/types';

export class CustomerRepository {
  private static instance: CustomerRepository;
  private constructor() {}

  static getInstance(): CustomerRepository {
    if (!CustomerRepository.instance) {
      CustomerRepository.instance = new CustomerRepository();
    }
    return CustomerRepository.instance;
  }

  async getAll(params?: CustomerQueryParams): Promise<{ data: Customer[]; pagination: any }> {
    const response = await apiClient.get<{ data: Customer[]; pagination: any }>('/customers', { params });
    return response.data;
  }

  async getById(id: number): Promise<Customer> {
    const response = await apiClient.get<Customer>(`/customers/${id}`);
    return response.data;
  }

  async create(data: CreateCustomerRequest): Promise<Customer> {
    const response = await apiClient.post<Customer>('/customers', data);
    return response.data;
  }

  async update(id: number, data: Partial<CreateCustomerRequest>): Promise<Customer> {
    const response = await apiClient.put<Customer>(`/customers/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  }
}

export const customerRepo = CustomerRepository.getInstance();
