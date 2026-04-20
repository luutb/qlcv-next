import api from '@/api/client';
import {
  UserDetail,
  UserCertificate,
  UserEducation,
  PaginatedResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserQueryParams,
  CreateCertificateRequest,
  CreateEducationRequest,
  UpdateProfileRequest,
} from '@/types';

class UserRepository {
  // ── Admin: User CRUD ──

  async getAll(params: UserQueryParams): Promise<PaginatedResponse<UserDetail>> {
    const res = await api.get('/users', { params });
    return res.data;
  }

  async getById(id: number): Promise<UserDetail> {
    const res = await api.get(`/users/${id}`);
    const body = res.data;
    // BE có thể trả { data: { ...user } } hoặc trực tiếp { id, username, ... }
    if (body?.data && typeof body.data === 'object' && 'id' in body.data) {
      return body.data;
    }
    return body;
  }

  async create(data: CreateUserRequest): Promise<UserDetail> {
    const res = await api.post('/users', data);
    return res.data.data ?? res.data;
  }

  async update(id: number, data: UpdateUserRequest): Promise<UserDetail> {
    const res = await api.put(`/users/${id}`, data);
    return res.data.data ?? res.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  async toggleActive(id: number): Promise<void> {
    await api.put(`/users/${id}/toggle-active`);
  }

  async resetPassword(id: number, newPassword: string): Promise<void> {
    await api.put(`/users/${id}/reset-password`, { new_password: newPassword });
  }

  async uploadAvatar(id: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await api.post(`/users/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data?.avatar_url ?? res.data.avatar_url;
  }

  // ── Admin: Certificates ──

  async getCertificates(userId: number): Promise<UserCertificate[]> {
    const res = await api.get(`/users/${userId}/certificates`);
    return res.data.data ?? res.data;
  }

  async createCertificate(userId: number, data: CreateCertificateRequest): Promise<UserCertificate> {
    const res = await api.post(`/users/${userId}/certificates`, data);
    return res.data.data ?? res.data;
  }

  async updateCertificate(userId: number, certId: number, data: CreateCertificateRequest): Promise<UserCertificate> {
    const res = await api.put(`/users/${userId}/certificates/${certId}`, data);
    return res.data.data ?? res.data;
  }

  async deleteCertificate(userId: number, certId: number): Promise<void> {
    await api.delete(`/users/${userId}/certificates/${certId}`);
  }

  // ── Admin: Educations ──

  async getEducations(userId: number): Promise<UserEducation[]> {
    const res = await api.get(`/users/${userId}/educations`);
    return res.data.data ?? res.data;
  }

  async createEducation(userId: number, data: CreateEducationRequest): Promise<UserEducation> {
    const res = await api.post(`/users/${userId}/educations`, data);
    return res.data.data ?? res.data;
  }

  async updateEducation(userId: number, eduId: number, data: CreateEducationRequest): Promise<UserEducation> {
    const res = await api.put(`/users/${userId}/educations/${eduId}`, data);
    return res.data.data ?? res.data;
  }

  async deleteEducation(userId: number, eduId: number): Promise<void> {
    await api.delete(`/users/${userId}/educations/${eduId}`);
  }

  // ── Auth: Profile ──

  async getMe(): Promise<UserDetail> {
    const res = await api.get('/auth/me');
    return res.data.data ?? res.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserDetail> {
    const res = await api.put('/auth/profile', data);
    return res.data.data ?? res.data;
  }

  // ── Auth: Profile Certificates ──

  async createProfileCertificate(data: CreateCertificateRequest): Promise<UserCertificate> {
    const res = await api.post('/auth/profile/certificates', data);
    return res.data.data ?? res.data;
  }

  async updateProfileCertificate(certId: number, data: CreateCertificateRequest): Promise<UserCertificate> {
    const res = await api.put(`/auth/profile/certificates/${certId}`, data);
    return res.data.data ?? res.data;
  }

  async deleteProfileCertificate(certId: number): Promise<void> {
    await api.delete(`/auth/profile/certificates/${certId}`);
  }

  // ── Auth: Profile Educations ──

  async createProfileEducation(data: CreateEducationRequest): Promise<UserEducation> {
    const res = await api.post('/auth/profile/educations', data);
    return res.data.data ?? res.data;
  }

  async updateProfileEducation(eduId: number, data: CreateEducationRequest): Promise<UserEducation> {
    const res = await api.put(`/auth/profile/educations/${eduId}`, data);
    return res.data.data ?? res.data;
  }

  async deleteProfileEducation(eduId: number): Promise<void> {
    await api.delete(`/auth/profile/educations/${eduId}`);
  }

  // ── Upload certificate file ──

  async uploadCertificateFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload/certificate', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data?.file_url ?? res.data.file_url ?? res.data.url;
  }
}

export const userRepo = new UserRepository();
