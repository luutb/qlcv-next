'use client';

import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction,
  Avatar, Button, Chip, Box, Typography, CircularProgress,
  Rating, LinearProgress, Alert,
} from '@mui/material';
import {
  Person, Schedule, TrendingUp, Assignment,
  CheckCircle, Close,
} from '@mui/icons-material';
import { workloadRepo, TaskRecommendation } from '@/repositories/WorkloadRepository';
import toast from 'react-hot-toast';

interface TaskAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  taskId: number;
  onAssign: (userId: number) => void;
  taskData?: {
    title: string;
    required_skills?: string[];
    estimated_hours?: number;
    deadline?: string;
    priority?: string;
  };
}

export default function TaskAssignmentModal({
  open,
  onClose,
  taskId,
  onAssign,
  taskData
}: TaskAssignmentModalProps) {
  const [recommendations, setRecommendations] = useState<TaskRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<number | null>(null);

  useEffect(() => {
    if (open && taskId) {
      fetchRecommendations();
    }
  }, [open, taskId]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const data = await workloadRepo.getRecommendationsV2({
        task_id: taskId,
        required_skills: taskData?.required_skills,
        estimated_hours: taskData?.estimated_hours,
        deadline: taskData?.deadline,
        priority: taskData?.priority,
        max_recommendations: 5
      });
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Không thể tải gợi ý phân công');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (userId: number) => {
    setAssigning(userId);
    try {
      await onAssign(userId);
      toast.success('Đã phân công task thành công');
      onClose();
    } catch (error) {
      toast.error('Phân công thất bại');
    } finally {
      setAssigning(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
    return 'error';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Rất phù hợp';
    if (score >= 0.6) return 'Phù hợp';
    return 'Ít phù hợp';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: 400 }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Assignment />
          <Box>
            <Typography variant="h6">
              Gợi ý phân công Task
            </Typography>
            {taskData?.title && (
              <Typography variant="body2" color="text.secondary">
                {taskData.title}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : recommendations.length === 0 ? (
          <Alert severity="info">
            Không tìm thấy nhân viên phù hợp. Hãy thử điều chỉnh yêu cầu của task.
          </Alert>
        ) : (
          <List>
            {recommendations.map((rec, index) => (
              <ListItem
                key={rec.user_id}
                divider={index < recommendations.length - 1}
                sx={{
                  border: index === 0 ? '2px solid' : '1px solid',
                  borderColor: index === 0 ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: index === 0 ? 'primary.50' : 'background.paper'
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Person />
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {rec.user_name}
                      </Typography>
                      {index === 0 && (
                        <Chip
                          label="Khuyến nghị"
                          color="primary"
                          size="small"
                          icon={<CheckCircle />}
                        />
                      )}
                      <Chip
                        label={rec.department}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={rec.role}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        {rec.reason}
                      </Typography>

                      {/* Recommendation Score */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <TrendingUp fontSize="small" />
                        <Typography variant="caption">Điểm phù hợp:</Typography>
                        <Chip
                          label={`${(rec.recommendation_score * 100).toFixed(0)}% - ${getScoreLabel(rec.recommendation_score)}`}
                          color={getScoreColor(rec.recommendation_score)}
                          size="small"
                        />
                      </Box>

                      {/* Skill Match */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="caption">Khớp kỹ năng:</Typography>
                        <Rating
                          value={rec.skill_match * 5}
                          readOnly
                          size="small"
                          precision={0.1}
                        />
                        <Typography variant="caption">
                          ({(rec.skill_match * 100).toFixed(0)}%)
                        </Typography>
                      </Box>

                      {/* Current Workload */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="caption">Workload hiện tại:</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={rec.workload_score * 100}
                          sx={{ width: 80, height: 6 }}
                        />
                        <Typography variant="caption">
                          {(rec.workload_score * 100).toFixed(0)}%
                        </Typography>
                      </Box>

                      {/* Task Info */}
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<Schedule />}
                          label={`~${rec.estimated_completion_days} ngày`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          icon={<Assignment />}
                          label={`${rec.current_active_tasks} tasks đang làm`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`Sau khi nhận: ${(rec.workload_after_assignment * 100).toFixed(0)}%`}
                          size="small"
                          color={rec.workload_after_assignment > 0.8 ? 'warning' : 'default'}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  }
                />

                <ListItemSecondaryAction>
                  <Button
                    variant={index === 0 ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => handleAssign(rec.user_id)}
                    disabled={assigning !== null}
                    startIcon={assigning === rec.user_id ? <CircularProgress size={16} /> : <CheckCircle />}
                  >
                    {assigning === rec.user_id ? 'Đang phân công...' : 'Phân công'}
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}

        {/* Task Details */}
        {taskData && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Thông tin Task:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {taskData.required_skills && taskData.required_skills.length > 0 && (
                <Box>
                  <Typography variant="caption">Kỹ năng yêu cầu: </Typography>
                  {taskData.required_skills.map(skill => (
                    <Chip key={skill} label={skill} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </Box>
              )}
              {taskData.estimated_hours && (
                <Chip
                  label={`${taskData.estimated_hours}h ước tính`}
                  size="small"
                  variant="outlined"
                />
              )}
              {taskData.priority && (
                <Chip
                  label={`Ưu tiên: ${taskData.priority}`}
                  size="small"
                  color={taskData.priority === 'high' ? 'error' : 'default'}
                />
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          startIcon={<Close />}
          disabled={assigning !== null}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}