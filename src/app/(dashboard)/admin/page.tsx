'use client';

import { useEffect, useState } from 'react';
import {
  Typography, Box, Paper, Grid, CircularProgress,
} from '@mui/material';
import {
  Assignment, PendingActions, CheckCircle, Paid,
} from '@mui/icons-material';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';
import apiClient from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import BudgetSummaryWidget from '@/components/budget/BudgetSummaryWidget';
import BudgetAlertsWidget from '@/components/budget/BudgetAlertsWidget';

interface OverviewStats {
  tasks: { total: number; active: number; done: number; rejected: number };
  payment: { pending_payment: number; paid: number; pending_collection: number; collected: number };
}

interface RevenueData {
  month: string;
  revenue: number;
  paid: number;
  collected: number;
}

interface RevenueStats {
  total_revenue: number;
  total_paid: number;
  total_collected: number;
  monthly: RevenueData[];
}

function formatVND(value: number) {
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
  'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
  'linear-gradient(135deg, #059669 0%, #34D399 100%)',
  'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const currentYear = new Date().getFullYear();
      const [statsRes, revenueRes] = await Promise.allSettled([
        apiClient.get('/statistics/overview'),
        apiClient.get('/statistics/revenue', { params: { year: currentYear } }),
      ]);
      if (statsRes.status === 'fulfilled') {
        const body = statsRes.value.data;
        setStats(body?.data ?? body);
      }
      if (revenueRes.status === 'fulfilled') {
        const body = revenueRes.value.data;
        setRevenue(body?.data ?? body);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const cards = [
    { label: 'Tổng hồ sơ', value: stats?.tasks.total ?? 0, icon: <Assignment sx={{ fontSize: 32 }} />, gradient: CARD_GRADIENTS[0] },
    { label: 'Đang xử lý', value: stats?.tasks.active ?? 0, icon: <PendingActions sx={{ fontSize: 32 }} />, gradient: CARD_GRADIENTS[1] },
    { label: 'Hoàn thành', value: stats?.tasks.done ?? 0, icon: <CheckCircle sx={{ fontSize: 32 }} />, gradient: CARD_GRADIENTS[2] },
    { label: 'Tổng doanh thu', value: revenue?.total_revenue ?? 0, icon: <Paid sx={{ fontSize: 32 }} />, gradient: CARD_GRADIENTS[3], isCurrency: true },
  ];

  return (
    <Box>
      <Typography variant="h4" mb={0.5}>Tổng quan</Typography>
      <Typography color="text.secondary" mb={3}>
        Xin chào, {user?.full_name}.
      </Typography>

      <Grid container spacing={3} mb={4}>
        {cards.map((card, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{
              p: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              background: card.gradient,
              color: '#fff',
              border: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(79, 70, 229, 0.2)',
              },
            }}>
              <Box sx={{
                width: 52, height: 52, borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {card.icon}
              </Box>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>{card.label}</Typography>
                <Typography variant="h5" fontWeight={700}>
                  {card.isCurrency ? formatVND(card.value) : card.value.toLocaleString('vi-VN')}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>
          Biểu đồ doanh thu theo tháng
        </Typography>
        {revenue?.monthly && revenue.monthly.length > 0 ? (
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={revenue.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} />
              <YAxis
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickFormatter={(v: number) =>
                  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}tr`
                    : v >= 1_000 ? `${(v / 1_000).toFixed(0)}k`
                      : String(v)
                }
              />
              <Tooltip
                formatter={(value) => formatVND(Number(value))}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              />
              <Legend />
              <Bar dataKey="paid" name="Đã thanh toán" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              <Bar dataKey="collected" name="Đã thu" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Typography color="text.secondary" textAlign="center" py={8}>
            Chưa có dữ liệu doanh thu.
          </Typography>
        )}
      </Paper>

      {/* Budget Widgets */}
      <Grid container spacing={3} mt={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <BudgetSummaryWidget refreshTrigger={refreshTrigger} />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <BudgetAlertsWidget refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
        </Grid>
      </Grid>
    </Box>
  );
}
