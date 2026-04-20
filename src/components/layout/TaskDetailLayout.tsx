'use client';

import { Box, Toolbar } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useState } from 'react';

export default function TaskDetailLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuToggle = () => setMobileOpen((prev) => !prev);
  const handleMobileClose = () => setMobileOpen(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={handleMobileClose} />
      <Header onMenuToggle={handleMenuToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
