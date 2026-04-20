'use client';

import { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

interface StepFinalProps {
  onSubmit: (note?: string) => Promise<void>;
  disabled?: boolean;
}

export default function StepFinal({ onSubmit, disabled }: StepFinalProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await onSubmit(note || undefined);
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Alert severity="success" icon={<CheckCircle />}>
        Hồ sơ đã hoàn tất thành công!
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="body1" color="text.secondary">
        Đây là bước cuối cùng. Sau khi xác nhận, hồ sơ sẽ được đánh dấu hoàn tất.
      </Typography>
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
        color="success"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
        onClick={handleComplete}
        disabled={disabled || loading}
        size="large"
      >
        Hoàn tất hồ sơ
      </Button>
    </Box>
  );
}
