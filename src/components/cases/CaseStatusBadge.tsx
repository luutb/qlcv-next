'use client';

import React from 'react';
import { Chip } from '@mui/material';
import { CaseStatus } from '@/types/case.types';

interface CaseStatusBadgeProps {
  status: CaseStatus;
  size?: 'small' | 'medium';
}

const statusConfig: Record<CaseStatus, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error' }> = {
  open: { label: 'Mới', color: 'primary' },
  in_progress: { label: 'Đang xử lý', color: 'warning' },
  closed: { label: 'Đã đóng', color: 'success' },
};

export default function CaseStatusBadge({ status, size = 'small' }: CaseStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant="outlined"
    />
  );
}
