'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Folder as CasesIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface ResponsiveAppBarProps {
  title: string;
  onMenuClick?: () => void;
  children?: React.ReactNode;
}

const DRAWER_WIDTH = 280;

export function ResponsiveAppBar({ title, onMenuClick, children }: ResponsiveAppBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: 'primary.main',
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            fontSize: isMobile ? '1rem' : '1.25rem',
          }}
        >
          {title}
        </Typography>
        {children && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {children}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

interface NavigationProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Navigation({ mobileOpen, onClose }: NavigationProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { icon: <DashboardIcon />, label: 'Dashboard', path: '/' },
    { icon: <CasesIcon />, label: 'Hồ sơ', path: '/cases' },
    { icon: <UsersIcon />, label: 'Người dùng', path: '/users' },
    { icon: <SettingsIcon />, label: 'Cài đặt', path: '/settings' },
  ];

  const drawerContent = (
    <Box>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" noWrap>
          QLCV
        </Typography>
        <Typography variant="caption">
          Quản lý Công Việc
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              component="a"
              href={item.path}
              onClick={isMobile ? onClose : undefined}
              sx={{
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: DRAWER_WIDTH,
          borderRight: '1px solid rgba(0,0,0,0.12)',
        },
      }}
      open
    >
      {drawerContent}
    </Drawer>
  );
}

export default ResponsiveAppBar;
