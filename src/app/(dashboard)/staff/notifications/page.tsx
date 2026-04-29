'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Chip, CircularProgress, Alert } from '@mui/material';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import NotificationPreferences from '@/components/notifications/NotificationPreferences';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: number;
  title: string;
  body: string;
  type: 'task_update' | 'contract_expiry' | 'payment_reminder' | 'system' | 'workflow_update';
  is_read: boolean;
  created_at: string;
  reference_id?: number;
}

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  in_app: boolean;
  digest: boolean;
  digest_frequency: 'instant' | 'hourly' | 'daily';
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: true,
    in_app: true,
    digest: false,
    digest_frequency: 'instant',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      const mockNotifications: Notification[] = [
        {
          id: 1,
          title: 'Hồ sơ mới',
          body: 'Hồ sơ "Vay vốn mua nhà" đã được tạo',
          type: 'task_update',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'Hợp đồng sắp hết hạn',
          body: 'Hợp đồng #123 sẽ hết hạn trong 15 ngày',
          type: 'contract_expiry',
          is_read: false,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          title: 'Thanh toán',
          body: 'Đã nhận thanh toán cho mốc #1',
          type: 'payment_reminder',
          is_read: true,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      setNotifications(mockNotifications);

      const mockPreferences: NotificationPreferences = {
        email: true,
        push: true,
        in_app: true,
        digest: false,
        digest_frequency: 'instant',
      };
      setPreferences(mockPreferences);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (notificationId: number) => {
    try {
      // TODO: Replace with actual API call
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      // TODO: Replace with actual API call
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      // TODO: Replace with actual API call
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      // TODO: Replace with actual API call
      setNotifications([]);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    }
  };

  const handlePreferencesChange = async (newPreferences: NotificationPreferences) => {
    try {
      // TODO: Replace with actual API call
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Trung tâm thông báo
        </Typography>
        <Chip
          label={`${notifications.filter((n) => !n.is_read).length} chưa đọc`}
          size="small"
          color="error"
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 350px' }, gap: 3 }}>
        {/* Notification List */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Danh sách thông báo
          </Typography>
          <NotificationCenter
            notifications={notifications}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onDelete={handleDelete}
            onDeleteAll={handleDeleteAll}
          />
        </Paper>

        {/* Preferences */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Cài đặt
          </Typography>
          <NotificationPreferences
            preferences={preferences}
            onChange={handlePreferencesChange}
          />
        </Paper>
      </Box>
    </Box>
  );
}
