'use client';

import { useState } from 'react';
import { Box, Button, TextField, CircularProgress, Alert } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';

interface StepDefaultProps {
  onSubmit: (note?: string) => Promise<void>;
  disabled?: boolean;
  label?: string;
}

export default function StepDefault({ onSubmit, disabled, label }: StepDefaultProps) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(note || undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {label && <Alert severity="success" sx={{ borderRadius: 3 }}>{label}</Alert>}
      <TextField
        label="Ghi chú (tùy chọn)"
        multiline
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        fullWidth
      />
      <Button
        variant="contained"
        endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <NavigateNext />}
        onClick={handleSubmit}
        disabled={disabled || loading}
      >
        Chuyển bước tiếp theo
      </Button>
    </Box>
  );
}
