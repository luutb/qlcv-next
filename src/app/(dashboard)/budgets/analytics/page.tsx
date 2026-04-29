'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import {
  GetApp,
  Refresh,
  Analytics,
  TrendingUp,
  PieChart,
  BarChart,
} from '@mui/icons-material';
import {
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { budgetRepository } from '@/repositories/BudgetRepo';
import { Budget, BudgetAnalyticsRequest, BudgetAnalyticsResponse } from '@/types/budget';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function BudgetAnalyticsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [analytics, setAnalytics] = useState<BudgetAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<BudgetAnalyticsRequest>({
    budget_ids: [],
    start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    group_by: 'month',
    include_forecasts: true,
  });

  const fetchBudgets = async () => {
    try {
      const response = await budgetRepository.getBudgets({ limit: 100 });
      setBudgets(response?.budgets || []);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setBudgets([]);
    }
  };

  const fetchAnalytics = async () => {
    // Check if budget analytics API is disabled
    if (process.env.NEXT_PUBLIC_DISABLE_BUDGET_ANALYTICS === 'true') {
      setError('Budget Analytics API đã bị tắt. Vui lòng bật lại trong .env.local (NEXT_PUBLIC_DISABLE_BUDGET_ANALYTICS=false)');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching analytics with filters:', filters);
      
      // Validate filters before making API call
      if (!filters.budget_ids || filters.budget_ids.length === 0) {
        setError('Vui lòng chọn ít nhất một ngân sách');
        return;
      }
      
      if (!filters.start_date || !filters.end_date) {
        setError('Vui lòng chọn khoảng thời gian');
        return;
      }
      
      const data = await budgetRepository.getBudgetAnalytics(filters);
      console.log('Analytics response:', data);
      
      // Ensure data is valid
      if (!data) {
        setError('Không có dữ liệu phân tích');
        setAnalytics(null);
        return;
      }
      
      setAnalytics(data);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Không thể tải dữ liệu phân tích';
      if (err.response?.status === 500) {
        errorMessage = 'Lỗi server (500). Vui lòng kiểm tra API endpoint /budgets/analytics';
      } else if (err.response?.status === 404) {
        errorMessage = 'API endpoint không tồn tại (404)';
      } else if (err.response?.status === 401) {
        errorMessage = 'Không có quyền truy cập (401)';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  // Auto-select all budgets when they are loaded
  useEffect(() => {
    if (budgets.length > 0 && (!filters.budget_ids || filters.budget_ids.length === 0)) {
      setFilters(prev => ({
        ...prev,
        budget_ids: budgets.map(b => b.id)
      }));
    }
  }, [budgets]);

  useEffect(() => {
    if (filters.start_date && filters.end_date && filters.budget_ids && filters.budget_ids.length > 0) {
      fetchAnalytics();
    }
  }, [filters]);

  const handleFilterChange = (field: keyof BudgetAnalyticsRequest, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization < 70) return '#10B981';
    if (utilization < 90) return '#F59E0B';
    return '#EF4444';
  };

  const getPieChartData = () => {
    if (!analytics?.category_breakdown || analytics.category_breakdown.length === 0) return [];
    return analytics.category_breakdown.map((item, index) => ({
      name: item.category_name,
      value: item.spent,
      color: COLORS[index % COLORS.length],
    }));
  };

  const getBarChartData = () => {
    if (!analytics?.category_breakdown || analytics.category_breakdown.length === 0) return [];
    return analytics.category_breakdown.map(item => ({
      category: item.category_name,
      allocated: item.allocated,
      spent: item.spent,
      remaining: item.remaining,
      utilization: item.percentage,
    }));
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Analytics color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight="bold">
            Phân tích Ngân sách
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Button startIcon={<Refresh />} onClick={fetchAnalytics} disabled={loading}>
            Làm mới
          </Button>
          <Button startIcon={<GetApp />} variant="outlined">
            Xuất báo cáo
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Autocomplete
                multiple
                options={budgets || []}
                getOptionLabel={(option) => option.name}
                value={budgets?.filter(b => filters.budget_ids?.includes(b.id)) || []}
                onChange={(_, newValue) => handleFilterChange('budget_ids', newValue.map(b => b.id))}
                renderInput={(params) => (
                  <TextField {...params} label="Chọn ngân sách" placeholder="Tất cả ngân sách" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return (
                      <Chip
                        key={key}
                        variant="outlined"
                        label={option.name}
                        {...tagProps}
                      />
                    );
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                label="Từ ngày"
                type="date"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                label="Đến ngày"
                type="date"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Nhóm theo</InputLabel>
                <Select
                  value={filters.group_by}
                  onChange={(e) => handleFilterChange('group_by', e.target.value)}
                  label="Nhóm theo"
                >
                  <MenuItem value="month">Tháng</MenuItem>
                  <MenuItem value="quarter">Quý</MenuItem>
                  <MenuItem value="year">Năm</MenuItem>
                  <MenuItem value="department">Phòng ban</MenuItem>
                  <MenuItem value="category">Danh mục</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Bao gồm dự báo</InputLabel>
                <Select
                  value={filters.include_forecasts ? 'yes' : 'no'}
                  onChange={(e) => handleFilterChange('include_forecasts', e.target.value === 'yes')}
                  label="Bao gồm dự báo"
                >
                  <MenuItem value="yes">Có</MenuItem>
                  <MenuItem value="no">Không</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Analytics Content */}
      {analytics && analytics.category_breakdown && analytics.category_breakdown.length > 0 ? (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <TrendingUp color="primary" sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h5" color="primary" fontWeight="bold">
                          {formatCurrency(analytics.total_budget)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tổng ngân sách
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <BarChart color="warning" sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h5" color="warning.main" fontWeight="bold">
                          {formatCurrency(analytics.total_spent)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Đã chi tiêu
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <PieChart color="info" sx={{ fontSize: 40 }} />
                      <Box>
                        <Typography variant="h5" color="info.main" fontWeight="bold">
                          {formatCurrency(analytics.total_committed)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Cam kết
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: getUtilizationColor(analytics.utilization_rate),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      >
                        {analytics.utilization_rate.toFixed(0)}%
                      </Box>
                      <Box>
                        <Typography variant="h5" fontWeight="bold" sx={{ color: getUtilizationColor(analytics.utilization_rate) }}>
                          {formatCurrency(analytics.total_remaining)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Còn lại
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Category Breakdown - Pie Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardHeader title="Phân bổ theo danh mục" />
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
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Comparison - Bar Chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardHeader title="So sánh danh mục" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={getBarChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="allocated" fill="#8884d8" name="Phân bổ" />
                    <Bar dataKey="spent" fill="#82ca9d" name="Đã chi" />
                    <Bar dataKey="remaining" fill="#ffc658" name="Còn lại" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Variance Analysis */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title="Phân tích độ lệch" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color={analytics.variance_amount >= 0 ? 'error' : 'success'}>
                        {analytics.variance_amount >= 0 ? '+' : ''}{formatCurrency(analytics.variance_amount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Độ lệch số tiền
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color={analytics.variance_percent >= 0 ? 'error' : 'success'}>
                        {analytics.variance_percent >= 0 ? '+' : ''}{analytics.variance_percent.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Độ lệch phần trăm
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="primary">
                        {analytics.period}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Kỳ phân tích
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Details Table */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title="Chi tiết theo danh mục" />
              <CardContent>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Danh mục</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Phân bổ</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Đã chi</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Còn lại</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Tỷ lệ sử dụng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.category_breakdown && analytics.category_breakdown.length > 0 ? (
                        analytics.category_breakdown.map((item, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '12px' }}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: COLORS[index % COLORS.length],
                                  }}
                                />
                                <Typography variant="body2" fontWeight="medium">
                                  {item.category_name}
                                </Typography>
                              </Box>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              <Typography variant="body2">
                                {formatCurrency(item.allocated)}
                              </Typography>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              <Typography variant="body2" color="warning.main">
                                {formatCurrency(item.spent)}
                              </Typography>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              <Typography variant="body2" color="success.main">
                                {formatCurrency(item.remaining)}
                              </Typography>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <Chip
                                label={`${item.percentage.toFixed(1)}%`}
                                size="small"
                                color={item.percentage > 90 ? 'error' : item.percentage > 70 ? 'warning' : 'success'}
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ padding: '24px', textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                              Không có dữ liệu danh mục
                            </Typography>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : !loading && !error && (
        <Card>
          <CardContent>
            <Box textAlign="center" py={8}>
              <Analytics sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có dữ liệu phân tích
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Vui lòng chọn ngân sách và khoảng thời gian để xem phân tích
              </Typography>
              <Button variant="contained" onClick={fetchAnalytics} disabled={!filters.budget_ids || filters.budget_ids.length === 0}>
                Tạo báo cáo
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}