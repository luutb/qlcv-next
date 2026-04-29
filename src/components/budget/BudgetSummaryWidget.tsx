'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  AccountBalance,
  Receipt,
  Notifications,
} from '@mui/icons-material';
import { budgetRepository } from '@/repositories/BudgetRepo';
import { BudgetSummaryData } from '@/types/budget';

interface BudgetSummaryWidgetProps {
  refreshTrigger?: number;
}

export default function BudgetSummaryWidget({ refreshTrigger }: BudgetSummaryWidgetProps) {
  const [summary, setSummary] = useState<BudgetSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await budgetRepository.getBudgetSummary();
      setSummary(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu tổng quan ngân sách');
      console.error('Error fetching budget summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [refreshTrigger]);

  const getUtilizationColor = (rate: number) => {
    if (rate < 70) return 'success';
    if (rate < 90) return 'warning';
    return 'error';
  };

  const getUtilizationIcon = (rate: number) => {
    if (rate < 70) return <CheckCircle color="success" />;
    if (rate < 90) return <Warning color="warning" />;
    return <TrendingUp color="error" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <Card>
      <CardHeader
        title="Tổng quan Ngân sách"
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Chip
            icon={getUtilizationIcon(summary.utilization_rate)}
            label={`${summary.utilization_rate.toFixed(1)}%`}
            color={getUtilizationColor(summary.utilization_rate)}
            variant="outlined"
          />
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          {/* Total Budgets */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box textAlign="center">
              <AccountBalance color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" color="primary" fontWeight="bold">
                {summary.total_budgets}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng số ngân sách
              </Typography>
            </Box>
          </Grid>

          {/* Total Amount */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box textAlign="center">
              <TrendingUp color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="success.main" fontWeight="bold">
                {formatCurrency(summary.total_amount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng ngân sách
              </Typography>
            </Box>
          </Grid>

          {/* Total Spent */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box textAlign="center">
              <Receipt color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="warning.main" fontWeight="bold">
                {formatCurrency(summary.total_spent)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đã chi tiêu
              </Typography>
            </Box>
          </Grid>

          {/* Remaining */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box textAlign="center">
              <CheckCircle color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" color="info.main" fontWeight="bold">
                {formatCurrency(summary.total_remaining)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Còn lại
              </Typography>
            </Box>
          </Grid>

          {/* Utilization Progress */}
          <Grid size={{ xs: 12 }}>
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight="medium">
                  Tỷ lệ sử dụng ngân sách
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {summary.utilization_rate.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(summary.utilization_rate, 100)}
                color={getUtilizationColor(summary.utilization_rate)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Grid>

          {/* Alerts and Over Budget */}
          <Grid size={{ xs: 12 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Warning color={summary.over_budget_count > 0 ? 'error' : 'disabled'} />
                  <Box>
                    <Typography variant="h6" color={summary.over_budget_count > 0 ? 'error' : 'text.secondary'}>
                      {summary.over_budget_count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Vượt ngân sách
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Notifications color={summary.alert_count > 0 ? 'warning' : 'disabled'} />
                  <Box>
                    <Typography variant="h6" color={summary.alert_count > 0 ? 'warning.main' : 'text.secondary'}>
                      {summary.alert_count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cảnh báo
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}