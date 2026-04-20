'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Box, Typography, TextField, MenuItem, InputAdornment,
  Paper, Button, Chip, Avatar, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockResetIcon from '@mui/icons-material/LockReset';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UserDetail, Role } from '@/types';
import { userRepo } from '@/repositories/user.repo';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị viên',
  manager: 'Quản lý',
  staff: 'Nhân viên',
  accountant: 'Kế toán',
};

const ROLE_COLORS: Record<string, 'error' | 'primary' | 'success' | 'warning'> = {
  admin: 'error',
  manager: 'primary',
  staff: 'success',
  accountant: 'warning',
};

const ROLE_OPTIONS = [
  { value: '', label: 'Tất cả vai trò' },
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'manager', label: 'Quản lý' },
  { value: 'staff', label: 'Nhân viên' },
  { value: 'accountant', label: 'Kế toán' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'true', label: 'Đang hoạt động' },
  { value: 'false', label: 'Đã vô hiệu hóa' },
];

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  // Reset password dialog
  const [resetDialog, setResetDialog] = useState<{ open: boolean; user: UserDetail | null }>({ open: false, user: null });
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [roleFilter, statusFilter, debouncedKeyword]);

  const queryParams = useMemo(() => ({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    role: (roleFilter as Role) || undefined,
    is_active: statusFilter === '' ? undefined : statusFilter === 'true',
    search: debouncedKeyword || undefined,
  }), [paginationModel, roleFilter, statusFilter, debouncedKeyword]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userRepo.getAll(queryParams);
      setUsers(res.data);
      setTotal(res.pagination.total);
    } catch {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleActive = async (user: UserDetail) => {
    try {
      await userRepo.toggleActive(user.id);
      toast.success(user.is_active ? 'Đã vô hiệu hóa tài khoản' : 'Đã kích hoạt tài khoản');
      fetchUsers();
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const handleResetPassword = async () => {
    if (!resetDialog.user || !newPassword) return;
    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setResetLoading(true);
    try {
      await userRepo.resetPassword(resetDialog.user.id, newPassword);
      toast.success('Đã reset mật khẩu thành công');
      setResetDialog({ open: false, user: null });
      setNewPassword('');
    } catch {
      toast.error('Reset mật khẩu thất bại');
    } finally {
      setResetLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 60 },
    {
      field: 'full_name',
      headerName: 'Họ tên',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={params.row.avatar_url}
            sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.main' }}
          >
            {params.row.full_name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>{params.row.full_name}</Typography>
            <Typography variant="caption" color="text.secondary">@{params.row.username}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'role',
      headerName: 'Vai trò',
      width: 140,
      renderCell: (params) => (
        <Chip
          label={ROLE_LABELS[params.value] || params.value}
          color={ROLE_COLORS[params.value] || 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    { field: 'email', headerName: 'Email', width: 200, valueGetter: (_v: unknown, row: UserDetail) => row.email || '—' },
    { field: 'phone', headerName: 'SĐT', width: 130, valueGetter: (_v: unknown, row: UserDetail) => row.phone || '—' },
    { field: 'department', headerName: 'Phòng ban', width: 150, valueGetter: (_v: unknown, row: UserDetail) => row.department || '—' },
    {
      field: 'is_active',
      headerName: 'Trạng thái',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value !== false ? 'Hoạt động' : 'Vô hiệu hóa'}
          color={params.value !== false ? 'success' : 'default'}
          size="small"
          variant="filled"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Ngày tạo',
      width: 120,
      valueFormatter: (value: string) => value ? new Date(value).toLocaleDateString('vi-VN') : '—',
    },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Chỉnh sửa">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); router.push(`/admin/users/${params.row.id}`); }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.is_active !== false ? 'Vô hiệu hóa' : 'Kích hoạt'}>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleToggleActive(params.row); }}
              color={params.row.is_active !== false ? 'warning' : 'success'}>
              {params.row.is_active !== false ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset mật khẩu">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setResetDialog({ open: true, user: params.row }); }}>
              <LockResetIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Quản lý người dùng
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => router.push('/admin/users/create')}>
          Thêm người dùng
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          select label="Vai trò" value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          size="small" sx={{ minWidth: 160 }}
        >
          {ROLE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>

        <TextField
          select label="Trạng thái" value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small" sx={{ minWidth: 180 }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>

        <TextField
          label="Tìm kiếm" value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          size="small" sx={{ minWidth: 280 }}
          placeholder="Tên, username, email, SĐT..."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
              ),
            },
          }}
        />
      </Paper>

      {/* Data Grid */}
      <Paper sx={{ width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          rowCount={total}
          loading={loading}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight
          onRowClick={(params) => router.push(`/admin/users/${params.id}`)}
          sx={{
            border: 0,
            cursor: 'pointer',
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50', fontWeight: 700 },
          }}
        />
      </Paper>

      {/* Reset Password Dialog */}
      <Dialog open={resetDialog.open} onClose={() => { setResetDialog({ open: false, user: null }); setNewPassword(''); }}>
        <DialogTitle>Reset mật khẩu</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Đặt mật khẩu mới cho <strong>{resetDialog.user?.full_name}</strong> (@{resetDialog.user?.username})
          </Typography>
          <TextField
            label="Mật khẩu mới" type="password" fullWidth
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            slotProps={{ htmlInput: { minLength: 6 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setResetDialog({ open: false, user: null }); setNewPassword(''); }}>Hủy</Button>
          <Button variant="contained" onClick={handleResetPassword} disabled={resetLoading || !newPassword}>
            {resetLoading ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
