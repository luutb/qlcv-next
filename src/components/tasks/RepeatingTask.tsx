'use client';

import {
  Box, Typography, Paper, Button, Chip, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Switch, FormControlLabel,
  Alert,
} from '@mui/material';
import {
  Repeat,
  Add,
  Edit,
  Delete,
} from '@mui/icons-material';
import { useState } from 'react';

interface RepeatingTask {
  id?: number;
  task_id: number;
  repeat_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeat_interval: number;
  repeat_days?: number[]; // For weekly: 0-6 (Sun-Sat)
  repeat_day_of_month?: number; // For monthly: 1-31
  end_type: 'never' | 'after' | 'on_date';
  end_after?: number;
  end_on_date?: string;
  is_active: boolean;
  created_at: string;
}

interface RepeatingTaskProps {
  tasks: RepeatingTask[];
  onAdd?: (task: Omit<RepeatingTask, 'id' | 'created_at'>) => Promise<void>;
  onUpdate?: (task: RepeatingTask) => Promise<void>;
  onDelete?: (taskId: number) => Promise<void>;
}

export default function RepeatingTask({
  tasks,
  onAdd,
  onUpdate,
  onDelete,
}: RepeatingTaskProps) {
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<RepeatingTask | null>(null);
  const [formData, setFormData] = useState<{
    repeat_type: RepeatingTask['repeat_type'];
    repeat_interval: number;
    repeat_days: number[];
    repeat_day_of_month: number;
    end_type: RepeatingTask['end_type'];
    end_after: number;
    end_on_date: string;
    is_active: boolean;
  }>({
    repeat_type: 'weekly',
    repeat_interval: 1,
    repeat_days: [],
    repeat_day_of_month: 1,
    end_type: 'never',
    end_after: 10,
    end_on_date: '',
    is_active: true,
  });

  const handleOpen = (task?: RepeatingTask) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        repeat_type: task.repeat_type,
        repeat_interval: task.repeat_interval,
        repeat_days: task.repeat_days || [],
        repeat_day_of_month: task.repeat_day_of_month || 1,
        end_type: task.end_type,
        end_after: task.end_after || 10,
        end_on_date: task.end_on_date || '',
        is_active: task.is_active,
      });
    } else {
      setEditingTask(null);
      setFormData({
        repeat_type: 'weekly',
        repeat_interval: 1,
        repeat_days: [],
        repeat_day_of_month: 1,
        end_type: 'never',
        end_after: 10,
        end_on_date: '',
        is_active: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = async () => {
    const taskData: Omit<RepeatingTask, 'id' | 'created_at'> = {
      task_id: editingTask?.task_id || 0,
      repeat_type: formData.repeat_type,
      repeat_interval: formData.repeat_interval,
      repeat_days: formData.repeat_type === 'weekly' ? formData.repeat_days : undefined,
      repeat_day_of_month: formData.repeat_type === 'monthly' ? formData.repeat_day_of_month : undefined,
      end_type: formData.end_type,
      end_after: formData.end_type === 'after' ? formData.end_after : undefined,
      end_on_date: formData.end_type === 'on_date' ? formData.end_on_date : undefined,
      is_active: formData.is_active,
    };

    if (editingTask && onUpdate) {
      await onUpdate({ ...editingTask, ...taskData });
    } else if (onAdd) {
      await onAdd(taskData);
    }

    handleClose();
  };

  const handleDelete = async (taskId: number) => {
    if (onDelete) {
      await onDelete(taskId);
    }
  };

  const handleToggleActive = async (task: RepeatingTask) => {
    if (onUpdate) {
      await onUpdate({ ...task, is_active: !task.is_active });
    }
  };

  const getRepeatLabel = (type: string, interval: number) => {
    const labels: Record<string, string> = {
      daily: `Mỗi ${interval} ngày`,
      weekly: `Mỗi ${interval} tuần`,
      monthly: `Mỗi ${interval} tháng`,
      yearly: `Mỗi ${interval} năm`,
    };
    return labels[type] || type;
  };

  const getEndLabel = (type: string, after?: number, onDate?: string) => {
    switch (type) {
      case 'never':
        return 'Không giới hạn';
      case 'after':
        return `Sau ${after} lần lặp`;
      case 'on_date':
        return `Đến ${onDate ? new Date(onDate).toLocaleDateString('vi-VN') : ''}`;
      default:
        return type;
    }
  };

  const getDayName = (day: number) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[day] || '';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Repeat fontSize="small" color="action" />
        <Typography variant="h6">Task lặp lại</Typography>
        <Chip
          label={`${tasks.length} task`}
          size="small"
          color="primary"
        />
      </Box>

      {tasks.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Chưa có task lặp lại nào
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => handleOpen()}
          >
            Tạo task lặp đầu tiên
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {tasks.map((task) => (
            <Paper
              key={task.id}
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: task.is_active ? 'background.paper' : 'action.disabledBackground',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  label={getRepeatLabel(task.repeat_type, task.repeat_interval)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={getEndLabel(task.end_type, task.end_after, task.end_on_date)}
                  size="small"
                  variant="outlined"
                />
                {task.repeat_type === 'weekly' && task.repeat_days && (
                  <Chip
                    label={task.repeat_days.map(getDayName).join(', ')}
                    size="small"
                    variant="outlined"
                  />
                )}
                {task.repeat_type === 'monthly' && task.repeat_day_of_month && (
                  <Chip
                    label={`Ngày ${task.repeat_day_of_month}`}
                    size="small"
                    variant="outlined"
                  />
                )}
                {task.is_active && (
                  <Chip
                    label="Đang hoạt động"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Task ID: {task.task_id}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {' • '}
                  Tạo: {new Date(task.created_at).toLocaleDateString('vi-VN')}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  size="small"
                  onClick={() => handleOpen(task)}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(task.id!)}
                >
                  Xóa
                </Button>
                <Switch
                  checked={task.is_active}
                  onChange={() => handleToggleActive(task)}
                  size="small"
                />
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => handleOpen()}
        sx={{ mt: 2 }}
      >
        Thêm task lặp
      </Button>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Chỉnh sửa task lặp' : 'Tạo task lặp mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Loại lặp lại"
              fullWidth
              value={formData.repeat_type}
              onChange={(e) => setFormData({ ...formData, repeat_type: e.target.value as any })}
            >
              <MenuItem value="daily">Hàng ngày</MenuItem>
              <MenuItem value="weekly">Hàng tuần</MenuItem>
              <MenuItem value="monthly">Hàng tháng</MenuItem>
              <MenuItem value="yearly">Hàng năm</MenuItem>
            </TextField>

            <TextField
              label="Khoảng cách"
              type="number"
              fullWidth
              value={formData.repeat_interval}
              onChange={(e) => setFormData({ ...formData, repeat_interval: parseInt(e.target.value) })}
              slotProps={{ htmlInput: { min: 1 } }}
            />

            {formData.repeat_type === 'weekly' && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  Ngày trong tuần:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <Button
                      key={day}
                      variant={formData.repeat_days.includes(day) ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => {
                        const days = formData.repeat_days.includes(day)
                          ? formData.repeat_days.filter((d) => d !== day)
                          : [...formData.repeat_days, day];
                        setFormData({ ...formData, repeat_days: days });
                      }}
                    >
                      {getDayName(day)}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

            {formData.repeat_type === 'monthly' && (
              <TextField
                label="Ngày trong tháng"
                type="number"
                fullWidth
                value={formData.repeat_day_of_month}
                onChange={(e) => setFormData({ ...formData, repeat_day_of_month: parseInt(e.target.value) })}
                slotProps={{ htmlInput: { min: 1, max: 31 } }}
              />
            )}

            <TextField
              select
              label="Kết thúc"
              fullWidth
              value={formData.end_type}
              onChange={(e) => setFormData({ ...formData, end_type: e.target.value as any })}
            >
              <MenuItem value="never">Không giới hạn</MenuItem>
              <MenuItem value="after">Sau số lần lặp</MenuItem>
              <MenuItem value="on_date">Đến ngày cụ thể</MenuItem>
            </TextField>

            {formData.end_type === 'after' && (
              <TextField
                label="Số lần lặp"
                type="number"
                fullWidth
                value={formData.end_after}
                onChange={(e) => setFormData({ ...formData, end_after: parseInt(e.target.value) })}
                slotProps={{ htmlInput: { min: 1 } }}
              />
            )}

            {formData.end_type === 'on_date' && (
              <TextField
                label="Ngày kết thúc"
                type="date"
                fullWidth
                value={formData.end_on_date}
                onChange={(e) => setFormData({ ...formData, end_on_date: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Kích hoạt"
            />

            <Alert severity="info" sx={{ fontSize: 12 }}>
              Task lặp lại sẽ tự động tạo task mới theo lịch trình đã chọn.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.repeat_interval || formData.repeat_interval < 1}
          >
            {editingTask ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
