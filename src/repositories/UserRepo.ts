import apiClient from '@/api/client';
import { UserDetail, CreateUserRequest, UpdateUserRequest, CreateCertificateRequest, CreateEducationRequest } from '@/types';

export const userRepo = {
  getMe: () => apiClient.get<UserDetail>('/users/me').then(r => r.data),
  getAll: (params: { page: number; limit: number; role?: string; is_active?: string; search?: string }) =>
    apiClient.get<{ data: UserDetail[]; pagination: { total: number } }>('/users', { params }).then(r => r.data),
  getById: (id: number) => apiClient.get<UserDetail>(`/users/${id}`).then(r => r.data),
  create: (data: CreateUserRequest) => apiClient.post<UserDetail>('/users', data).then(r => r.data),
  update: (id: number, data: UpdateUserRequest) => apiClient.put<UserDetail>(`/users/${id}`, data).then(r => r.data),
  toggleActive: (id: number) => apiClient.put<UserDetail>(`/users/${id}/toggle-active`).then(r => r.data),
  resetPassword: (id: number, newPassword: string) =>
    apiClient.put(`/users/${id}/reset-password`, { new_password: newPassword }),
  updateProfile: (data: { full_name: string; email?: string; phone?: string; address?: string; date_of_birth?: string; gender?: 'male' | 'female' | 'other' }) =>
    apiClient.put<UserDetail>('/users/me/profile', data).then(r => r.data),
  createProfileCertificate: (data: CreateCertificateRequest) =>
    apiClient.post<UserDetail>('/users/me/certificates', data).then(r => r.data),
  updateProfileCertificate: (certId: number, data: CreateCertificateRequest) =>
    apiClient.put<UserDetail>(`/users/me/certificates/${certId}`, data).then(r => r.data),
  deleteProfileCertificate: (certId: number) =>
    apiClient.delete(`/users/me/certificates/${certId}`).then(r => r.data),
  createProfileEducation: (data: CreateEducationRequest) =>
    apiClient.post<UserDetail>('/users/me/educations', data).then(r => r.data),
  updateProfileEducation: (eduId: number, data: CreateEducationRequest) =>
    apiClient.put<UserDetail>(`/users/me/educations/${eduId}`, data).then(r => r.data),
  deleteProfileEducation: (eduId: number) =>
    apiClient.delete(`/users/me/educations/${eduId}`).then(r => r.data),
  createCertificate: (userId: number, data: CreateCertificateRequest) =>
    apiClient.post<UserDetail>(`/users/${userId}/certificates`, data).then(r => r.data),
  updateCertificate: (userId: number, certId: number, data: CreateCertificateRequest) =>
    apiClient.put<UserDetail>(`/users/${userId}/certificates/${certId}`, data).then(r => r.data),
  deleteCertificate: (userId: number, certId: number) =>
    apiClient.delete(`/users/${userId}/certificates/${certId}`).then(r => r.data),
  createEducation: (userId: number, data: CreateEducationRequest) =>
    apiClient.post<UserDetail>(`/users/${userId}/educations`, data).then(r => r.data),
  updateEducation: (userId: number, eduId: number, data: CreateEducationRequest) =>
    apiClient.put<UserDetail>(`/users/${userId}/educations/${eduId}`, data).then(r => r.data),
  deleteEducation: (userId: number, eduId: number) =>
    apiClient.delete(`/users/${userId}/educations/${eduId}`).then(r => r.data),
};
