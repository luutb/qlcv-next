'use client';

import { useState } from 'react';
import {
  Box, Button, TextField, Typography, CircularProgress, Alert,
} from '@mui/material';
import { Payment, NavigateNext } from '@mui/icons-material';
import { Task, PaymentAction } from '@/types';

interface StepPaymentProps {
  task: Task;
  stepNumber: number;
  onConfirmPayment: (action: PaymentAction, amount: number, note?: string) => Promise<void>;
  onSubmit: (note?: string) => Promise<void>;
  disabled?: boolean;
}

export default function StepPayment({
  task, stepNumber, onConfirmPayment, onSubmit, disabled,
}: StepPaymentProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isCollectionStep = stepNumber === 9;
  const action: PaymentAction = isCollectionStep ? 'confirm_collected' : 'confirm_paid';
  const isConfirmed = isCollectionStep ? task.is_collected : task.is_paid;
  const confirmedAmount = isCollectionStep ? task.collected_amount : task.paid_amount;

  const label = isCollectionStep ? 'Thu phí' : 'Thanh toán';

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  const handleConfirmPayment = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    setConfirming(true);
    try {
      await onConfirmPayment(action, numAmount, note || undefined);
    } finally {
      setConfirming(false);
    }
  };

  const handleNextStep = async () => {
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Tổng số tiền hồ sơ
        </Typography>
        <Typography variant="h5" color="primary" fontWeight="bold" sx={{ mt: 0.5 }}>
          {task.amount ? formatCurrency(task.amount) : 'Chưa xác định'}
        </Typography>
        {confirmedAmount != null && confirmedAmount > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Đã {label.toLowerCase()}: {formatCurrency(confirmedAmount)}
          </Typography>
        )}
      </Box>

      {isConfirmed ? (
        <>
          <Alert severity="success" sx={{ borderRadius: 3 }}>
            Đã xác nhận {label.toLowerCase()}
          </Alert>
          <Button
            variant="contained"
            endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <NavigateNext />}
            onClick={handleNextStep}
            disabled={disabled || submitting}
            size="large"
          >
            Chuyển bước tiếp theo
          </Button>
        </>
      ) : (
        <>
          <TextField
            label={`Số tiền ${label.toLowerCase()} (VND)`}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            slotProps={{ htmlInput: { min: 0 } }}
          />
          <TextField
            label="Ghi chú (tùy chọn)"
            multiline
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            color="warning"
            startIcon={confirming ? <CircularProgress size={20} color="inherit" /> : <Payment />}
            onClick={handleConfirmPayment}
            disabled={disabled || confirming || !amount || parseFloat(amount) <= 0}
          >
            Xác nhận {label.toLowerCase()}
          </Button>
        </>
      )}
    </Box>
  );
}
