import api from '@/api/client';
import { Notification, PaginatedResponse } from '@/types';

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  is_read?: boolean;
  type?: string;
}

class NotificationRepository {
  async getAll(params: NotificationQueryParams): Promise<PaginatedResponse<Notification>> {
    const res = await api.get('/notifications', { params });
    return res.data;
  }

  async markAsRead(id: number): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/notifications/${id}`);
  }

  async getUnreadCount(): Promise<number> {
    const res = await api.get('/notifications/unread-count');
    return res.data.count ?? res.data.data?.count ?? 0;
  }
}

export const notificationRepo = new NotificationRepository();
