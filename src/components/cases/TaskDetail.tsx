'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import { CaseTaskResponse, TaskStatus } from '@/types/case.types';
import TaskStatusToggle from './TaskStatusToggle';
import CreateTaskForm from './CreateTaskForm';

// TODO: Replace with real API call to get user details

interface TaskDetailProps {
  open: boolean;
  task: CaseTaskResponse | null;
  onClose: () => void;
  onUpdateStatus?: (taskId: string, status: TaskStatus) => Promise<void>;
  onUpdateTask?: (taskId: string, data: any) => Promise<void>;
  onDeleteTask?: (taskId: string) => Promise<void>;
  readonly?: boolean;
}

interface EditTaskData {
  title: string;
  description: string;
  assignee_id: number | null;
  due_date: string | null;
}

export default function TaskDetail({
  open,
  task,
  onClose,
  onUpdateStatus,
  onUpdateTask,
  onDeleteTask,
  readonly = false,
}: TaskDetailProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task || !onUpdateStatus) return;

    try {
      setLoading(true);
      setError(null);
      await onUpdateStatus(task.id, newStatus);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      const errorMessage = err.response?.data?.message || 'Không thể cập nhật trạng thái';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !onDeleteTask) return;

    try {
      setLoading(true);
      setError(null);
      await onDeleteTask(task.id);
      setDeleteConfirmOpen(false);
      onClose();
    } catch (err: any) {
      console.error('Failed to delete task:', err);
      const errorMessage = err.response?.data?.message || 'Không thể xóa công việc';
      setError(errorMessage);
      setDeleteConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleUpdateTask = async (data: any) => {
    if (!task || !onUpdateTask) return;

    try {
      setLoading(true);
      setError(null);
      await onUpdateTask(task.id, data);
      setEditMode(false);
    } catch (err: any) {
      console.error('Failed to update task:', err);
      const errorMessage = err.response?.data?.message || 'Không thể cập nhật công việc';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getUserById = (userId?: number) => {
    if (!userId) return null;
    // TODO: Replace with actual API call
    return { id: userId, name: `User ${userId}`, email: `user${userId}@example.com` };
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (!task) return null;

  const assignee = getUserById(task.assignee_id);
  const overdue = task.due_date && isOverdue(task.due_date) && task.status !== 'done';

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '80vh', maxHeight: '80vh' },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h2">
                Chi tiết công việc
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Tạo lúc: {formatDate(task.created_at)}
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pb: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Title and Status */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {task.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <TaskStatusToggle
                      currentStatus={task.status}
                      onStatusChange={handleStatusChange}
                      disabled={readonly || loading}
                      size="medium"
                    />
                    {task.due_date && (
                      <Chip
                        icon={<CalendarToday fontSize="small" />}
                        label={`Hạn: ${new Date(task.due_date).toLocaleDateString('vi-VN')}`}
                        size="small"
                        color={overdue ? 'error' : 'default'}
                        variant={overdue ? 'filled' : 'outlined'}
                      />
                    )}
                  </Box>
                </Box>

                {!readonly && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={handleEdit}
                      disabled={loading}
                    >
                      Chỉnh sửa
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteConfirmOpen(true)}
                      disabled={loading}
                    >
                      Xóa
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DescriptionIcon fontSize="small" color="action" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Mô tả
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {task.description || 'Không có mô tả'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Assignee */}
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Người thực hiện
                    </Typography>
                  </Box>
                  {assignee ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {assignee.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">{assignee.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {assignee.email}
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Chưa phân công
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Timeline */}
            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <UpdateIcon fontSize="small" color="action" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Thời gian
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      <strong>Ngày tạo:</strong> {formatDate(task.created_at)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Cập nhật:</strong> {formatDate(task.updated_at)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Due Date Warning */}
            {overdue && (
              <Grid item xs={12}>
                <Alert severity="error">
                  <Typography variant="body2">
                    <strong>Cảnh báo:</strong> Công việc này đã quá hạn ({new Date(task.due_date!).toLocaleDateString('vi-VN')})
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !loading && setDeleteConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận xóa công việc</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Bạn có chắc chắn muốn xóa công việc "{task.title}"?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Hành động này không thể hoàn tác. Tất cả thông tin về công việc sẽ bị mất vĩnh viễn.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {loading ? 'Đang xóa...' : 'Xóa công việc'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Form Dialog */}
      {editMode && task && (
        <CreateTaskForm
          open={editFormOpen}
          onClose={() => {
            setEditFormOpen(false);
            setEditMode(false);
          }}
          onSubmit={handleUpdateTask}
          caseId={task.case_id}
          caseMembers={[]}
        />
      )}
    </>
  );
}
