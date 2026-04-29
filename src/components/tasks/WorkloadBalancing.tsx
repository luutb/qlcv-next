'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid,
  List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction,
  Avatar, Button, Chip, LinearProgress, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  Person, Assignment, TrendingUp, CheckCircle,
  Warning, Schedule, SwapHoriz,
} from '@mui/icons-material';
import { workloadRepo, WorkloadUser } from '@/repositories/WorkloadRepository';
import TaskAssignmentModal from './TaskAssignmentModal';
import toast from 'react-hot-toast';

interface WorkloadBalancingProps {
  users: WorkloadUser[];
  onAssignTask: (userId: number, taskId: number) => void;
  taskId?: number;
  showAssignmentModal?: boolean;
}

const WORKLOAD_COLORS = {
  low: '#4caf50',
  medium: '#ff9800', 
  high: '#ff5722',
  overloaded: '#f44336'
};

const WORKLOAD_LABELS = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  overloaded: 'Quá tải'
};

export default function WorkloadBalancing({ 
  users: initialUsers, 
  onAssignTask,
  taskId,
  showAssignmentModal = false
}: WorkloadBalancingProps) {
  const [users, setUsers] = useState<WorkloadUser[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(showAssignmentModal);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<WorkloadUser | null>(null);

  useEffect(() => {
    if (initialUsers.length === 0) {
      fetchUsers();
    } else {
      setUsers(initialUsers);
    }
  }, [initialUsers]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await workloadRepo.getUsersWorkloadV2();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users workload:', error);
      toast.error('Không thể tải dữ liệu workload');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (userId: number) => {
    if (taskId) {
      try {
        await onAssignTask(userId, taskId);
        await fetchUsers(); // Refresh data after assignment
      } catch (error) {
        throw error; // Let the modal handle the error
      }
    }
  };

  const getWorkloadColor = (level: string) => 
    WORKLOAD_COLORS[level as keyof typeof WORKLOAD_COLORS] || '#9e9e9e';

  const getWorkloadIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle sx={{ color: WORKLOAD_COLORS.low }} />;
      case 'medium': return <Schedule sx={{ color: WORKLOAD_COLORS.medium }} />;
      case 'high': return <TrendingUp sx={{ color: WORKLOAD_COLORS.high }} />;
      case 'overloaded': return <Warning sx={{ color: WORKLOAD_COLORS.overloaded }} />;
      default: return <Assignment />;
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    // Sort by availability first, then by workload score
    if (a.is_available !== b.is_available) {
      return a.is_available ? -1 : 1;
    }
    return a.workload_score - b.workload_score;
  });

  const availableUsers = users.filter(u => u.is_available);
  const overloadedUsers = users.filter(u => u.workload_level === 'overloaded');
  const averageWorkload = users.length > 0 
    ? users.reduce((sum, u) => sum + u.workload_score, 0) / users.length 
    : 0;

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                <Person />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                {users.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng nhân viên
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                <CheckCircle />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                {availableUsers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Có thể nhận việc
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1 }}>
                <Warning />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                {overloadedUsers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quá tải
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                <TrendingUp />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                {(averageWorkload * 100).toFixed(0)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Workload TB
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {overloadedUsers.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Có {overloadedUsers.length} nhân viên đang quá tải. 
            Hãy xem xét cân bằng lại workload.
          </Typography>
          <Button
            size="small"
            onClick={() => setBalanceDialogOpen(true)}
            sx={{ mt: 1 }}
          >
            Xem gợi ý cân bằng
          </Button>
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {taskId && (
          <Button
            variant="contained"
            startIcon={<Assignment />}
            onClick={() => setAssignmentModalOpen(true)}
          >
            Smart Assign Task
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<SwapHoriz />}
          onClick={() => setBalanceDialogOpen(true)}
        >
          Cân bằng Workload
        </Button>
      </Box>

      {/* Users List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Danh sách nhân viên
          </Typography>
          
          <List>
            {sortedUsers.map((user, index) => (
              <ListItem
                key={user.user_id}
                divider={index < sortedUsers.length - 1}
                sx={{
                  border: user.workload_level === 'overloaded' ? '1px solid' : 'none',
                  borderColor: 'error.main',
                  borderRadius: user.workload_level === 'overloaded' ? 1 : 0,
                  mb: user.workload_level === 'overloaded' ? 1 : 0,
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getWorkloadColor(user.workload_level) }}>
                    {user.user_name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {user.user_name}
                      </Typography>
                      <Chip
                        label={user.department}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={user.role}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                      {!user.is_available && (
                        <Chip
                          label="Không nhận việc"
                          size="small"
                          color="error"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      {/* Workload Progress */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {getWorkloadIcon(user.workload_level)}
                        <LinearProgress
                          variant="determinate"
                          value={user.workload_score * 100}
                          sx={{
                            flex: 1,
                            height: 8,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getWorkloadColor(user.workload_level)
                            }
                          }}
                        />
                        <Typography variant="caption" fontWeight={600}>
                          {(user.workload_score * 100).toFixed(0)}%
                        </Typography>
                        <Chip
                          label={WORKLOAD_LABELS[user.workload_level]}
                          size="small"
                          sx={{
                            backgroundColor: getWorkloadColor(user.workload_level),
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Box>

                      {/* Task Info */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<Assignment />}
                          label={`${user.active_tasks} tasks đang làm`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          icon={<Schedule />}
                          label={`${user.total_hours_this_week.toFixed(1)}h tuần này`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`Capacity: ${user.capacity_utilization.toFixed(0)}%`}
                          size="small"
                          color={user.capacity_utilization > 80 ? 'warning' : 'default'}
                          variant="outlined"
                        />
                      </Box>

                      {/* Skills */}
                      {user.skills.length > 0 && (
                        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {user.skills.slice(0, 3).map(skill => (
                            <Chip
                              key={skill}
                              label={skill}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                          {user.skills.length > 3 && (
                            <Chip
                              label={`+${user.skills.length - 3}`}
                              size="small"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                  }
                />

                <ListItemSecondaryAction>
                  {taskId && user.is_available && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleAssignTask(user.user_id)}
                      disabled={user.workload_level === 'overloaded'}
                    >
                      Assign
                    </Button>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Task Assignment Modal */}
      {taskId && (
        <TaskAssignmentModal
          open={assignmentModalOpen}
          onClose={() => setAssignmentModalOpen(false)}
          taskId={taskId}
          onAssign={handleAssignTask}
        />
      )}

      {/* Workload Balance Dialog */}
      <Dialog
        open={balanceDialogOpen}
        onClose={() => setBalanceDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Gợi ý cân bằng Workload</DialogTitle>
        <DialogContent>
          {overloadedUsers.length === 0 ? (
            <Alert severity="success">
              Workload của team đang cân bằng tốt!
            </Alert>
          ) : (
            <Box>
              <Typography variant="body1" gutterBottom>
                Các nhân viên đang quá tải:
              </Typography>
              <List>
                {overloadedUsers.map(user => (
                  <ListItem key={user.user_id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'error.main' }}>
                        {user.user_name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.user_name}
                      secondary={`${user.active_tasks} tasks, ${(user.workload_score * 100).toFixed(0)}% workload`}
                    />
                  </ListItem>
                ))}
              </List>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Gợi ý: Hãy xem xét chuyển một số task từ những người quá tải sang những người có workload thấp hơn.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBalanceDialogOpen(false)}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
