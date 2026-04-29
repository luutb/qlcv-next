'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, TextField, MenuItem,
  CircularProgress, Alert, Chip, IconButton, Divider,
} from '@mui/material';
import {
  FilterList,
  FileDownload,
  Search,
  History,
  Person,
  CalendarToday,
  Description,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

interface AuditLog {
  id: number;
  user_id: number;
  username: string;
  action: string;
  resource_type: string;
  resource_id: number;
  resource_name?: string;
  timestamp: string;
  ip_address?: string;
}

interface AuditLogFilters {
  user_id?: number;
  action?: string;
  resource_type?: string;
  date_from?: string;
  date_to?: string;
}

export default function AuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);

  const handleFilterChange = (field: keyof AuditLogFilters) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [field]: e.target.value });
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockLogs: AuditLog[] = [
        {
          id: 1,
          user_id: 1,
          username: 'admin',
          action: 'CREATE_TASK',
          resource_type: 'task',
          resource_id: 1001,
          resource_name: 'Hồ sơ vay vốn',
          timestamp: '2024-01-15T08:30:00Z',
          ip_address: '192.168.1.1',
        },
        {
          id: 2,
          user_id: 2,
          username: 'manager',
          action: 'APPROVE_TASK',
          resource_type: 'task',
          resource_id: 1002,
          resource_name: 'Hồ sơ mua nhà',
          timestamp: '2024-01-15T09:45:00Z',
          ip_address: '192.168.1.2',
        },
      ];
      setLogs(mockLogs);
      setTotal(mockLogs.length);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // TODO: Replace with actual API call
      console.log('Export audit logs:', logs);
    } catch (error) {
      console.error('Failed to export audit logs:', error);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'username',
      headerName: 'Người thực hiện',
      width: 150,
      renderCell: (params: GridRenderCellParams<AuditLog>) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person fontSize="small" color="action" />
          <Typography variant="body2">{params.row.username}</Typography>
        </Box>
      ),
    },
    {
      field: 'action',
      headerName: 'Hành động',
      width: 150,
      renderCell: (params: GridRenderCellParams<AuditLog>) => (
        <Chip
          label={params.value}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'resource_type',
      headerName: 'Loại tài nguyên',
      width: 130,
      renderCell: (params: GridRenderCellParams<AuditLog>) => (
        <Chip
          label={params.value}
          size="small"
          color="default"
          variant="outlined"
        />
      ),
    },
    {
      field: 'resource_name',
      headerName: 'Tên tài nguyên',
      width: 200,
    },
    {
      field: 'timestamp',
      headerName: 'Thời gian',
      width: 160,
      valueFormatter: (value: string) =>
        new Date(value).toLocaleString('vi-VN'),
    },
    {
      field: 'ip_address',
      headerName: 'IP Address',
      width: 120,
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <History fontSize="small" color="action" />
          <Typography variant="h4" fontWeight={700}>
            Nhật ký kiểm toán
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<FileDownload />}
          onClick={handleExport}
        >
          Xuất file
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterList fontSize="small" color="action" />
          <Typography variant="h6">Bộ lọc</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            select
            label="Người dùng"
            size="small"
            value={filters.user_id || ''}
            onChange={handleFilterChange('user_id')}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Tất cả người dùng</MenuItem>
            <MenuItem value="1">admin</MenuItem>
            <MenuItem value="2">manager</MenuItem>
          </TextField>

          <TextField
            select
            label="Hành động"
            size="small"
            value={filters.action || ''}
            onChange={handleFilterChange('action')}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Tất cả hành động</MenuItem>
            <MenuItem value="CREATE_TASK">Tạo hồ sơ</MenuItem>
            <MenuItem value="APPROVE_TASK">Phê duyệt</MenuItem>
            <MenuItem value="REJECT_TASK">Từ chối</MenuItem>
          </TextField>

          <TextField
            select
            label="Loại tài nguyên"
            size="small"
            value={filters.resource_type || ''}
            onChange={handleFilterChange('resource_type')}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Tất cả loại</MenuItem>
            <MenuItem value="task">Hồ sơ</MenuItem>
            <MenuItem value="contract">Hợp đồng</MenuItem>
            <MenuItem value="workflow">Quy trình</MenuItem>
          </TextField>

          <TextField
            label="Từ ngày"
            type="date"
            size="small"
            value={filters.date_from || ''}
            onChange={handleFilterChange('date_from')}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 150 }}
          />

          <TextField
            label="Đến ngày"
            type="date"
            size="small"
            value={filters.date_to || ''}
            onChange={handleFilterChange('date_to')}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: 150 }}
          />

          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={handleSearch}
            disabled={loading}
            sx={{ height: 56 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Tìm kiếm'}
          </Button>
        </Box>
      </Paper>

      {/* Audit Logs Table */}
      <Paper sx={{ width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : logs.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Chưa có dữ liệu. Vui lòng chọn bộ lọc và tìm kiếm.
            </Typography>
          </Box>
        ) : (
          <DataGrid
            rows={logs}
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
