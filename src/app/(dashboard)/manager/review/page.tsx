'use client';

import { Typography, Box } from '@mui/material';

export default function ReviewTasksPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Duyệt task
      </Typography>
      <Typography color="text.secondary">
        Danh sách task cần duyệt sẽ hiển thị ở đây.
      </Typography>
    </Box>
  );
}
