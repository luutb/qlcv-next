'use client';

import {
  Box, Typography, Paper, Switch, FormControlLabel,
  FormGroup, Divider, Button, Alert, Chip,
} from '@mui/material';
import { useState } from 'react';

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  in_app: boolean;
  digest: boolean;
  digest_frequency: 'instant' | 'hourly' | 'daily';
}

interface NotificationPreferencesProps {
  preferences: NotificationPreferences;
  onChange?: (preferences: NotificationPreferences) => Promise<void>;
}

export default function NotificationPreferences({
  preferences,
  onChange,
}: NotificationPreferencesProps) {
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof NotificationPreferences) => (value: boolean) => {
    const newPreferences = { ...localPreferences, [field]: value };
    setLocalPreferences(newPreferences);
    if (onChange) {
      setLoading(true);
      onChange(newPreferences).finally(() => setLoading(false));
    }
  };

  const handleFrequencyChange = (frequency: 'instant' | 'hourly' | 'daily') => {
    const newPreferences = { ...localPreferences, digest_frequency: frequency };
    setLocalPreferences(newPreferences);
    if (onChange) {
      setLoading(true);
      onChange(newPreferences).finally(() => setLoading(false));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Chip label="Cài đặt thông báo" size="small" color="primary" />
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Kênh thông báo
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={localPreferences.email}
                onChange={(e) => handleChange('email')(e.target.checked)}
                disabled={loading}
              />
            }
            label="Email"
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
            Nhận thông báo qua email
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={localPreferences.push}
                onChange={(e) => handleChange('push')(e.target.checked)}
                disabled={loading}
              />
            }
            label="Push (Web Push)"
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
            Nhận thông báo push trên trình duyệt
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={localPreferences.in_app}
                onChange={(e) => handleChange('in_app')(e.target.checked)}
                disabled={loading}
              />
            }
            label="Trong ứng dụng"
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
            Hiển thị thông báo trong ứng dụng
          </Typography>
        </FormGroup>
      </Paper>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Tóm tắt thông báo (Digest)
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Alert severity="info" sx={{ mb: 2, fontSize: 12 }}>
          Khi bật chế độ tóm tắt, bạn sẽ nhận được một email tổng hợp thay vì từng email riêng lẻ.
        </Alert>

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={localPreferences.digest}
                onChange={(e) => handleChange('digest')(e.target.checked)}
                disabled={loading}
              />
            }
            label="Bật chế độ tóm tắt"
          />
        </FormGroup>

        {localPreferences.digest && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Tần suất gửi tóm tắt:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              {(['instant', 'hourly', 'daily'] as const).map((freq) => (
                <Button
                  key={freq}
                  variant={localPreferences.digest_frequency === freq ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleFrequencyChange(freq)}
                  disabled={loading}
                >
                  {freq === 'instant' ? 'Tức thì' : freq === 'hourly' ? 'Giờ' : 'Ngày'}
                </Button>
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
