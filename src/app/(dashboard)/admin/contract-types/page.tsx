'use client';

import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { contractTypeRepo } from '@/repositories/ContractTypeRepo';
import { ContractType } from '@/types';
import toast from 'react-hot-toast';

interface ContractTypeForm {
  name: string;
  description?: string;
  is_active: boolean;
}

export default function ContractTypesPage() {
  const router = useRouter();
  const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ContractTypeForm>({ defaultValues: { name: '', description: '', is_active: true } });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await contractTypeRepo.getAll();
      console.log('Contract types data:', data);
      
      // Ensure data is always an array
      setContractTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching contract types:', error);
      toast.error('Không thể tải danh sách loại hợp đồng');
      setContractTypes([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    reset({ name: '', description: '', is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (ct: ContractType) => {
    setEditingId(ct.id);
    reset({
      name: ct.name,
      description: ct.description || '',
      is_active: ct.is_active,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: ContractTypeForm) => {
    try {
      if (editingId) {
        await contractTypeRepo.update(editingId, data);
        toast.success('Đã cập nhật loại hợp đồng');
      } else {
        await contractTypeRepo.create(data);
        toast.success('Đã thêm loại hợp đồng');
      }
      setDialogOpen(false);
      await fetchData();
    } catch {
      toast.error(editingId ? 'Cập nhật thất bại' : 'Thêm thất bại');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa loại hợp đồng này?')) return;
    try {
      await contractTypeRepo.delete(id);
      toast.success('Đã xóa loại hợp đồng');
      await fetchData();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Quản lý loại hợp đồng</Typography>
        <Button startIcon={<Add />} onClick={openCreate} variant="contained">
          Thêm mới
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên loại hợp đồng</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(!contractTypes || contractTypes.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="text.secondary">Chưa có loại hợp đồng nào</Typography>
                  </TableCell>
                </TableRow>
              )}
              {contractTypes && contractTypes.map((ct) => (
                <TableRow key={ct.id}>
                  <TableCell>{ct.name}</TableCell>
                  <TableCell>{ct.description || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={ct.is_active ? 'Hoạt động' : 'Ngừng hoạt động'}
                      color={ct.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Sửa">
                      <IconButton size="small" onClick={() => openEdit(ct)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton size="small" onClick={() => handleDelete(ct.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Sửa loại hợp đồng' : 'Thêm loại hợp đồng mới'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Tên loại hợp đồng"
              {...register('name', { required: 'Bắt buộc' })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            <TextField
              fullWidth
              label="Mô tả"
              multiline
              rows={3}
              {...register('description')}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Hoạt động:</Typography>
              <Chip
                label={watch('is_active') ? 'Có' : 'Không'}
                color={watch('is_active') ? 'success' : 'default'}
                onClick={() => setValue('is_active', !watch('is_active'))}
                sx={{ cursor: 'pointer' }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button onClick={() => setDialogOpen(false)} disabled={isSubmitting}>Hủy</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {editingId ? 'Cập nhật' : 'Thêm'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
