import apiClient from '@/api/client';

export interface GeneralSettings {
  app_name: string;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  max_file_size_mb: number;
  allowed_file_types: string;
  task_deadline_warning_days: number;
  auto_assign_enabled: boolean;
}

export const settingsRepo = {
  getGeneral: () => apiClient.get<GeneralSettings>('/settings/general').then(r => r.data),
  updateGeneral: (data: GeneralSettings) => apiClient.put<GeneralSettings>('/settings/general', data).then(r => r.data),
};
