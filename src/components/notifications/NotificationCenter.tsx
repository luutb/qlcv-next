'use client';

import {
  Box, Typography, Paper, List, ListItem, ListItemText,
  ListItemIcon, ListItemSecondaryAction, IconButton, Badge,
  Chip, Divider, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, Collapse,
} from '@mui/material';
import {
  Notifications,
  Markunread,
  MarkunreadMailbox,
  Delete,
  Close,
  Email,
  PushPin,
  Info,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useState } from 'react';

interface Notification {
  id: number;
  title: string;
  body: string;
  type: 'task_update' | 'contract_expiry' | 'payment_reminder' | 'system' | 'workflow_update';
  is_read: boolean;
  created_at: string;
  reference_id?: number;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead?: (notificationId: number) => Promise<void>;
  onMarkAllRead?: () => Promise<void>;
  onDelete?: (notificationId: number) => Promise<void>;
  onDeleteAll?: () => Promise<void>;
}

const TYPE_ICONS = {
  task_update: <Info fontSize="small" />,
  contract_expiry: <Warning fontSize="small" />,
  payment_reminder: <CheckCircle fontSize="small" />,
  system: <PushPin fontSize="small" />,
  workflow_update: <Info fontSize="small" />,
};

const TYPE_COLORS: Record<string, 'error' | 'default' | 'primary' | 'secondary' | 'success' | 'info' | 'warning'> = {
  task_update: 'info',
  contract_expiry: 'warning',
  payment_reminder: 'success',
  system: 'primary',
  workflow_update: 'info',
};

const TYPE_LABELS = {
  task_update: 'Cập nhật hồ sơ',
  contract_expiry: 'Hết hạn hợp đồng',
  payment_reminder: 'Nhắc nhở thanh toán',
  system: 'Hệ thống',
  workflow_update: 'Cập nhật quy trình',
};

export default function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onDeleteAll,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (notificationId: number) => {
    if (onMarkRead) {
      await onMarkRead(notificationId);
    }
  };

  const handleMarkAllRead = async () => {
    if (onMarkAllRead) {
      await onMarkAllRead();
    }
  };

  const handleDelete = async (notificationId: number) => {
    if (onDelete) {
      await onDelete(notificationId);
    }
  };

  const handleDeleteAll = async () => {
    if (onDeleteAll) {
      await onDeleteAll();
    }
  };

  const handleOpenNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setOpen(true);
    handleMarkRead(notification.id);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedNotification(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Hôm nay';
    } else if (days === 1) {
      return 'Hôm qua';
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  return (
    <Box>
      <Badge badgeContent={unreadCount} color="error">
        <IconButton onClick={() => setOpen(true)} color="inherit">
          <Notifications />
        </IconButton>
      </Badge>

      {/* Notification List Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Notifications fontSize="small" />
              <Typography variant="h6">Thông báo</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  startIcon={<Markunread />}
                  onClick={handleMarkAllRead}
                >
                  Đánh dấu đã đọc
                </Button>
              )}
              <Button
                size="small"
                color="error"
                startIcon={<Delete />}
                onClick={handleDeleteAll}
                disabled={notifications.length === 0}
              >
                Xóa tất cả
              </Button>
              <IconButton onClick={handleClose}>
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <MarkunreadMailbox fontSize="large" color="action" sx={{ mb: 2 }} />
              <Typography color="text.secondary">
                Không có thông báo nào
              </Typography>
            </Box>
          ) : (
            <List>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    bgcolor: notification.is_read ? 'background.paper' : 'action.hover',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                  onClick={() => handleOpenNotification(notification)}
                >
                  <ListItemIcon>
                    <Chip
                      icon={TYPE_ICONS[notification.type]}
                      label={TYPE_LABELS[notification.type]}
                      size="small"
                      color={TYPE_COLORS[notification.type]}
                      variant="outlined"
                    />
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        fontWeight={notification.is_read ? 400 : 600}
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography
                          variant="caption"
                          color={notification.is_read ? 'text.secondary' : 'text.primary'}
                        >
                          {notification.body}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {formatDate(notification.created_at)}
                        </Typography>
                      </Box>
                    }
                  />

                  {!notification.is_read && (
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkRead(notification.id);
                        }}
                      >
                        <Markunread fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Detail Dialog */}
      <Dialog
        open={!!selectedNotification}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        {selectedNotification && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={TYPE_ICONS[selectedNotification.type]}
                  label={TYPE_LABELS[selectedNotification.type]}
                  size="small"
                  color={TYPE_COLORS[selectedNotification.type]}
                />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {selectedNotification.title}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" paragraph>
                  {selectedNotification.body}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  {new Date(selectedNotification.created_at).toLocaleString('vi-VN')}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Đóng</Button>
              {onDelete && (
                <Button
                  color="error"
                  onClick={() => {
                    handleDelete(selectedNotification.id);
                    handleClose();
                  }}
                >
                  Xóa
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
