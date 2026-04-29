'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Menu,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  CheckCircle,
  Cancel,
  Receipt,
  GetApp,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { budgetRepository } from '@/repositories/BudgetRepo';
import { Expense, ExpenseQueryParams, Budget } from '@/types/budget';
import ExpenseForm from '@/components/expense/ExpenseForm';

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [formDialog, setFormDialog] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);

  // Filters
  const [filters, setFilters] = useState<ExpenseQueryParams>({
    search: '',
    status: undefined,
    expense_type: undefined,
    start_date: '',
    end_date: '',
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      // Since we don't have a global expenses endpoint, we'll need to fetch from all budgets
      // For now, let's create a mock implementation
      setExpenses([]);
      setTotal(0);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách chi phí');
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await budgetRepository.getBudgets({ limit: 100 });
      setBudgets(response?.budgets || []);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setBudgets([]);
    }
  };

  useEffect(() => {
    fetchBudgets();
    fetchExpenses();
  }, [page, filters]);

  const handleFilterChange = (field: keyof ExpenseQueryParams, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
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
      } catch (err) {
        console.error('Error deleting expense:', err);
      }
    }
    handleMenuClose();
  };

  const handleOpenForm = (budgetId?: number) => {
    setSelectedBudgetId(budgetId || null);
    setFormDialog(true);
  };

  const handleCloseForm = () => {
    setFormDialog(false);
    setSelectedBudgetId(null);
  };

  const handleExpenseSubmit = () => {
    fetchExpenses();
    handleCloseForm();
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
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý Chi phí
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            startIcon={<GetApp />}
            variant="outlined"
          >
            Xuất Excel
          </Button>
          <Button
            startIcon={<Add />}
            onClick={() => handleOpenForm()}
            variant="contained"
          >
            Thêm chi phí
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm chi phí..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
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
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Loại chi phí</InputLabel>
                <Select
                  value={filters.expense_type || ''}
                  onChange={(e) => handleFilterChange('expense_type', e.target.value || undefined)}
                  label="Loại chi phí"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="actual">Thực tế</MenuItem>
                  <MenuItem value="committed">Cam kết</MenuItem>
                  <MenuItem value="forecast">Dự báo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                label="Từ ngày"
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                label="Đến ngày"
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 1 }}>
              <Tooltip title="Lọc nâng cao">
                <IconButton>
                  <FilterList />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
                <TableCell>Ngân sách</TableCell>
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
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box py={4}>
                      <Typography variant="body2" color="text.secondary">
                        Chưa có chi phí nào. Nhấn "Thêm chi phí" để bắt đầu.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
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
                      {expense.budget ? (
                        <Typography variant="body2">
                          {expense.budget.name}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          N/A
                        </Typography>
                      )}
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
                ))
              )}
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

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedExpense && router.push(`/expenses/${selectedExpense.id}`)}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleMenuClose}>
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

      {/* Expense Form Dialog */}
      <Dialog open={formDialog} onClose={handleCloseForm} maxWidth="lg" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          {selectedBudgetId ? (
            <ExpenseForm
              budgetId={selectedBudgetId}
              onSubmit={handleExpenseSubmit}
              onCancel={handleCloseForm}
            />
          ) : (
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Chọn ngân sách
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Vui lòng chọn ngân sách để thêm chi phí:
              </Typography>
              <Grid container spacing={2}>
                {budgets && budgets.length > 0 ? budgets.map((budget) => (
                  <Grid size={{ xs: 12, md: 6 }} key={budget.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => handleOpenForm(budget.id)}
                    >
                      <CardContent>
                        <Typography variant="body1" fontWeight="medium">
                          {budget.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatCurrency(budget.remaining_budget)} còn lại
                        </Typography>
                        <Chip
                          label={budget.status}
                          size="small"
                          color={budget.status === 'active' ? 'success' : 'default'}
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                )) : (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Không có ngân sách nào. Vui lòng tạo ngân sách trước.
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}