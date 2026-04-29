'use client';

import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
  Alert,
} from '@mui/material';
import {
  History,
  Compare,
  Restore,
  Close,
  CalendarToday,
  Person,
} from '@mui/icons-material';
import { useState } from 'react';

interface WorkflowVersion {
  id: number;
  version: number;
  created_at: string;
  created_by: number;
  creator_name?: string;
  change_description: string;
  steps: any[];
}

interface WorkflowVersionHistoryProps {
  workflowId: number;
  versions: WorkflowVersion[];
  onRestore?: (versionId: number) => Promise<void>;
  onCompare?: (v1: WorkflowVersion, v2: WorkflowVersion) => void;
}

export default function WorkflowVersionHistory({
  workflowId,
  versions,
  onRestore,
  onCompare,
}: WorkflowVersionHistoryProps) {
  const [compareVersions, setCompareVersions] = useState<{
    v1: WorkflowVersion;
    v2: WorkflowVersion;
  } | null>(null);
  const [restoringVersion, setRestoringVersion] = useState<number | null>(null);

  const handleRestore = async (versionId: number) => {
    if (!onRestore) return;
    setRestoringVersion(versionId);
    try {
      await onRestore(versionId);
    } finally {
      setRestoringVersion(null);
    }
  };

  const handleCompare = (v1: WorkflowVersion, v2: WorkflowVersion) => {
    setCompareVersions({ v1, v2 });
  };

  const handleCloseCompare = () => {
    setCompareVersions(null);
  };

  const getStepChanges = (v1: WorkflowVersion, v2: WorkflowVersion) => {
    const steps1 = v1.steps || [];
    const steps2 = v2.steps || [];
    const changes: string[] = [];

    // Check for added steps
    steps2.forEach((step: any, idx: number) => {
      if (!steps1[idx]) {
        changes.push(`+ Bước ${idx + 1}: ${step.step_name}`);
      } else if (
        step.step_name !== steps1[idx].step_name ||
        step.required_role !== steps1[idx].required_role ||
        step.require_file !== steps1[idx].require_file
      ) {
        changes.push(`~ Bước ${idx + 1}: ${step.step_name}`);
      }
    });

    // Check for removed steps
    steps1.forEach((step: any, idx: number) => {
      if (!steps2[idx]) {
        changes.push(`- Bước ${idx + 1}: ${step.step_name}`);
      }
    });

    return changes;
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
          label={`Tổng cộng: ${versions.length}`}
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
                      Phiên bản {version.version}
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
                      {formatDate(version.created_at)}
                    </Typography>
                    {version.creator_name && (
                      <Typography variant="caption" color="text.secondary">
                        {' • '}
                        {version.creator_name}
                      </Typography>
                    )}
                    {version.change_description && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {version.change_description}
                      </Typography>
                    )}
                  </Box>
                }
              />

              <Box sx={{ display: 'flex', gap: 1 }}>
                {idx > 0 && (
                  <Button
                    size="small"
                    startIcon={<Compare />}
                    onClick={() => handleCompare(versions[0], version)}
                  >
                    So sánh
                  </Button>
                )}
                {onRestore && (
                  <Button
                    size="small"
                    startIcon={<Restore />}
                    onClick={() => handleRestore(version.id)}
                    disabled={restoringVersion === version.id}
                  >
                    Khôi phục
                  </Button>
                )}
              </Box>
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
              {compareVersions.v1.version === compareVersions.v2.version ? (
                <Alert severity="info">Không thể so sánh cùng một phiên bản</Alert>
              ) : (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Thay đổi bước:
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: 'grey.100',
                      fontFamily: 'monospace',
                      fontSize: 'small',
                    }}
                  >
                    {getStepChanges(compareVersions.v1, compareVersions.v2).length >
                    0 ? (
                      getStepChanges(compareVersions.v1, compareVersions.v2).map(
                        (change, idx) => (
                          <Typography key={idx} variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {change}
                          </Typography>
                        )
                      )
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Không có thay đổi nào
                      </Typography>
                    )}
                  </Paper>
                </Box>
              )}
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
