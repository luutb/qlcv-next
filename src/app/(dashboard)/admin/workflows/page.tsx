'use client';

import { useState } from 'react';
import {
  Box, Typography, Paper, Button, Chip,
  CircularProgress, Alert, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import { Workflow } from '@/types';
import { useWorkflows } from '@/hooks/useWorkflows';
import { workflowRepo } from '@/repositories/workflow.repo';
import toast from 'react-hot-toast';

export default function WorkflowListPage() {
  const router = useRouter();
  const { workflows, loading, error, refresh } = useWorkflows();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await workflowRepo.delete(deleteId);
      toast.success('Đã xóa quy trình');
      setDeleteId(null);
      refresh();
    } catch {
      toast.error('Xóa thất bại. Quy trình có thể đang được sử dụng.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Tên quy trình', flex: 1, minWidth: 200 },
    { field: 'description', headerName: 'Mô tả', flex: 1, minWidth: 200,
      valueGetter: (_value: unknown, row: Workflow) => row.description || '—',
    },
    { field: 'step_count', headerName: 'Số bước', width: 100, align: 'center', headerAlign: 'center' },
    {
      field: 'is_active',
      headerName: 'Trạng thái',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Hoạt động' : 'Tắt'}
          size="small"
          color={params.value ? 'success' : 'default'}
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
      field: 'actions',
      headerName: 'Thao tác',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Chỉnh sửa">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/workflows/${params.row.id}`);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(params.row.id);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Quản lý quy trình
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/admin/workflows/create')}
        >
          Tạo quy trình
        </Button>
      </Box>

      <Paper sx={{ width: '100%' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DataGrid
            rows={workflows}
            columns={columns}
            disableRowSelectionOnClick
            autoHeight
            pageSizeOptions={[10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            onRowClick={(params) => router.push(`/admin/workflows/${params.id}`)}
            sx={{
              border: 0,
              cursor: 'pointer',
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: 'grey.50',
                fontWeight: 700,
              },
            }}
          />
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Xóa quy trình</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa quy trình này? Thao tác này không thể hoàn tác.
            Quy trình chỉ có thể xóa khi không có hồ sơ nào đang sử dụng.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={deleting}>Hủy</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
