'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Paper, Typography, TextField, Button, MenuItem,
  CircularProgress, Divider, Grid,
} from '@mui/material';
import { ArrowBack, PersonAdd } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { userRepo } from '@/repositories/UserRepo';
import { Role, CreateUserRequest } from '@/types';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'manager', label: 'Quản lý' },
  { value: 'staff', label: 'Nhân viên' },
  { value: 'accountant', label: 'Kế toán' },
];

const GENDER_OPTIONS = [
  { value: '', label: 'Chưa chọn' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    phone: '',
    role: 'staff' as Role,
    department: '',
    position: '',
    address: '',
    date_of_birth: '',
    gender: '',
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.username.trim()) errs.username = 'Tên đăng nhập không được để trống';
    if (form.username.length > 50) errs.username = 'Tối đa 50 ký tự';
    if (!form.password) errs.password = 'Mật khẩu không được để trống';
    if (form.password.length < 6) errs.password = 'Mật khẩu ít nhất 6 ký tự';
    if (!form.full_name.trim()) errs.full_name = 'Họ tên không được để trống';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Email không hợp lệ';
    }
    if (!form.role) errs.role = 'Vui lòng chọn vai trò';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload: CreateUserRequest = {
        username: form.username.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        role: form.role,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        department: form.department.trim() || undefined,
        position: form.position.trim() || undefined,
        address: form.address.trim() || undefined,
        date_of_birth: form.date_of_birth || undefined,
        gender: (form.gender as CreateUserRequest['gender']) || undefined,
      };

      await userRepo.create(payload);
      toast.success('Tạo người dùng thành công');
      router.push('/admin/users');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Tạo người dùng thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.back()}>Quay lại</Button>
        <Typography variant="h5" fontWeight="bold">Thêm người dùng mới</Typography>
      </Box>

      <Paper sx={{ p: 4, maxWidth: 800 }}>
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" fontWeight={600} mb={2}>Thông tin tài khoản</Typography>
          <Grid container spacing={2.5} mb={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Tên đăng nhập" fullWidth required
                value={form.username} onChange={set('username')}
                error={!!errors.username} helperText={errors.username}
                slotProps={{ htmlInput: { maxLength: 50 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Mật khẩu" type="password" fullWidth required
                value={form.password} onChange={set('password')}
                error={!!errors.password} helperText={errors.password}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select label="Vai trò" fullWidth required
                value={form.role} onChange={set('role')}
                error={!!errors.role} helperText={errors.role}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight={600} mb={2}>Thông tin cá nhân</Typography>
          <Grid container spacing={2.5} mb={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Họ và tên" fullWidth required
                value={form.full_name} onChange={set('full_name')}
                error={!!errors.full_name} helperText={errors.full_name}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email" type="email" fullWidth
                value={form.email} onChange={set('email')}
                error={!!errors.email} helperText={errors.email}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Số điện thoại" fullWidth value={form.phone} onChange={set('phone')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select label="Giới tính" fullWidth
                value={form.gender} onChange={set('gender')}
              >
                {GENDER_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Ngày sinh" type="date" fullWidth
                value={form.date_of_birth} onChange={set('date_of_birth')}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Địa chỉ" fullWidth value={form.address} onChange={set('address')} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight={600} mb={2}>Thông tin công việc</Typography>
          <Grid container spacing={2.5} mb={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Phòng ban" fullWidth value={form.department} onChange={set('department')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Chức vụ" fullWidth value={form.position} onChange={set('position')} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Button
            type="submit" variant="contained" size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PersonAdd />}
            disabled={loading}
          >
            Tạo người dùng
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
