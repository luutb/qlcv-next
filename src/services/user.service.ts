import apiClient from './api/client';
import { UserDetail, CreateUserRequest, UpdateUserRequest, CreateCertificateRequest, CreateEducationRequest, ApiResponse } from '@/types';

export interface UserQueryParams {
  page: number;
  limit: number;
  role?: string;
  is_active?: string;
  search?: string;
}

export interface UserListResponse {
  data: UserDetail[];
  pagination: { total: number };
}

export interface UpdateProfileData {
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
}

export const userService = {
  async getMe(): Promise<ApiResponse<UserDetail>> {
    const response = await apiClient.get<UserDetail>('/users/me');
    return response;
  },

  async getAll(params: UserQueryParams): Promise<ApiResponse<UserListResponse>> {
    const response = await apiClient.get<UserListResponse>('/users', { params });
    return response;
  },

  async getById(id: number): Promise<ApiResponse<UserDetail>> {
    const response = await apiClient.get<UserDetail>(`/users/${id}`);
    return response;
  },

  async create(data: CreateUserRequest): Promise<ApiResponse<UserDetail>> {
    const response = await apiClient.post<UserDetail>('/users', data);
    return response;
  },

  async update(id: number, data: UpdateUserRequest): Promise<ApiResponse<UserDetail>> {
    const response = await apiClient.put<UserDetail>(`/users/${id}`, data);
    return response;
  },

  async toggleActive(id: number): Promise<ApiResponse<UserDetail>> {
    const response = await apiClient.put<UserDetail>(`/users/${id}/toggle-active`);
    return response;
  },

  async resetPassword(id: number, newPassword: string): Promise<void> {
    await apiClient.put(`/users/${id}/reset-password`, { new_password: newPassword });
  },

  // Profile management
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<UserDetail>> {
    const response = await apiClient.put<UserDetail>('/users/me/profile', data);
    return response;
  },

  // Certificate management
  async createProfileCertificate(data: CreateCertificateRequest): Promise<ApiResponse<UserDetail>> {
    const response = await apiClient.post<UserDetail>('/users/me/certificates', data);
    return response;
  },

  async updateProfileCertificate(certId: number, data: CreateCertificateRequest): Promise<ApiResponse<UserDetail>> {
    const response = await apiClient.put<UserDetail>(`/users/me/certificates/${certId}`, data);
    return response;
  },

  async deleteProfileCertificate(certId: number): Promise<void> {
    await apiClient.delete(`/users/me/certificates/${certId}`);
  },

  async createCertificate(userId: number, data: CreateCertificateRequest): Promise<ApiResponse<UserDetail>> {
    const response = await apiClient.post<UserDetail>(`/users/${userId}/certificates`, data);
    return response;
  },

  async updateCertificate(userId: number, certId: number, data: CreateCertificateRequest): Promise<ApiResponse<UserDetail>> {
    const response = await apiClient.put<UserDetail>(`/users/${userId}/certificates/${certId}`, data);
    return response;
  },

  async deleteCertificate(userId: number, certId: number): Promise<void> {
    await apiClient.delete(`/users/${userId}/certificates/${certId}`);
  },

  // Education management
  async createProfileEducation(data: CreateEducationRequest): Promise<ApiResponse<UserDetail>> {
    const response = await apiClient.post<UserDetail>('/users/me/educations', data);
    return response;
  },

  async updateProfileEducation(eduId: number, data: CreateEducationRequest): Promise<ApiResponse<UserDetail>> {
    const response = await apiClient.put<UserDetail>(`/users/me/educations/${eduId}`, data);
    return response;
  },

  async deleteProfileEducation(eduId: number): Promise<void> {
    await apiClient.delete(`/users/me/educations/${eduId}`);
  },

  async createEducation(userId: number, data: CreateEducationRequest): Promise<ApiResponse<UserDetail>> {
    const response = await apiClient.post<UserDetail>(`/users/${userId}/educations`, data);
    return response;
  },

  async updateEducation(userId: number, eduId: number, data: CreateEducationRequest): Promise<ApiResponse<UserDetail>> {
    const response = await apiClient.put<UserDetail>(`/users/${userId}/educations/${eduId}`, data);
    return response;
  },

  async deleteEducation(userId: number, eduId: number): Promise<void> {
    await apiClient.delete(`/users/${userId}/educations/${eduId}`);
  }
};