'use client';

import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  TextField,
  Button,
  Typography,
  Chip,
  Avatar,
} from '@mui/material';
import { Delete, Add, Edit } from '@mui/icons-material';
import { useState } from 'react';

interface SubTask {
  id?: number;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assignee_id?: number;
  assignee?: {
    id: number;
    full_name: string;
    avatar?: string;
  };
  order: number;
}

interface SubTaskListProps {
  taskId: number;
  subTasks: SubTask[];
  onUpdate: (subTasks: SubTask[]) => void;
  disabled?: boolean;
}

export default function SubTaskList({
  taskId,
  subTasks,
  onUpdate,
  disabled = false,
}: SubTaskListProps) {
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleAddSubTask = async () => {
    if (!newSubTaskTitle.trim()) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSubTaskTitle,
          status: 'PENDING',
          order: subTasks.length + 1,
        }),
      });

      if (response.ok) {
        const newSubTask = await response.json();
        onUpdate([...subTasks, newSubTask]);
        setNewSubTaskTitle('');
      }
    } catch (error) {
      console.error('Failed to add sub-task:', error);
    }
  };

  const handleToggleStatus = async (subTask: SubTask) => {
    if (!subTask.id) return;

    const newStatus: SubTask['status'] =
      subTask.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    try {
      const response = await fetch(`/api/subtasks/${subTask.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const updatedSubTasks = subTasks.map((st) =>
          st.id === subTask.id ? { ...st, status: newStatus } : st
        );
        onUpdate(updatedSubTasks);
      }
    } catch (error) {
      console.error('Failed to update sub-task status:', error);
    }
  };

  const handleDeleteSubTask = async (subTaskId: number) => {
    try {
      const response = await fetch(`/api/subtasks/${subTaskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onUpdate(subTasks.filter((st) => st.id !== subTaskId));
      }
    } catch (error) {
      console.error('Failed to delete sub-task:', error);
    }
  };

  const getStatusColor = (status: SubTask['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Sub-tasks ({subTasks.length})
      </Typography>

      <List>
        {subTasks.map((subTask) => (
          <ListItem
            key={subTask.id}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              mb: 1,
            }}
          >
            <Checkbox
              checked={subTask.status === 'COMPLETED'}
              onChange={() => handleToggleStatus(subTask)}
              disabled={disabled}
            />
            
            <ListItemText
              primary={subTask.title}
              secondary={
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <Chip
                    label={subTask.status}
                    size="small"
                    color={getStatusColor(subTask.status)}
                  />
                  {subTask.assignee && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Avatar
                        src={subTask.assignee.avatar}
                        sx={{ width: 20, height: 20 }}
                      >
                        {subTask.assignee.full_name.charAt(0)}
                      </Avatar>
                      <Typography variant="caption">
                        {subTask.assignee.full_name}
                      </Typography>
                    </Box>
                  )}
                </Box>
              }
              sx={{
                textDecoration:
                  subTask.status === 'COMPLETED' ? 'line-through' : 'none',
              }}
            />

            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                size="small"
                onClick={() => handleDeleteSubTask(subTask.id!)}
                disabled={disabled}
              >
                <Delete fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {!disabled && (
        <Box display="flex" gap={1} mt={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Add new sub-task"
            value={newSubTaskTitle}
            onChange={(e) => setNewSubTaskTitle(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddSubTask();
              }
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddSubTask}
          >
            Add
          </Button>
        </Box>
      )}
    </Box>
  );
}
