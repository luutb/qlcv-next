'use client';

import {
  Box, Typography, Paper, Grid, Chip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, LinearProgress, Avatar,
} from '@mui/material';
import {
  People,
  Devices,
  MonetizationOn,
  Assignment,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useState } from 'react';

interface Resource {
  id: number;
  name: string;
  type: 'person' | 'equipment' | 'budget';
  status: 'available' | 'assigned' | 'busy';
  utilization?: number;
  capacity?: number;
  cost?: number;
  assigned_tasks?: number;
}

interface ResourceManagementProps {
  resources: Resource[];
  onAssign?: (resourceId: number, taskId: number) => Promise<void>;
  onRelease?: (resourceId: number) => Promise<void>;
}

export default function ResourceManagement({
  resources,
  onAssign,
  onRelease,
}: ResourceManagementProps) {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  // Group resources by type
  const people = resources?.filter((r) => r.type === 'person') || [];
  const equipment = resources?.filter((r) => r.type === 'equipment') || [];
  const budgets = resources?.filter((r) => r.type === 'budget') || [];

  // Get color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'assigned':
        return 'primary';
      case 'busy':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleAssign = async (resourceId: number, taskId: number) => {
    if (onAssign) {
      await onAssign(resourceId, taskId);
      setShowAssignDialog(false);
    }
  };

  const handleRelease = async (resourceId: number) => {
    if (onRelease) {
      await onRelease(resourceId);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Assignment fontSize="small" color="action" />
        <Typography variant="h6">Resource Management</Typography>
        <Chip
          label={`${resources?.length || 0} resources`}
          size="small"
          color="primary"
        />
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <People fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Nhân sự
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {people.length}
            </Typography>
            <Typography variant="caption" color="success.main">
              {people.filter((r) => r.status === 'available').length} sẵn sàng
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Devices fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Thiết bị
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {equipment.length}
            </Typography>
            <Typography variant="caption" color="primary.main">
              {equipment.filter((r) => r.status === 'assigned').length} đang sử dụng
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <MonetizationOn fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Ngân sách
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold">
              {budgets.reduce((acc, r) => acc + (r.cost || 0), 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tổng ngân sách
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* People Resources */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <People fontSize="small" color="action" />
          <Typography variant="h6">Nhân sự</Typography>
        </Box>

        <Grid container spacing={2}>
          {people.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Typography color="text.secondary" textAlign="center" py={2}>
                Chưa có nhân sự nào
              </Typography>
            </Grid>
          ) : (
            people.map((resource) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={resource.id}>
              <Paper
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 3,
                  },
                }}
                onClick={() => setSelectedResource(resource)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      fontSize: 14,
                      background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                    }}
                  >
                    {resource.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      {resource.name}
                    </Typography>
                    <Chip
                      label={resource.status}
                      size="small"
                      color={getStatusColor(resource.status)}
                      variant="outlined"
                    />
                  </Box>
                </Box>

                {resource.utilization !== undefined && (
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Utilization
                      </Typography>
                      <Typography variant="caption" fontWeight="500">
                        {resource.utilization.toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={resource.utilization}
                      color={resource.utilization >= 90 ? 'error' : resource.utilization >= 70 ? 'warning' : 'success'}
                      sx={{ height: 4, borderRadius: 1 }}
                    />
                  </Box>
                )}

                {resource.assigned_tasks !== undefined && (
                  <Typography variant="caption" color="text.secondary">
                    {resource.assigned_tasks} tasks đang xử lý
                  </Typography>
                )}
              </Paper>
            </Grid>
          )))}
        </Grid>
      </Paper>

      {/* Equipment Resources */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Devices fontSize="small" color="action" />
          <Typography variant="h6">Thiết bị</Typography>
        </Box>

        <Grid container spacing={2}>
          {equipment.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Typography color="text.secondary" textAlign="center" py={2}>
                Chưa có thiết bị nào
              </Typography>
            </Grid>
          ) : (
            equipment.map((resource) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={resource.id}>
              <Paper
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 3,
                  },
                }}
                onClick={() => setSelectedResource(resource)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      fontSize: 14,
                      background: 'linear-gradient(135deg, #D97706, #F59E0B)',
                    }}
                  >
                    {resource.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      {resource.name}
                    </Typography>
                    <Chip
                      label={resource.status}
                      size="small"
                      color={getStatusColor(resource.status)}
                      variant="outlined"
                    />
                  </Box>
                </Box>

                {resource.utilization !== undefined && (
                  <Typography variant="caption" color="text.secondary">
                    {resource.utilization.toFixed(0)}% utilization
                  </Typography>
                )}
              </Paper>
            </Grid>
          )))}
        </Grid>
      </Paper>

      {/* Budget Resources */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <MonetizationOn fontSize="small" color="action" />
          <Typography variant="h6">Ngân sách</Typography>
        </Box>

        <Grid container spacing={2}>
          {budgets.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Typography color="text.secondary" textAlign="center" py={2}>
                Chưa có ngân sách nào
              </Typography>
            </Grid>
          ) : (
            budgets.map((resource) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={resource.id}>
              <Paper
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 3,
                  },
                }}
                onClick={() => setSelectedResource(resource)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      fontSize: 14,
                      background: 'linear-gradient(135deg, #059669, #34D399)',
                    }}
                  >
                    {resource.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      {resource.name}
                    </Typography>
                    <Chip
                      label={resource.status}
                      size="small"
                      color={getStatusColor(resource.status)}
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                  {resource.cost?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </Typography>

                {resource.utilization !== undefined && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Đã chi
                      </Typography>
                      <Typography variant="caption" fontWeight="500">
                        {resource.utilization.toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={resource.utilization}
                      color={resource.utilization >= 90 ? 'error' : resource.utilization >= 70 ? 'warning' : 'success'}
                      sx={{ height: 4, borderRadius: 1 }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
          )))}
        </Grid>
      </Paper>

      {/* Resource Detail Dialog */}
      <Dialog
        open={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedResource && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: 12,
                    background: selectedResource.type === 'person'
                      ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                      : selectedResource.type === 'equipment'
                      ? 'linear-gradient(135deg, #D97706, #F59E0B)'
                      : 'linear-gradient(135deg, #059669, #34D399)',
                  }}
                >
                  {selectedResource.name.charAt(0)}
                </Avatar>
                <Typography variant="h6">{selectedResource.name}</Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={selectedResource.type}
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: 'capitalize' }}
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Paper sx={{ p: 1.5, flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Trạng thái
                    </Typography>
                    <Chip
                      label={selectedResource.status}
                      size="small"
                      color={getStatusColor(selectedResource.status)}
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  </Paper>
                  {selectedResource.utilization !== undefined && (
                    <Paper sx={{ p: 1.5, flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Utilization
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
                        {selectedResource.utilization.toFixed(0)}%
                      </Typography>
                    </Paper>
                  )}
                </Box>

                {selectedResource.cost !== undefined && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight="500">
                      Chi phí: {selectedResource.cost.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </Typography>
                  </Box>
                )}

                {selectedResource.assigned_tasks !== undefined && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {selectedResource.assigned_tasks} tasks đang xử lý
                    </Typography>
                  </Box>
                )}

                <Alert severity="info" sx={{ mt: 2, fontSize: 12 }}>
                  {selectedResource.status === 'available'
                    ? 'Resource này hiện đang sẵn sàng để gán task.'
                    : 'Resource này hiện đang được sử dụng. Bạn có thể giải phóng nếu cần.'}
                </Alert>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedResource(null)}>Đóng</Button>
              {selectedResource.status === 'available' ? (
                <Button
                  onClick={() => setShowAssignDialog(true)}
                  variant="contained"
                  startIcon={<Assignment />}
                >
                  Gán task
                </Button>
              ) : (
                <Button
                  onClick={() => handleRelease(selectedResource.id)}
                  color="error"
                  startIcon={<TrendingDown />}
                >
                  Giải phóng
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog
        open={showAssignDialog}
        onClose={() => setShowAssignDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedResource && (
          <>
            <DialogTitle>
              Gán task cho {selectedResource.name}
            </DialogTitle>
            <DialogContent>
              <Alert severity="info" sx={{ fontSize: 12 }}>
                Chọn task để gán cho resource này.
              </Alert>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowAssignDialog(false)}>Hủy</Button>
              <Button
                onClick={() => handleAssign(selectedResource.id, 0)}
                variant="contained"
              >
                Gán task
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
