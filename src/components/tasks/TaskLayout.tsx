import React from 'react';
import { Box, Paper, Typography, Divider, Chip, Stepper, Step, StepLabel, Button } from '@mui/material';
import { ArrowBack, Person, CalendarToday, Description, Phone, Email, MonetizationOn } from '@mui/icons-material';
import { Task, WorkflowStepConfig } from '@/types';
import { TASK_STATUS_LABEL, TASK_STATUS_STYLE, STEP_STATUS_LABEL, STEP_STATUS_STYLE } from '@/repositories/constants';

interface Props {
  task: Task;
  createdBy: string;
  stepLabels: string[];
  totalSteps: number;
  currentStepConfig?: WorkflowStepConfig;
  onBack?: () => void;
  children?: React.ReactNode;
}

export default function TaskLayout({ task, createdBy, stepLabels, totalSteps, currentStepConfig, onBack, children }: Props) {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ color: 'text.secondary' }}>Quay lại</Button>
        <Typography variant="h5" sx={{ flex: 1 }}>{task.title}</Typography>
        <Chip
          label={TASK_STATUS_LABEL[task.status] || task.status}
          sx={{
            bgcolor: TASK_STATUS_STYLE[task.status]?.bg || '#F1F5F9',
            color: TASK_STATUS_STYLE[task.status]?.color || '#64748B',
            fontWeight: 600,
            px: 1,
            border: 'none',
          }}
        />
        {task.step_status && task.status === 'ACTIVE' && (
          <Chip
            label={STEP_STATUS_LABEL[task.step_status] || task.step_status}
            sx={{
              bgcolor: STEP_STATUS_STYLE[task.step_status]?.bg || '#F1F5F9',
              color: STEP_STATUS_STYLE[task.step_status]?.color || '#64748B',
              fontWeight: 600,
              px: 1,
              border: 'none',
            }}
          />
        )}
      </Box>

      {/* Common info */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>Thông tin chung</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={TASK_STATUS_LABEL[task.status] || task.status} size="small" sx={{ fontWeight: 600 }} />
              {task.step_status && task.status === 'ACTIVE' && <Chip label={STEP_STATUS_LABEL[task.step_status] || task.step_status} size="small" sx={{ fontWeight: 600 }} />}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">Người tạo:</Typography>
              <Typography variant="body2" fontWeight="bold">{createdBy}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">Ngày tạo:</Typography>
              <Typography variant="body2">{new Date(task.created_at).toLocaleString('vi-VN')}</Typography>
            </Box>

            {((task as any).expiry_date || (task as any).due_date) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">Ngày hết hạn:</Typography>
                <Typography variant="body2">{new Date((task as any).expiry_date || (task as any).due_date).toLocaleDateString('vi-VN')}</Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              {task.deadline && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday fontSize="small" color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Ngày hết hạn</Typography>
                    <Typography variant="body2">{new Date(task.deadline).toLocaleDateString('vi-VN')}</Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MonetizationOn fontSize="small" color="action" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Phí dự kiến</Typography>
                  <Typography variant="body2">
                    {typeof task.amount === 'number'
                      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(task.amount)
                      : '-'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ width: { xs: '100%', md: 360 } }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>Khách hàng</Typography>
            <Divider sx={{ mb: 1 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">Họ tên:</Typography>
                <Typography variant="body2" fontWeight="bold">{task.customer?.full_name}</Typography>
              </Box>
              {task.customer?.phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">SĐT:</Typography>
                  <Typography variant="body2">{task.customer.phone}</Typography>
                </Box>
              )}
              {task.customer?.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                  <Typography variant="body2">{task.customer.email}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Stepper */}
      {stepLabels.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, overflowX: 'auto' }}>
          <Stepper activeStep={task.current_step - 1} alternativeLabel>
            {stepLabels.map((label, index) => (
              <Step key={index} completed={index < task.current_step - 1}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      {children}
    </Box>
  );
}