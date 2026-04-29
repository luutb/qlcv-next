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
  LinearProgress,
  Alert,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  GetApp,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { budgetRepository } from '@/repositories/BudgetRepo';
import { Budget, BudgetQueryParams } from '@/types/budget';

export default function BudgetListPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  // Filters
  const [filters, setFilters] = useState<BudgetQueryParams>({
    search: '',
    budget_type: undefined,
    status: undefined,
    fiscal_year: new Date().getFullYear(),
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page,
        limit,
      };
      const response = await budgetRepository.getBudgets(params);
      setBudgets(response.budgets);
      setTotal(response.total);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách ngân sách');
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [page, filters]);

  const handleFilterChange = (field: keyof BudgetQueryParams, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, budget: Budget) => {
    setAnchorEl(event.currentTarget);
    setSelectedBudget(budget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBudget(null);
  };

  const handleView = (budgetId: number) => {
    router.push(`/budgets/${budgetId}`);
    handleMenuClose();
  };

  const handleEdit = (budgetId: number) => {
    router.push(`/budgets/${budgetId}/edit`);
    handleMenuClose();
  };

  const handleDelete = async (budgetId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa ngân sách này?')) {
      try {
        await budgetRepository.deleteBudget(budgetId);
        fetchBudgets();
      } catch (err) {
        console.error('Error deleting budget:', err);
      }
    }
    handleMenuClose();
  };

  const getStatusColor = (status: Budget['status']) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'approved':
        return 'success';
      case 'active':
        return 'primary';
      case 'closed':
        return 'secondary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Budget['status']) => {
    switch (status) {
      case 'draft':
        return 'Nháp';
      case 'approved':
        return 'Đã duyệt';
      case 'active':
        return 'Đang hoạt động';
      case 'closed':
        return 'Đã đóng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getBudgetTypeLabel = (type: Budget['budget_type']) => {
    switch (type) {
      case 'project':
        return 'Dự án';
      case 'department':
        return 'Phòng ban';
      case 'task':
        return 'Nhiệm vụ';
      case 'contract':
        return 'Hợp đồng';
      default:
        return type;
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 70) return 'success';
    if (utilization < 90) return 'warning';
    return 'error';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const calculateUtilization = (budget: Budget) => {
    return budget.total_budget > 0 ? (budget.spent_amount / budget.total_budget) * 100 : 0;
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý Ngân sách
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push('/budgets/create')}
        >
          Tạo ngân sách mới
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm ngân sách..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Loại ngân sách</InputLabel>
                <Select
                  value={filters.budget_type || ''}
                  onChange={(e) => handleFilterChange('budget_type', e.target.value || undefined)}
                  label="Loại ngân sách"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="project">Dự án</MenuItem>
                  <MenuItem value="department">Phòng ban</MenuItem>
                  <MenuItem value="task">Nhiệm vụ</MenuItem>
                  <MenuItem value="contract">Hợp đồng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  label="Trạng thái"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="draft">Nháp</MenuItem>
                  <MenuItem value="approved">Đã duyệt</MenuItem>
                  <MenuItem value="active">Đang hoạt động</MenuItem>
                  <MenuItem value="closed">Đã đóng</MenuItem>
                  <MenuItem value="cancelled">Đã hủy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                type="number"
                label="Năm tài chính"
                value={filters.fiscal_year}
                onChange={(e) => handleFilterChange('fiscal_year', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={filters.sort_by}
                  onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                  label="Sắp xếp"
                >
                  <MenuItem value="created_at">Ngày tạo</MenuItem>
                  <MenuItem value="name">Tên</MenuItem>
                  <MenuItem value="total_budget">Tổng ngân sách</MenuItem>
                  <MenuItem value="spent_amount">Đã chi tiêu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Tooltip title="Xuất Excel">
                <IconButton>
                  <GetApp />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Budget Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên ngân sách</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Tổng ngân sách</TableCell>
                <TableCell>Đã chi tiêu</TableCell>
                <TableCell>Còn lại</TableCell>
                <TableCell>Tiến độ</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Năm tài chính</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budgets && budgets.length > 0 ? budgets.map((budget) => {
                const utilization = calculateUtilization(budget);
                return (
                  <TableRow key={budget.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {budget.name}
                        </Typography>
                        {budget.description && (
                          <Typography variant="caption" color="text.secondary">
                            {budget.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getBudgetTypeLabel(budget.budget_type)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(budget.total_budget)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="warning.main">
                        {formatCurrency(budget.spent_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main">
                        {formatCurrency(budget.remaining_budget)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(utilization, 100)}
                          color={getUtilizationColor(utilization)}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {utilization.toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(budget.status)}
                        size="small"
                        color={getStatusColor(budget.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {budget.fiscal_year}
                        {budget.quarter && ` - Q${budget.quarter}`}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={(e) => handleMenuClick(e, budget)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box py={4}>
                      <Typography variant="body2" color="text.secondary">
                        {loading ? 'Đang tải...' : 'Chưa có ngân sách nào'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
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
        <MenuItem onClick={() => selectedBudget && handleView(selectedBudget.id)}>
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem chi tiết</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedBudget && handleEdit(selectedBudget.id)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chỉnh sửa</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedBudget && handleDelete(selectedBudget.id)}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xóa</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}