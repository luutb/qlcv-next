import api from '@/api/client';

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

class SettingsRepository {
  async getGeneral(): Promise<GeneralSettings> {
    const res = await api.get('/settings/general');
    return res.data.data ?? res.data;
  }

  async updateGeneral(data: Partial<GeneralSettings>): Promise<void> {
    await api.put('/settings/general', data);
  }
}

export const settingsRepo = new SettingsRepository();
