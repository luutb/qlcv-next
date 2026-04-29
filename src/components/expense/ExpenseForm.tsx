'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Divider,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Save,
  Cancel,
  AttachFile,
  Delete,
  CloudUpload,
} from '@mui/icons-material';
import { budgetRepository } from '@/repositories/BudgetRepo';
import { Expense, ExpenseFormData, BudgetCategory } from '@/types/budget';

interface ExpenseFormProps {
  budgetId: number;
  expense?: Expense;
  onSubmit?: (expense: Expense) => void;
  onCancel?: () => void;
}

export default function ExpenseForm({ budgetId, expense, onSubmit, onCancel }: ExpenseFormProps) {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ExpenseFormData>({
    title: expense?.title || '',
    description: expense?.description || '',
    amount: expense?.amount || 0,
    currency: expense?.currency || 'VND',
    expense_date: expense?.expense_date ? expense.expense_date.split('T')[0] : new Date().toISOString().split('T')[0],
    vendor_name: expense?.vendor_name || '',
    category_id: expense?.category_id || null,
    expense_type: expense?.expense_type || 'actual',
    task_id: expense?.task_id,
    contract_id: expense?.contract_id,
    attachments: [],
  });

  const fetchCategories = async () => {
    try {
      const data = await budgetRepository.getBudgetCategories(budgetId);
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [budgetId]);

  const handleInputChange = (field: keyof ExpenseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...files] }));
  };

  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const submitData = {
        title: formData.title,
        description: formData.description,
        amount: formData.amount,
        currency: formData.currency,
        expense_date: formData.expense_date,
        vendor_name: formData.vendor_name,
        category_id: formData.category_id || undefined,
        expense_type: formData.expense_type,
        task_id: formData.task_id,
        contract_id: formData.contract_id,
      };

      let result: Expense;
      if (expense) {
        result = await budgetRepository.updateExpense(expense.id, submitData);
      } else {
        result = await budgetRepository.createExpense(budgetId, submitData);
      }

      // Upload attachments if any
      if (formData.attachments.length > 0) {
        for (const file of formData.attachments) {
          await budgetRepository.uploadExpenseAttachment(result.id, file);
        }
      }

      onSubmit?.(result);
    } catch (err) {
      setError('Có lỗi xảy ra khi lưu chi phí');
      console.error('Error saving expense:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader
        title={expense ? 'Chỉnh sửa chi phí' : 'Thêm chi phí mới'}
        action={
          <Box display="flex" gap={1}>
            <Button
              startIcon={<Cancel />}
              onClick={onCancel}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              startIcon={<Save />}
              onClick={handleSubmit}
              disabled={loading || !formData.title || formData.amount <= 0}
              variant="contained"
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </Box>
        }
      />
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin cơ bản
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              label="Tiêu đề chi phí *"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={formData.category_id || ''}
                onChange={(e) => handleInputChange('category_id', e.target.value ? Number(e.target.value) : null)}
                label="Danh mục"
              >
                <MenuItem value="">Không phân loại</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.category_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Mô tả"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </Grid>

          {/* Financial Information */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Thông tin tài chính
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Số tiền *"
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Tiền tệ</InputLabel>
              <Select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                label="Tiền tệ"
              >
                <MenuItem value="VND">VND</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Ngày chi phí *"
              type="date"
              value={formData.expense_date}
              onChange={(e) => handleInputChange('expense_date', e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Loại chi phí</InputLabel>
              <Select
                value={formData.expense_type}
                onChange={(e) => handleInputChange('expense_type', e.target.value)}
                label="Loại chi phí"
              >
                <MenuItem value="actual">Thực tế</MenuItem>
                <MenuItem value="committed">Cam kết</MenuItem>
                <MenuItem value="forecast">Dự báo</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Vendor Information */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Thông tin nhà cung cấp
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Tên nhà cung cấp"
              value={formData.vendor_name}
              onChange={(e) => handleInputChange('vendor_name', e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="ID Task liên quan"
              type="number"
              value={formData.task_id || ''}
              onChange={(e) => handleInputChange('task_id', e.target.value ? Number(e.target.value) : undefined)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="ID Contract liên quan"
              type="number"
              value={formData.contract_id || ''}
              onChange={(e) => handleInputChange('contract_id', e.target.value ? Number(e.target.value) : undefined)}
            />
          </Grid>

          {/* File Attachments */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              File đính kèm
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
              component="label"
            >
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                Nhấn để chọn file hoặc kéo thả file vào đây
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hỗ trợ: JPG, PNG, PDF, DOC, XLS (tối đa 10MB mỗi file)
              </Typography>
            </Box>
          </Grid>

          {formData.attachments.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                File đã chọn:
              </Typography>
              <List dense>
                {formData.attachments.map((file, index) => (
                  <ListItem key={index} divider>
                    <ListItemIcon>
                      <AttachFile />
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={formatFileSize(file.size)}
                    />
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveFile(index)}
                      size="small"
                      color="error"
                      sx={{ ml: 'auto' }}
                    >
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            </Grid>
          )}

          {/* Summary */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tóm tắt chi phí
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tiêu đề:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {formData.title || 'Chưa nhập'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Số tiền:
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" color="primary">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: formData.currency,
                      }).format(formData.amount)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Loại chi phí:
                    </Typography>
                    <Chip
                      label={
                        formData.expense_type === 'actual' ? 'Thực tế' :
                        formData.expense_type === 'committed' ? 'Cam kết' : 'Dự báo'
                      }
                      size="small"
                      color={formData.expense_type === 'actual' ? 'primary' : 'default'}
                    />
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Ngày chi phí:
                    </Typography>
                    <Typography variant="body1">
                      {formData.expense_date ? new Date(formData.expense_date).toLocaleDateString('vi-VN') : 'Chưa chọn'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}