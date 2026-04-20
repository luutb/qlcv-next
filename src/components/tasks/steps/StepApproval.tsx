'use client';

import { useState } from 'react';
import { Box, Button, TextField, CircularProgress, Alert } from '@mui/material';
import { CheckCircle, Block } from '@mui/icons-material';

interface StepApprovalProps {
  onApprove: (note?: string) => Promise<void>;
  onReject: () => void;
  disabled?: boolean;
}

export default function StepApproval({ onApprove, onReject, disabled }: StepApprovalProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(note || undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Alert severity="info" sx={{ borderRadius: 3 }}>
        Bước này yêu cầu phê duyệt. Vui lòng kiểm tra và phê duyệt hoặc từ chối.
      </Alert>
      <TextField
        label="Ghi chú (tùy chọn)"
        multiline
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        fullWidth
      />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
          onClick={handleApprove}
          disabled={disabled || loading}
          sx={{ flex: 1 }}
        >
          Phê duyệt
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Block />}
          onClick={onReject}
          disabled={disabled || loading}
          sx={{ flex: 1 }}
        >
          Từ chối
        </Button>
      </Box>
    </Box>
  );
}
