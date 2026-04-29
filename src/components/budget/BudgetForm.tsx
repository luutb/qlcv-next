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
  Stepper,
  Step,
  StepLabel,
  Alert,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Add,
  Delete,
  Save,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { budgetRepository } from '@/repositories/BudgetRepo';
import { Budget, BudgetFormData, CreateBudgetCategoryRequest } from '@/types/budget';

interface BudgetFormProps {
  budget?: Budget;
  onSubmit?: (budget: Budget) => void;
}

const steps = ['Thông tin cơ bản', 'Danh mục chi tiêu', 'Xem lại & Lưu'];

export default function BudgetForm({ budget, onSubmit }: BudgetFormProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<BudgetFormData>({
    name: budget?.name || '',
    description: budget?.description || '',
    budget_type: budget?.budget_type || 'project',
    total_budget: budget?.total_budget || 0,
    currency: budget?.currency || 'VND',
    start_date: budget?.start_date ? budget.start_date.split('T')[0] : '',
    end_date: budget?.end_date ? budget.end_date.split('T')[0] : '',
    fiscal_year: budget?.fiscal_year || new Date().getFullYear(),
    quarter: budget?.quarter,
    department_id: budget?.department_id,
    reference_id: budget?.reference_id,
    reference_name: budget?.reference_name || '',
    categories: budget?.categories?.map(cat => ({
      category_name: cat.category_name,
      category_type: cat.category_type,
      allocated_amount: cat.allocated_amount,
      percentage: cat.percentage,
      description: cat.description,
    })) || [],
  });

  const handleInputChange = (field: keyof BudgetFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddCategory = () => {
    const newCategory: CreateBudgetCategoryRequest = {
      category_name: '',
      category_type: 'operational',
      allocated_amount: 0,
      percentage: 0,
      description: '',
    };
    setFormData(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
  };

  const handleCategoryChange = (index: number, field: keyof CreateBudgetCategoryRequest, value: any) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[index] = { ...updatedCategories[index], [field]: value };
    
    // Auto-calculate percentage
    if (field === 'allocated_amount') {
      const percentage = formData.total_budget > 0 ? (value / formData.total_budget) * 100 : 0;
      updatedCategories[index].percentage = percentage;
    }
    
    setFormData(prev => ({ ...prev, categories: updatedCategories }));
  };

  const handleRemoveCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 0:
        return formData.name && formData.total_budget > 0 && formData.start_date && formData.end_date;
      case 1:
        const totalAllocated = formData.categories.reduce((sum, cat) => sum + cat.allocated_amount, 0);
        return totalAllocated <= formData.total_budget;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const submitData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };

      let result: Budget;
      if (budget) {
        result = await budgetRepository.updateBudget(budget.id, submitData);
      } else {
        result = await budgetRepository.createBudget(submitData);
      }

      onSubmit?.(result);
      router.push(`/budgets/${result.id}`);
    } catch (err) {
      setError('Có lỗi xảy ra khi lưu ngân sách');
      console.error('Error saving budget:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalAllocated = () => {
    return formData.categories.reduce((sum, cat) => sum + cat.allocated_amount, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          {budget ? 'Chỉnh sửa ngân sách' : 'Tạo ngân sách mới'}
        </Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
        >
          Quay lại
        </Button>
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Step Content */}
      <Card>
        <CardContent>
          {/* Step 1: Basic Information */}
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Thông tin cơ bản
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Tên ngân sách *"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Loại ngân sách</InputLabel>
                    <Select
                      value={formData.budget_type}
                      onChange={(e) => handleInputChange('budget_type', e.target.value)}
                      label="Loại ngân sách"
                    >
                      <MenuItem value="project">Dự án</MenuItem>
                      <MenuItem value="department">Phòng ban</MenuItem>
                      <MenuItem value="task">Nhiệm vụ</MenuItem>
                      <MenuItem value="contract">Hợp đồng</MenuItem>
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
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Tổng ngân sách *"
                    type="number"
                    value={formData.total_budget}
                    onChange={(e) => handleInputChange('total_budget', parseFloat(e.target.value) || 0)}
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
                    label="Ngày bắt đầu *"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Ngày kết thúc *"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Năm tài chính"
                    type="number"
                    value={formData.fiscal_year}
                    onChange={(e) => handleInputChange('fiscal_year', parseInt(e.target.value))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Quý"
                    type="number"
                    inputProps={{ min: 1, max: 4 }}
                    value={formData.quarter || ''}
                    onChange={(e) => handleInputChange('quarter', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 2: Categories */}
          {activeStep === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                  Danh mục chi tiêu
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={handleAddCategory}
                  variant="outlined"
                >
                  Thêm danh mục
                </Button>
              </Box>

              <Box mb={3}>
                <Typography variant="body2" color="text.secondary">
                  Tổng ngân sách: {formatCurrency(formData.total_budget)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đã phân bổ: {formatCurrency(getTotalAllocated())}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Còn lại: {formatCurrency(formData.total_budget - getTotalAllocated())}
                </Typography>
              </Box>

              {formData.categories.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tên danh mục</TableCell>
                        <TableCell>Loại</TableCell>
                        <TableCell>Số tiền phân bổ</TableCell>
                        <TableCell>Tỷ lệ (%)</TableCell>
                        <TableCell>Mô tả</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.categories.map((category, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <TextField
                              size="small"
                              value={category.category_name}
                              onChange={(e) => handleCategoryChange(index, 'category_name', e.target.value)}
                              placeholder="Tên danh mục"
                            />
                          </TableCell>
                          <TableCell>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={category.category_type}
                                onChange={(e) => handleCategoryChange(index, 'category_type', e.target.value)}
                              >
                                <MenuItem value="operational">Vận hành</MenuItem>
                                <MenuItem value="capital">Đầu tư</MenuItem>
                                <MenuItem value="personnel">Nhân sự</MenuItem>
                                <MenuItem value="marketing">Marketing</MenuItem>
                                <MenuItem value="other">Khác</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={category.allocated_amount}
                              onChange={(e) => handleCategoryChange(index, 'allocated_amount', parseFloat(e.target.value) || 0)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {category.percentage.toFixed(1)}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={category.description}
                              onChange={(e) => handleCategoryChange(index, 'description', e.target.value)}
                              placeholder="Mô tả"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              onClick={() => handleRemoveCategory(index)}
                              color="error"
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  Chưa có danh mục nào. Nhấn "Thêm danh mục" để bắt đầu.
                </Alert>
              )}
            </Box>
          )}

          {/* Step 3: Review */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Xem lại thông tin
              </Typography>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined">
                    <CardHeader title="Thông tin cơ bản" />
                    <CardContent>
                      <Typography variant="body2" gutterBottom>
                        <strong>Tên:</strong> {formData.name}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Loại:</strong> {formData.budget_type}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Tổng ngân sách:</strong> {formatCurrency(formData.total_budget)}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Thời gian:</strong> {formData.start_date} - {formData.end_date}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Năm tài chính:</strong> {formData.fiscal_year}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined">
                    <CardHeader title="Danh mục chi tiêu" />
                    <CardContent>
                      {formData.categories.map((category, index) => (
                        <Box key={index} mb={1}>
                          <Typography variant="body2">
                            <strong>{category.category_name}:</strong> {formatCurrency(category.allocated_amount)} ({category.percentage.toFixed(1)}%)
                          </Typography>
                        </Box>
                      ))}
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2">
                        <strong>Tổng phân bổ:</strong> {formatCurrency(getTotalAllocated())}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>

        {/* Navigation Buttons */}
        <Box display="flex" justifyContent="space-between" p={3}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Quay lại
          </Button>
          
          <Box>
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!validateStep(activeStep)}
                endIcon={<ArrowForward />}
              >
                Tiếp theo
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                startIcon={<Save />}
              >
                {loading ? 'Đang lưu...' : 'Lưu ngân sách'}
              </Button>
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  );
}