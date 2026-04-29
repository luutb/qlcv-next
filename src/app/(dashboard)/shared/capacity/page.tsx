'use client';

import { Box, Typography } from '@mui/material';
import UserCapacitySettings from '@/components/users/UserCapacitySettings';

export default function UserCapacityPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Cài đặt Capacity
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Quản lý khả năng làm việc và sở thích của bạn để hệ thống có thể gợi ý task phù hợp.
      </Typography>
      
      <UserCapacitySettings />
    </Box>
  );
}