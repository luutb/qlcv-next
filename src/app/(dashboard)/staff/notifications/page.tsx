'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Paper, Button, IconButton, Chip,
  TextField, MenuItem, Tooltip, CircularProgress,
  List, ListItemButton, ListItemIcon, ListItemText,
  Divider,
} from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import UndoIcon from '@mui/icons-material/Undo';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PaymentIcon from '@mui/icons-material/Payment';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import CircleIcon from '@mui/icons-material/Circle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Notification } from '@/types';
import { notificationRepo } from '@/repositories/notification.repo';
import { useNotification } from '@/contexts/NotificationContext';

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  NEXT_STEP: { icon: <ArrowForwardIcon />, color: '#4F46E5', label: 'Chuyển bước' },
  REJECT: { icon: <UndoIcon />, color: '#DC2626', label: 'Từ chối' },
  ASSIGN: { icon: <PersonAddIcon />, color: '#059669', label: 'Phân công' },
  PAYMENT: { icon: <PaymentIcon />, color: '#D97706', label: 'Thanh toán' },
  UPLOAD: { icon: <UploadFileIcon />, color: '#7C3AED', label: 'Upload' },
  SYSTEM: { icon: <InfoIcon />, color: '#64748B', label: 'Hệ thống' },
  TASK_ASSIGNED: { icon: <PersonAddIcon />, color: '#059669', label: 'Phân công' },
  TASK_UPDATED: { icon: <ArrowForwardIcon />, color: '#4F46E5', label: 'Cập nhật' },
  TASK_REJECTED: { icon: <UndoIcon />, color: '#DC2626', label: 'Từ chối' },
  TASK_COMPLETED: { icon: <CheckCircleIcon />, color: '#059669', label: 'Hoàn tất' },
  PAYMENT_CONFIRMED: { icon: <PaymentIcon />, color: '#D97706', label: 'Thanh toán' },
  APPROVE: { icon: <CheckCircleIcon />, color: '#059669', label: 'Phê duyệt' },
  APPROVAL: { icon: <CheckCircleIcon />, color: '#059669', label: 'Phê duyệt' },
};

const FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'unread', label: 'Chưa đọc' },
  { value: 'read', label: 'Đã đọc' },
];

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

const LIMIT = 20;

export default function NotificationsPage() {
  const router = useRouter();
  const { refreshUnreadCount, markAllRead: markAllReadCtx } = useNotification();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [readFilter, setReadFilter] = useState('');

  const fetchNotifications = useCallback(async (p: number, append = false) => {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const res = await notificationRepo.getAll({
        page: p,
        limit: LIMIT,
        is_read: readFilter === 'read' ? true : readFilter === 'unread' ? false : undefined,
      });
      if (append) {
        setNotifications((prev) => [...prev, ...res.data]);
      } else {
        setNotifications(res.data);
      }
      setTotal(res.pagination.total);
    } catch {
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [readFilter]);

  // Initial load & filter change
  useEffect(() => {
    setPage(1);
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  const hasMore = notifications.length < total;

  const handleMarkAsRead = async (notif: Notification) => {
    if (notif.is_read) return;
    try {
      await notificationRepo.markAsRead(notif.id);
      setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, is_read: true } : n));
      refreshUnreadCount();
    } catch {
      // silent
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationRepo.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      markAllReadCtx();
      toast.success('Đã đánh dấu tất cả đã đọc');
    } catch {
      toast.error('Thao tác thất bại');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await notificationRepo.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotal((prev) => prev - 1);
      refreshUnreadCount();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const handleClick = (notif: Notification) => {
    handleMarkAsRead(notif);
    if (notif.task_id) {
      router.push(`/shared/tasks/${notif.task_id}`);
    }
  };

  const unreadInView = notifications.filter((n) => !n.is_read).length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Thông báo</Typography>
          <Typography variant="body2" color="text.secondary">
            {total} thông báo{unreadInView > 0 && ` · ${unreadInView} chưa đọc`}
          </Typography>
        </Box>
        <Button
          variant="outlined" startIcon={<DoneAllIcon />}
          onClick={handleMarkAllRead} disabled={unreadInView === 0}
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </Box>

      {/* Filter */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          select label="Trạng thái" value={readFilter}
          onChange={(e) => setReadFilter(e.target.value)}
          size="small" sx={{ minWidth: 160 }}
        >
          {FILTER_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
      </Paper>

      {/* Notification List */}
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">Không có thông báo nào.</Typography>
          </Box>
        ) : (
          <>
            <List disablePadding>
              {notifications.map((notif, idx) => {
                const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.SYSTEM;
                return (
                  <Box key={notif.id}>
                    {idx > 0 && <Divider />}
                    <ListItemButton
                      onClick={() => handleClick(notif)}
                      sx={{
                        py: 2, px: 3,
                        bgcolor: notif.is_read ? 'transparent' : 'rgba(79, 70, 229, 0.04)',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 48 }}>
                        <Box sx={{
                          width: 38, height: 38, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: `${config.color}14`, color: config.color,
                        }}>
                          {config.icon}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {!notif.is_read && (
                              <CircleIcon sx={{ fontSize: 8, color: 'primary.main', flexShrink: 0 }} />
                            )}
                            <Typography component="span" variant="body2" fontWeight={notif.is_read ? 400 : 600} noWrap>
                              {notif.title}
                            </Typography>
                            <Chip label={config.label} size="small" variant="outlined"
                              sx={{ fontSize: 11, height: 20, color: config.color, borderColor: config.color, flexShrink: 0 }} />
                          </Box>
                        }
                        secondary={
                          <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                            <Typography component="span" variant="body2" color="text.secondary" sx={{
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mr: 2, flex: 1,
                            }}>
                              {notif.body}
                            </Typography>
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                              {formatRelativeTime(notif.created_at)}
                            </Typography>
                          </Box>
                        }
                      />
                      <Tooltip title="Xóa">
                        <IconButton size="small" onClick={(e) => handleDelete(e, notif.id)} sx={{ ml: 1 }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItemButton>
                  </Box>
                );
              })}
            </List>

            {hasMore && (
              <Box sx={{ py: 2, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
                <Button onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? <CircularProgress size={20} /> : 'Tải thêm'}
                </Button>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
