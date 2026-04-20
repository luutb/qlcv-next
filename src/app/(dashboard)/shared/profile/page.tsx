'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  Typography, Box, Paper, TextField, Button, Avatar,
  Grid, Alert, Divider, MenuItem, CircularProgress, Tabs, Tab,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '@/contexts/AuthContext';
import { userRepo } from '@/repositories/user.repo';
import { UserDetail } from '@/types';
import CertificateSection from '@/components/users/CertificateSection';
import EducationSection from '@/components/users/EducationSection';
import apiClient from '@/api/client';
import toast from 'react-hot-toast';

interface ProfileForm {
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
}

interface ChangePasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị viên',
  manager: 'Quản lý',
  staff: 'Nhân viên',
  accountant: 'Kế toán',
};

const GENDER_OPTIONS = [
  { value: '', label: 'Chưa chọn' },
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
];

const GENDER_LABELS: Record<string, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserDetail | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [tab, setTab] = useState(0);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
    reset: resetProfile,
  } = useForm<ProfileForm>({
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      address: '',
      date_of_birth: '',
      gender: undefined,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    reset: resetPassword,
    setError: setPasswordError,
  } = useForm<ChangePasswordForm>();

  const [savingProfile, setSavingProfile] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingPw, setLoadingPw] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await userRepo.getMe();
      setProfile(data);
      resetProfile({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        date_of_birth: data.date_of_birth?.split('T')[0] || '',
        gender: data.gender || undefined,
      });
    } catch {
      // Fallback: just use basic user info from context
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [resetProfile]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const onSubmitProfile = async (data: ProfileForm) => {
    if (!data.full_name.trim()) {
      toast.error('Họ tên không được để trống');
      return;
    }
    setSavingProfile(true);
    try {
      await userRepo.updateProfile({
        full_name: data.full_name.trim(),
        email: data.email?.trim() || undefined,
        phone: data.phone?.trim() || undefined,
        address: data.address?.trim() || undefined,
        date_of_birth: data.date_of_birth || undefined,
        gender: data.gender || undefined,
      });
      toast.success('Cập nhật thông tin thành công');
      fetchProfile();
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setSavingProfile(false);
    }
  };

  const onSubmitPassword = async (data: ChangePasswordForm) => {
    setMessage(null);

    if (data.new_password !== data.confirm_password) {
      setPasswordError('confirm_password', { message: 'Mật khẩu xác nhận không khớp.' });
      return;
    }
    if (data.new_password.length < 6) {
      setPasswordError('new_password', { message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }

    setLoadingPw(true);
    try {
      await apiClient.put('/auth/change-password', {
        current_password: data.current_password,
        new_password: data.new_password,
      });
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công.' });
      resetPassword();
    } catch {
      setMessage({ type: 'error', text: 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.' });
    } finally {
      setLoadingPw(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Thông tin cá nhân
      </Typography>

      {/* User Info Card */}
      <Paper sx={{ p: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 3 }} elevation={2}>
        <Avatar
          src={profile?.avatar_url}
          sx={{ width: 72, height: 72, bgcolor: 'primary.main' }}
        >
          {user?.full_name ? user.full_name.charAt(0) : <PersonIcon sx={{ fontSize: 36 }} />}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            {profile?.full_name || user?.full_name}
          </Typography>
          <Typography color="text.secondary">
            @{user?.username} &middot; {user ? ROLE_LABELS[user.role] || user.role : ''}
          </Typography>
          {profile && (
            <Box sx={{ display: 'flex', gap: 3, mt: 0.5, flexWrap: 'wrap' }}>
              {profile.email && <Typography variant="caption" color="text.secondary">{profile.email}</Typography>}
              {profile.phone && <Typography variant="caption" color="text.secondary">{profile.phone}</Typography>}
              {profile.department && <Typography variant="caption" color="text.secondary">{profile.department}</Typography>}
              {profile.position && <Typography variant="caption" color="text.secondary">{profile.position}</Typography>}
              {profile.gender && <Typography variant="caption" color="text.secondary">{GENDER_LABELS[profile.gender]}</Typography>}
            </Box>
          )}
        </Box>
      </Paper>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Chỉnh sửa thông tin" />
        <Tab label={`Bằng cấp & Chứng chỉ (${profile?.certificates?.length || 0})`} />
        <Tab label={`Học vấn (${profile?.educations?.length || 0})`} />
        <Tab label="Đổi mật khẩu" />
      </Tabs>

      {/* Tab 0: Edit Profile */}
      {tab === 0 && (
        <Paper sx={{ p: 3 }} elevation={2}>
          {loadingProfile ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <Box component="form" onSubmit={handleSubmitProfile(onSubmitProfile)}>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Họ và tên" fullWidth required {...registerProfile('full_name', { required: 'Bắt buộc' })}
                    error={!!profileErrors.full_name} helperText={profileErrors.full_name?.message} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Email" type="email" fullWidth {...registerProfile('email')} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Số điện thoại" fullWidth {...registerProfile('phone')} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField select label="Giới tính" fullWidth {...registerProfile('gender')}>
                    {GENDER_OPTIONS.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Ngày sinh" type="date" fullWidth {...registerProfile('date_of_birth')}
                    slotProps={{ inputLabel: { shrink: true } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Địa chỉ" fullWidth {...registerProfile('address')} />
                </Grid>
              </Grid>
              <Button
                type="submit"
                variant="contained" sx={{ mt: 3 }}
                startIcon={isSubmittingProfile ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={isSubmittingProfile}
              >
                Lưu thay đổi
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Tab 1: Certificates */}
      {tab === 1 && (
        <Paper sx={{ p: 3 }} elevation={2}>
          {loadingProfile ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <CertificateSection
              certificates={profile?.certificates || []}
              onAdd={async (data) => { await userRepo.createProfileCertificate(data); fetchProfile(); }}
              onUpdate={async (certId, data) => { await userRepo.updateProfileCertificate(certId, data); fetchProfile(); }}
              onDelete={async (certId) => { await userRepo.deleteProfileCertificate(certId); fetchProfile(); }}
            />
          )}
        </Paper>
      )}

      {/* Tab 2: Educations */}
      {tab === 2 && (
        <Paper sx={{ p: 3 }} elevation={2}>
          {loadingProfile ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <EducationSection
              educations={profile?.educations || []}
              onAdd={async (data) => { await userRepo.createProfileEducation(data); fetchProfile(); }}
              onUpdate={async (eduId, data) => { await userRepo.updateProfileEducation(eduId, data); fetchProfile(); }}
              onDelete={async (eduId) => { await userRepo.deleteProfileEducation(eduId); fetchProfile(); }}
            />
          )}
        </Paper>
      )}

      {/* Tab 3: Change Password */}
      {tab === 3 && (
        <Paper sx={{ p: 3 }} elevation={2}>
          <Typography variant="h6" fontWeight={600} mb={2}>Đổi mật khẩu</Typography>

          {message && (
            <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmitPassword(onSubmitPassword)}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Mật khẩu hiện tại" type="password" fullWidth
                  {...registerPassword('current_password', { required: 'Bắt buộc' })}
                  error={!!passwordErrors.current_password} helperText={passwordErrors.current_password?.message} required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }} />
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Mật khẩu mới" type="password" fullWidth
                  {...registerPassword('new_password', { required: 'Bắt buộc' })}
                  error={!!passwordErrors.new_password} helperText={passwordErrors.new_password?.message} required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Xác nhận mật khẩu mới" type="password" fullWidth
                  {...registerPassword('confirm_password', { required: 'Bắt buộc' })}
                  error={!!passwordErrors.confirm_password} helperText={passwordErrors.confirm_password?.message} required />
              </Grid>
            </Grid>
            <Button type="submit" variant="contained" disabled={isSubmittingPassword} sx={{ mt: 2 }}>
              {isSubmittingPassword ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
