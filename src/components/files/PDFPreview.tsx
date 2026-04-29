'use client';

import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { useState, useEffect } from 'react';

interface PDFPreviewProps {
  url: string;
  fileName: string;
  fileSize?: number;
}

export default function PDFPreview({ url, fileName, fileSize }: PDFPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [url]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6">Xem trước PDF</Typography>
        {fileSize && (
          <Typography variant="caption" color="text.secondary">
            ({formatFileSize(fileSize)})
          </Typography>
        )}
      </Box>

      <Paper sx={{ p: 2, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">
            {error}
          </Alert>
        ) : (
          <Box sx={{ position: 'relative', width: '100%', minHeight: 400 }}>
            <iframe
              src={url}
              title={fileName}
              style={{ width: '100%', height: '500px', border: 'none' }}
              onError={() => setError('Không thể tải file PDF')}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              File: {fileName}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
