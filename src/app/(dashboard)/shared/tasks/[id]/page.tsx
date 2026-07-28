'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  TextField,
  AvatarGroup,
  Tooltip,
  Autocomplete,
  Paper,
  Fade,
  ListItemIcon,
} from '@mui/material';
import {
  Edit,
  Delete,
  MoreVert,
  Person,
  CalendarToday,
  AttachMoney,
  AttachFile,
  Add,
  Download,
  Save,
  Cancel,
  Star,
  StarBorder,
  Share,
  Check,
  Close,
  ContentCopy,
  AccessTime,
  Flag,
  Link as LinkIcon,
  Lock,
  Public,
  Comment,
  KeyboardArrowDown,
  Assignment,
  Notifications,
  NotificationsOff,
} from '@mui/icons-material';
import apiClient from '@/api/client';

// Types
interface User {
  id: number;
  name: string;
  username: string;
  avatar_url?: string;
  email: string;
}

interface Customer {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  company_name: string;
}

interface Label {
  id: number;
  name: string;
  color: string;
  bg_color: string;
  icon: string;
  description: string;
  category: string;
}

interface TaskLabels {
  workflow_step: Label;
  payment_status: Label;
  task_status: Label;
  priority: Label;
  custom_labels: Label[] | null;
}

interface Document {
  id: number;
  name: string;
  url: string;
  size: number;
  uploaded_at: string;
}

interface Activity {
  id: number;
  type: 'comment' | 'system_note' | 'label_change' | 'status_change' | 'assigned';
  user: User;
  content: string;
  created_at: string;
  system_note?: string;
}

interface Task {
  id: number;
  issue_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  payment_status: string;
  amount: number;
  paid_amount: number;
  collected_amount: number;
  is_paid: boolean;
  is_collected: boolean;
  due_date: string | null;
  start_date: string | null;
  original_estimate: number;
  remaining_estimate: number;
  time_spent: number;
  story_points: number | null;
  customer_id: number;
  customer: Customer;
  assignees: User[];
  labels: TaskLabels;
  documents?: Document[];
  created_at: string;
  updated_at: string;
  closed_at?: string;
  is_confidential: boolean;
  subscribed: boolean;
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [isStarred, setIsStarred] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<User[]>([]);

