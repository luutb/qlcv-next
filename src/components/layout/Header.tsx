'use client';

import {
  AppBar, Toolbar, IconButton, Box, Badge, Tooltip,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { useFcmNotification } from '@/hooks/useFcmNotification';
import { DRAWER_WIDTH } from './Sidebar';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { logout } = useAuth();
  const { unreadCount } = useNotification();

  useFcmNotification();

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
        bgcolor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(12px)',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={onMenuToggle}
          sx={{ mr: 1, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Thông báo">
            <IconButton
              component={Link}
              href="/staff/notifications"
              size="small"
              sx={{
                bgcolor: '#F1F5F9',
                '&:hover': { bgcolor: '#E2E8F0' },
              }}
            >
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsNoneIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Đăng xuất">
            <IconButton
              onClick={logout}
              size="small"
              sx={{
                bgcolor: '#F1F5F9',
                '&:hover': { bgcolor: '#FEE2E2', color: '#DC2626' },
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
