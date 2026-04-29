'use client';

import {
  Box, Typography, Paper, Chip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, List, ListItem, ListItemText, ListItemIcon,
} from '@mui/material';
import {
  Link as LinkIcon,
  ArrowForward,
  Warning,
  Info,
  Close,
} from '@mui/icons-material';
import { useState } from 'react';

interface Task {
  id: number;
  title: string;
  status: 'ACTIVE' | 'REJECTED' | 'DONE';
  progress: number;
}

interface Dependency {
  id: number;
  from_task_id: number;
  to_task_id: number;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  from_task?: Task;
  to_task?: Task;
}

interface DependencyVisualizationProps {
  taskId: number;
  dependencies: Dependency[];
  tasks: Task[];
  onHighlight?: (taskId: number) => void;
}

export default function DependencyVisualization({
  taskId,
  dependencies,
  tasks,
  onHighlight,
}: DependencyVisualizationProps) {
  const [highlightedTask, setHighlightedTask] = useState<number | null>(null);
  const [showAffected, setShowAffected] = useState(false);

  // Get dependencies for current task
  const taskDependencies = dependencies.filter(
    (d) => d.from_task_id === taskId || d.to_task_id === taskId
  );

  // Get tasks that depend on this task (this task is from_task)
  const dependentTasks = dependencies
    .filter((d) => d.from_task_id === taskId)
    .map((d) => d.to_task)
    .filter(Boolean) as Task[];

  // Get tasks that this task depends on (this task is to_task)
  const dependencyTasks = dependencies
    .filter((d) => d.to_task_id === taskId)
    .map((d) => d.from_task)
    .filter(Boolean) as Task[];

  // Get tasks that would be affected if this task changes
  const getAffectedTasks = (task: Task, deps: Dependency[], allTasks: Task[]): Task[] => {
    const affected: Task[] = [];
    const visited = new Set<number>();

    const traverse = (currentTaskId: number) => {
      if (visited.has(currentTaskId)) return;
      visited.add(currentTaskId);

      const dependents = deps
        .filter((d) => d.from_task_id === currentTaskId)
        .map((d) => d.to_task)
        .filter(Boolean) as Task[];

      dependents.forEach((dependent) => {
        affected.push(dependent);
        traverse(dependent.id);
      });
    };

    traverse(task.id);
    return affected;
  };

  const affectedTasks = getAffectedTasks(
    tasks.find((t) => t.id === taskId) || { id: taskId, title: '', status: 'ACTIVE', progress: 0 },
    dependencies,
    tasks
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'success';
      case 'REJECTED':
        return 'error';
      default:
        return 'primary';
    }
  };

  const getDependencyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      finish_to_start: 'Finish to Start (FS)',
      start_to_start: 'Start to Start (SS)',
      finish_to_finish: 'Finish to Finish (FF)',
      start_to_finish: 'Start to Finish (SF)',
    };
    return labels[type] || type;
  };

  const handleHighlightTask = (taskId: number) => {
    setHighlightedTask(taskId);
    if (onHighlight) {
      onHighlight(taskId);
    }
  };

  const handleCloseHighlight = () => {
    setHighlightedTask(null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LinkIcon fontSize="small" color="action" />
        <Typography variant="h6">Dependencies</Typography>
        <Chip
          label={`${taskDependencies.length} dependencies`}
          size="small"
          color="primary"
        />
      </Box>

      {/* Dependencies for this task */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Dependencies của task này
        </Typography>

        {taskDependencies.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            Task này không có dependencies
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {taskDependencies.map((dep) => (
              <Box
                key={dep.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                }}
              >
                {dep.from_task_id === taskId ? (
                  <>
                    <Typography variant="body2" fontWeight="500">
                      Task #{taskId}
                    </Typography>
                    <ArrowForward fontSize="small" color="action" />
                    <Typography
                      variant="body2"
                      fontWeight={dep.to_task_id === highlightedTask ? 700 : 500}
                      color={dep.to_task_id === highlightedTask ? 'primary' : 'inherit'}
                      onClick={() => handleHighlightTask(dep.to_task_id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      Task #{dep.to_task_id}: {dep.to_task?.title || 'Unknown'}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography
                      variant="body2"
                      fontWeight={dep.from_task_id === highlightedTask ? 700 : 500}
                      color={dep.from_task_id === highlightedTask ? 'primary' : 'inherit'}
                      onClick={() => handleHighlightTask(dep.from_task_id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      Task #{dep.from_task_id}: {dep.from_task?.title || 'Unknown'}
                    </Typography>
                    <ArrowForward fontSize="small" color="action" />
                    <Typography variant="body2" fontWeight="500">
                      Task #{taskId}
                    </Typography>
                  </>
                )}
                <Chip
                  label={getDependencyTypeLabel(dep.type)}
                  size="small"
                  variant="outlined"
                />
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      {/* Dependent tasks (tasks that depend on this) */}
      {dependentTasks.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Tasks phụ thuộc vào task này
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {dependentTasks.map((task) => (
              <Box
                key={task.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                }}
              >
                <ArrowForward fontSize="small" color="action" />
                <Typography
                  variant="body2"
                  fontWeight={task.id === highlightedTask ? 700 : 500}
                  color={task.id === highlightedTask ? 'primary' : 'inherit'}
                  onClick={() => handleHighlightTask(task.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  Task #{task.id}: {task.title}
                </Typography>
                <Chip
                  label={task.status}
                  size="small"
                  color={getStatusColor(task.status)}
                  variant="outlined"
                />
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* Dependency tasks (tasks this depends on) */}
      {dependencyTasks.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Tasks mà task này phụ thuộc vào
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {dependencyTasks.map((task) => (
              <Box
                key={task.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={task.id === highlightedTask ? 700 : 500}
                  color={task.id === highlightedTask ? 'primary' : 'inherit'}
                  onClick={() => handleHighlightTask(task.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  Task #{task.id}: {task.title}
                </Typography>
                <ArrowForward fontSize="small" color="action" />
                <Typography variant="body2" fontWeight="500">
                  Task #{taskId}
                </Typography>
                <Chip
                  label={task.status}
                  size="small"
                  color={getStatusColor(task.status)}
                  variant="outlined"
                />
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* Affected tasks visualization */}
      {affectedTasks.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Warning fontSize="small" color="warning" />
            <Typography variant="subtitle2">
              Tasks bị ảnh hưởng khi thay đổi
            </Typography>
            <Chip
              label={`${affectedTasks.length} tasks`}
              size="small"
              color="warning"
            />
          </Box>

          <Alert severity="warning" sx={{ mb: 2, fontSize: 12 }}>
            Khi task này thay đổi, các task sau cũng sẽ bị ảnh hưởng theo dependencies.
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {affectedTasks.map((task) => (
              <Box
                key={task.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  bgcolor: 'warning.light',
                  borderRadius: 1,
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={task.id === highlightedTask ? 700 : 500}
                  color={task.id === highlightedTask ? 'primary' : 'inherit'}
                  onClick={() => handleHighlightTask(task.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  Task #{task.id}: {task.title}
                </Typography>
                <Chip
                  label={task.status}
                  size="small"
                  color={getStatusColor(task.status)}
                  variant="outlined"
                />
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* Highlighted Task Detail Dialog */}
      <Dialog
        open={highlightedTask !== null}
        onClose={handleCloseHighlight}
        maxWidth="sm"
        fullWidth
      >
        {highlightedTask && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info fontSize="small" color="primary" />
                <Typography variant="h6">Task Detail</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" fontWeight="500">
                  Task ID: {highlightedTask}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {tasks.find((t) => t.id === highlightedTask)?.title || 'Unknown'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Status: {tasks.find((t) => t.id === highlightedTask)?.status || 'Unknown'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Progress: {tasks.find((t) => t.id === highlightedTask)?.progress || 0}%
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseHighlight}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
