'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, TextField, MenuItem,
  InputAdornment, Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import { Task } from '@/types';
import { useTaskRepository } from '@/hooks/useTaskRepository';
import {
  STATUS_OPTIONS, TASK_STATUS_STYLE, TASK_STATUS_LABEL, TaskStatus,
} from '@/repositories/constants';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'title', headerName: 'Tiêu đề', flex: 1, minWidth: 200 },
  {
    field: 'status',
    headerName: 'Trạng thái',
    width: 130,
    renderCell: (params) => {
      const style = TASK_STATUS_STYLE[params.value as TaskStatus];
      return (
        <Box
          sx={{
            px: 1.5, py: 0.5, borderRadius: 2, fontSize: 12,
            fontWeight: 600,
            color: style?.color || '#64748B',
            bgcolor: style?.bg || '#F1F5F9',
            display: 'inline-block',
            lineHeight: 1.6,
          }}
        >
          {TASK_STATUS_LABEL[params.value as TaskStatus] || params.value}
        </Box>
      );
    },
  },
  {
    field: 'current_step',
    headerName: 'Bước hiện tại',
    width: 150,
    valueGetter: (_value: unknown, row: Task) =>
      row.current_step_config?.step_name || `Bước ${row.current_step}`,
  },
  {
    field: 'amount',
    headerName: 'Số tiền',
    width: 130,
    valueFormatter: (value: number | undefined) =>
      value != null
        ? value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
        : '—',
  },
  {
    field: 'is_paid',
    headerName: 'Thanh toán',
    width: 120,
    renderCell: (params) => (
      <Box sx={{
        px: 1.5, py: 0.5, borderRadius: 2, fontSize: 12, fontWeight: 600,
        color: params.value ? '#047857' : '#B45309',
        bgcolor: params.value ? '#ECFDF5' : '#FFFBEB',
        display: 'inline-block',
        lineHeight: 1.6,
      }}>
        {params.value ? 'Đã TT' : 'Chưa TT'}
      </Box>
    ),
  },
  {
    field: 'created_at',
    headerName: 'Ngày tạo',
    width: 140,
    valueFormatter: (value: string) =>
      new Date(value).toLocaleDateString('vi-VN'),
  },
];

export default function PaymentsPage() {
  const router = useRouter();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [statusFilter, debouncedKeyword]);

  const queryParams = useMemo(
    () => ({
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      status: statusFilter || undefined,
      keyword: debouncedKeyword || undefined,
    }),
    [paginationModel, statusFilter, debouncedKeyword],
  );

  const { tasks, total, loading } = useTaskRepository(queryParams);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Quản lý thanh toán
      </Typography>

      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Trạng thái"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 160 }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Tìm kiếm"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          size="small"
          sx={{ minWidth: 260 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <DataGrid
          rows={tasks}
          columns={columns}
          rowCount={total}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight
          onRowClick={(params) => router.push(`/shared/tasks/${params.id}`)}
          sx={{
            border: 0,
            cursor: 'pointer',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'grey.50',
              fontWeight: 700,
            },
          }}
        />
      </Paper>
    </Box>
  );
}
