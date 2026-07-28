'use client';

import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  Paper,
} from '@mui/material';

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
  size?: number;
  fullscreen?: boolean;
}

export function LoadingOverlay({
  open,
  message = 'Đang tải...',
  size = 40,
  fullscreen = true,
}: LoadingOverlayProps) {
  if (fullscreen) {
    return (
      <Backdrop
        open={open}
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.tooltip + 1,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={size} sx={{ mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#fff' }}>
            {message}
          </Typography>
        </Box>
      </Backdrop>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3,
        minHeight: 200,
      }}
    >
      {open && (
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={size} sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

interface InlineLoadingProps {
  message?: string;
  size?: number;
}

export function InlineLoading({ message = 'Đang tải...', size = 24 }: InlineLoadingProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
      <CircularProgress size={size} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  loadingText?: string;
}

export function ButtonLoading({
  loading,
  children,
  disabled = false,
  onClick,
  loadingText = 'Đang xử lý...',
}: ButtonLoadingProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        background: loading ? '#9e9e9e' : 'linear-gradient(135deg, #1976d2, #1565c0)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: 500,
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {loading && (
        <CircularProgress size={16} sx={{ color: 'white' }} />
      )}
      {loading ? loadingText : children}
    </button>
  );
}

interface PageLoadingProps {
  message?: string;
}

export function PageLoading({ message = 'Đang tải...' }: PageLoadingProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
        }}
      >
        <CircularProgress size={48} sx={{ mb: 3 }} />
        <Typography variant="h6" gutterBottom>
          {message}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vui lòng đợi trong giây lát...
        </Typography>
      </Paper>
    </Box>
  );
}

export default LoadingOverlay;
