'use client';

import {
  Box,
  Chip,
  Avatar,
  Autocomplete,
  TextField,
  Typography,
} from '@mui/material';
import { useState, useEffect } from 'react';

interface User {
  id: number;
  full_name: string;
  email?: string;
  avatar?: string;
}

interface TaskAssigneesProps {
  value: User[];
  onChange: (users: User[]) => void;
  disabled?: boolean;
}

export default function TaskAssignees({
  value,
  onChange,
  disabled = false,
}: TaskAssigneesProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users?active=true');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Assignees
      </Typography>
      
      <Autocomplete
        multiple
        options={users}
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
        getOptionLabel={(option) => option.full_name}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        loading={loading}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Select assignees"
            variant="outlined"
          />
        )}
        renderTags={(tagValue, getTagProps) =>
          tagValue.map((option, index) => (
            <Chip
              {...getTagProps({ index })}
              key={option.id}
              avatar={
                <Avatar
                  src={option.avatar}
                  alt={option.full_name}
                  sx={{ width: 24, height: 24 }}
                >
                  {option.full_name.charAt(0)}
                </Avatar>
              }
              label={option.full_name}
              size="small"
            />
          ))
        }
        renderOption={(props, option) => (
          <Box component="li" {...props} display="flex" alignItems="center" gap={1}>
            <Avatar
              src={option.avatar}
              alt={option.full_name}
              sx={{ width: 32, height: 32 }}
            >
              {option.full_name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2">{option.full_name}</Typography>
              {option.email && (
                <Typography variant="caption" color="text.secondary">
                  {option.email}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      />
    </Box>
  );
}
