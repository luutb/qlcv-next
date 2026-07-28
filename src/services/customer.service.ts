import apiClient from './api/client';
import { Customer, CreateCustomerRequest, CustomerQueryParams, ApiResponse } from '@/types';

export interface CustomerListResponse {
  data: Customer[];
  pagination: any;
}

export const customerService = {
  async getAll(params?: CustomerQueryParams): Promise<ApiResponse<CustomerListResponse>> {
    const response = await apiClient.get<CustomerListResponse>('/customers', { params });
    return response;
  },

  async getById(id: number): Promise<ApiResponse<Customer>> {
    const response = await apiClient.get<Customer>(`/customers/${id}`);
    return response;
  },

  async create(data: CreateCustomerRequest): Promise<ApiResponse<Customer>> {
    const response = await apiClient.post<Customer>('/customers', data);
    return response;
  },

  async update(id: number, data: Partial<CreateCustomerRequest>): Promise<ApiResponse<Customer>> {
    const response = await apiClient.put<Customer>(`/customers/${id}`, data);
    return response;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  }
};