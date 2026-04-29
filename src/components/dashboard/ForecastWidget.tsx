'use client';

import { Box, CircularProgress, Typography } from '@mui/material';
import { ForecastConfig } from '@/lib/config/types';
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ForecastData {
  labels: string[];
  historical: number[];
  forecast: number[];
  upperBound: number[];
  lowerBound: number[];
}

interface ForecastWidgetProps {
  config: ForecastConfig;
}

export default function ForecastWidget({ config }: ForecastWidgetProps) {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecastData();
  }, [config]);

  const fetchForecastData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        metric: config.metric,
        historicalPeriod: config.historicalPeriod.toString(),
        forecastPeriod: config.forecastPeriod.toString(),
        confidenceInterval: config.confidenceInterval.toString(),
      });

      const response = await fetch(`/api/analytics/forecast?${params}`);
      const result = await response.json();
      
      setData(result);
    } catch (error) {
      console.error('Failed to fetch forecast data:', error);
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

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Historical',
        data: data.historical,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Forecast',
        data: [...Array(data.historical.length - 1).fill(null), ...data.forecast],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderDash: [5, 5],
        tension: 0.4,
      },
      {
        label: 'Upper Bound',
        data: [...Array(data.historical.length - 1).fill(null), ...data.upperBound],
        borderColor: 'rgba(255, 99, 132, 0.3)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        fill: '+1',
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'Lower Bound',
        data: [...Array(data.historical.length - 1).fill(null), ...data.lowerBound],
        borderColor: 'rgba(255, 99, 132, 0.3)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        fill: '-1',
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${config.metric} Forecast (${config.confidenceInterval}% Confidence)`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Box p={2} height={300}>
      <Line data={chartData} options={chartOptions} />
    </Box>
  );
}
