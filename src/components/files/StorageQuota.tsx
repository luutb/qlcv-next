'use client';

import { Box, Typography, Paper, LinearProgress, Chip, Alert } from '@mui/material';

interface StorageQuota {
  used_bytes: number;
  limit_bytes: number;
  percentage_used: number;
  last_updated: string;
}

interface StorageQuotaProps {
  quota: StorageQuota;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export default function StorageQuota({ quota }: StorageQuotaProps) {
  const isAlmostFull = quota.percentage_used >= 90;
  const isFull = quota.percentage_used >= 100;

  const getProgressColor = () => {
    if (isFull) return 'error';
    if (isAlmostFull) return 'warning';
    return 'primary';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6">Bộ nhớ lưu trữ</Typography>
        <Chip
          label={`${quota.percentage_used.toFixed(1)}%`}
          size="small"
          color={getProgressColor()}
        />
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Đã sử dụng: {formatFileSize(quota.used_bytes)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Giới hạn: {formatFileSize(quota.limit_bytes)}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={quota.percentage_used}
          color={getProgressColor()}
          sx={{ height: 12, borderRadius: 1, mb: 2 }}
        />

        {isFull ? (
          <Alert severity="error">
            Bạn đã đạt giới hạn lưu trữ. Vui lòng xóa bớt file để tiếp tục sử dụng.
          </Alert>
        ) : isAlmostFull ? (
          <Alert severity="warning">
            Bạn đang gần đạt giới hạn lưu trữ. Vui lòng xóa bớt file.
          </Alert>
        ) : (
          <Alert severity="info" sx={{ fontSize: 12 }}>
            Bạn còn {formatFileSize(quota.limit_bytes - quota.used_bytes)} trống
          </Alert>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          Cập nhật lần cuối: {new Date(quota.last_updated).toLocaleDateString('vi-VN')}
        </Typography>
      </Paper>
    </Box>
  );
}
