'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { caseService } from '@/services';
import { UpdateCaseRequest, CaseResponse, CaseStatus } from '@/types/case.types';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function EditCasePage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<CaseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<UpdateCaseRequest>({
    title: '',
    client_name: '',
    status: 'open',
  });

  // Validation state
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateCaseRequest, string>>>({});

  useEffect(() => {
    if (caseId) {
      loadCaseData();
    }
  }, [caseId]);

  const loadCaseData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await caseService.getCase(caseId);
      setCaseData(data);

      // Pre-fill form
      setFormData({
        title: data.title,
        client_name: data.client_name,
        status: data.status,
      });
    } catch (err: any) {
      console.error('Failed to load case:', err);
      const errorMessage = err.response?.data?.message || 'Không thể tải thông tin hồ sơ';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateCaseRequest, string>> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Tên hồ sơ là bắt buộc';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Tên hồ sơ phải có ít nhất 3 ký tự';
    }

    if (!formData.client_name?.trim()) {
      newErrors.client_name = 'Tên khách hàng là bắt buộc';
    } else if (formData.client_name.trim().length < 2) {
      newErrors.client_name = 'Tên khách hàng phải có ít nhất 2 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UpdateCaseRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updateData: UpdateCaseRequest = {
        title: formData.title?.trim(),
        client_name: formData.client_name?.trim(),
        status: formData.status,
      };

      await caseService.updateCase(caseId, updateData);

      // Show success message and redirect
      alert('Cập nhật hồ sơ thành công!');
      router.push(`/cases/${caseId}`);
    } catch (err: any) {
      console.error('Failed to update case:', err);
      const errorMessage = err.response?.data?.message || 'Không thể cập nhật hồ sơ. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Check if form has changes
    const hasChanges =
      (formData.title !== caseData?.title) ||
      (formData.client_name !== caseData?.client_name) ||
      (formData.status !== caseData?.status);

    if (hasChanges) {
      if (!confirm('Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu.')) {
        return;
      }
    }
    router.push(`/cases/${caseId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !caseData) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Không tìm thấy hồ sơ'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push(`/cases/${caseId}`)}
          sx={{ mt: 2 }}
        >
          Quay lại chi tiết
        </Button>
      </Container>
    );
  }

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Quản lý Hồ sơ', href: '/cases' },
    { label: caseData.case_code, href: `/cases/${caseId}` },
    { label: 'Chỉnh sửa' },
  ];

  return (
    <Container maxWidth="md">
      <Breadcrumbs items={breadcrumbItems} />

      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          sx={{ mb: 2 }}
        >
          Quay lại
        </Button>
        <Typography variant="h4" component="h1">
          Chỉnh sửa Hồ sơ
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {caseData.case_code}
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Mã hồ sơ"
                value={caseData.case_code}
                disabled
                helperText="Mã hồ sơ không thể thay đổi"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Tên hồ sơ *"
                value={formData.title}
                onChange={handleInputChange('title')}
                error={!!errors.title}
                helperText={errors.title || 'Tên mô tả ngắn gọn về vụ việc'}
                required
                disabled={saving}
                autoFocus
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Tên khách hàng *"
                value={formData.client_name}
                onChange={handleInputChange('client_name')}
                error={!!errors.client_name}
                helperText={errors.client_name || 'Tên cá nhân hoặc tổ chức cần tư vấn pháp lý'}
                required
                disabled={saving}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                select
                label="Trạng thái *"
                value={formData.status}
                onChange={handleInputChange('status')}
                required
                disabled={saving}
                helperText="Chọn trạng thái hiện tại của hồ sơ"
              >
                <MenuItem value="open">Mới</MenuItem>
                <MenuItem value="in_progress">Đang xử lý</MenuItem>
                <MenuItem value="closed">Đã đóng</MenuItem>
              </TextField>
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Info Box */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'info.50' }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Lưu ý:</strong> Khi đóng hồ sơ, bạn sẽ không thể tạo mới công việc cho hồ sơ này.
        </Typography>
      </Paper>
    </Container>
  );
}