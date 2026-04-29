'use client';

import {
  Box, Typography, Paper, Button, Alert, LinearProgress,
  Chip, IconButton, List, ListItem, ListItemText, ListItemIcon,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  CloudUpload,
  FileDownload,
  Delete,
  InsertDriveFile,
  Close,
  Error,
} from '@mui/icons-material';
import { useState, useRef } from 'react';

interface FileMetadata {
  id: number;
  file_name: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  uploaded_by: number;
  uploaded_by_name?: string;
  version: number;
}

interface FileUploadProps {
  onUpload?: (file: File) => Promise<FileMetadata>;
  onDelete?: (fileId: number) => Promise<void>;
  maxSize?: number;
  allowedTypes?: string[];
  multiple?: boolean;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function FileUpload({
  onUpload,
  onDelete,
  maxSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'image/png', 'image/jpeg'],
  multiple = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setError(`Loại file không được hỗ trợ. Chỉ cho phép: PDF, DOCX, DOC, PNG, JPEG`);
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`File quá lớn. Tối đa: ${formatFileSize(maxSize)}`);
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    let interval: ReturnType<typeof setInterval> | undefined;
    try {
      // Simulate upload progress
      interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            if (interval) clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      if (onUpload) {
        const uploadedFile = await onUpload(file);
        setFiles((prev) => [uploadedFile, ...prev]);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 500);
      }
    } catch (err) {
      setError('Tải file lên thất bại');
    } finally {
      setUploading(false);
      if (interval) clearInterval(interval);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (fileId: number) => {
    if (onDelete) {
      await onDelete(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    }
  };

  const handleDownload = (file: FileMetadata) => {
    // TODO: Implement download
    console.log('Download file:', file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const fakeEvent = { target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(fakeEvent);
    }
  };

  return (
    <Box>
      {/* Upload Area */}
      <Paper
        sx={{
          p: 3,
          border: 2,
          borderColor: 'divider',
          borderStyle: 'dashed',
          bgcolor: 'action.hover',
          cursor: 'pointer',
          position: 'relative',
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          multiple={multiple}
        />

        {uploading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CloudUpload fontSize="large" color="primary" />
            <Typography variant="body2" color="primary">
              Đang tải lên...
            </Typography>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{ width: '100%', maxWidth: 300 }}
            />
            <Typography variant="caption" color="text.secondary">
              {uploadProgress}% - {formatFileSize(files.reduce((acc, f) => acc + f.file_size, 0))} / {formatFileSize(maxSize)}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <CloudUpload fontSize="large" color="action" />
            <Typography variant="body2" color="text.secondary">
              Kéo và thả file vào đây hoặc click để chọn file
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Hỗ trợ: PDF, DOCX, DOC, PNG, JPEG (Tối đa: {formatFileSize(maxSize)})
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Danh sách file:
          </Typography>
          <List>
            {files.map((file) => (
              <ListItem
                key={file.id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  <InsertDriveFile color="action" />
                </ListItemIcon>

                <ListItemText
                  primary={file.file_name}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(file.file_size)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {' • '}
                        {new Date(file.uploaded_at).toLocaleDateString('vi-VN')}
                      </Typography>
                      {file.uploaded_by_name && (
                        <Typography variant="caption" color="text.secondary">
                          {' • '}
                          {file.uploaded_by_name}
                        </Typography>
                      )}
                      <Chip
                        label={`v${file.version}`}
                        size="small"
                        sx={{ ml: 0.5 }}
                      />
                    </Box>
                  }
                />

                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    onClick={() => handleDownload(file)}
                    title="Tải xuống"
                  >
                    <FileDownload fontSize="small" />
                  </IconButton>
                  {onDelete && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(file.id)}
                      title="Xóa"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
}
