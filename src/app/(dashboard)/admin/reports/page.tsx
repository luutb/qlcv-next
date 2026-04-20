'use client';

import { Typography, Box } from '@mui/material';

export default function ReportsPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Báo cáo doanh thu
      </Typography>
      <Typography color="text.secondary">
        Báo cáo chi tiết sẽ hiển thị ở đây.
      </Typography>
    </Box>
  );
}
