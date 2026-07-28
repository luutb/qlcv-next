'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import { taskService } from '@/services';
import { Task } from '@/types';

interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  dependencies?: string[];
  assignee?: string;
  status: string;
}

interface TaskGanttViewProps {
  workflowId?: number;
  className?: string;
}

const TaskGanttView: React.FC<TaskGanttViewProps> = ({ workflowId, className }) => {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [workflowId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getAll({
        workflow_id: workflowId,
        limit: 100
      });
      
      const ganttTasks: GanttTask[] = response.data.data.map((task: Task) => ({
        id: task.id,
        name: task.title,
        start: new Date(task.createdAt),
        end: task.dueDate ? new Date(task.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        progress: getTaskProgress(task.status),
        assignee: task.assignee?.name,
        status: task.status,
        dependencies: task.dependencies || []
      }));
      
      setTasks(ganttTasks);
    } catch (err) {
      console.error('Error fetching tasks for Gantt view:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const getTaskProgress = (status: string): number => {
    switch (status) {
      case 'todo':
        return 0;
      case 'in_progress':
        return 50;
      case 'review':
        return 80;
      case 'done':
        return 100;
      default:
        return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'default';
      case 'in_progress':
        return 'primary';
      case 'review':
        return 'warning';
      case 'done':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('vi-VN');
  };

  const calculateDuration = (start: Date, end: Date): number => {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <Box className={className} display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={className}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box className={className}>
      <Typography variant="h6" gutterBottom>
        Task Gantt View
      </Typography>
      
      {tasks.length === 0 ? (
        <Alert severity="info">No tasks found for Gantt view</Alert>
      ) : (
        <Grid container spacing={2}>
          {tasks.map((task) => (
            <Grid item xs={12} key={task.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {task.name}
                    </Typography>
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="textSecondary">
                        Start: {formatDate(task.start)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Typography variant="body2" color="textSecondary">
                        End: {formatDate(task.end)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="body2" color="textSecondary">
                        Duration: {calculateDuration(task.start, task.end)} days
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Typography variant="body2" color="textSecondary">
                        Progress: {task.progress}%
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      {task.assignee && (
                        <Typography variant="body2" color="textSecondary">
                          Assignee: {task.assignee}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                  
                  {/* Simple progress bar */}
                  <Box mt={2}>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
                        backgroundColor: 'grey.300',
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: `${task.progress}%`,
                          height: '100%',
                          backgroundColor: task.progress === 100 ? 'success.main' : 'primary.main',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TaskGanttView;