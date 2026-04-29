'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Delete,
  GetApp,
  Refresh,
  ArrowBack,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { budgetRepository } from '@/repositories/BudgetRepo';
import { Budget } from '@/types/budget';
import BudgetInfoTab from '@/components/budget/BudgetInfoTab';
import BudgetCategoriesTab from '@/components/budget/BudgetCategoriesTab';
import BudgetExpensesTab from '@/components/budget/BudgetExpensesTab';
import BudgetForecastsTab from '@/components/budget/BudgetForecastsTab';
import BudgetAlertsTab from '@/components/budget/BudgetAlertsTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`budget-tabpanel-${index}`}
      aria-labelledby={`budget-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function BudgetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const budgetId = parseInt(params.id as string);

  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      const data = await budgetRepository.getBudget(budgetId);
      setBudget(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải thông tin ngân sách');
      console.error('Error fetching budget:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (budgetId) {
      fetchBudget();
    }
  }, [budgetId, refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEdit = () => {
    router.push(`/budgets/${budgetId}/edit`);
  };

  const handleDelete = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa ngân sách này?')) {
      try {
        await budgetRepository.deleteBudget(budgetId);
        router.push('/budgets');
      } catch (err) {
        console.error('Error deleting budget:', err);
      }
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const calculateUtilization = () => {
    if (!budget || budget.total_budget === 0) return 0;
    return (budget.spent_amount / budget.total_budget) * 100;
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 70) return 'success';
    if (utilization < 90) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/budgets')}>
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  if (!budget) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Không tìm thấy ngân sách
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/budgets')}>
          Quay lại danh sách
        </Button>
      </Box>
    );
  }

  const utilization = calculateUtilization();

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => router.push('/budgets')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {budget.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {budget.description}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Tooltip title="Làm mới">
            <IconButton onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xuất báo cáo">
            <IconButton>
              <GetApp />
            </IconButton>
          </Tooltip>
          <Button startIcon={<Edit />} onClick={handleEdit}>
            Chỉnh sửa
          </Button>
          <Button
            startIcon={<Delete />}
            color="error"
            onClick={handleDelete}
          >
            Xóa
          </Button>
        </Box>
      </Box>

      {/* Budget Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* Basic Info */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Loại ngân sách
                </Typography>
                <Chip
                  label={getBudgetTypeLabel(budget.budget_type)}
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Trạng thái
                </Typography>
                <Chip
                  label={getStatusLabel(budget.status)}
                  color={getStatusColor(budget.status)}
                />
              </Box>
            </Grid>

            {/* Financial Summary */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Box textAlign="center">
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      {formatCurrency(budget.total_budget)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tổng ngân sách
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box textAlign="center">
                    <Typography variant="h5" color="warning.main" fontWeight="bold">
                      {formatCurrency(budget.spent_amount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Đã chi tiêu
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box textAlign="center">
                    <Typography variant="h5" color="info.main" fontWeight="bold">
                      {formatCurrency(budget.committed_amount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cam kết
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box textAlign="center">
                    <Typography variant="h5" color="success.main" fontWeight="bold">
                      {formatCurrency(budget.remaining_budget)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Còn lại
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* Utilization */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Box textAlign="center">
                <Typography variant="h5" color={getUtilizationColor(utilization)} fontWeight="bold">
                  {utilization.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tỷ lệ sử dụng
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(utilization, 100)}
                  color={getUtilizationColor(utilization)}
                  sx={{ height: 8, borderRadius: 4, mt: 1 }}
                />
              </Box>
            </Grid>

            {/* Period */}
            <Grid size={{ xs: 12 }}>
              <Divider />
              <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Thời gian: {new Date(budget.start_date).toLocaleDateString('vi-VN')} - {new Date(budget.end_date).toLocaleDateString('vi-VN')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Năm tài chính: {budget.fiscal_year} {budget.quarter && `- Quý ${budget.quarter}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tiền tệ: {budget.currency}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            aria-label="budget detail tabs"
          >
            <Tab label="Thông tin" />
            <Tab label="Danh mục" />
            <Tab label="Chi phí" />
            <Tab label="Dự báo" />
            <Tab label="Cảnh báo" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <BudgetInfoTab budget={budget} onRefresh={handleRefresh} />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <BudgetCategoriesTab budgetId={budgetId} onRefresh={handleRefresh} />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <BudgetExpensesTab budgetId={budgetId} onRefresh={handleRefresh} />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <BudgetForecastsTab budgetId={budgetId} onRefresh={handleRefresh} />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <BudgetAlertsTab budgetId={budgetId} onRefresh={handleRefresh} />
        </TabPanel>
      </Card>
    </Box>
  );
}