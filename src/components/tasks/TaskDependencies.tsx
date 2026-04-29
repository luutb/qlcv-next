'use client';

import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Autocomplete,
} from '@mui/material';
import { Delete, Add, ArrowForward } from '@mui/icons-material';
import { useState, useEffect } from 'react';

interface Task {
  id: number;
  title: string;
  status: string;
}

interface TaskDependency {
  id: number;
  from_task_id: number;
  to_task_id: number;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  from_task?: Task;
  to_task?: Task;
}

interface TaskDependenciesProps {
  taskId: number;
  dependencies: TaskDependency[];
  onUpdate: (dependencies: TaskDependency[]) => void;
  disabled?: boolean;
}

const DEPENDENCY_TYPES = [
  { value: 'finish_to_start', label: 'Finish to Start (FS)' },
  { value: 'start_to_start', label: 'Start to Start (SS)' },
  { value: 'finish_to_finish', label: 'Finish to Finish (FF)' },
  { value: 'start_to_finish', label: 'Start to Finish (SF)' },
];

export default function TaskDependencies({
  taskId,
  dependencies,
  onUpdate,
  disabled = false,
}: TaskDependenciesProps) {
  const [open, setOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dependencyType, setDependencyType] = useState<string>('finish_to_start');

  useEffect(() => {
    if (open) {
      fetchTasks();
    }
  }, [open]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks?exclude=' + taskId);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleAddDependency = async () => {
    if (!selectedTask) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}/dependencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_task_id: selectedTask.id,
          to_task_id: taskId,
          type: dependencyType,
        }),
      });

      if (response.ok) {
        const newDependency = await response.json();
        onUpdate([...dependencies, newDependency]);
        setOpen(false);
        setSelectedTask(null);
        setDependencyType('finish_to_start');
      }
    } catch (error) {
      console.error('Failed to add dependency:', error);
    }
  };

  const handleDeleteDependency = async (dependencyId: number) => {
    try {
      const response = await fetch(`/api/dependencies/${dependencyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate(dependencies.filter((d) => d.id !== dependencyId));
      }
    } catch (error) {
      console.error('Failed to delete dependency:', error);
    }
  };

  const getDependencyTypeLabel = (type: string) => {
    return DEPENDENCY_TYPES.find((t) => t.value === type)?.label || type;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle2">
          Dependencies ({dependencies.length})
        </Typography>
        {!disabled && (
          <Button
            size="small"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
          >
            Add Dependency
          </Button>
        )}
      </Box>

      {dependencies.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No dependencies
        </Typography>
      ) : (
        <List>
          {dependencies.map((dependency) => (
            <ListItem
              key={dependency.id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2">
                      {dependency.from_task?.title || `Task #${dependency.from_task_id}`}
                    </Typography>
                    <ArrowForward fontSize="small" color="action" />
                    <Typography variant="body2">
                      {dependency.to_task?.title || `Task #${dependency.to_task_id}`}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Chip
                    label={getDependencyTypeLabel(dependency.type)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                }
              />

              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleDeleteDependency(dependency.id)}
                  disabled={disabled}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Add Dependency Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Task Dependency</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Autocomplete
              options={tasks}
              value={selectedTask}
              onChange={(_, newValue) => setSelectedTask(newValue)}
              getOptionLabel={(option) => option.title}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Depends on Task"
                  placeholder="Select a task"
                />
              )}
            />

            <TextField
              select
              label="Dependency Type"
              value={dependencyType}
              onChange={(e) => setDependencyType(e.target.value)}
            >
              {DEPENDENCY_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>

            <Typography variant="caption" color="text.secondary">
              This task will depend on the selected task according to the chosen dependency type.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddDependency}
            variant="contained"
            disabled={!selectedTask}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
