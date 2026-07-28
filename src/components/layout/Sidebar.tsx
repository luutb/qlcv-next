'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Box, Avatar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TaskIcon from '@mui/icons-material/TaskAlt';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ContactsIcon from '@mui/icons-material/Contacts';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import FolderIcon from '@mui/icons-material/Folder';
import SecurityIcon from '@mui/icons-material/Security';
import TimelineIcon from '@mui/icons-material/Timeline';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ViewKanbanIcon from '@mui/icons-material/ViewKanban';
import LabelIcon from '@mui/icons-material/Label';
import { Role } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  authorizedRoles: Role[];
}

const ROLE_HOME: Record<string, string> = {
  admin: '/admin',
  manager: '/manager',
  staff: '/staff',
  accountant: '/accountant',
};

const MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon />, authorizedRoles: ['admin', 'manager', 'staff', 'accountant'] },
  { label: 'Bảng công việc', path: '/board', icon: <ViewKanbanIcon />, authorizedRoles: ['admin', 'manager', 'staff'] },
  { label: 'Quản lý hồ sơ (Cases)', path: '/cases', icon: <AssignmentIcon />, authorizedRoles: ['admin', 'manager', 'staff'] },
  { label: 'Quản lý người dùng', path: '/admin/users', icon: <PeopleIcon />, authorizedRoles: ['admin'] },
  { label: 'Quản lý Labels', path: '/admin/labels', icon: <LabelIcon />, authorizedRoles: ['admin', 'manager'] },
  { label: 'Cấu hình hệ thống', path: '/admin/settings', icon: <SettingsIcon />, authorizedRoles: ['admin'] },
];

const DRAWER_WIDTH = 270;

function filterMenuByRole(items: MenuItem[], role: Role): MenuItem[] {
  return items.filter((item) => item.authorizedRoles.includes(role));
}

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // Don't render anything while loading to prevent hydration mismatch
  if (isLoading || !user) {
    return null;
  }

  const visibleItems = filterMenuByRole(MENU_ITEMS, user.role);

  const drawerContent = (
    <>
      {/* Logo / Brand */}
      <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 38, height: 38, borderRadius: 2.5,
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Q</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E293B', lineHeight: 1.2 }}>
            QLCV
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: 11 }}>
            Quản lý công việc
          </Typography>
        </Box>
      </Box>

      {/* User info */}
      <Box sx={{ mx: 2, mb: 2, p: 1.5, borderRadius: 3, bgcolor: '#F1F5F9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{
            width: 34, height: 34, fontSize: 14,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          }}>
            {user.full_name.charAt(0)}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} noWrap>{user.full_name}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {ROLE_LABELS[user.role] || user.role}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ overflow: 'auto', flex: 1, px: 1 }}>
        <Typography variant="overline" sx={{ px: 2, mb: 0.5, display: 'block', color: '#94A3B8', fontSize: 10, letterSpacing: 1.2 }}>
          Menu
        </Typography>
        <List disablePadding>
          {visibleItems.map((item) => {
            const isDashboard = Object.values(ROLE_HOME).includes(item.path);
            const isActive = isDashboard
              ? pathname === item.path
              : pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <ListItemButton
                key={item.path}
                component={Link}
                href={item.path}
                selected={isActive}
                onClick={onMobileClose}
                sx={{ py: 1, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: isActive ? 600 : 400 }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </>
  );

  const drawerPaperSx = {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box' as const,
    bgcolor: '#FAFBFD',
  };

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': drawerPaperSx,
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': drawerPaperSx,
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị viên',
  manager: 'Quản lý',
  staff: 'Nhân viên',
  accountant: 'Kế toán',
};

export { DRAWER_WIDTH };
