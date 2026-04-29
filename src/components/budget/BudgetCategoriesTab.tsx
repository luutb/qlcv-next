'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  PieChart,
} from '@mui/icons-material';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { budgetRepository } from '@/repositories/BudgetRepo';
import { BudgetCategory, CreateBudgetCategoryRequest } from '@/types/budget';

interface BudgetCategoriesTabProps {
  budgetId: number;
  onRefresh: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function BudgetCategoriesTab({ budgetId, onRefresh }: BudgetCategoriesTabProps) {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateBudgetCategoryRequest>({
    category_name: '',
    category_type: 'operational',
    allocated_amount: 0,
    percentage: 0,
    description: '',
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await budgetRepository.getBudgetCategories(budgetId);
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách danh mục');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [budgetId]);

  const handleOpenDialog = (category?: BudgetCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        category_name: category.category_name,
        category_type: category.category_type,
        allocated_amount: category.allocated_amount,
        percentage: category.percentage,
        description: category.description,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        category_name: '',
        category_type: 'operational',
        allocated_amount: 0,
        percentage: 0,
        description: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (editingCategory) {
        await budgetRepository.updateBudgetCategory(editingCategory.id, formData);
      } else {
        await budgetRepository.createBudgetCategory(budgetId, formData);
      }
      fetchCategories();
      onRefresh();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving category:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        await budgetRepository.deleteBudgetCategory(categoryId);
        fetchCategories();
        onRefresh();
      } catch (err) {
        console.error('Error deleting category:', err);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getCategoryTypeLabel = (type: string) => {
    switch (type) {
      case 'operational':
        return 'Vận hành';
      case 'capital':
        return 'Đầu tư';
      case 'personnel':
        return 'Nhân sự';
      case 'marketing':
        return 'Marketing';
      case 'other':
        return 'Khác';
      default:
        return type;
    }
  };

  const getTotalAllocated = () => {
    return categories.reduce((sum, cat) => sum + cat.allocated_amount, 0);
  };

  const getTotalSpent = () => {
    return categories.reduce((sum, cat) => sum + cat.spent_amount, 0);
  };

  const getPieChartData = () => {
    return categories.map((category, index) => ({
      name: category.category_name,
      value: category.allocated_amount,
      color: COLORS[index % COLORS.length],
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Summary */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="primary">
                      {formatCurrency(getTotalAllocated())}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng phân bổ
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="warning.main">
                      {formatCurrency(getTotalSpent())}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đã chi tiêu
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(getTotalAllocated() - getTotalSpent())}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Còn lại
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Box textAlign="center">
                    <Typography variant="h6" color="info.main">
                      {categories.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Số danh mục
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Pie Chart */}
        {categories.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardHeader
                title="Biểu đồ phân bổ ngân sách"
                avatar={<PieChart />}
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={getPieChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getPieChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Categories Table */}
        <Grid size={{ xs: 12, md: categories.length > 0 ? 6 : 12 }}>
          <Card>
            <CardHeader
              title="Danh sách danh mục"
              action={
                <Button
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                  variant="contained"
                  size="small"
                >
                  Thêm danh mục
                </Button>
              }
            />
            <CardContent sx={{ p: 0 }}>
              {categories.length === 0 ? (
                <Box p={3} textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Chưa có danh mục nào. Nhấn "Thêm danh mục" để bắt đầu.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Tên danh mục</TableCell>
                        <TableCell>Loại</TableCell>
                        <TableCell align="right">Phân bổ</TableCell>
                        <TableCell align="right">Đã chi</TableCell>
                        <TableCell align="right">Còn lại</TableCell>
                        <TableCell align="center">Tiến độ</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categories.map((category) => {
                        const utilization = category.allocated_amount > 0 
                          ? (category.spent_amount / category.allocated_amount) * 100 
                          : 0;
                        
                        return (
                          <TableRow key={category.id} hover>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {category.category_name}
                                </Typography>
                                {category.description && (
                                  <Typography variant="caption" color="text.secondary">
                                    {category.description}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              {getCategoryTypeLabel(category.category_type)}
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight="medium">
                                {formatCurrency(category.allocated_amount)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ({category.percentage.toFixed(1)}%)
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="warning.main">
                                {formatCurrency(category.spent_amount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="success.main">
                                {formatCurrency(category.remaining_amount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(utilization, 100)}
                                  color={utilization > 90 ? 'error' : utilization > 70 ? 'warning' : 'success'}
                                  sx={{ width: 60, height: 6, borderRadius: 3 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {utilization.toFixed(0)}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Chỉnh sửa">
                                <IconButton
                                  onClick={() => handleOpenDialog(category)}
                                  size="small"
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Xóa">
                                <IconButton
                                  onClick={() => handleDelete(category.id)}
                                  size="small"
                                  color="error"
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Tên danh mục *"
                value={formData.category_name}
                onChange={(e) => setFormData(prev => ({ ...prev, category_name: e.target.value }))}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Loại danh mục</InputLabel>
                <Select
                  value={formData.category_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_type: e.target.value }))}
                  label="Loại danh mục"
                >
                  <MenuItem value="operational">Vận hành</MenuItem>
                  <MenuItem value="capital">Đầu tư</MenuItem>
                  <MenuItem value="personnel">Nhân sự</MenuItem>
                  <MenuItem value="marketing">Marketing</MenuItem>
                  <MenuItem value="other">Khác</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Số tiền phân bổ *"
                type="number"
                value={formData.allocated_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, allocated_amount: parseFloat(e.target.value) || 0 }))}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Tỷ lệ (%)"
                type="number"
                value={formData.percentage}
                onChange={(e) => setFormData(prev => ({ ...prev, percentage: parseFloat(e.target.value) || 0 }))}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !formData.category_name || formData.allocated_amount <= 0}
            variant="contained"
          >
            {submitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}