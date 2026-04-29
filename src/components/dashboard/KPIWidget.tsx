'use client';

import { Box, Typography, CircularProgress, Card, CardContent } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import { KPIConfig } from '@/lib/config/types';
import { useEffect, useState } from 'react';

interface KPIData {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  label: string;
}

interface KPIWidgetProps {
  config: KPIConfig;
}

export default function KPIWidget({ config }: KPIWidgetProps) {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIData();
  }, [config]);

  const fetchKPIData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        metric: config.metric,
        groupBy: config.groupBy,
        timeRange: config.timeRange,
      });

      const response = await fetch(`/api/analytics/kpi?${params}`);
      const result = await response.json();
      
      setData(result);
    } catch (error) {
      console.error('Failed to fetch KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricLabel = (metric: string) => {
    const labels: Record<string, string> = {
      tasks_completed: 'Tasks Completed',
      tasks_pending: 'Tasks Pending',
      revenue: 'Revenue',
      avg_completion_time: 'Avg Completion Time',
    };
    return labels[metric] || metric;
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p={2}>
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    );
  }

  return (
    <Card elevation={0}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {getMetricLabel(config.metric)}
        </Typography>
        
        <Box display="flex" alignItems="baseline" gap={1} mb={1}>
          <Typography variant="h3" component="div">
            {data.value.toLocaleString()}
          </Typography>
          
          {data.trend !== 'neutral' && (
            <Box display="flex" alignItems="center" gap={0.5}>
              {data.trend === 'up' ? (
                <TrendingUp color="success" />
              ) : (
                <TrendingDown color="error" />
              )}
              <Typography
                variant="body2"
                color={data.trend === 'up' ? 'success.main' : 'error.main'}
              >
                {Math.abs(data.change)}%
              </Typography>
            </Box>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary">
          {config.groupBy !== 'none' && `Grouped by ${config.groupBy} • `}
          {config.timeRange}
        </Typography>
      </CardContent>
    </Card>
  );
}
