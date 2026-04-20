'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box, Typography, TextField, Paper, Button, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, IconButton, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { Customer, CreateCustomerRequest } from '@/types';
import { customerRepo } from '@/repositories/customer.repo';
import toast from 'react-hot-toast';

interface CustomerForm {
  full_name: string;
  phone?: string;
  email?: string;
  id_number?: string;
  address?: string;
  company_name?: string;
  tax_code?: string;
  note?: string;
}

const emptyForm: CustomerForm = {
  full_name: '',
  phone: '',
  email: '',
  id_number: '',
  address: '',
  company_name: '',
  tax_code: '',
  note: '',
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CustomerForm>({ defaultValues: emptyForm });

  // Delete confirm
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [debouncedKeyword]);

  const queryParams = useMemo(() => ({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: debouncedKeyword || undefined,
  }), [paginationModel, debouncedKeyword]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerRepo.getAll(queryParams);
      setCustomers(res.data);
      setTotal(res.pagination.total);
    } catch {
      toast.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const openCreate = () => {
    setEditId(null);
    reset(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditId(customer.id);
    reset({
      full_name: customer.full_name,
      phone: customer.phone || '',
      email: customer.email || '',
      id_number: customer.id_number || '',
      address: customer.address || '',
      company_name: customer.company_name || '',
      tax_code: customer.tax_code || '',
      note: customer.note || '',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: CustomerForm) => {
    try {
      if (editId) {
        await customerRepo.update(editId, data);
        toast.success('Đã cập nhật khách hàng');
      } else {
        await customerRepo.create(data);
        toast.success('Đã tạo khách hàng');
      }
      setDialogOpen(false);
      fetchCustomers();
    } catch {
      toast.error(editId ? 'Cập nhật thất bại' : 'Tạo khách hàng thất bại');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await customerRepo.delete(deleteId);
      toast.success('Đã xóa khách hàng');
      setDeleteId(null);
      fetchCustomers();
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
      if (code === 'CUSTOMER_HAS_TASKS') {
        toast.error('Không thể xóa khách hàng đang có hồ sơ');
      } else {
        toast.error('Xóa khách hàng thất bại');
      }
    } finally {
      setDeleting(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'full_name', headerName: 'Họ tên', flex: 1, minWidth: 180 },
    { field: 'phone', headerName: 'Số điện thoại', width: 140, valueGetter: (_v: unknown, row: Customer) => row.phone || '—' },
    { field: 'email', headerName: 'Email', width: 200, valueGetter: (_v: unknown, row: Customer) => row.email || '—' },
    { field: 'id_number', headerName: 'CMND/CCCD', width: 140, valueGetter: (_v: unknown, row: Customer) => row.id_number || '—' },
    { field: 'company_name', headerName: 'Công ty', width: 180, valueGetter: (_v: unknown, row: Customer) => row.company_name || '—' },
    {
      field: 'created_at', headerName: 'Ngày tạo', width: 120,
      valueFormatter: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      field: 'actions', headerName: '', width: 100, sortable: false, filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Sửa">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(params.row); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteId(params.row.id); }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PersonIcon color="primary" />
          <Typography variant="h4" fontWeight={700}>Quản lý khách hàng</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Thêm khách hàng
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          label="Tìm kiếm (tên, SĐT, CCCD, công ty)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          size="small"
          sx={{ minWidth: 350 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
              ),
            },
          }}
        />
      </Paper>

      <Paper sx={{ width: '100%' }}>
        <DataGrid
          rows={customers}
          columns={columns}
          rowCount={total}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50', fontWeight: 700 },
          }}
        />
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Sửa khách hàng' : 'Thêm khách hàng mới'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Họ tên"
              {...register('full_name', { required: 'Họ tên không được để trống' })}
              required
              fullWidth
              error={!!errors.full_name}
              helperText={errors.full_name?.message}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Số điện thoại" {...register('phone')} fullWidth />
              <TextField label="Email" {...register('email')} fullWidth />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="CMND/CCCD" {...register('id_number')} fullWidth />
              <TextField label="Mã số thuế" {...register('tax_code')} fullWidth />
            </Box>
            <TextField label="Địa chỉ" {...register('address')} fullWidth />
            <TextField label="Tên công ty" {...register('company_name')} fullWidth />
            <TextField label="Ghi chú" {...register('note')} multiline rows={2} fullWidth />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button onClick={() => setDialogOpen(false)} disabled={isSubmitting}>Hủy</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
              >
                {editId ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs">
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc muốn xóa khách hàng này? Thao tác này không thể hoàn tác.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={deleting}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
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
