'use client';

import {
  Box, Typography, Paper, Button, Chip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Switch, FormControlLabel,
  List, ListItem, ListItemText, ListItemIcon,
  ListItemSecondaryAction, IconButton,
} from '@mui/material';
import {
  AccountTree,
  Add,
  Edit,
  Delete,
  PlayArrow,
  Pause,
  Settings,
} from '@mui/icons-material';
import { useState } from 'react';

interface WorkflowStep {
  id?: number;
  step: number;
  step_name: string;
  required_role: 'admin' | 'manager' | 'staff' | 'accountant';
  require_file?: boolean;
  require_approval?: boolean;
  auto_advance?: boolean;
  auto_advance_condition?: string;
  is_active?: boolean;
}

interface CustomWorkflow {
  id?: number;
  name: string;
  description?: string;
  is_active: boolean;
  steps: WorkflowStep[];
  created_at: string;
}

interface CustomWorkflowProps {
  workflows: CustomWorkflow[];
  onAdd?: (workflow: Omit<CustomWorkflow, 'id' | 'created_at'>) => Promise<void>;
  onUpdate?: (workflow: CustomWorkflow) => Promise<void>;
  onDelete?: (workflowId: number) => Promise<void>;
}

export default function CustomWorkflow({
  workflows,
  onAdd,
  onUpdate,
  onDelete,
}: CustomWorkflowProps) {
  const [open, setOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<CustomWorkflow | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    steps: [] as WorkflowStep[],
  });
  const [stepFormData, setStepFormData] = useState({
    step: 1,
    step_name: '',
    required_role: 'manager' as const,
    require_file: false,
    require_approval: false,
    auto_advance: false,
    auto_advance_condition: '',
  });

  const handleOpen = (workflow?: CustomWorkflow) => {
    if (workflow) {
      setEditingWorkflow(workflow);
      setFormData({
        name: workflow.name,
        description: workflow.description || '',
        is_active: workflow.is_active,
        steps: workflow.steps,
      });
    } else {
      setEditingWorkflow(null);
      setFormData({
        name: '',
        description: '',
        is_active: true,
        steps: [],
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingWorkflow(null);
  };

  const handleAddStep = () => {
    if (!stepFormData.step_name.trim()) return;

    const newStep: WorkflowStep = {
      step: stepFormData.step,
      step_name: stepFormData.step_name,
      required_role: stepFormData.required_role,
      require_file: stepFormData.require_file,
      require_approval: stepFormData.require_approval,
      auto_advance: stepFormData.auto_advance,
      auto_advance_condition: stepFormData.auto_advance_condition,
      is_active: true,
    };

    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));

    setStepFormData({
      step: formData.steps.length + 1,
      step_name: '',
      required_role: 'manager',
      require_file: false,
      require_approval: false,
      auto_advance: false,
      auto_advance_condition: '',
    });
  };

  const handleRemoveStep = (stepIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== stepIndex),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;

    const workflowData: Omit<CustomWorkflow, 'id' | 'created_at'> = {
      name: formData.name,
      description: formData.description,
      is_active: formData.is_active,
      steps: formData.steps,
    };

    if (editingWorkflow && onUpdate) {
      await onUpdate({ ...editingWorkflow, ...workflowData });
    } else if (onAdd) {
      await onAdd(workflowData);
    }

    handleClose();
  };

  const handleDelete = async (workflowId: number) => {
    if (onDelete) {
      await onDelete(workflowId);
    }
  };

  const handleToggleActive = async (workflow: CustomWorkflow) => {
    if (onUpdate) {
      await onUpdate({ ...workflow, is_active: !workflow.is_active });
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Quản trị',
      manager: 'Quản lý',
      staff: 'Nhân viên',
      accountant: 'Kế toán',
    };
    return labels[role] || role;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AccountTree fontSize="small" color="action" />
        <Typography variant="h6">Custom Workflows</Typography>
        <Chip
          label={`${workflows.length} workflows`}
          size="small"
          color="primary"
        />
      </Box>

      {workflows.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Chưa có custom workflow nào
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => handleOpen()}
          >
            Tạo workflow đầu tiên
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {workflows.map((workflow) => (
            <Paper
              key={workflow.id}
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: workflow.is_active ? 'background.paper' : 'action.disabledBackground',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" fontWeight="500">
                  {workflow.name}
                </Typography>
                {workflow.is_active && (
                  <Chip
                    label="Đang hoạt động"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>

              {workflow.description && (
                <Typography variant="caption" color="text.secondary">
                  {workflow.description}
                </Typography>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {workflow.steps.length} bước
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {' • '}
                  Tạo: {new Date(workflow.created_at).toLocaleDateString('vi-VN')}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  size="small"
                  onClick={() => handleOpen(workflow)}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(workflow.id!)}
                >
                  Xóa
                </Button>
                <Switch
                  checked={workflow.is_active}
                  onChange={() => handleToggleActive(workflow)}
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
        Thêm workflow
      </Button>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingWorkflow ? 'Chỉnh sửa workflow' : 'Tạo workflow mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Tên workflow"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <TextField
              label="Mô tả"
              multiline
              rows={2}
              fullWidth
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Các bước
              </Typography>

              {formData.steps.length === 0 ? (
                <Alert severity="info" sx={{ fontSize: 12 }}>
                  Chưa có bước nào. Thêm bước để tạo workflow.
                </Alert>
              ) : (
                <List>
                  {formData.steps.map((step, idx) => (
                    <ListItem
                      key={idx}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemIcon>
                        <Typography variant="body2" fontWeight="500">
                          Bước {step.step}
                        </Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary={step.step_name}
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {getRoleLabel(step.required_role)}
                            </Typography>
                            {step.require_file && (
                              <Typography variant="caption" color="text.secondary">
                                {' • '} Yêu cầu file
                              </Typography>
                            )}
                            {step.require_approval && (
                              <Typography variant="caption" color="text.secondary">
                                {' • '} Yêu cầu duyệt
                              </Typography>
                            )}
                            {step.auto_advance && (
                              <Typography variant="caption" color="success.main">
                                {' • '} Tự động chuyển
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveStep(idx)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}

              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Thêm bước mới
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <TextField
                    label="Tên bước"
                    required
                    size="small"
                    value={stepFormData.step_name}
                    onChange={(e) => setStepFormData({ ...stepFormData, step_name: e.target.value })}
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                  <TextField
                    select
                    label="Vai trò"
                    size="small"
                    value={stepFormData.required_role}
                    onChange={(e) => setStepFormData({ ...stepFormData, required_role: e.target.value as any })}
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="admin">Quản trị</MenuItem>
                    <MenuItem value="manager">Quản lý</MenuItem>
                    <MenuItem value="staff">Nhân viên</MenuItem>
                    <MenuItem value="accountant">Kế toán</MenuItem>
                  </TextField>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAddStep}
                    disabled={!stepFormData.step_name.trim()}
                  >
                    Thêm
                  </Button>
                </Box>
              </Box>
            </Box>

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
              Custom workflows cho phép bạn tự định nghĩa quy trình làm việc với các bước và điều kiện riêng.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name.trim() || formData.steps.length === 0}
          >
            {editingWorkflow ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
