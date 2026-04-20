'use client';

import { useEffect, useState } from 'react';
import {
  Typography, Box, Paper, Grid, CircularProgress,
} from '@mui/material';
import { Assignment, PendingActions, CheckCircle } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import apiClient from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';

interface OverviewStats {
  tasks: { total: number; active: number; done: number; rejected: number };
}

export default function StaffDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/statistics/overview')
      .then((res) => {
        const body = res.data;
        setStats(body?.data ?? body);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const cards = [
    { label: 'Được giao', value: stats?.tasks.total ?? 0, icon: <Assignment sx={{ fontSize: 40 }} />, color: '#1976d2' },
    { label: 'Đang xử lý', value: stats?.tasks.active ?? 0, icon: <PendingActions sx={{ fontSize: 40 }} />, color: '#ed6c02' },
    { label: 'Hoàn thành', value: stats?.tasks.done ?? 0, icon: <CheckCircle sx={{ fontSize: 40 }} />, color: '#2e7d32' },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>Tổng quan</Typography>
      <Typography color="text.secondary" mb={3}>Xin chào, {user?.full_name}.</Typography>

      <Grid container spacing={3}>
        {cards.map((card, i) => (
          <Grid key={i} size={{ xs: 12, sm: 4 }}>
            <Paper
              sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderTop: `4px solid ${card.color}`, cursor: 'pointer' }}
              elevation={2}
              onClick={() => router.push('/staff/my-tasks')}
            >
              <Box sx={{ color: card.color }}>{card.icon}</Box>
              <Box>
                <Typography variant="body2" color="text.secondary">{card.label}</Typography>
                <Typography variant="h5" fontWeight={700}>{card.value.toLocaleString('vi-VN')}</Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
