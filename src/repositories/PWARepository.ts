import apiClient from '@/api/client';

export interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  hasNotificationPermission: boolean;
  lastSync?: string;
  cacheSize?: number;
}

export interface PWASettings {
  enableOffline: boolean;
  enablePushNotifications: boolean;
  autoSync: boolean;
  syncFrequency: 'manual' | 'hourly' | 'daily';
}

export interface PWAUpdateSettingsRequest {
  enableOffline?: boolean;
  enablePushNotifications?: boolean;
  autoSync?: boolean;
  syncFrequency?: 'manual' | 'hourly' | 'daily';
}

export class PWARepository {
  private static instance: PWARepository;
  private constructor() {}

  static getInstance(): PWARepository {
    if (!PWARepository.instance) {
      PWARepository.instance = new PWARepository();
    }
    return PWARepository.instance;
  }

  async getStatus(): Promise<PWAStatus> {
    const response = await apiClient.get<PWAStatus>('/pwa/status');
    return response.data;
  }

  async getSettings(): Promise<PWASettings> {
    const response = await apiClient.get<PWASettings>('/pwa/settings');
    return response.data;
  }

  async updateSettings(settings: PWAUpdateSettingsRequest): Promise<PWASettings> {
    const response = await apiClient.put<PWASettings>('/pwa/settings', settings);
    return response.data;
  }

  async install(): Promise<void> {
    // This would typically trigger the PWA install prompt
    // Implementation depends on how PWA is set up in the app
    console.log('PWA install triggered');
  }
}

export const pwaRepo = PWARepository.getInstance();
