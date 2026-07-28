'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Chip,
  Avatar,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  role?: string;
  department?: string;
}

interface UserSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  excludeUserIds?: number[];
  filterRole?: string;
  placeholder?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
}

// TODO: Replace with real API call to get users
const mockUsers: User[] = [
  // This should be replaced with actual API call
];

export default function UserSelect({
  value,
  onChange,
  label = 'Chọn thành viên',
  error,
  helperText,
  required = false,
  disabled = false,
  excludeUserIds = [],
  filterRole,
  placeholder = 'Chọn thành viên...',
  fullWidth = true,
  size = 'medium',
}: UserSelectProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, [excludeUserIds, filterRole]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Filter users
      let filteredUsers = [...mockUsers];

      // Exclude specified user IDs
      if (excludeUserIds.length > 0) {
        filteredUsers = filteredUsers.filter(user => !excludeUserIds.includes(user.id));
      }

      // Filter by role if specified
      if (filterRole) {
        filteredUsers = filteredUsers.filter(user => user.role === filterRole);
      }

      setUsers(filteredUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = () => {
    if (!searchTerm) {
      return users;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return users.filter(user =>
      user.name.toLowerCase().includes(lowerSearchTerm) ||
      user.email.toLowerCase().includes(lowerSearchTerm) ||
      (user.department && user.department.toLowerCase().includes(lowerSearchTerm))
    );
  };

  const getRoleLabel = (role?: string) => {
    const roleMap: Record<string, string> = {
      lawyer: 'Luật sư',
      support: 'Hỗ trợ',
      admin: 'Quản trị viên',
      manager: 'Quản lý',
      staff: 'Nhân viên',
      accountant: 'Kế toán',
    };
    return role ? (roleMap[role] || role) : '';
  };

  const getRoleColor = (role?: string) => {
    const colorMap: Record<string, any> = {
      lawyer: 'primary',
      support: 'default',
      admin: 'error',
      manager: 'warning',
      staff: 'info',
      accountant: 'success',
    };
    return role ? (colorMap[role] || 'default') : 'default';
  };

  const selectedUser = users.find(user => user.id.toString() === value);

  return (
    <TextField
      select
      fullWidth={fullWidth}
      size={size}
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      helperText={helperText}
      required={required}
      disabled={disabled || loading}
      placeholder={placeholder}
      InputProps={{
        startAdornment: selectedUser && (
          <Avatar
            src={selectedUser.avatar_url}
            sx={{ width: 24, height: 24, mr: 1, fontSize: 12 }}
          >
            {selectedUser.name.charAt(0)}
          </Avatar>
        ),
      }}
      SelectProps={{
        MenuProps: {
          PaperProps: {
            style: { maxHeight: 400 },
          },
        },
        displayEmpty: true,
        renderValue: (selected) => {
          if (!selected) {
            return <Typography color="text.secondary">{placeholder}</Typography>;
          }
          const user = users.find(u => u.id.toString() === selected);
          if (!user) return placeholder;

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={user.avatar_url}
                sx={{ width: 24, height: 24, fontSize: 12 }}
              >
                {user.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body2">{user.name}</Typography>
                {user.email && (
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        },
      }}
    >
      <MenuItem disabled value="">
        <Typography color="text.secondary">
          {loading ? 'Đang tải...' : placeholder}
        </Typography>
      </MenuItem>

      {/* Search Field inside Menu */}
      <MenuItem disabled sx={{ bgcolor: 'grey.50' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          autoFocus
        />
      </MenuItem>

      {getFilteredUsers().length === 0 ? (
        <MenuItem disabled value="">
          <Typography color="text.secondary">
            {searchTerm ? 'Không tìm thấy kết quả' : 'Không có thành viên nào'}
          </Typography>
        </MenuItem>
      ) : (
        getFilteredUsers().map((user) => (
          <MenuItem key={user.id} value={user.id.toString()}>
            <ListItemIcon>
              <Avatar
                src={user.avatar_url}
                sx={{ width: 32, height: 32 }}
              >
                {user.name.charAt(0)}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">{user.name}</Typography>
                  {user.role && (
                    <Chip
                      label={getRoleLabel(user.role)}
                      size="small"
                      color={getRoleColor(user.role)}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                  {user.department && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      • {user.department}
                    </Typography>
                  )}
                </Box>
              }
            />
          </MenuItem>
        ))
      )}
    </TextField>
  );
}
