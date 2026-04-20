'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, TextField,
  Switch, FormControlLabel, Grid, Divider, CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import toast from 'react-hot-toast';
import { settingsRepo, GeneralSettings } from '@/repositories/settings.repo';

const defaultGeneral: GeneralSettings = {
  app_name: '',
  company_name: '',
  company_address: '',
  company_phone: '',
  company_email: '',
  max_file_size_mb: 5,
  allowed_file_types: 'pdf,png,jpg,jpeg,docx',
  task_deadline_warning_days: 3,
  auto_assign_enabled: false,
};

export default function SystemSettingsPage() {
  // ── General state ──
  const [general, setGeneral] = useState<GeneralSettings>(defaultGeneral);
  const [loadingGen, setLoadingGen] = useState(true);
  const [savingGen, setSavingGen] = useState(false);

  // ── Fetch general ──
  const fetchGeneral = useCallback(async () => {
    setLoadingGen(true);
    try {
      const data = await settingsRepo.getGeneral();
      setGeneral({ ...defaultGeneral, ...data });
    } catch {
      toast.error('Không thể tải cấu hình chung');
    } finally {
      setLoadingGen(false);
    }
  }, []);

  useEffect(() => { fetchGeneral(); }, [fetchGeneral]);

  // ── General handlers ──
  const setGen = (field: keyof GeneralSettings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setGeneral((prev) => ({ ...prev, [field]: val }));
  };

  const handleSaveGeneral = async () => {
    setSavingGen(true);
    try {
      await settingsRepo.updateGeneral(general);
      toast.success('Đã lưu cấu hình');
    } catch {
      toast.error('Lưu thất bại');
    } finally {
      setSavingGen(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Cấu hình hệ thống</Typography>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight={600}>Cài đặt chung</Typography>
          <Button
            variant="contained" startIcon={savingGen ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            onClick={handleSaveGeneral} disabled={savingGen || loadingGen}
          >
            Lưu thay đổi
          </Button>
        </Box>

        {loadingGen ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : (
          <>
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mb={2}>
              Thông tin ứng dụng
            </Typography>
            <Grid container spacing={2.5} mb={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Tên ứng dụng" fullWidth value={general.app_name} onChange={setGen('app_name')} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Tên công ty" fullWidth value={general.company_name} onChange={setGen('company_name')} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Địa chỉ công ty" fullWidth value={general.company_address} onChange={setGen('company_address')} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Số điện thoại" fullWidth value={general.company_phone} onChange={setGen('company_phone')} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Email công ty" type="email" fullWidth value={general.company_email} onChange={setGen('company_email')} />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mb={2}>
              Cài đặt hồ sơ
            </Typography>
            <Grid container spacing={2.5} mb={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Giới hạn file upload (MB)" type="number" fullWidth
                  value={general.max_file_size_mb} onChange={setGen('max_file_size_mb')}
                  slotProps={{ htmlInput: { min: 1, max: 100 } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Loại file cho phép" fullWidth
                  value={general.allowed_file_types} onChange={setGen('allowed_file_types')}
                  helperText="Cách nhau bởi dấu phẩy, VD: pdf,png,jpg,docx" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Cảnh báo deadline trước (ngày)" type="number" fullWidth
                  value={general.task_deadline_warning_days} onChange={setGen('task_deadline_warning_days')}
                  slotProps={{ htmlInput: { min: 0, max: 30 } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch checked={general.auto_assign_enabled}
                      onChange={(e) => setGeneral((prev) => ({ ...prev, auto_assign_enabled: e.target.checked }))} />
                  }
                  label="Tự động phân công hồ sơ"
                />
              </Grid>
            </Grid>
          </>
        )}
      </Paper>
    </Box>
  );
}
