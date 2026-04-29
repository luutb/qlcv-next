'use client';

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  Cloud,
  Download,
  Notifications,
  PhoneIphone,
  Settings,
  Wifi,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  hasNotificationPermission: boolean;
  lastSync?: string;
  cacheSize?: number;
}

interface PWASettings {
  enableOffline: boolean;
  enablePushNotifications: boolean;
  autoSync: boolean;
  syncFrequency: 'manual' | 'hourly' | 'daily';
}

interface PWAProps {
  status: PWAStatus;
  settings: PWASettings;
  onInstall?: () => Promise<void>;
  onToggleOffline?: (enabled: boolean) => Promise<void>;
  onToggleNotifications?: (enabled: boolean) => Promise<void>;
  onUpdateSettings?: (settings: PWASettings) => Promise<void>;
}

export default function PWA({
  status,
  settings,
  onInstall,
  onToggleOffline,
  onToggleNotifications,
  onUpdateSettings,
}: PWAProps) {
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [draftSettings, setDraftSettings] = useState(settings);

  useEffect(() => {
    setDraftSettings(settings);
  }, [settings]);

  const handleInstall = async () => {
    if (onInstall) {
      await onInstall();
    }
  };

  const handleToggleOffline = async (enabled: boolean) => {
    if (onToggleOffline) {
      await onToggleOffline(enabled);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (onToggleNotifications) {
      await onToggleNotifications(enabled);
    }
  };

  const handleUpdateSettings = async () => {
    if (onUpdateSettings) {
      await onUpdateSettings(draftSettings);
      setShowSettingsDialog(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <PhoneIphone fontSize="small" color="action" />
        <Typography variant="h6">Mobile App / PWA</Typography>
        <Chip
          label={status.isInstalled ? 'Đã cài đặt' : 'Chưa cài đặt'}
          size="small"
          color={status.isInstalled ? 'success' : undefined}
        />
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Cloud fontSize="small" color="action" />
          <Typography variant="h6">Trạng thái</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Paper sx={{ p: 2, flex: 1, minWidth: 150 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Wifi fontSize="small" color={status.isOnline ? 'success' : 'error'} />
              <Typography variant="body2" color="text.secondary">
                Kết nối
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight="bold" color={status.isOnline ? 'success.main' : 'error.main'}>
              {status.isOnline ? 'Online' : 'Offline'}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2, flex: 1, minWidth: 150 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Notifications fontSize="small" color={status.hasNotificationPermission ? 'success' : 'action'} />
              <Typography variant="body2" color="text.secondary">
                Thông báo
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight="bold">
              {status.hasNotificationPermission ? 'Đã bật' : 'Chưa bật'}
            </Typography>
          </Paper>

          <Paper sx={{ p: 2, flex: 1, minWidth: 150 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Download fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Đã cài đặt
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight="bold" color={status.isInstalled ? 'success.main' : 'text.primary'}>
              {status.isInstalled ? 'Có' : 'Không'}
            </Typography>
          </Paper>
        </Box>

        {status.lastSync && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Đồng bộ lần cuối: {new Date(status.lastSync).toLocaleDateString('vi-VN')}
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Settings fontSize="small" color="action" />
          <Typography variant="h6">Tính năng</Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" fontWeight="500">
                Chế độ offline
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Truy cập dữ liệu khi không có kết nối internet
              </Typography>
            </Box>
            <Switch
              checked={settings.enableOffline}
              onChange={(e) => handleToggleOffline(e.target.checked)}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" fontWeight="500">
                Push notifications
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Nhận thông báo từ hệ thống
              </Typography>
            </Box>
            <Switch
              checked={settings.enablePushNotifications}
              onChange={(e) => handleToggleNotifications(e.target.checked)}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" fontWeight="500">
                Đồng bộ tự động
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Đồng bộ dữ liệu khi có kết nối
              </Typography>
            </Box>
            <Switch
              checked={settings.autoSync}
              onChange={(e) =>
                onUpdateSettings &&
                onUpdateSettings({ ...settings, autoSync: e.target.checked })
              }
            />
          </Box>
        </Box>

        {settings.autoSync && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Tần suất đồng bộ:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {(['manual', 'hourly', 'daily'] as const).map((freq) => (
                <Button
                  key={freq}
                  variant={settings.syncFrequency === freq ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() =>
                    onUpdateSettings &&
                    onUpdateSettings({ ...settings, syncFrequency: freq })
                  }
                >
                  {freq === 'manual' ? 'Thủ công' : freq === 'hourly' ? 'Giờ' : 'Ngày'}
                </Button>
              ))}
            </Box>
          </Box>
        )}
      </Paper>

      {!status.isInstalled && (
        <Paper sx={{ p: 3, textAlign: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              fontSize: 24,
              mx: 'auto',
              mb: 2,
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            }}
          >
            <PhoneIphone />
          </Avatar>
          <Typography variant="h6" gutterBottom>
            Cài đặt ứng dụng
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Cài đặt ứng dụng PWA để truy cập nhanh và sử dụng offline
          </Typography>
          <Button variant="contained" startIcon={<Download />} onClick={handleInstall}>
            Cài đặt ngay
          </Button>
        </Paper>
      )}

      <Button
        variant="outlined"
        startIcon={<Settings />}
        onClick={() => {
          setDraftSettings(settings);
          setShowSettingsDialog(true);
        }}
      >
        Cài đặt PWA
      </Button>

      <Dialog
        open={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cài đặt PWA</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Alert severity="info" sx={{ fontSize: 12 }}>
              Các cài đặt này ảnh hưởng đến cách ứng dụng hoạt động trên thiết bị của bạn.
            </Alert>

            <FormControlLabel
              control={
                <Switch
                  checked={draftSettings.enableOffline}
                  onChange={(e) =>
                    setDraftSettings((prev) => ({ ...prev, enableOffline: e.target.checked }))
                  }
                />
              }
              label="Bật chế độ offline"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={draftSettings.enablePushNotifications}
                  onChange={(e) =>
                    setDraftSettings((prev) => ({ ...prev, enablePushNotifications: e.target.checked }))
                  }
                />
              }
              label="Bật push notifications"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={draftSettings.autoSync}
                  onChange={(e) =>
                    setDraftSettings((prev) => ({ ...prev, autoSync: e.target.checked }))
                  }
                />
              }
              label="Đồng bộ tự động"
            />

            {draftSettings.autoSync && (
              <TextField
                select
                label="Tần suất đồng bộ"
                fullWidth
                value={draftSettings.syncFrequency}
                onChange={(e) =>
                  setDraftSettings((prev) => ({
                    ...prev,
                    syncFrequency: e.target.value as PWASettings['syncFrequency'],
                  }))
                }
              >
                <MenuItem value="manual">Thủ công</MenuItem>
                <MenuItem value="hourly">Mỗi giờ</MenuItem>
                <MenuItem value="daily">Mỗi ngày</MenuItem>
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettingsDialog(false)}>Hủy</Button>
          <Button onClick={handleUpdateSettings} variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
