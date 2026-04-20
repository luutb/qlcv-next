'use client';

import { Typography, Box } from '@mui/material';

export default function UserSettingsPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Cài đặt
      </Typography>
      <Typography color="text.secondary">
        Cài đặt cá nhân sẽ hiển thị ở đây.
      </Typography>
    </Box>
  );
}
