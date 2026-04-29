'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Chip, Avatar, Paper,
} from '@mui/material';
import { PersonAdd, Person, SwapHoriz } from '@mui/icons-material';
import { User, Role } from '@/types';
import { taskRepo } from '@/repositories/TaskRepo';
import toast from 'react-hot-toast';

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Quản trị viên',
  manager: 'Quản lý',
  staff: 'Nhân viên',
  accountant: 'Kế toán',
};

interface AssignSectionProps {
  taskId: string;
  assignee?: { id: number; full_name: string } | null;
  requiredRole: Role;
  onAssigned: () => void;
}

export default function AssignSection({ taskId, assignee, requiredRole, onAssigned }: AssignSectionProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    taskRepo.getUsers()
      .then((allUsers) => {
        // Backend yêu cầu assignee.role === config.requiredRole (exact match)
        const filtered = allUsers.filter(
          (u) => u.is_active !== false && u.role === requiredRole,
        );
        setUsers(filtered);
      })
      .catch(() => toast.error('Không thể tải danh sách người dùng'))
      .finally(() => setLoading(false));
  }, [open, requiredRole]);

  const handleAssign = async () => {
    if (!selectedUserId) return;
    setSubmitting(true);
    try {
      await taskRepo.assignTask(taskId, selectedUserId);
      toast.success('Đã phân công thành công');
      setOpen(false);
      setSelectedUserId('');
      onAssigned();
    } catch {
      toast.error('Phân công thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          Phân công xử lý
        </Typography>

        {assignee ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{
              width: 40, height: 40,
              background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              fontSize: 16, fontWeight: 700,
            }}>
              {assignee.full_name.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight={600}>{assignee.full_name}</Typography>
              <Typography variant="caption" color="text.secondary">
                Đang xử lý bước này
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<SwapHoriz />}
              onClick={() => setOpen(true)}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Đổi
            </Button>
          </Box>
        ) : (
          <Box
            onClick={() => setOpen(true)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 2,
              p: 2, borderRadius: 3, cursor: 'pointer',
              border: '2px dashed',
              borderColor: '#E2E8F0',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: '#F8FAFF',
              },
            }}
          >
            <Avatar sx={{ width: 40, height: 40, bgcolor: '#F1F5F9', color: '#94A3B8' }}>
              <PersonAdd fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Chưa phân công
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Bấm để chọn {ROLE_LABELS[requiredRole].toLowerCase()} xử lý
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>Phân công người xử lý</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Bước hiện tại yêu cầu:{' '}
            <Chip
              label={ROLE_LABELS[requiredRole]}
              size="small"
              sx={{ bgcolor: '#EEF2FF', color: '#4338CA', fontWeight: 600 }}
            />
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <FormControl fullWidth>
              <InputLabel>Chọn người xử lý</InputLabel>
              <Select
                value={selectedUserId}
                label="Chọn người xử lý"
                onChange={(e) => setSelectedUserId(e.target.value as number)}
              >
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                      <Avatar sx={{
                        width: 30, height: 30, fontSize: 13,
                        background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                      }}>
                        {u.full_name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>{u.full_name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
                {users.length === 0 && (
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      Không có {ROLE_LABELS[requiredRole].toLowerCase()} nào
                    </Typography>
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={!selectedUserId || submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <Person />}
          >
            Phân công
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
