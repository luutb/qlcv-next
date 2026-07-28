'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  MenuItem,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { CreateCaseTaskRequest, CaseMember } from '@/types/case.types';
import UserSelect from '@/components/users/UserSelect';

interface CreateTaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCaseTaskRequest) => Promise<void>;
  caseId: string;
  caseMembers: CaseMember[];
}

interface FormData {
  title: string;
  description: string;
  assignee_id: string;
  due_date: string;
}

interface FormErrors {
  title?: string;
  assignee_id?: string;
}

export default function CreateTaskForm({
  open,
  onClose,
  onSubmit,
  caseId,
  caseMembers,
}: CreateTaskFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    assignee_id: '',
    due_date: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tên công việc là bắt buộc';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Tên công việc phải có ít nhất 3 ký tự';
    }

    if (!formData.assignee_id) {
      newErrors.assignee_id = 'Vui lòng chọn người thực hiện';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData: CreateCaseTaskRequest = {
        case_id: caseId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        assignee_id: parseInt(formData.assignee_id),
        due_date: formData.due_date || undefined,
      };

      await onSubmit(submitData);

      // Reset form and close
      setFormData({
        title: '',
        description: '',
        assignee_id: '',
        due_date: '',
      });
      setErrors({});
      onClose();
    } catch (err: any) {
      console.error('Failed to create task:', err);
      const errorMessage = err.response?.data?.message || 'Không thể tạo công việc';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.title || formData.description || formData.assignee_id) {
      if (!confirm('Bạn có chắc chắn muốn hủy? Các thông tin đã nhập sẽ bị mất.')) {
        return;
      }
    }
    setFormData({
      title: '',
      description: '',
      assignee_id: '',
      due_date: '',
    });
    setErrors({});
    setError(null);
    onClose();
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Dialog
      open={open}
      onClose={() => !loading && handleCancel()}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>Tạo công việc mới</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Tên công việc *"
              placeholder="Nhập tên công việc"
              value={formData.title}
              onChange={handleInputChange('title')}
              error={!!errors.title}
              helperText={errors.title || 'Mô tả ngắn gọn về công việc cần làm'}
              required
              disabled={loading}
              autoFocus
              multiline
              rows={2}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              label="Mô tả chi tiết"
              placeholder="Nhập mô tả chi tiết về công việc (tùy chọn)"
              value={formData.description}
              onChange={handleInputChange('description')}
              disabled={loading}
              multiline
              rows={4}
              helperText="Cung cấp thêm thông tin chi tiết về công việc"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <UserSelect
              value={formData.assignee_id}
              onChange={(value) => setFormData({ ...formData, assignee_id: value })}
              label="Người thực hiện *"
              error={!!errors.assignee_id}
              helperText={errors.assignee_id}
              excludeUserIds={[]}
              disabled={loading}
              fullWidth
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Chỉ có thể chọn từ thành viên của hồ sơ này
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="Hạn chót"
              value={formData.due_date}
              onChange={handleInputChange('due_date')}
              disabled={loading}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: getMinDate(),
              }}
              helperText="Ngày hoàn thành dự kiến (tùy chọn)"
            />
          </Grid>
        </Grid>

        {/* Info Box */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Thông tin:</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
            • Người thực hiện sẽ được thông báo về công việc mới<br />
            • Bạn có thể cập nhật trạng thái và thông tin sau khi tạo<br />
            • Đặt hạn chót giúp theo dõi tiến độ tốt hơn
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCancel}
          disabled={loading}
          startIcon={<CancelIcon />}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {loading ? 'Đang tạo...' : 'Tạo công việc'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
