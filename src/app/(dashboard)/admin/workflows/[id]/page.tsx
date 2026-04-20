'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Paper, Typography, TextField, Button, MenuItem,
  CircularProgress, Divider, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, Alert,
} from '@mui/material';
import { ArrowBack, Save, Edit, Check, Close } from '@mui/icons-material';
import { WorkflowDetail, WorkflowStepConfig, Role } from '@/types';
import { workflowRepo } from '@/repositories/workflow.repo';
import toast from 'react-hot-toast';

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Quản trị viên' },
  { value: 'manager', label: 'Quản lý' },
  { value: 'staff', label: 'Nhân viên' },
  { value: 'accountant', label: 'Kế toán' },
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị viên',
  manager: 'Quản lý',
  staff: 'Nhân viên',
  accountant: 'Kế toán',
};

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = Number(params.id);

  const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
  const [steps, setSteps] = useState<WorkflowStepConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline edit state
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<WorkflowStepConfig | null>(null);

  // Workflow info edit
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await workflowRepo.getById(workflowId);
      setWorkflow(data);
      setSteps(data.steps || []);
      setName(data.name);
      setDescription(data.description || '');
      setIsActive(data.is_active);
      setError(null);
    } catch {
      setError('Không thể tải thông tin quy trình');
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Step inline editing
  const startEdit = (step: WorkflowStepConfig) => {
    setEditingStep(step.step);
    setEditForm({ ...step });
  };

  const cancelEdit = () => {
    setEditingStep(null);
    setEditForm(null);
  };

  const confirmEdit = () => {
    if (!editForm) return;
    if (!editForm.step_name.trim()) {
      toast.error('Tên bước không được để trống');
      return;
    }
    setSteps((prev) => prev.map((s) => (s.step === editForm.step ? editForm : s)));
    setEditingStep(null);
    setEditForm(null);
  };

  // Save workflow
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Tên quy trình không được để trống');
      return;
    }
    setSaving(true);
    try {
      // Separate custom steps into before_payment and processing based on fixed step positions
      const fixedPaymentStep = steps.find(
        (s) => s.is_fixed && s.require_payment && !s.step_name.toLowerCase().includes('thu'),
      );
      const fixedCompleteStep = steps.find(
        (s) => s.is_fixed && s.step_name.toLowerCase().includes('hoàn tất'),
      );

      const paymentIdx = fixedPaymentStep ? steps.indexOf(fixedPaymentStep) : -1;
      const completeIdx = fixedCompleteStep ? steps.indexOf(fixedCompleteStep) : -1;

      const stepsBeforePayment = paymentIdx > 1
        ? steps.slice(1, paymentIdx).filter((s) => !s.is_fixed).map((s) => ({
            step_name: s.step_name,
            required_role: s.required_role,
            require_file: s.require_file,
            description: s.description || '',
          }))
        : [];

      const processingSteps = paymentIdx >= 0 && completeIdx > paymentIdx
        ? steps.slice(paymentIdx + 1, completeIdx).filter((s) => !s.is_fixed).map((s) => ({
            step_name: s.step_name,
            required_role: s.required_role,
            require_file: s.require_file,
            description: s.description || '',
          }))
        : [];

      await workflowRepo.update(workflowId, {
        name: name.trim(),
        description: description.trim() || undefined,
        is_active: isActive,
        steps_before_payment: stepsBeforePayment,
        processing_steps: processingSteps,
      });
      toast.success('Đã lưu quy trình');
      await fetchData();
    } catch {
      toast.error('Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !workflow) {
    return <Alert severity="error">{error || 'Không tìm thấy quy trình'}</Alert>;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/admin/workflows')}>
          Quay lại
        </Button>
        <Typography variant="h5" fontWeight="bold" sx={{ flex: 1 }}>
          {workflow.name}
        </Typography>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
          onClick={handleSave}
          disabled={saving}
        >
          Lưu thay đổi
        </Button>
      </Box>

      {/* Workflow Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Thông tin quy trình</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Tên quy trình"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            fullWidth
          />
          <FormControlLabel
            control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
            label="Kích hoạt quy trình"
          />
        </Box>
      </Paper>

      {/* Steps Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Các bước trong quy trình</Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Các bước cố định (đánh dấu &quot;Cố định&quot;) không thể chỉnh sửa. Chỉ có thể sửa các bước tùy chỉnh.
        </Alert>
        <Divider sx={{ mb: 2 }} />

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width={60}>Bước</TableCell>
                <TableCell>Tên bước</TableCell>
                <TableCell width={160}>Vai trò</TableCell>
                <TableCell width={100} align="center">Yêu cầu file</TableCell>
                <TableCell width={120} align="center">Thanh toán</TableCell>
                <TableCell width={110} align="center">Phê duyệt</TableCell>
                <TableCell width={90} align="center">Loại</TableCell>
                <TableCell width={80} align="center">Sửa</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {steps.map((step) => {
                const isEditing = editingStep === step.step;
                const isFixed = step.is_fixed;
                const data = isEditing && editForm ? editForm : step;
                return (
                  <TableRow
                    key={step.step}
                    sx={{
                      '&:last-child td': { border: 0 },
                      bgcolor: isFixed ? '#FAFBFC' : undefined,
                    }}
                  >
                    <TableCell>
                      <Chip label={step.step} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          fullWidth
                          value={data.step_name}
                          onChange={(e) =>
                            setEditForm((prev) => (prev ? { ...prev, step_name: e.target.value } : prev))
                          }
                        />
                      ) : (
                        <Box>
                          <Typography variant="body2" fontWeight={500}>{step.step_name}</Typography>
                          {step.description && (
                            <Typography variant="caption" color="text.secondary">{step.description}</Typography>
                          )}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          select
                          size="small"
                          fullWidth
                          value={data.required_role}
                          onChange={(e) =>
                            setEditForm((prev) =>
                              prev ? { ...prev, required_role: e.target.value as Role } : prev,
                            )
                          }
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <Chip
                          label={ROLE_LABELS[step.required_role] || step.required_role}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {isEditing ? (
                        <Switch
                          checked={data.require_file}
                          onChange={(e) =>
                            setEditForm((prev) => (prev ? { ...prev, require_file: e.target.checked } : prev))
                          }
                        />
                      ) : step.require_file ? (
                        <Check color="success" fontSize="small" />
                      ) : (
                        <Close color="disabled" fontSize="small" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {step.require_payment ? (
                        <Check color="success" fontSize="small" />
                      ) : (
                        <Close color="disabled" fontSize="small" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {isEditing ? (
                        <Switch
                          checked={data.require_approval || false}
                          onChange={(e) =>
                            setEditForm((prev) => (prev ? { ...prev, require_approval: e.target.checked } : prev))
                          }
                        />
                      ) : step.require_approval ? (
                        <Check color="success" fontSize="small" />
                      ) : (
                        <Close color="disabled" fontSize="small" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={isFixed ? 'Cố định' : 'Tùy chỉnh'}
                        size="small"
                        color={isFixed ? 'default' : 'info'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {isFixed ? (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      ) : isEditing ? (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Xác nhận">
                            <IconButton size="small" color="success" onClick={confirmEdit}>
                              <Check fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hủy">
                            <IconButton size="small" onClick={cancelEdit}>
                              <Close fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      ) : (
                        <Tooltip title="Chỉnh sửa">
                          <IconButton size="small" onClick={() => startEdit(step)}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
