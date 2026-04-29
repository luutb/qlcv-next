'use client';

import { useState } from 'react';
import {
  Box, Typography, Paper, Button, TextField, MenuItem,
  CircularProgress, Alert, Divider, Chip, Grid,
} from '@mui/material';
import {
  FilterList,
  FileDownload,
  CalendarToday,
  People,
  MonetizationOn,
  CheckCircle,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/api/client';
import { useUsers } from '@/hooks/useUsers';

interface ReportData {
  id: number;
  task_id: number;
  task_title: string;
  customer_name: string;
  amount: number;
  status: 'DONE' | 'ACTIVE' | 'REJECTED';
  created_at: string;
  completed_at?: string;
  user_name: string;
  department_name: string;
}

interface ReportFilters {
  department_id?: number;
  user_id?: number;
  date_from?: string;
  date_to?: string;
  status?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export default function ReportsPage() {
  const { user } = useAuth();
  const { users: staffList } = useUsers();
  const [filters, setFilters] = useState<ReportFilters>({});
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [total, setTotal] = useState(0);

  const handleFilterChange = (field: keyof ReportFilters) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [field]: e.target.value });
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.post('/reports/generate', {
        filters: {
          department_id: filters.department_id || undefined,
          user_id: filters.user_id || undefined,
          date_from: filters.date_from || undefined,
          date_to: filters.date_to || undefined,
          status: filters.status || undefined,
        },
      });
      setReports(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const { data } = await apiClient.post('/reports/export/excel', { filters }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bao-cao-${new Date().toLocaleDateString('vi-VN')}.xlsx`;
      a.click();
    } catch (error) {
      console.error('Failed to export Excel:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const { data } = await apiClient.post('/reports/export/pdf', { filters }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bao-cao-${new Date().toLocaleDateString('vi-VN')}.pdf`;
      a.click();
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'task_id', headerName: 'Mã hồ sơ', width: 120 },
    { field: 'task_title', headerName: 'Tên hồ sơ', flex: 1, minWidth: 200 },
    { field: 'customer_name', headerName: 'Khách hàng', flex: 1, minWidth: 150 },
    { field: 'user_name', headerName: 'Nhân viên', flex: 1, minWidth: 150 },
    { field: 'department_name', headerName: 'Khoa', flex: 1, minWidth: 150 },
    {
      field: 'amount',
      headerName: 'Số tiền',
      width: 120,
      valueFormatter: (value: number) =>
        formatCurrency(value),
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      width: 130,
      renderCell: (params: GridRenderCellParams<ReportData>) => (
        <Chip
          label={params.row.status === 'DONE' ? 'Hoàn thành' : 'Đang xử lý'}
          size="small"
          color={params.value === 'DONE' ? 'success' : 'warning'}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Ngày tạo',
      width: 140,
      valueFormatter: (value: string) =>
        new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      field: 'completed_at',
      headerName: 'Ngày hoàn thành',
      width: 140,
      valueFormatter: (value: string) =>
        value ? new Date(value).toLocaleDateString('vi-VN') : '-',
    },
  ];

  const stats = [
    { label: 'Tổng số hồ sơ', value: total, icon: <People fontSize="small" /> },
    { label: 'Tổng doanh thu', value: formatCurrency(reports.reduce((acc, r) => acc + r.amount, 0)), icon: <MonetizationOn fontSize="small" /> },
    { label: 'Hồ sơ hoàn thành', value: reports.filter((r) => r.status === 'DONE').length, icon: <CheckCircle fontSize="small" /> },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Báo cáo & Thống kê
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={handleExportPDF}
          >
            Xuất PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={handleExportExcel}
          >
            Xuất Excel
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: 1, color: 'primary.main' }}>
                {stat.icon}
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {stat.value}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterList fontSize="small" color="action" />
          <Typography variant="h6">Bộ lọc</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              select
              label="Khoa"
              fullWidth
              value={filters.department_id || ''}
              onChange={handleFilterChange('department_id')}
            >
              <MenuItem value="">Tất cả khoa</MenuItem>
              <MenuItem value="1">Khoa Kỹ thuật</MenuItem>
              <MenuItem value="2">Khoa Kinh doanh</MenuItem>
              <MenuItem value="3">Khoa Tài chính</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              select
              label="Nhân viên"
              fullWidth
              value={filters.user_id || ''}
              onChange={handleFilterChange('user_id')}
            >
              <MenuItem value="">Tất cả nhân viên</MenuItem>
              {staffList.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.full_name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label="Từ ngày"
              type="date"
              fullWidth
              value={filters.date_from || ''}
              onChange={handleFilterChange('date_from')}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label="Đến ngày"
              type="date"
              fullWidth
              value={filters.date_to || ''}
              onChange={handleFilterChange('date_to')}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button
              variant="contained"
              startIcon={<FilterList />}
              onClick={handleGenerate}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Tìm kiếm'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Reports Table */}
      <Paper sx={{ width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : reports.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Chưa có dữ liệu. Vui lòng chọn bộ lọc và tìm kiếm.
            </Typography>
          </Box>
        ) : (
          <DataGrid
            rows={reports as any}
            columns={columns}
            disableRowSelectionOnClick
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            sx={{
              border: 0,
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: 'grey.50',
                fontWeight: 700,
              },
            }}
          />
        )}
      </Paper>
    </Box>
  );
}
