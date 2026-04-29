'use client';

import {
  Box, Typography, Paper, Grid, Chip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, List, ListItem, ListItemText, ListItemIcon,
  ListItemSecondaryAction, IconButton, Divider,
} from '@mui/material';
import {
  Folder,
  FileDownload,
  Delete,
  InsertDriveFile,
  Share,
  Lock,
  Public,
  History,
  Visibility,
} from '@mui/icons-material';
import { useState } from 'react';

interface Document {
  id: number;
  task_id?: number;
  task_name?: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_by: number;
  uploaded_by_name?: string;
  uploaded_at: string;
  version: number;
  permissions: 'private' | 'team' | 'public';
  is_locked?: boolean;
}

interface DocumentManagementProps {
  documents: Document[];
  onUpload?: (file: File, taskId?: number) => Promise<Document>;
  onDelete?: (documentId: number) => Promise<void>;
  onShare?: (documentId: number, permission: 'private' | 'team' | 'public') => Promise<void>;
}

export default function DocumentManagement({
  documents,
  onUpload,
  onDelete,
  onShare,
}: DocumentManagementProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Group documents by task
  const documentsByTask: Record<string, Document[]> = {};
  documents.forEach((doc) => {
    const key = doc.task_name || 'Uncategorized';
    if (!documentsByTask[key]) {
      documentsByTask[key] = [];
    }
    documentsByTask[key].push(doc);
  });

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get permission icon
  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'public':
        return <Public fontSize="small" color="action" />;
      case 'team':
        return <Share fontSize="small" color="action" />;
      default:
        return <Lock fontSize="small" color="action" />;
    }
  };

  const handleShare = async (documentId: number, permission: 'private' | 'team' | 'public') => {
    if (onShare) {
      await onShare(documentId, permission);
      setShowShareDialog(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Folder fontSize="small" color="action" />
        <Typography variant="h6">Document Management</Typography>
        <Chip
          label={`${documents.length} documents`}
          size="small"
          color="primary"
        />
      </Box>

      {/* Summary */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Tổng dung lượng
            </Typography>
            <Typography variant="body2" fontWeight="500">
              {formatFileSize(documents.reduce((acc, d) => acc + d.file_size, 0))}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Tài liệu công
            </Typography>
            <Typography variant="body2" fontWeight="500" color="primary">
              {documents.filter((d) => d.permissions === 'public').length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Tài liệu riêng tư
            </Typography>
            <Typography variant="body2" fontWeight="500" color="error">
              {documents.filter((d) => d.permissions === 'private').length}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Documents by Task */}
      {Object.keys(documentsByTask).length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Chưa có tài liệu nào
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {Object.entries(documentsByTask).map(([taskName, docs]) => (
            <Paper key={taskName} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <InsertDriveFile fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight="500">
                  {taskName}
                </Typography>
                <Chip
                  label={`${docs.length} files`}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <List>
                {docs.map((doc) => (
                  <ListItem
                    key={doc.id}
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
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight="500">
                            {doc.file_name}
                          </Typography>
                          <Chip
                            label={`v${doc.version}`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(doc.uploaded_at)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {' • '}
                            {formatFileSize(doc.file_size)}
                          </Typography>
                          {doc.uploaded_by_name && (
                            <Typography variant="caption" color="text.secondary">
                              {' • '}
                              {doc.uploaded_by_name}
                            </Typography>
                          )}
                          {doc.is_locked && (
                            <Typography variant="caption" color="error">
                              {' • '}
                              Đã khóa
                            </Typography>
                          )}
                        </Box>
                      }
                    />

                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        title="Tải xuống"
                        onClick={() => console.log('Download:', doc)}
                      >
                        <FileDownload fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        title="Chia sẻ"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setShowShareDialog(true);
                        }}
                      >
                        {getPermissionIcon(doc.permissions)}
                      </IconButton>
                      {onDelete && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(doc.id)}
                          title="Xóa"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          ))}
        </Box>
      )}

      {/* Share Dialog */}
      <Dialog
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedDocument && (
          <>
            <DialogTitle>
              Chia sẻ: {selectedDocument.file_name}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Alert severity="info" sx={{ fontSize: 12 }}>
                  Quyền truy cập hiện tại: {selectedDocument.permissions}
                </Alert>

                <Button
                  variant={selectedDocument.permissions === 'private' ? 'contained' : 'outlined'}
                  fullWidth
                  startIcon={<Lock />}
                  onClick={() => handleShare(selectedDocument.id, 'private')}
                >
                  Riêng tư (Chỉ tôi)
                </Button>

                <Button
                  variant={selectedDocument.permissions === 'team' ? 'contained' : 'outlined'}
                  fullWidth
                  startIcon={<Share />}
                  onClick={() => handleShare(selectedDocument.id, 'team')}
                >
                  Nhóm (Tất cả thành viên)
                </Button>

                <Button
                  variant={selectedDocument.permissions === 'public' ? 'contained' : 'outlined'}
                  fullWidth
                  startIcon={<Public />}
                  onClick={() => handleShare(selectedDocument.id, 'public')}
                >
                  Công khai (Mọi người)
                </Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowShareDialog(false)}>Hủy</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
