'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Typography, Paper, TextField, Button, MenuItem,
  Grid, Avatar, Chip, Divider, CircularProgress, Alert, Tabs, Tab,
} from '@mui/material';
import { ArrowBack, Save, Block, CheckCircle } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { userRepo } from '@/repositories/user.repo';
import { UserDetail, Role } from '@/types';
import CertificateSection from '@/components/users/CertificateSection';
import EducationSection from '@/components/users/EducationSection';

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

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(0);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: '' as Role,
    department: '',
    position: '',
    address: '',
    date_of_birth: '',
    gender: '',
  });

  const fetchUser = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await userRepo.getById(Number(id));
      // Handle cả trường hợp BE trả { data: user } hoặc user trực tiếp
      const data: UserDetail = (res && typeof res === 'object' && 'username' in res) ? res : (res as unknown as { data: UserDetail }).data ?? res;
      setUser(data);
      setForm({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        role: data.role,
        department: data.department || '',
        position: data.position || '',
        address: data.address || '',
        date_of_birth: data.date_of_birth?.split('T')[0] || '',
        gender: data.gender || '',
      });
    } catch (err) {
      console.error('Fetch user error:', err);
      toast.error('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchUser();
  }, [id, fetchUser]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.full_name.trim()) { toast.error('Họ tên không được để trống'); return; }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        full_name: form.full_name.trim(),
        role: form.role,
      };
      if (form.email.trim()) payload.email = form.email.trim(); else payload.email = '';
      if (form.phone.trim()) payload.phone = form.phone.trim(); else payload.phone = '';
      if (form.department.trim()) payload.department = form.department.trim(); else payload.department = '';
      if (form.position.trim()) payload.position = form.position.trim(); else payload.position = '';
      if (form.address.trim()) payload.address = form.address.trim(); else payload.address = '';
      if (form.date_of_birth) payload.date_of_birth = form.date_of_birth; else payload.date_of_birth = '';
      if (form.gender) payload.gender = form.gender; else payload.gender = '';

      await userRepo.update(Number(id), payload as Parameters<typeof userRepo.update>[1]);
      toast.success('Cập nhật thành công');
      fetchUser();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!user) return;
    try {
      await userRepo.toggleActive(user.id);
      toast.success(user.is_active ? 'Đã vô hiệu hóa tài khoản' : 'Đã kích hoạt tài khoản');
      fetchUser();
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Alert severity="error">Không tìm thấy người dùng.</Alert>;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/admin/users')}>Quay lại</Button>
        <Typography variant="h5" fontWeight="bold" sx={{ flex: 1 }}>Chi tiết người dùng</Typography>
        <Button
          variant="outlined"
          color={user.is_active !== false ? 'warning' : 'success'}
          startIcon={user.is_active !== false ? <Block /> : <CheckCircle />}
          onClick={handleToggleActive}
        >
          {user.is_active !== false ? 'Vô hiệu hóa' : 'Kích hoạt'}
        </Button>
      </Box>

      {/* User summary card */}
      <Paper sx={{ p: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
        <Avatar
          src={user.avatar_url}
          sx={{ width: 72, height: 72, fontSize: 28, bgcolor: 'primary.main' }}
        >
          {user.full_name?.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" fontWeight={700}>{user.full_name}</Typography>
            <Chip
              label={user.is_active !== false ? 'Hoạt động' : 'Vô hiệu hóa'}
              color={user.is_active !== false ? 'success' : 'default'}
              size="small"
            />
          </Box>
          <Typography color="text.secondary">
            @{user.username} &middot; {ROLE_OPTIONS.find((r) => r.value === user.role)?.label || user.role}
          </Typography>
          {user.last_login_at && (
            <Typography variant="caption" color="text.secondary">
              Đăng nhập lần cuối: {new Date(user.last_login_at).toLocaleString('vi-VN')}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Thông tin" />
        <Tab label={`Bằng cấp & Chứng chỉ (${user.certificates?.length || 0})`} />
        <Tab label={`Học vấn (${user.educations?.length || 0})`} />
      </Tabs>

      {/* Tab 0: Info */}
      {tab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Thông tin cá nhân</Typography>
          <Grid container spacing={2.5} mb={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Họ và tên" fullWidth value={form.full_name} onChange={set('full_name')} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Tên đăng nhập" fullWidth value={user.username} disabled />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Email" type="email" fullWidth value={form.email} onChange={set('email')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Số điện thoại" fullWidth value={form.phone} onChange={set('phone')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Giới tính" fullWidth value={form.gender} onChange={set('gender')}>
                {GENDER_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Ngày sinh" type="date" fullWidth value={form.date_of_birth} onChange={set('date_of_birth')}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField label="Địa chỉ" fullWidth value={form.address} onChange={set('address')} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" fontWeight={600} mb={2}>Thông tin công việc</Typography>
          <Grid container spacing={2.5} mb={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select label="Vai trò" fullWidth value={form.role} onChange={set('role')}>
                {ROLE_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Phòng ban" fullWidth value={form.department} onChange={set('department')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Chức vụ" fullWidth value={form.position} onChange={set('position')} />
            </Grid>
          </Grid>

          <Button
            variant="contained" startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
            onClick={handleSave} disabled={saving}
          >
            Lưu thay đổi
          </Button>
        </Paper>
      )}

      {/* Tab 1: Certificates */}
      {tab === 1 && (
        <Paper sx={{ p: 3 }}>
          <CertificateSection
            certificates={user.certificates || []}
            onAdd={async (data) => { await userRepo.createCertificate(user.id, data); fetchUser(); }}
            onUpdate={async (certId, data) => { await userRepo.updateCertificate(user.id, certId, data); fetchUser(); }}
            onDelete={async (certId) => { await userRepo.deleteCertificate(user.id, certId); fetchUser(); }}
          />
        </Paper>
      )}

      {/* Tab 2: Educations */}
      {tab === 2 && (
        <Paper sx={{ p: 3 }}>
          <EducationSection
            educations={user.educations || []}
            onAdd={async (data) => { await userRepo.createEducation(user.id, data); fetchUser(); }}
            onUpdate={async (eduId, data) => { await userRepo.updateEducation(user.id, eduId, data); fetchUser(); }}
            onDelete={async (eduId) => { await userRepo.deleteEducation(user.id, eduId); fetchUser(); }}
          />
        </Paper>
      )}
    </Box>
  );
}