  // Fetch task detail
  const fetchTaskDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/tasks/${taskId}`);
      const responseData = response.data as any;
      let taskData: Task;
      
      if (responseData.data) {
        taskData = responseData.data;
      } else {
        taskData = responseData;
      }

      // Ensure all required fields
      taskData = {
        ...taskData,
        assignees: taskData.assignees || [],
        is_confidential: taskData.is_confidential || false,
        subscribed: taskData.subscribed || false,
        labels: taskData.labels || {
          workflow_step: { id: 0, name: 'Không xác định', color: '#666', bg_color: '#f5f5f5', icon: '❓', description: '', category: 'workflow' },
          task_status: { id: 0, name: 'Không xác định', color: '#666', bg_color: '#f5f5f5', icon: '❓', description: '', category: 'status' },
          payment_status: { id: 0, name: 'Không xác định', color: '#666', bg_color: '#f5f5f5', icon: '❓', description: '', category: 'payment' },
          priority: { id: 0, name: 'Không xác định', color: '#666', bg_color: '#f5f5f5', icon: '❓', description: '', category: 'priority' },
          custom_labels: null
        }
      };

      setTask(taskData);
      setEditedTask(taskData);
      setSelectedAssignees(taskData.assignees || []);
      
      // Mock activities for now
      setActivities([
        {
          id: 1,
          type: 'system_note',
          user: { id: 1, name: 'Admin', username: 'admin', email: 'admin@example.com' },
          content: 'đã tạo issue này',
          created_at: taskData.created_at,
          system_note: 'created'
        }
      ]);

    } catch (err: any) {
      console.error('Failed to fetch task detail:', err);
      setError('Không thể tải chi tiết công việc.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for assignees
  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/users', {
        params: { limit: 100 }
      });
      const responseData = response.data as any;
      let usersData = [];
      
      if (responseData.data && Array.isArray(responseData.data)) {
        usersData = responseData.data;
      } else if (Array.isArray(responseData)) {
        usersData = responseData;
      }
      
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      // Mock users if API fails
      setUsers([
        { id: 1, name: 'Admin User', username: 'admin', email: 'admin@example.com' },
        { id: 2, name: 'Nguyễn Văn A', username: 'nguyenvana', email: 'a@example.com' },
        { id: 3, name: 'Trần Thị B', username: 'tranthib', email: 'b@example.com' }
      ]);
    }
  };

  // Update task description
  const handleUpdateDescription = async () => {
    if (!task) return;
    try {
      await apiClient.put(`/tasks/${task.id}`, {
        description: editedTask.description
      });
      setEditingDescription(false);
      await fetchTaskDetail();
    } catch (err) {
      setError('Không thể cập nhật mô tả.');
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return;
    try {
      await apiClient.post(`/tasks/${task.id}/comments`, {
        content: newComment
      });
      setNewComment('');
      await fetchTaskDetail();
    } catch (err) {
      setError('Không thể thêm bình luận.');
    }
  };

  // Update assignees
  const handleUpdateAssignees = async (assignees: User[]) => {
    if (!task) return;
    try {
      await apiClient.put(`/tasks/${task.id}`, {
        assignee_ids: assignees.map(a => a.id)
      });
      setSelectedAssignees(assignees);
      await fetchTaskDetail();
    } catch (err) {
      setError('Không thể cập nhật người được giao.');
    }
  };

  // Toggle subscription
  const handleToggleSubscription = async () => {
    if (!task) return;
    try {
      if (task.subscribed) {
        await apiClient.post(`/tasks/${task.id}/unsubscribe`);
      } else {
        await apiClient.post(`/tasks/${task.id}/subscribe`);
      }
      setTask({ ...task, subscribed: !task.subscribed });
    } catch (err) {
      setError('Không thể thay đổi trạng thái theo dõi.');
    }
  };

  // Close/Reopen issue
  const handleToggleIssue = async () => {
    if (!task) return;
    try {
      await apiClient.put(`/tasks/${task.id}`, {
        status: task.status === 'closed' ? 'open' : 'closed'
      });
      await fetchTaskDetail();
    } catch (err) {
      setError('Không thể thay đổi trạng thái issue.');
    }
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (!task) return;
    if (confirm('Bạn có chắc chắn muốn xóa issue này?')) {
      try {
        await apiClient.delete(`/tasks/${task.id}`);
        router.push('/board');
      } catch (err) {
        setError('Không thể xóa issue.');
      }
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (taskId) {
      fetchTaskDetail();
      fetchUsers();
    }
  }, [taskId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !task) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Không tìm thấy issue.'}
        </Alert>
        <Button variant="outlined" onClick={() => router.push('/board')}>
          Quay lại bảng công việc
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      {/* GitLab Header */}
      <Box sx={{ backgroundColor: 'white', borderBottom: '1px solid #e5e5e5', mb: 0 }}>
        <Box sx={{ maxWidth: '1280px', mx: 'auto', px: 4, py: 2 }}>
          {/* Breadcrumb */}
          <Box display="flex" alignItems="center" gap={1} mb={2} fontSize="14px">
            <Typography 
              sx={{ 
                color: '#1068bf', 
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={() => router.push('/board')}
            >
              Bảng công việc
            </Typography>
            <Typography sx={{ color: '#666' }}>/</Typography>
            <Typography sx={{ color: '#666' }}>Issues</Typography>
            <Typography sx={{ color: '#666' }}>/</Typography>
            <Typography sx={{ color: '#303030', fontWeight: 500 }}>
              #{task.issue_number || task.id}
            </Typography>
            {task.is_confidential && (
              <Chip
                icon={<Lock sx={{ fontSize: 14 }} />}
                label="Confidential"
                size="small"
                sx={{ 
                  ml: 1,
                  height: 20,
                  fontSize: '11px',
                  backgroundColor: '#fff3cd',
                  color: '#856404',
                  border: '1px solid #ffc107'
                }}
              />
            )}
          </Box>

          {/* Title Section */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ flex: 1 }}>
              <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                {task.status === 'closed' ? (
                  <Chip
                    icon={<Check sx={{ fontSize: 16 }} />}
                    label="Closed"
                    size="small"
                    sx={{ 
                      height: 24,
                      backgroundColor: '#d1d5db',
                      color: '#374151',
                      fontWeight: 600
                    }}
                  />
                ) : (
                  <Chip
                    icon={<Check sx={{ fontSize: 16 }} />}
                    label="Open"
                    size="small"
                    sx={{ 
                      height: 24,
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      fontWeight: 600
                    }}
                  />
                )}
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 600,
                    fontSize: '22px',
                    lineHeight: 1.2,
                    color: '#303030'
                  }}
                >
                  {task.title}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1.5} fontSize="14px" color="#666">
                <Typography fontSize="14px">
                  Được tạo bởi 
                  <Typography component="span" fontWeight={500} sx={{ ml: 0.5 }}>
                    {task.customer?.full_name || 'Admin'}
                  </Typography>
                </Typography>
                <Typography fontSize="14px">•</Typography>
                <Typography fontSize="14px">
                  {new Date(task.created_at).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            </Box>

            {/* Actions */}
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={task.subscribed ? <Notifications /> : <NotificationsOff />}
                onClick={handleToggleSubscription}
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#e5e5e5',
                  color: '#303030',
                  fontSize: '14px'
                }}
              >
                {task.subscribed ? 'Đang theo dõi' : 'Theo dõi'}
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={task.status === 'closed' ? <Check /> : <Close />}
                onClick={handleToggleIssue}
                sx={{ 
                  textTransform: 'none',
                  backgroundColor: task.status === 'closed' ? '#10b981' : '#dc2626',
                  fontSize: '14px'
                }}
              >
                {task.status === 'closed' ? 'Mở lại issue' : 'Đóng issue'}
              </Button>
              <IconButton onClick={handleMenuOpen} sx={{ border: '1px solid #e5e5e5' }}>
                <MoreVert />
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => { handleDeleteTask(); handleMenuClose(); }}>
                  <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
                  Xóa issue
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                  <ListItemIcon><LinkIcon fontSize="small" /></ListItemIcon>
                  Copy link
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: '1280px', mx: 'auto', px: 4, py: 4, display: 'flex', gap: 4 }}>
        {/* Left Column - Content */}
        <Box sx={{ flex: 1 }}>
          {/* Description */}
          <Box sx={{ mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>
                Mô tả
              </Typography>
              <Button
                size="small"
                startIcon={editingDescription ? <Close /> : <Edit />}
                onClick={() => {
                  setEditingDescription(!editingDescription);
                  setEditedTask({ ...editedTask, description: task.description });
                }}
                sx={{ textTransform: 'none', color: editingDescription ? '#dc2626' : '#666' }}
              >
                {editingDescription ? 'Hủy' : 'Chỉnh sửa'}
              </Button>
            </Box>

            {editingDescription ? (
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  value={editedTask.description || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  placeholder="Mô tả issue..."
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { fontSize: '14px' } }}
                />
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleUpdateDescription}
                    sx={{ textTransform: 'none', backgroundColor: '#1068bf' }}
                  >
                    Lưu
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setEditingDescription(false)}
                    sx={{ textTransform: 'none' }}
                  >
                    Hủy
                  </Button>
                </Box>
              </Box>
            ) : (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2,
                  border: '1px solid #e5e5e5',
                  borderRadius: 1,
                  minHeight: 80,
                  backgroundColor: '#fafafa'
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    color: task.description ? '#303030' : '#999',
                    fontStyle: task.description ? 'normal' : 'italic',
                    fontSize: '14px',
                    lineHeight: 1.6
                  }}
                >
                  {task.description || 'Chưa có mô tả'}
                </Typography>
              </Paper>
            )}
          </Box>

          {/* Activity Feed */}
          <Box>
            <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600, mb: 2 }}>
              Hoạt động ({activities.length})
            </Typography>

            {/* Activity List */}
            {activities.map((activity) => (
              <Box key={activity.id} display="flex" gap={2} mb={3}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {activity.user.name.charAt(0)}
                </Avatar>
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Typography variant="subtitle2" fontWeight={600} fontSize="14px">
                      {activity.user.name}
                    </Typography>
                    <Typography variant="body2" fontSize="14px" color="#666">
                      {activity.content}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="#999">
                    {new Date(activity.created_at).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              </Box>
            ))}

            {/* Comment Box */}
            <Box display="flex" gap={2} mt={3}>
              <Avatar sx={{ width: 32, height: 32 }}>
                <Person fontSize="small" />
              </Avatar>
              <Box flex={1}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận..."
                  sx={{ mb: 1, '& .MuiOutlinedInput-root': { fontSize: '14px' } }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  sx={{ textTransform: 'none', backgroundColor: '#1068bf' }}
                >
                  Bình luận
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right Sidebar */}
        <Box sx={{ width: 300 }}>
          {/* Assignees */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontSize: '12px', fontWeight: 600, color: '#666', mb: 1.5, textTransform: 'uppercase' }}>
              Assignees
            </Typography>
            <Autocomplete
              multiple
              size="small"
              options={users}
              value={selectedAssignees}
              getOptionLabel={(option) => option.name}
              onChange={(event, newValue) => handleUpdateAssignees(newValue)}
              renderInput={(params) => (
                <TextField {...params} placeholder="Add assignees..." sx={{ '& .MuiInputBase-input': { fontSize: '13px' } }} />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>
                      {option.name.charAt(0)}
                    </Avatar>
                    <Typography fontSize="13px">{option.name}</Typography>
                  </Box>
                </li>
              )}
              renderTags={(value, getTagProps) => (
                <Box display="flex" flexWrap="wrap" gap={0.5}>
                  {value.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.name}
                      size="small"
                      avatar={<Avatar sx={{ width: 20, height: 20 }}>{option.name.charAt(0)}</Avatar>}
                      sx={{ fontSize: '12px', height: 24 }}
                    />
                  ))}
                </Box>
              )}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Labels */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontSize: '12px', fontWeight: 600, color: '#666', mb: 1.5, textTransform: 'uppercase' }}>
              Labels
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {task.labels?.priority && (
                <Chip
                  label={task.labels.priority.name}
                  size="small"
                  sx={{ 
                    fontSize: '12px',
                    backgroundColor: task.labels.priority.bg_color,
                    color: task.labels.priority.color,
                    mb: 0.5
                  }}
                />
              )}
              {task.labels?.task_status && (
                <Chip
                  label={task.labels.task_status.name}
                  size="small"
                  sx={{ 
                    fontSize: '12px',
                    backgroundColor: task.labels.task_status.bg_color,
                    color: task.labels.task_status.color,
                    mb: 0.5
                  }}
                />
              )}
              {task.labels?.payment_status && (
                <Chip
                  label={task.labels.payment_status.name}
                  size="small"
                  sx={{ 
                    fontSize: '12px',
                    backgroundColor: task.labels.payment_status.bg_color,
                    color: task.labels.payment_status.color,
                    mb: 0.5
                  }}
                />
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Milestone/Due Date */}
          {task.due_date && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontSize: '12px', fontWeight: 600, color: '#666', mb: 1.5, textTransform: 'uppercase' }}>
                  Due date
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday sx={{ fontSize: 16, color: '#666' }} />
                  <Typography variant="body2" fontSize="13px">
                    {new Date(task.due_date).toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          {/* Time Tracking */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontSize: '12px', fontWeight: 600, color: '#666', mb: 1.5, textTransform: 'uppercase' }}>
              Time tracking
            </Typography>
            <Box display="flex" justifyContent="space-between" fontSize="13px" color="#666" mb={0.5}>
              <Typography fontSize="13px">Estimate:</Typography>
              <Typography fontSize="13px" fontWeight={500}>{task.original_estimate || 0}h</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" fontSize="13px" color="#666" mb={0.5}>
              <Typography fontSize="13px">Spent:</Typography>
              <Typography fontSize="13px" fontWeight={500}>{task.time_spent || 0}h</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" fontSize="13px" color="#666">
              <Typography fontSize="13px">Remaining:</Typography>
              <Typography fontSize="13px" fontWeight={500}>{task.remaining_estimate || 0}h</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Customer */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontSize: '12px', fontWeight: 600, color: '#666', mb: 1.5, textTransform: 'uppercase' }}>
              Customer
            </Typography>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Avatar sx={{ width: 28, height: 28, fontSize: '13px' }}>
                {task.customer?.full_name?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={500} fontSize="14px">
                  {task.customer?.full_name || 'N/A'}
                </Typography>
                <Typography variant="caption" fontSize="12px" color="#666">
                  {task.customer?.company_name || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Financial */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontSize: '12px', fontWeight: 600, color: '#666', mb: 1.5, textTransform: 'uppercase' }}>
              Financial
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <AttachMoney sx={{ fontSize: 18, color: '#10b981' }} />
              <Typography variant="body2" fontWeight={600} fontSize="16px">
                {task.amount?.toLocaleString('vi-VN') || 0} ₫
              </Typography>
            </Box>
            <Typography variant="caption" fontSize="12px" color="#666" display="block">
              Paid: {task.paid_amount?.toLocaleString('vi-VN') || 0} ₫
            </Typography>
            <Typography variant="caption" fontSize="12px" color="#666" display="block">
              Collected: {task.collected_amount?.toLocaleString('vi-VN') || 0} ₫
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Documents */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontSize: '12px', fontWeight: 600, color: '#666', mb: 1.5, textTransform: 'uppercase' }}>
              Documents ({task.documents?.length || 0})
            </Typography>
            {task.documents && task.documents.length > 0 ? (
              <Box>
                {task.documents.map(doc => (
                  <Box 
                    key={doc.id}
                    display="flex" 
                    alignItems="center" 
                    gap={1} 
                    py={1}
                    sx={{ borderBottom: '1px solid #f0f0f0', '&:last-child': { borderBottom: 'none' } }}
                  >
                    <AttachFile sx={{ fontSize: 16, color: '#666' }} />
                    <Box flex={1}>
                      <Typography variant="body2" fontSize="13px" noWrap>
                        {doc.name}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => window.open(doc.url, '_blank')}>
                      <Download fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" fontSize="13px" color="#999">
                No documents
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}