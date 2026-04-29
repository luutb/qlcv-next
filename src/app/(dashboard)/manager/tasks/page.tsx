'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  InputAdornment,
  Paper,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import { Task } from '@/types';
import { useTaskRepository } from '@/hooks/useTaskRepository';
import { useWorkflows } from '@/hooks/useWorkflows';
import {
  STATUS_OPTIONS,
  TASK_STATUS_STYLE,
  TASK_STATUS_LABEL,
  TaskStatus,
  STEP_STATUS_OPTIONS,
  STEP_STATUS_STYLE,
  STEP_STATUS_LABEL,
} from '@/repositories/constants';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'title', headerName: 'Tiêu đề', flex: 1, minWidth: 200 },
  {
    field: 'workflow_name',
    headerName: 'Quy trình',
    width: 160,
    valueGetter: (_value: unknown, row: Task) => row.workflow_name || '—',
  },
  {
    field: 'status',
    headerName: 'Trạng thái',
    width: 130,
    renderCell: (params) => {
      const style = TASK_STATUS_STYLE[params.value as TaskStatus];
      return (
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            fontSize: 12,
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
    field: 'step_status',
    headerName: 'Tiến độ',
    width: 130,
    renderCell: (params) => {
      const val = params.value as string;
      if (!val || params.row.status !== 'ACTIVE') return '—';
      const style = STEP_STATUS_STYLE[val];
      return (
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            fontSize: 12,
            fontWeight: 600,
            color: style?.color || '#64748B',
            bgcolor: style?.bg || '#F1F5F9',
            display: 'inline-block',
            lineHeight: 1.6,
          }}
        >
          {STEP_STATUS_LABEL[val] || val}
        </Box>
      );
    },
  },
  {
    field: 'assignee',
    headerName: 'Người thực hiện',
    width: 160,
    valueGetter: (_value: unknown, row: Task) =>
      row.assignee?.full_name || '—',
  },
  {
    field: 'current_step',
    headerName: 'Bước hiện tại',
    width: 130,
    valueGetter: (_value: unknown, row: Task) =>
      row.current_step_config?.step_name || `Bước ${row.current_step}`,
  },
  {
    field: 'amount',
    headerName: 'Số tiền',
    width: 130,
    valueFormatter: (value: number | undefined) =>
      value != null
        ? value.toLocaleString('vi-VN', {
            style: 'currency',
            currency: 'VND',
          })
        : '—',
  },
  {
    field: 'created_at',
    headerName: 'Ngày tạo',
    width: 140,
    valueFormatter: (value: string) =>
      new Date(value).toLocaleDateString('vi-VN'),
  },
];

export default function TaskListPage() {
  const router = useRouter();
  const { workflows } = useWorkflows();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [stepStatusFilter, setStepStatusFilter] = useState('');
  const [workflowFilter, setWorkflowFilter] = useState<number | ''>('');
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [statusFilter, stepStatusFilter, workflowFilter, debouncedKeyword]);

  const queryParams = useMemo(
    () => ({
      page: paginationModel.page + 1,
      limit: paginationModel.pageSize,
      status: statusFilter || undefined,
      step_status: stepStatusFilter || undefined,
      keyword: debouncedKeyword || undefined,
      workflow_id: workflowFilter || undefined,
    }),
    [paginationModel, statusFilter, stepStatusFilter, workflowFilter, debouncedKeyword],
  );

  const { tasks, total, loading } = useTaskRepository(queryParams);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Quản lý hồ sơ
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/manager/tasks/create')}
        >
          Tạo hồ sơ
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Quy trình"
          value={workflowFilter}
          onChange={(e) => setWorkflowFilter(e.target.value ? Number(e.target.value) : '')}
          size="small"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Tất cả quy trình</MenuItem>
          {workflows.map((wf) => (
            <MenuItem key={wf.id} value={wf.id}>
              {wf.name}
            </MenuItem>
          ))}
        </TextField>

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
          select
          label="Tiến độ bước"
          value={stepStatusFilter}
          onChange={(e) => setStepStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 160 }}
        >
          {STEP_STATUS_OPTIONS.map((opt) => (
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

      {/* Data Grid */}
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
          onRowClick={(params) => router.push(`/shared/tasks/${params.row.id}`)}
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
