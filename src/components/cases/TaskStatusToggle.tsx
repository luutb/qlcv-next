'use client';

import React, { useState } from 'react';
import {
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Assignment as AssignmentIcon,
  FilterList as FilterListIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import { TaskStatus } from '@/types/case.types';

interface TaskStatusToggleProps {
  currentStatus: TaskStatus;
  onStatusChange: (newStatus: TaskStatus) => Promise<void>;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

const statusConfig = {
  todo: {
    label: 'Cần làm',
    color: 'default' as const,
    icon: <PendingIcon fontSize="small" />,
    description: 'Công việc chưa được bắt đầu',
  },
  in_progress: {
    label: 'Đang làm',
    color: 'info' as const,
    icon: <AssignmentIcon fontSize="small" />,
    description: 'Công việc đang được thực hiện',
  },
  review: {
    label: 'Đang xem',
    color: 'warning' as const,
    icon: <FilterListIcon fontSize="small" />,
    description: 'Công việc đang được xem xét',
  },
  done: {
    label: 'Hoàn thành',
    color: 'success' as const,
    icon: <CheckCircleIcon fontSize="small" />,
    description: 'Công việc đã hoàn thành',
  },
  blocked: {
    label: 'Bị chặn',
    color: 'error' as const,
    icon: <PendingIcon fontSize="small" />,
    description: 'Công việc đang gặp vấn đề',
  },
};

const statusTransitions: Record<TaskStatus, TaskStatus[]> = {
  todo: ['in_progress', 'blocked'],
  in_progress: ['todo', 'review', 'done', 'blocked'],
  review: ['in_progress', 'done', 'blocked'],
  done: ['in_progress', 'review', 'todo'],
  blocked: ['todo', 'in_progress'],
};

export default function TaskStatusToggle({
  currentStatus,
  onStatusChange,
  disabled = false,
  size = 'small',
}: TaskStatusToggleProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; newStatus: TaskStatus | null }>({
    open: false,
    newStatus: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusClick = (newStatus: TaskStatus) => {
    handleClose();

    // Check if transition is allowed
    const allowedTransitions = statusTransitions[currentStatus];
    if (!allowedTransitions.includes(newStatus)) {
      setError(`Không thể chuyển từ "${statusConfig[currentStatus].label}" sang "${statusConfig[newStatus].label}"`);
      return;
    }

    // Require confirmation for certain transitions
    if (newStatus === 'done' || newStatus === 'blocked') {
      setConfirmDialog({ open: true, newStatus });
    } else {
      executeStatusChange(newStatus);
    }
  };

  const executeStatusChange = async (newStatus: TaskStatus) => {
    try {
      setLoading(true);
      setError(null);
      await onStatusChange(newStatus);
    } catch (err: any) {
      console.error('Failed to change status:', err);
      const errorMessage = err.response?.data?.message || 'Không thể thay đổi trạng thái';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmChange = async () => {
    if (confirmDialog.newStatus) {
      await executeStatusChange(confirmDialog.newStatus);
    }
    setConfirmDialog({ open: false, newStatus: null });
  };

  const handleCancelConfirm = () => {
    setConfirmDialog({ open: false, newStatus: null });
  };

  const currentConfig = statusConfig[currentStatus];
  const allowedStatuses = statusTransitions[currentStatus];

  return (
    <>
      <Box sx={{ display: 'inline-flex' }}>
        <Chip
          icon={currentConfig.icon}
          label={currentConfig.label}
          color={currentConfig.color}
          size={size}
          variant="outlined"
          onClick={handleClick}
          deleteIcon={<ArrowDropDownIcon />}
          onDelete={handleClick}
          disabled={disabled || loading}
          sx={{
            cursor: disabled ? 'not-allowed' : 'pointer',
            '& .MuiChip-deleteIcon': {
              marginLeft: 0,
              marginRight: '-4px',
            },
          }}
        />
      </Box>

      {/* Status Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Chuyển sang trạng thái:
          </Typography>
        </Box>

        {Object.entries(statusConfig).map(([status, config]) => {
          const statusKey = status as TaskStatus;
          const isAllowed = allowedStatuses.includes(statusKey);
          const isCurrent = statusKey === currentStatus;

          if (!isAllowed && !isCurrent) return null;

          return (
            <MenuItem
              key={status}
              onClick={() => handleStatusClick(statusKey)}
              disabled={isCurrent || loading}
              selected={isCurrent}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {config.icon}
                <Box>
                  <Typography variant="body2">
                    {config.label}
                    {isCurrent && ' (hiện tại)'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {config.description}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          );
        })}
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleCancelConfirm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {confirmDialog.newStatus === 'done'
            ? 'Xác nhận hoàn thành công việc'
            : 'Xác nhận đánh dấu bị chặn'}
        </DialogTitle>
        <DialogContent>
          {confirmDialog.newStatus === 'done' ? (
            <Typography>
              Bạn có chắc chắn muốn đánh dấu công việc này là đã hoàn thành?
              Sau khi hoàn thành, bạn vẫn có thể thay đổi trạng thái nếu cần.
            </Typography>
          ) : (
            <>
              <Typography gutterBottom>
                Bạn có chắc chắn muốn đánh dấu công việc này là bị chặn?
              </Typography>
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Công việc bị chặn sẽ cần sự chú ý và có thể ảnh hưởng đến tiến độ chung.
                </Typography>
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelConfirm}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmChange}
            variant="contained"
            color={confirmDialog.newStatus === 'done' ? 'success' : 'error'}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Đang cập nhật...' : confirmDialog.newStatus === 'done' ? 'Hoàn thành' : 'Đánh dấu chặn'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mt: 1 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
    </>
  );
}
