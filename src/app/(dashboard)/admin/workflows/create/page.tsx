'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Box, Paper, Typography, TextField, Button, MenuItem,
  CircularProgress, Divider, IconButton, Chip, Alert,
} from '@mui/material';
import { ArrowBack, Add, Delete } from '@mui/icons-material';
import { Role, CreateWorkflowStep } from '@/types';
import { workflowRepo } from '@/repositories/workflow.repo';
import toast from 'react-hot-toast';

interface WorkflowForm {
  name: string;
  description?: string;
  steps_before_payment: CreateWorkflowStep[];
  processing_steps: CreateWorkflowStep[];
}

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'manager', label: 'Quản lý' },
  { value: 'staff', label: 'Nhân viên' },
  { value: 'accountant', label: 'Kế toán' },
];

const FIXED_STEPS = [
  'Tiếp nhận',
  'Xác nhận thanh toán',
  'Hoàn tất',
  'Thu tiền',
  'Hoàn thành',
];

const emptyStep = (): CreateWorkflowStep => ({
  step_name: '',
  required_role: 'staff',
  require_file: false,
  description: '',
});

export default function CreateWorkflowPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<WorkflowForm>({
    defaultValues: {
      name: '',
      description: '',
      steps_before_payment: [emptyStep()],
      processing_steps: [emptyStep()],
    },
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stepsBeforePayment, setStepsBeforePayment] = useState<CreateWorkflowStep[]>([emptyStep()]);
  const [processingSteps, setProcessingSteps] = useState<CreateWorkflowStep[]>([emptyStep()]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Tên quy trình không được để trống';
    stepsBeforePayment.forEach((s, i) => {
      if (!s.step_name.trim()) errs[`before_${i}`] = 'Tên bước không được để trống';
    });
    processingSteps.forEach((s, i) => {
      if (!s.step_name.trim()) errs[`proc_${i}`] = 'Tên bước không được để trống';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (data: WorkflowForm) => {
    if (!validate()) return;
    setLoading(true);
    try {
      await workflowRepo.create({
        name: data.name.trim(),
        description: data.description?.trim(),
        steps_before_payment: data.steps_before_payment,
        processing_steps: data.processing_steps,
      });
      toast.success('Tạo quy trình thành công');
      router.push('/admin/workflows');
    } catch {
      toast.error('Tạo quy trình thất bại');
    } finally {
      setLoading(false);
    }
  };

  const updateStep = (
    list: CreateWorkflowStep[],
    setList: React.Dispatch<React.SetStateAction<CreateWorkflowStep[]>>,
    index: number,
    field: keyof CreateWorkflowStep,
    value: string | boolean,
  ) => {
    setList((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const addStep = (setList: React.Dispatch<React.SetStateAction<CreateWorkflowStep[]>>) => {
    setList((prev) => [...prev, emptyStep()]);
  };

  const removeStep = (
    list: CreateWorkflowStep[],
    setList: React.Dispatch<React.SetStateAction<CreateWorkflowStep[]>>,
    index: number,
  ) => {
    if (list.length <= 1) return;
    setList((prev) => prev.filter((_, i) => i !== index));
  };

  const renderStepForm = (
    steps: CreateWorkflowStep[],
    setSteps: React.Dispatch<React.SetStateAction<CreateWorkflowStep[]>>,
    prefix: string,
  ) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {steps.map((step, index) => (
        <Paper key={index} variant="outlined" sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Chip label={`Bước ${index + 1}`} size="small" color="primary" variant="outlined" />
            {steps.length > 1 && (
              <IconButton size="small" color="error" onClick={() => removeStep(steps, setSteps, index)}>
                <Delete fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Tên bước"
              value={step.step_name}
              onChange={(e) => updateStep(steps, setSteps, index, 'step_name', e.target.value)}
              size="small"
              sx={{ flex: 1, minWidth: 200 }}
              error={!!errors[`${prefix}_${index}`]}
              helperText={errors[`${prefix}_${index}`]}
            />
            <TextField
              select
              label="Vai trò"
              value={step.required_role}
              onChange={(e) => updateStep(steps, setSteps, index, 'required_role', e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              {ROLE_OPTIONS.map((r) => (
                <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Yêu cầu file"
              value={step.require_file ? 'true' : 'false'}
              onChange={(e) => updateStep(steps, setSteps, index, 'require_file', e.target.value === 'true')}
              size="small"
              sx={{ minWidth: 130 }}
            >
              <MenuItem value="false">Không</MenuItem>
              <MenuItem value="true">Có</MenuItem>
            </TextField>
          </Box>
        </Paper>
      ))}
      <Button
        variant="outlined"
        startIcon={<Add />}
        onClick={() => addStep(setSteps)}
        size="small"
        sx={{ alignSelf: 'flex-start' }}
      >
        Thêm bước
      </Button>
    </Box>
  );

  // Build preview
  const previewSteps = [
    FIXED_STEPS[0],
    ...stepsBeforePayment.map((s) => s.step_name || '(chưa đặt tên)'),
    FIXED_STEPS[1],
    ...processingSteps.map((s) => s.step_name || '(chưa đặt tên)'),
    ...FIXED_STEPS.slice(2),
  ];

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.back()}>
          Quay lại
        </Button>
        <Typography variant="h5" fontWeight="bold">
          Tạo quy trình mới
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Left: Form */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Thông tin chung</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Tên quy trình"
                {...register('name', { required: 'Tên quy trình không được để trống' })}
                required
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
              <TextField
                label="Mô tả"
                {...register('description')}
                multiline
                rows={3}
                fullWidth
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Bước trước thanh toán</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Các bước tùy chỉnh giữa &quot;Tiếp nhận&quot; và &quot;Xác nhận thanh toán&quot;
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {renderStepForm(stepsBeforePayment, setStepsBeforePayment, 'before')}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Bước xử lý</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Các bước tùy chỉnh giữa &quot;Xác nhận thanh toán&quot; và &quot;Hoàn tất&quot;
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {renderStepForm(processingSteps, setProcessingSteps, 'proc')}
          </Paper>

          <Button
            type="submit"
            variant="contained"
            size="large"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Add />}
          >
            Tạo quy trình
          </Button>
        </Box>

        {/* Right: Preview */}
        <Paper sx={{ p: 3, height: 'fit-content', position: 'sticky', top: 80 }}>
          <Typography variant="h6" gutterBottom>Xem trước quy trình</Typography>
          <Divider sx={{ mb: 2 }} />
          <Alert severity="info" sx={{ mb: 2, fontSize: 12 }}>
            Các bước cố định được đánh dấu màu xám và không thể thay đổi.
          </Alert>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {previewSteps.map((stepName, index) => {
              const isFixed = FIXED_STEPS.includes(stepName);
              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    p: 1.5, borderRadius: 2,
                    bgcolor: isFixed ? '#F1F5F9' : '#EEF2FF',
                    border: `1px solid ${isFixed ? '#CBD5E1' : '#C7D2FE'}`,
                  }}
                >
                  <Chip
                    label={index + 1}
                    size="small"
                    color={isFixed ? 'default' : 'primary'}
                    variant="outlined"
                    sx={{ minWidth: 32 }}
                  />
                  <Typography variant="body2" fontWeight={isFixed ? 400 : 600}>
                    {stepName}
                  </Typography>
                  {isFixed && (
                    <Chip label="Cố định" size="small" variant="outlined" sx={{ ml: 'auto', fontSize: 10 }} />
                  )}
                </Box>
              );
            })}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
