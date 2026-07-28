'use client';

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Divider,
  Chip,
  Avatar,
  AvatarGroup,
  Button,
  TextField,
  Paper,
  Stack,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  InsertEmoticon as MilestoneIcon,
  Flag as WeightIcon,
  AccessTime as TimeIcon,
  Comment as CommentIcon,
  History as HistoryIcon,
  Assignment as ActivityIcon,
  Send as SendIcon,
  Update as UpdateIcon,
  Create as CreateIcon,
} from '@mui/icons-material';
import { Task } from '@/types/board';

interface TaskSidebarProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit?: (task: Task) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default function TaskSidebar({ open, task, onClose, onEdit }: TaskSidebarProps) {
  const [tabValue, setTabValue] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (task) {
      setEditedTask(task);
    }
  }, [task]);

  const handleClose = () => {
    setTabValue(0);
    setNewComment('');
    setIsEditing(false);
    setEditedTask(null);
    onClose();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditClick = () => {
    if (onEdit && task) {
      onEdit(task);
    } else {
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    // TODO: Implement save logic
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (task) {
      setEditedTask(task);
    }
  };

  const handleSubmitComment = () => {
    // TODO: Implement comment submission
    setNewComment('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa có hạn';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDueDateColor = () => {
    if (!task?.due_date) return '#666';
    if (task.due_date_status === 'overdue') return '#db3b21';
    if (task.due_date_status === 'due_soon') return '#e75e40';
    return '#333';
  };

  if (!task) return null;

  const currentTask = isEditing && editedTask ? editedTask : task;
  const displayLabels = currentTask.labels?.custom_labels || [];
  const priorityLabel = currentTask.labels?.priority;
  const statusLabel = currentTask.labels?.task_status;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: '600px', md: '700px' },
          boxSizing: 'border-box',
        },
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fafbfc',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              {currentTask.confidential && (
                <LockIcon sx={{ fontSize: 18, color: '#666' }} />
              )}
              {isEditing ? (
                <TextField
                  value={currentTask.title}
                  onChange={(e) =>
                    setEditedTask({ ...currentTask, title: e.target.value })
                  }
                  size="small"
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    },
                  }}
                />
              ) : (
                <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
                  {currentTask.title}
                </Typography>
              )}
            </Box>

            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="caption" color="text.secondary">
                #{currentTask.issue_number}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                •
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentTask.status}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" gap={1}>
            {!isEditing && (
              <Tooltip title="Chỉnh sửa">
                <IconButton onClick={handleEditClick} size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Tabs */}
        <Box
          sx={{
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontSize: '0.875rem',
              },
            }}
          >
            <Tab
              label="Chi tiết"
              icon={<ActivityIcon fontSize="small" />}
              iconPosition="start"
            />
            <Tab
              label="Bình luận"
              icon={<CommentIcon fontSize="small" />}
              iconPosition="start"
            />
            <Tab
              label="Lịch sử"
              icon={<HistoryIcon fontSize="small" />}
              iconPosition="start"
            />
            <Tab
              label="Hoạt động"
              icon={<ActivityIcon fontSize="small" />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <TabPanel value={tabValue} index={0}>
            {/* Details Tab */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Description */}
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Mô tả
                </Typography>
                {isEditing ? (
                  <TextField
                    value={currentTask.description || ''}
                    onChange={(e) =>
                      setEditedTask({ ...currentTask, description: e.target.value })
                    }
                    multiline
                    rows={4}
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      },
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    {currentTask.description || 'Chưa có mô tả'}
                  </Typography>
                )}
              </Paper>

              {/* Labels */}
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Labels
                </Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {priorityLabel && (
                    <Chip
                      label={priorityLabel.name}
                      size="small"
                      sx={{
                        backgroundColor: priorityLabel.bg_color,
                        color: priorityLabel.color,
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {statusLabel && (
                    <Chip
                      label={statusLabel.name}
                      size="small"
                      sx={{
                        backgroundColor: statusLabel.bg_color,
                        color: statusLabel.color,
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {displayLabels.map((label) => (
                    <Chip
                      key={label.id}
                      label={label.name}
                      size="small"
                      sx={{
                        backgroundColor: label.bg_color,
                        color: label.color,
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Box>
              </Paper>

              {/* Assignees */}
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                  <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Người được giao
                  </Typography>
                </Box>
                {currentTask.assignees && currentTask.assignees.length > 0 ? (
                  <AvatarGroup max={5}>
                    {currentTask.assignees.map((assignee) => (
                      <Tooltip key={assignee.id} title={assignee.name}>
                        <Avatar src={assignee.avatar_url}>
                          {assignee.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </AvatarGroup>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Chưa có người được giao
                  </Typography>
                )}
              </Paper>

              {/* Due Date */}
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                  <CalendarIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Hạn chót
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: getDueDateColor(),
                    fontWeight:
                      currentTask.due_date_status !== 'none' ? 600 : 400,
                  }}
                >
                  {formatDueDate(currentTask.due_date)}
                </Typography>
              </Paper>

              {/* Milestone */}
              {currentTask.milestone && (
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    <MilestoneIcon
                      fontSize="small"
                      sx={{ color: 'text.secondary' }}
                    />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Milestone
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {currentTask.milestone.title}
                  </Typography>
                  {currentTask.milestone.due_date && (
                    <Typography variant="caption" color="text.secondary">
                      • {formatDueDate(currentTask.milestone.due_date)}
                    </Typography>
                  )}
                </Paper>
              )}

              {/* Weight */}
              {currentTask.weight > 0 && (
                <Paper
                  sx={{
                    p: 2,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    <WeightIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Story Points
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {currentTask.weight}
                  </Typography>
                </Paper>
              )}

              {/* Customer Info */}
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Khách hàng
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>{currentTask.customer.company_name}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {currentTask.customer.full_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentTask.customer.phone} • {currentTask.customer.email}
                </Typography>
              </Paper>

              {/* Timestamps */}
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                  <TimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Thời gian
                  </Typography>
                </Box>
                <Stack spacing={0.5}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <CreateIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Tạo: {formatDate(currentTask.created_at)}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <UpdateIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Cập nhật: {formatDate(currentTask.updated_at)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Subtasks */}
              {currentTask.subtasks_count !== undefined &&
                currentTask.subtasks_count > 0 && (
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Subtasks
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {currentTask.subtasks_completed} /{' '}
                      {currentTask.subtasks_count} hoàn thành
                    </Typography>
                  </Paper>
                )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* Comments Tab */}
            <Box>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                <TextField
                  placeholder="Viết bình luận..."
                  multiline
                  rows={3}
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                    },
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    startIcon={<SendIcon fontSize="small" />}
                    sx={{ borderRadius: 1, textTransform: 'none' }}
                  >
                    Gửi
                  </Button>
                </Box>
              </Paper>

              {/* Mock Comments */}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Chưa có bình luận nào
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* History Tab */}
            <Typography variant="body2" color="text.secondary">
              Chưa có lịch sử thay đổi
            </Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {/* Activity Tab */}
            <Typography variant="body2" color="text.secondary">
              Chưa có hoạt động nào
            </Typography>
          </TabPanel>
        </Box>

        {/* Footer Actions */}
        {isEditing && (
          <Box
            sx={{
              p: 2,
              backgroundColor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 1,
            }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancelEdit}
              sx={{ borderRadius: 1, textTransform: 'none' }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleSaveEdit}
              sx={{ borderRadius: 1, textTransform: 'none' }}
            >
              Lưu
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}