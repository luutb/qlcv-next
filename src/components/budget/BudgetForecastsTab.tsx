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
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { budgetRepository } from '@/repositories/BudgetRepo';
import { BudgetForecast } from '@/types/budget';

interface BudgetForecastsTabProps {
  budgetId: number;
  onRefresh: () => void;
}

export default function BudgetForecastsTab({ budgetId, onRefresh }: BudgetForecastsTabProps) {
  const [forecasts, setForecasts] = useState<BudgetForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingForecast, setEditingForecast] = useState<BudgetForecast | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    forecast_date: '',
    forecast_period: 'monthly' as BudgetForecast['forecast_period'],
    projected_spend: 0,
    projected_total: 0,
    confidence_level: 80,
    forecast_method: 'linear',
    assumptions: '',
    notes: '',
  });

  const fetchForecasts = async () => {
    try {
      setLoading(true);
      const data = await budgetRepository.getBudgetForecasts(budgetId);
      setForecasts(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách dự báo');
      console.error('Error fetching forecasts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, [budgetId]);

  const handleOpenDialog = (forecast?: BudgetForecast) => {
    if (forecast) {
      setEditingForecast(forecast);
      setFormData({
        forecast_date: forecast.forecast_date.split('T')[0],
        forecast_period: forecast.forecast_period,
        projected_spend: forecast.projected_spend,
        projected_total: forecast.projected_total,
        confidence_level: forecast.confidence_level,
        forecast_method: forecast.forecast_method,
        assumptions: forecast.assumptions,
        notes: forecast.notes,
      });
    } else {
      setEditingForecast(null);
      setFormData({
        forecast_date: new Date().toISOString().split('T')[0],
        forecast_period: 'monthly',
        projected_spend: 0,
        projected_total: 0,
        confidence_level: 80,
        forecast_method: 'linear',
        assumptions: '',
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingForecast(null);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await budgetRepository.createForecast(budgetId, formData);
      fetchForecasts();
      onRefresh();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving forecast:', err);
    } finally {
      setSubmitting(false);
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

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'error';
    if (variance < -5) return 'success';
    return 'warning';
  };

  const getVarianceIcon = (variance: number) => {
    return variance > 0 ? <TrendingUp color="error" /> : <TrendingDown color="success" />;
  };

  const getChartData = () => {
    return forecasts.map(forecast => ({
      date: formatDate(forecast.forecast_date),
      projected: forecast.projected_total,
      variance: forecast.variance_amount,
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
        {/* Chart */}
        {forecasts.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title="Biểu đồ xu hướng dự báo" />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => formatCurrency(value as number)} />
                    <Line type="monotone" dataKey="projected" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="variance" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Forecasts Table */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader
              title="Danh sách dự báo"
              action={
                <Button
                  startIcon={<Add />}
                  onClick={() => handleOpenDialog()}
                  variant="contained"
                  size="small"
                >
                  Tạo dự báo
                </Button>
              }
            />
            <CardContent sx={{ p: 0 }}>
              {forecasts.length === 0 ? (
                <Box p={3} textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Chưa có dự báo nào. Nhấn "Tạo dự báo" để bắt đầu.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ngày dự báo</TableCell>
                        <TableCell>Kỳ</TableCell>
                        <TableCell align="right">Dự báo chi tiêu</TableCell>
                        <TableCell align="right">Dự báo tổng</TableCell>
                        <TableCell align="center">Độ lệch</TableCell>
                        <TableCell align="center">Độ tin cậy</TableCell>
                        <TableCell>Phương pháp</TableCell>
                        <TableCell align="center">Thao tác</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {forecasts.map((forecast) => (
                        <TableRow key={forecast.id} hover>
                          <TableCell>
                            {formatDate(forecast.forecast_date)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={forecast.forecast_period}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(forecast.projected_spend)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(forecast.projected_total)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                              {getVarianceIcon(forecast.variance_percent)}
                              <Typography
                                variant="body2"
                                color={getVarianceColor(forecast.variance_percent)}
                              >
                                {forecast.variance_percent > 0 ? '+' : ''}{forecast.variance_percent.toFixed(1)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${forecast.confidence_level}%`}
                              size="small"
                              color={forecast.confidence_level >= 80 ? 'success' : forecast.confidence_level >= 60 ? 'warning' : 'error'}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {forecast.forecast_method}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Chỉnh sửa">
                              <IconButton
                                onClick={() => handleOpenDialog(forecast)}
                                size="small"
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingForecast ? 'Chỉnh sửa dự báo' : 'Tạo dự báo mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Ngày dự báo *"
                type="date"
                value={formData.forecast_date}
                onChange={(e) => setFormData(prev => ({ ...prev, forecast_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Kỳ dự báo</InputLabel>
                <Select
                  value={formData.forecast_period}
                  onChange={(e) => setFormData(prev => ({ ...prev, forecast_period: e.target.value as BudgetForecast['forecast_period'] }))}
                  label="Kỳ dự báo"
                >
                  <MenuItem value="monthly">Hàng tháng</MenuItem>
                  <MenuItem value="quarterly">Hàng quý</MenuItem>
                  <MenuItem value="annual">Hàng năm</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Dự báo chi tiêu *"
                type="number"
                value={formData.projected_spend}
                onChange={(e) => setFormData(prev => ({ ...prev, projected_spend: parseFloat(e.target.value) || 0 }))}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Dự báo tổng *"
                type="number"
                value={formData.projected_total}
                onChange={(e) => setFormData(prev => ({ ...prev, projected_total: parseFloat(e.target.value) || 0 }))}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Độ tin cậy (%)"
                type="number"
                value={formData.confidence_level}
                onChange={(e) => setFormData(prev => ({ ...prev, confidence_level: parseFloat(e.target.value) || 0 }))}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Phương pháp dự báo"
                value={formData.forecast_method}
                onChange={(e) => setFormData(prev => ({ ...prev, forecast_method: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Giả định"
                multiline
                rows={3}
                value={formData.assumptions}
                onChange={(e) => setFormData(prev => ({ ...prev, assumptions: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Ghi chú"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
            disabled={submitting || !formData.forecast_date || formData.projected_total <= 0}
            variant="contained"
          >
            {submitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}