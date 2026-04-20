'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';

interface LoginForm {
  username: string;
  password: string;
}

const ROLE_HOME: Record<string, string> = {
  admin: '/admin',
  manager: '/manager',
  staff: '/staff',
  accountant: '/accountant',
};

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginForm>();

  // Redirect when user state updates (after login or if already logged in)
  useEffect(() => {
    if (user) {
      router.push(ROLE_HOME[user.role] || '/staff');
    }
  }, [user, router]);

  // Redirect when user state updates (after login or if already logged in)
  useEffect(() => {
    if (user) {
      router.push(ROLE_HOME[user.role] || '/staff');
    }
  }, [user, router]);

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data);
      // redirect is handled by the useEffect above when user state updates
    } catch {
      setError('username', { message: 'Sai tên đăng nhập hoặc mật khẩu' });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
      }}
    >
      <Card sx={{ width: 400, maxWidth: '90vw' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} textAlign="center" mb={3}>
            Quản Lý Công Việc
          </Typography>

          {errors.username && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errors.username.message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Tên đăng nhập"
              fullWidth
              margin="normal"
              {...register('username', { required: 'Bắt buộc' })}
              error={!!errors.username}
              helperText={errors.username?.message}
              required
              autoFocus
            />
            <TextField
              label="Mật khẩu"
              type="password"
              fullWidth
              margin="normal"
              {...register('password', { required: 'Bắt buộc' })}
              error={!!errors.password}
              helperText={errors.password?.message}
              required
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 2 }}
            >
              {isSubmitting ? <CircularProgress size={24} /> : 'Đăng nhập'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
