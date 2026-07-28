import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, LoginResponse, LoginData } from '@/api/services/auth.service';
import { User, LoginForm } from '@/types';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get user from localStorage/cookies as fallback until backend /auth/me is ready
  const getUserFromStorage = (): User | null => {
    if (!mounted) return null; // Prevent hydration mismatch
    
    try {
      const userStr = Cookies.get('user') || (typeof window !== 'undefined' ? localStorage.getItem('user') : null);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  // Get current user
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      // For now, just return the stored user data until backend is ready
      const storedUser = getUserFromStorage();
      if (!storedUser) {
        throw new Error('No user data found');
      }
      return storedUser;
    },
    enabled: mounted && !!Cookies.get('token'), // Only enable if mounted and we have a token
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    initialData: undefined, // Don't use initial data to prevent hydration mismatch
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginForm) => {
      // Convert LoginForm to LoginData for API
      const loginData: LoginData = {
        username: credentials.username,
        password: credentials.password
      };
      return authService.login(loginData);
    },
    onSuccess: (response) => {
      console.log('Login success response:', response);
      const { token, refresh_token, user } = response;
      
      console.log('Setting cookies and localStorage...');
      // Store tokens
      Cookies.set('token', token, { sameSite: 'Lax' });
      Cookies.set('refresh_token', refresh_token, { sameSite: 'Lax' });
      Cookies.set('user', JSON.stringify(user), { sameSite: 'Lax' });
      Cookies.set('role', user.role, { sameSite: 'Lax' });
      
      localStorage.setItem('token', token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', user.role);

      console.log('Cookies set:', {
        token: Cookies.get('token'),
        role: Cookies.get('role'),
        user: Cookies.get('user')
      });

      // Update query cache
      queryClient.setQueryData(['auth', 'user'], user);
      
      console.log('Redirecting based on role...');
      // Redirect directly to role-specific page
      setTimeout(() => {
        console.log('Executing redirect...');
        const roleHome = {
          admin: '/admin',
          manager: '/manager', 
          staff: '/staff',
          accountant: '/accountant'
        };
        const targetUrl = roleHome[user.role as keyof typeof roleHome] || '/staff';
        console.log('Redirecting to:', targetUrl);
        window.location.href = targetUrl;
      }, 200);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear tokens and cache
      Cookies.remove('token');
      Cookies.remove('refresh_token');
      Cookies.remove('user');
      Cookies.remove('role');
      
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');

      queryClient.clear();
      
      // Redirect to login
      router.push('/login');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      // Force logout even if API call fails
      Cookies.remove('token');
      Cookies.remove('refresh_token');
      Cookies.remove('user');
      Cookies.remove('role');
      
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');

      queryClient.clear();
      router.push('/login');
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<User>) => authService.updateProfile(data),
    onSuccess: (response) => {
      const updatedUser = response;
      
      // Update cookies and localStorage
      Cookies.set('user', JSON.stringify(updatedUser), { sameSite: 'Lax' });
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update query cache
      queryClient.setQueryData(['auth', 'user'], updatedUser);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => authService.changePassword(data),
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (data: {
      token: string;
      password: string;
      confirmPassword: string;
    }) => authService.resetPassword(data),
    onSuccess: () => {
      router.push('/login');
    },
  });

  const isAuthenticated = !!user && !!Cookies.get('token');

  return {
    // Data
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    changePassword: changePasswordMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isSendingResetEmail: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,

    // Errors
    loginError: loginMutation.error,
    updateProfileError: updateProfileMutation.error,
    changePasswordError: changePasswordMutation.error,
    forgotPasswordError: forgotPasswordMutation.error,
    resetPasswordError: resetPasswordMutation.error,
  };
};

export default useAuth;