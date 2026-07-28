'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Alert, CircularProgress, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { LabelsResponse, Label } from '@/types/label.types';
import { LabelBadge } from '@/components/labels/LabelBadge';
import { LabelCard } from '@/components/labels/LabelCard';
import { CreateLabelModal } from '@/components/labels/CreateLabelModal';
import { EditLabelModal } from '@/components/labels/EditLabelModal';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LabelManagementPage() {
  const [labels, setLabels] = useState<LabelsResponse | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const canManageLabels = ['admin', 'manager'].includes(user?.role || '');

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/labels', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách labels');
      }

      const data: LabelsResponse = await response.json();
      setLabels(data);
    } catch (err) {
      setError('Không thể tải danh sách labels');
      console.error('Error fetching labels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLabel = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa label này?')) {
      return;
    }

    try {
      await fetch(`/api/v1/labels/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      toast.success('Xóa label thành công');
      fetchLabels();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa label');
      console.error('Delete label error:', error);
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryNames: Record<string, string> = {
      workflow: 'Quy trình',
      payment: 'Thanh toán',
      status: 'Trạng thái',
      priority: 'Ưu tiên',
      customer: 'Khách hàng',
      contract: 'Hợp đồng',
      special: 'Đặc biệt',
      custom: 'Tùy chỉnh'
    };
    return categoryNames[category] || category;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý Labels
        </Typography>
        {canManageLabels && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Tạo Label
          </Button>
        )}
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {labels && (
        <>
          {/* System Labels */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="semibold">
                  System Labels
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Labels tự động được tạo bởi hệ thống
                </Typography>
              </Box>

              {Object.entries(labels.system_labels).map(([category, categoryLabels]) => (
                <Box key={category} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                    {getCategoryDisplayName(category)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {categoryLabels.map((label: Label) => (
                      <LabelBadge key={label.id} label={label} />
                    ))}
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Custom Labels */}
          <Card>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="semibold">
                  Custom Labels
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Labels tùy chỉnh do người dùng tạo
                </Typography>
              </Box>

              {labels.custom_labels.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                  Chưa có custom labels nào
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {labels.custom_labels.map((label) => (
                    <Grid key={label.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <LabelCard
                        label={label}
                        canEdit={canManageLabels}
                        onEdit={(label) => setEditingLabel(label)}
                        onDelete={handleDeleteLabel}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Modals */}
      <CreateLabelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchLabels}
      />

      <EditLabelModal
        label={editingLabel}
        isOpen={!!editingLabel}
        onClose={() => setEditingLabel(null)}
        onSuccess={fetchLabels}
      />
    </Box>
  );
}
