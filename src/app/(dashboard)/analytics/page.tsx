'use client';

import { Box, Button, Typography, Paper } from '@mui/material';
import { Add, FileDownload } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { ResponsiveGridLayout } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import DashboardWidget from '@/components/dashboard/DashboardWidget';
import { DashboardWidget as DashboardWidgetType } from '@/lib/config/types';
import apiClient from '@/api/client';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export default function AnalyticsPage() {
  const [widgets, setWidgets] = useState<DashboardWidgetType[]>([]);
  const [layouts, setLayouts] = useState<Partial<Record<string, Layout>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/dashboard/widgets');
      setWidgets(data.widgets || []);
      setLayouts(data.layouts || {});
    } catch {
      // BE chưa có endpoint này, bỏ qua lỗi
    } finally {
      setLoading(false);
    }
  };

  const saveDashboard = async () => {
    try {
      await apiClient.put('/dashboard/widgets', { widgets, layouts });
    } catch (error) {
      console.error('Failed to save dashboard:', error);
    }
  };

  const handleLayoutChange = (_layout: Layout, allLayouts: Partial<Record<string, Layout>>) => {
    setLayouts(allLayouts);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(widgets.filter((w) => w.id !== widgetId));
  };

  const handleExportPDF = async () => {
    try {
      const { data } = await apiClient.post('/dashboard/export/pdf', { widgets }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${new Date().toISOString()}.pdf`;
      a.click();
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const { data } = await apiClient.post('/dashboard/export/excel', { widgets }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${new Date().toISOString()}.xlsx`;
      a.click();
    } catch (error) {
      console.error('Failed to export Excel:', error);
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Analytics Dashboard</Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" startIcon={<FileDownload />} onClick={handleExportPDF}>
            Export PDF
          </Button>
          <Button variant="outlined" startIcon={<FileDownload />} onClick={handleExportExcel}>
            Export Excel
          </Button>
          <Button variant="contained" startIcon={<Add />}>
            Add Widget
          </Button>
          <Button variant="contained" color="primary" onClick={saveDashboard}>
            Save Layout
          </Button>
        </Box>
      </Box>

      {widgets.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Chưa có widget nào
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Nhấn "Add Widget" để bắt đầu tùy chỉnh dashboard
          </Typography>
          <Button variant="contained" startIcon={<Add />}>
            Thêm widget đầu tiên
          </Button>
        </Paper>
      ) : (
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          width={1200}
          onLayoutChange={handleLayoutChange}
        >
          {widgets.map((widget) => (
            <div key={widget.id}>
              <DashboardWidget widget={widget} onRemove={handleRemoveWidget} draggable />
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </Box>
  );
}
