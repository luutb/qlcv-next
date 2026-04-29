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
  Chip,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Pagination,
  Avatar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Cancel,
  MoreVert,
  Receipt,
  AttachFile,
  GetApp,
} from '@mui/icons-material';
import { budgetRepository } from '@/repositories/BudgetRepo';
import { Expense, ExpenseQueryParams, BudgetCategory } from '@/types/budget';

interface BudgetExpensesTabProps {
  budgetId: number;
  onRefresh: () => void;
}

export default function BudgetExpensesTab({ budgetId, onRefresh }: BudgetExpensesTabProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const [filters, setFilters] = useState<ExpenseQueryParams>({
    status: undefined,
    expense_type: undefined,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: 0,
    currency: 'VND',
    expense_date: '',
    vendor_name: '',
    category_id: undefined as number | undefined,
    expense_type: 'actual' as Expense['expense_type'],
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = { ...filters, page, limit };
      const response = await budgetRepository.getBudgetExpenses(budgetId, params);
      setExpenses(response.expenses);
      setTotal(response.total);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách chi phí');
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await budgetRepository.getBudgetCategories(budgetId);
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [budgetId, page, filters]);

  useEffect(() => {
    fetchCategories();
  }, [budgetId]);

  const handleOpenDialog = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        title: expense.title,
        description: expense.description,
        amount: expense.amount,
        currency: expense.currency,
        expense_date: expense.expense_date.split('T')[0],
        vendor_name: expense.vendor_name,
        category_id: expense.category_id,
        expense_type: expense.expense_type,
      });
    } else {
      setEditingExpense(null);
      setFormData({
        title: '',
        description: '',
        amount: 0,
        currency: 'VND',
        expense_date: new Date().toISOString().split('T')[0],
        vendor_name: '',
        category_id: undefined,
        expense_type: 'actual',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingExpense(null);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (editingExpense) {
        await budgetRepository.updateExpense(editingExpense.id, formData);
      } else {
        await budgetRepository.createExpense(budgetId, formData);
      }
      fetchExpenses();
      onRefresh();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving expense:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, expense: Expense) => {
    setAnchorEl(event.currentTarget);
    setSelectedExpense(expense);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedExpense(null);
  };

  const handleApprove = async (expenseId: number) => {
    try {
      await budgetRepository.approveExpense(expenseId);
      fetchExpenses();
      onRefresh();
    } catch (err) {
      console.error('Error approving expense:', err);
    }
    handleMenuClose();
  };

  const handleReject = async (expenseId: number) => {
    const reason = prompt('Lý do từ chối:');
    if (reason) {
      try {
        await budgetRepository.rejectExpense(expenseId, reason);
        fetchExpenses();
        onRefresh();
      } catch (err) {
        console.error('Error rejecting expense:', err);
      }
    }
    handleMenuClose();
  };

  const handleDelete = async (expenseId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa chi phí này?')) {
      try {
        await budgetRepository.deleteExpense(expenseId);
        fetchExpenses();
        onRefresh();
      } catch (err) {
        console.error('Error deleting expense:', err);
      }
    }
    handleMenuClose();
  };

  const getStatusColor = (status: Expense['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'paid':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Expense['status']) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      case 'paid':
        return 'Đã thanh toán';
      default:
        return status;
    }
  };

  const getExpenseTypeLabel = (type: Expense['expense_type']) => {
    switch (type) {
      case 'actual':
        return 'Thực tế';
      case 'committed':
        return 'Cam kết';
      case 'forecast':
        return 'Dự báo';
      default:
        return type;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Box>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
                  label="Trạng thái"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="pending">Chờ duyệt</MenuItem>
                  <MenuItem value="approved">Đã duyệt</MenuItem>
                  <MenuItem value="rejected">Từ chối</MenuItem>
                  <MenuItem value="paid">Đã thanh toán</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Loại chi phí</InputLabel>
                <Select
                  value={filters.expense_type || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, expense_type: e.target.value || undefined }))}
                  label="Loại chi phí"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="actual">Thực tế</MenuItem>
                  <MenuItem value="committed">Cam kết</MenuItem>
                  <MenuItem value="forecast">Dự báo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={filters.sort_by}
                  onChange={(e) => setFilters(prev => ({ ...prev, sort_by: e.target.value }))}
                  label="Sắp xếp"
                >
                  <MenuItem value="created_at">Ngày tạo</MenuItem>
                  <MenuItem value="expense_date">Ngày chi phí</MenuItem>
                  <MenuItem value="amount">Số tiền</MenuItem>
                  <MenuItem value="title">Tiêu đề</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                variant="contained"
              >
                Thêm chi phí
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', mb: 2 }} />}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Expenses Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Chi phí</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell>Số tiền</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Ngày chi phí</TableCell>
                <TableCell>Nhà cung cấp</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {expense.title}
                      </Typography>
                      {expense.description && (
                        <Typography variant="caption" color="text.secondary">
                          {expense.description}
                        </Typography>
                      )}
                      {expense.receipt_url && (
                        <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                          <Receipt fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            Có hóa đơn
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {expense.category ? (
                      <Chip
                        label={expense.category.category_name}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Chưa phân loại
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(expense.amount)}
                    </Typography>
                    {expense.currency !== 'VND' && (
                      <Typography variant="caption" color="text.secondary">
                        ({expense.currency})
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getExpenseTypeLabel(expense.expense_type)}
                      size="small"
                      color={expense.expense_type === 'actual' ? 'primary' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(expense.expense_date)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {expense.vendor_name || 'Không có'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(expense.status)}
                      size="small"
                      color={getStatusColor(expense.status)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={(e) => handleMenuClick(e, expense)}
                      size="small"
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {total > limit && (
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination
              count={Math.ceil(total / limit)}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingExpense ? 'Chỉnh sửa chi phí' : 'Thêm chi phí mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Tiêu đề *"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value ? Number(e.target.value) : undefined }))}
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
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Số tiền *"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Tiền tệ</InputLabel>
                <Select
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, expense_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Loại chi phí</InputLabel>
                <Select
                  value={formData.expense_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, expense_type: e.target.value as Expense['expense_type'] }))}
                  label="Loại chi phí"
                >
                  <MenuItem value="actual">Thực tế</MenuItem>
                  <MenuItem value="committed">Cam kết</MenuItem>
                  <MenuItem value="forecast">Dự báo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nhà cung cấp"
                value={formData.vendor_name}
                onChange={(e) => setFormData(prev => ({ ...prev, vendor_name: e.target.value }))}
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
            disabled={submitting || !formData.title || formData.amount <= 0}
            variant="contained"
          >
            {submitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedExpense && handleOpenDialog(selectedExpense)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        
        {selectedExpense?.status === 'pending' && (
          <>
            <MenuItem onClick={() => selectedExpense && handleApprove(selectedExpense.id)}>
              <ListItemIcon>
                <CheckCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>Phê duyệt</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => selectedExpense && handleReject(selectedExpense.id)}>
              <ListItemIcon>
                <Cancel fontSize="small" />
              </ListItemIcon>
              <ListItemText>Từ chối</ListItemText>
            </MenuItem>
          </>
        )}
        
        <MenuItem onClick={() => selectedExpense && handleDelete(selectedExpense.id)}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xóa</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}