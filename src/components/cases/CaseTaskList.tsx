'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Grid,
  TextField,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Divider,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { CaseTaskResponse, TaskStatus } from '@/types/case.types';

// TODO: Replace with real API call to get user details

interface CaseTaskListProps {
  caseId: string;
  tasks: CaseTaskResponse[];
  onCreateTask?: () => void;
  onUpdateTaskStatus?: (taskId: string, status: TaskStatus) => void;
  onDeleteTask?: (taskId: string) => void;
  onTaskClick?: (task: CaseTaskResponse) => void;
  readonly?: boolean;
}

export default function CaseTaskList({
  caseId,
  tasks,
  onCreateTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onTaskClick,
  readonly = false,
}: CaseTaskListProps) {
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'due_date' | 'title'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<CaseTaskResponse | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, task: CaseTaskResponse) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleStatusChange = (status: TaskStatus) => {
    if (selectedTask && onUpdateTaskStatus) {
      onUpdateTaskStatus(selectedTask.id, status);
    }
    handleMenuClose();
  };

  const handleDeleteTask = () => {
    if (selectedTask && onDeleteTask) {
      onDeleteTask(selectedTask.id);
    }
    handleMenuClose();
  };

  const getFilteredAndSortedTasks = () => {
    let filtered = [...tasks];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(lowerSearchTerm) ||
        (task.description && task.description.toLowerCase().includes(lowerSearchTerm))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'due_date':
          if (!a.due_date && !b.due_date) comparison = 0;
          else if (!a.due_date) comparison = 1;
          else if (!b.due_date) comparison = -1;
          else comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
        case 'created_at':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const getStatusInfo = (status: TaskStatus) => {
    const statusMap = {
      todo: { label: 'Cần làm', color: 'default' as const, icon: <PendingIcon fontSize="small" /> },
      in_progress: { label: 'Đang làm', color: 'info' as const, icon: <AssignmentIcon fontSize="small" /> },
      review: { label: 'Đang xem', color: 'warning' as const, icon: <FilterListIcon fontSize="small" /> },
      done: { label: 'Hoàn thành', color: 'success' as const, icon: <CheckCircleIcon fontSize="small" /> },
      blocked: { label: 'Bị chặn', color: 'error' as const, icon: <PendingIcon fontSize="small" /> },
    };
    return statusMap[status];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getUserById = (userId?: number) => {
    if (!userId) return null;
    // TODO: Replace with actual API call
    return { id: userId, name: `User ${userId}`, email: `user${userId}@example.com` };
  };

  const filteredTasks = getFilteredAndSortedTasks();

  return (
    <>
      <Card>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" component="h2">
                Công việc ({filteredTasks.length}/{tasks.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {Object.keys(getStatusInfo('todo')).map((status) => {
                  const statusKey = status as TaskStatus;
                  const count = tasks.filter(t => t.status === statusKey).length;
                  if (count === 0) return null;
                  const info = getStatusInfo(statusKey);
                  return (
                    <Chip
                      key={statusKey}
                      label={`${info.label}: ${count}`}
                      size="small"
                      color={info.color}
                      variant={filterStatus === statusKey ? 'filled' : 'outlined'}
                      onClick={() => setFilterStatus(filterStatus === statusKey ? 'all' : statusKey)}
                      sx={{ cursor: 'pointer' }}
                    />
                  );
                })}
              </Box>
            </Box>

            {!readonly && onCreateTask && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={onCreateTask}
              >
                Thêm công việc
              </Button>
            )}
          </Box>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm kiếm công việc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sắp xếp</InputLabel>
                <Select
                  value={sortBy}
                  label="Sắp xếp"
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <MenuItem value="created_at">Ngày tạo</MenuItem>
                  <MenuItem value="due_date">Hạn chót</MenuItem>
                  <MenuItem value="title">Tên</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Thứ tự</InputLabel>
                <Select
                  value={sortOrder}
                  label="Thứ tự"
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                >
                  <MenuItem value="desc">Mới nhất</MenuItem>
                  <MenuItem value="asc">Cũ nhất</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Task List */}
          {filteredTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {searchTerm || filterStatus !== 'all'
                  ? 'Không tìm thấy công việc nào'
                  : 'Chưa có công việc nào'}
              </Typography>
              {!readonly && onCreateTask && (
                <Button
                  variant="text"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={onCreateTask}
                  sx={{ mt: 1 }}
                >
                  Thêm công việc đầu tiên
                </Button>
              )}
            </Box>
          ) : (
            <Box>
              {filteredTasks.map((task, index) => {
                const statusInfo = getStatusInfo(task.status);
                const assignee = getUserById(task.assignee_id);
                const overdue = task.due_date && isOverdue(task.due_date) && task.status !== 'done';

                return (
                  <React.Fragment key={task.id}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: overdue ? 'error.main' : 'divider',
                        borderRadius: 1,
                        bgcolor: overdue ? 'error.50' : 'transparent',
                        cursor: onTaskClick ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 1,
                          borderColor: 'primary.main',
                        },
                      }}
                      onClick={() => onTaskClick && onTaskClick(task)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {statusInfo.icon}
                            <Typography variant="subtitle1" fontWeight="medium">
                              {task.title}
                            </Typography>
                          </Box>

                          {task.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {task.description}
                            </Typography>
                          )}

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Chip
                              icon={statusInfo.icon}
                              label={statusInfo.label}
                              size="small"
                              color={statusInfo.color}
                            />

                            {task.due_date && (
                              <Chip
                                icon={<CalendarIcon fontSize="small" />}
                                label={`Hạn: ${formatDate(task.due_date)}`}
                                size="small"
                                color={overdue ? 'error' : 'default'}
                                variant={overdue ? 'filled' : 'outlined'}
                              />
                            )}

                            {assignee && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                  sx={{ width: 24, height: 24, fontSize: 12 }}
                                >
                                  {assignee.name.charAt(0)}
                                </Avatar>
                                <Typography variant="caption" color="text.secondary">
                                  {assignee.name}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>

                        {!readonly && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMenuClick(e, task);
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                    {index < filteredTasks.length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Task Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 1 }}>
          Đổi trạng thái:
        </Typography>
        <MenuItem onClick={() => handleStatusChange('todo')}>
          <PendingIcon fontSize="small" sx={{ mr: 1 }} /> Cần làm
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('in_progress')}>
          <AssignmentIcon fontSize="small" sx={{ mr: 1 }} /> Đang làm
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('review')}>
          <FilterListIcon fontSize="small" sx={{ mr: 1 }} /> Đang xem
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('done')}>
          <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} /> Hoàn thành
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange('blocked')}>
          <PendingIcon fontSize="small" sx={{ mr: 1 }} /> Bị chặn
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteTask} sx={{ color: 'error.main' }}>
          Xóa công việc
        </MenuItem>
      </Menu>
    </>
  );
}
