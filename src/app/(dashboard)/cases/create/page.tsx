'use client';

import React, { useState } from 'react';
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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { caseService } from '@/services';
import { CreateCaseRequest } from '@/types/case.types';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export default function CreateCasePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateCaseRequest>({
    title: '',
    client_name: '',
    case_code: '',
  });

  // Validation state
  const [errors, setErrors] = useState<Partial<Record<keyof CreateCaseRequest, string>>>({});

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/' },
    { label: 'Quản lý Hồ sơ', href: '/cases' },
    { label: 'Tạo hồ sơ mới' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateCaseRequest, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tên hồ sơ là bắt buộc';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Tên hồ sơ phải có ít nhất 3 ký tự';
    }

    if (!formData.client_name.trim()) {
      newErrors.client_name = 'Tên khách hàng là bắt buộc';
    } else if (formData.client_name.trim().length < 2) {
      newErrors.client_name = 'Tên khách hàng phải có ít nhất 2 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateCaseRequest) => (
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
      setLoading(true);
      setError(null);

      // Remove case_code if empty (let backend generate it)
      const submitData: CreateCaseRequest = {
        title: formData.title.trim(),
        client_name: formData.client_name.trim(),
      };

      const caseCode = formData.case_code?.trim();
      if (caseCode) {
        submitData.case_code = caseCode;
      }

      const newCase = await caseService.createCase(submitData);

      // Show success message and redirect
      alert('Tạo hồ sơ thành công!');
      router.push(`/cases/${newCase.id}`);
    } catch (err: any) {
      console.error('Failed to create case:', err);
      const errorMessage = err.response?.data?.message || 'Không thể tạo hồ sơ. Vui lòng thử lại.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.title || formData.client_name) {
      if (!confirm('Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu.')) {
        return;
      }
    }
    router.push('/cases');
  };

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
          Tạo Hồ sơ Mới
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
                placeholder="Để trống nếu muốn tự động tạo"
                value={formData.case_code}
                onChange={handleInputChange('case_code')}
                helperText="Nếu để trống, hệ thống sẽ tự động tạo mã hồ sơ (ví dụ: CASE-2026-0001)"
                disabled={loading}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Tên hồ sơ *"
                placeholder="Nhập tên hồ sơ pháp lý"
                value={formData.title}
                onChange={handleInputChange('title')}
                error={!!errors.title}
                helperText={errors.title || 'Tên mô tả ngắn gọn về vụ việc'}
                required
                disabled={loading}
                autoFocus
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Tên khách hàng *"
                placeholder="Nhập tên khách hàng hoặc công ty"
                value={formData.client_name}
                onChange={handleInputChange('client_name')}
                error={!!errors.client_name}
                helperText={errors.client_name || 'Tên cá nhân hoặc tổ chức cần tư vấn pháp lý'}
                required
                disabled={loading}
              />
            </Grid>

            <Grid size={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Đang lưu...' : 'Lưu hồ sơ'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
