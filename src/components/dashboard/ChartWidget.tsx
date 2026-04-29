'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { ChartConfig } from '@/lib/config/types';
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}

interface ChartWidgetProps {
  config: ChartConfig;
}

export default function ChartWidget({ config }: ChartWidgetProps) {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [config]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: config.type,
        metrics: config.metrics.join(','),
        timeRange: config.timeRange,
        ...(config.groupBy && { groupBy: config.groupBy }),
      });

      const response = await fetch(`/api/analytics/chart-data?${params}`);
      const result = await response.json();
      
      setData(result);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={300}
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const renderChart = () => {
    switch (config.type) {
      case 'line':
        return <Line data={data} options={chartOptions} />;
      case 'bar':
        return <Bar data={data} options={chartOptions} />;
      case 'pie':
        return <Pie data={data} options={chartOptions} />;
      default:
        return null;
    }
  };

  return (
    <Box p={2} height={300}>
      {renderChart()}
    </Box>
  );
}
