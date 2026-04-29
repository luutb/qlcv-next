'use client';

import {
  Box, Typography, Paper, List, ListItem, ListItemText,
  ListItemIcon, ListItemSecondaryAction, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import {
  History,
  FileDownload,
  Compare,
  Close,
} from '@mui/icons-material';
import { useState } from 'react';

interface FileVersion {
  id: number;
  version: number;
  file_name: string;
  file_size: number;
  uploaded_by: number;
  uploaded_by_name?: string;
  uploaded_at: string;
  change_description: string;
}

interface FileVersionHistoryProps {
  versions: FileVersion[];
  onDownload?: (versionId: number) => Promise<void>;
  onCompare?: (v1: FileVersion, v2: FileVersion) => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function FileVersionHistory({
  versions,
  onDownload,
  onCompare,
}: FileVersionHistoryProps) {
  const [compareVersions, setCompareVersions] = useState<{
    v1: FileVersion;
    v2: FileVersion;
  } | null>(null);

  const handleCompare = (v1: FileVersion, v2: FileVersion) => {
    setCompareVersions({ v1, v2 });
  };

  const handleCloseCompare = () => {
    setCompareVersions(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <History fontSize="small" color="action" />
        <Typography variant="h6">Lịch sử phiên bản</Typography>
        <Chip
          label={`${versions.length} phiên bản`}
          size="small"
          color="primary"
        />
      </Box>

      {versions.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Chưa có phiên bản nào
          </Typography>
        </Paper>
      ) : (
        <List>
          {versions.map((version, idx) => (
            <ListItem
              key={version.id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                bgcolor: idx === 0 ? 'action.hover' : 'transparent',
              }}
            >
              <ListItemIcon>
                <Chip
                  label={`v${version.version}`}
                  size="small"
                  color={idx === 0 ? 'primary' : 'default'}
                  variant={idx === 0 ? 'filled' : 'outlined'}
                />
              </ListItemIcon>

              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="500">
                      {version.file_name}
                    </Typography>
                    {idx === 0 && (
                      <Chip
                        label="Mới nhất"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(version.uploaded_at)}
                    </Typography>
                    {version.uploaded_by_name && (
                      <Typography variant="caption" color="text.secondary">
                        {' • '}
                        {version.uploaded_by_name}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {' • '}
                      {formatFileSize(version.file_size)}
                    </Typography>
                    {version.change_description && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {version.change_description}
                      </Typography>
                    )}
                  </Box>
                }
              />

              <ListItemSecondaryAction>
                <IconButton
                  size="small"
                  onClick={() => onDownload && onDownload(version.id)}
                  title="Tải xuống"
                >
                  <FileDownload fontSize="small" />
                </IconButton>
                {idx > 0 && onCompare && (
                  <IconButton
                    size="small"
                    onClick={() => handleCompare(versions[0], version)}
                    title="So sánh"
                  >
                    <Compare fontSize="small" />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Compare Versions Dialog */}
      <Dialog
        open={!!compareVersions}
        onClose={handleCloseCompare}
        maxWidth="md"
        fullWidth
      >
        {compareVersions && (
          <>
            <DialogTitle>
              So sánh phiên bản {compareVersions.v1.version} và {compareVersions.v2.version}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  File 1 (v{compareVersions.v1.version}):
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {compareVersions.v1.file_name} - {formatFileSize(compareVersions.v1.file_size)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(compareVersions.v1.uploaded_at)}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                  File 2 (v{compareVersions.v2.version}):
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {compareVersions.v2.file_name} - {formatFileSize(compareVersions.v2.file_size)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(compareVersions.v2.uploaded_at)}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCompare}>Đóng</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
