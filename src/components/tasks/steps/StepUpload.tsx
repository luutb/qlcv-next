'use client';

import { useState, useRef } from 'react';
import {
  Box, Button, TextField, Typography,
  CircularProgress, Paper,
} from '@mui/material';
import { CloudUpload, NavigateNext, InsertDriveFile } from '@mui/icons-material';

interface StepUploadProps {
  taskId: string;
  stepNumber: number;
  onSubmit: (note?: string, file?: File) => Promise<void>;
  disabled?: boolean;
}

export default function StepUpload({ onSubmit, disabled }: StepUploadProps) {
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setSubmitting(true);
    try {
      await onSubmit(note || undefined, file);
    } finally {
      setSubmitting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept=".pdf,.png,.jpg,.jpeg,.docx"
      />

      <Button
        variant="outlined"
        startIcon={<CloudUpload />}
        onClick={() => fileInputRef.current?.click()}
        disabled={submitting}
      >
        Chọn tài liệu
      </Button>

      {file && (
        <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <InsertDriveFile color="action" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" noWrap>{file.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatSize(file.size)}
            </Typography>
          </Box>
        </Paper>
      )}

      <TextField
        label="Ghi chú"
        multiline
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        fullWidth
      />

      <Button
        variant="contained"
        endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <NavigateNext />}
        onClick={handleSubmit}
        disabled={disabled || !file || submitting}
      >
        Upload & Chuyển bước
      </Button>
    </Box>
  );
}
