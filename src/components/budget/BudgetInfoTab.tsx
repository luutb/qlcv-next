'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
} from '@mui/material';
import {
  Edit,
  CheckCircle,
  Cancel,
  Schedule,
} from '@mui/icons-material';
import { Budget } from '@/types/budget';
import { budgetRepository } from '@/repositories/BudgetRepo';

interface BudgetInfoTabProps {
  budget: Budget;
  onRefresh: () => void;
}

export default function BudgetInfoTab({ budget, onRefresh }: BudgetInfoTabProps) {
  const [approveDialog, setApproveDialog] = useState(false);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    try {
      setLoading(true);
      await budgetRepository.approveBudget(budget.id, comments);
      onRefresh();
      setApproveDialog(false);
      setComments('');
    } catch (err) {
      console.error('Error approving budget:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: Budget['status']) => {
    try {
      await budgetRepository.updateBudgetStatus(budget.id, status);
      onRefresh();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const getStatusColor = (status: Budget['status']) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'approved':
        return 'success';
      case 'active':
        return 'primary';
      case 'closed':
        return 'secondary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Budget['status']) => {
    switch (status) {
      case 'draft':
        return 'Nháp';
      case 'approved':
        return 'Đã duyệt';
      case 'active':
        return 'Đang hoạt động';
      case 'closed':
        return 'Đã đóng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getBudgetTypeLabel = (type: Budget['budget_type']) => {
    switch (type) {
      case 'project':
        return 'Dự án';
      case 'department':
        return 'Phòng ban';
      case 'task':
        return 'Nhiệm vụ';
      case 'contract':
        return 'Hợp đồng';
      default:
        return type;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Thông tin cơ bản" />
            <CardContent>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tên ngân sách
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {budget.name}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Mô tả
                </Typography>
                <Typography variant="body1">
                  {budget.description || 'Không có mô tả'}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Loại ngân sách
                </Typography>
                <Chip
                  label={getBudgetTypeLabel(budget.budget_type)}
                  color="primary"
                  variant="outlined"
                />
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tham chiếu
                </Typography>
                <Typography variant="body1">
                  {budget.reference_name || 'Không có'}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tiền tệ
                </Typography>
                <Typography variant="body1">
                  {budget.currency}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Thông tin tài chính" />
            <CardContent>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tổng ngân sách
                </Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {formatCurrency(budget.total_budget)}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Đã phân bổ
                </Typography>
                <Typography variant="h6" color="info.main" fontWeight="bold">
                  {formatCurrency(budget.allocated_budget)}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Đã chi tiêu
                </Typography>
                <Typography variant="h6" color="warning.main" fontWeight="bold">
                  {formatCurrency(budget.spent_amount)}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Cam kết
                </Typography>
                <Typography variant="h6" color="secondary.main" fontWeight="bold">
                  {formatCurrency(budget.committed_amount)}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Còn lại
                </Typography>
                <Typography variant="h6" color="success.main" fontWeight="bold">
                  {formatCurrency(budget.remaining_budget)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ngưỡng cảnh báo
                </Typography>
                <Typography variant="body1">
                  {budget.alert_threshold}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Time Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Thông tin thời gian" />
            <CardContent>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Thời gian thực hiện
                </Typography>
                <Typography variant="body1">
                  {formatDate(budget.start_date)} - {formatDate(budget.end_date)}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Năm tài chính
                </Typography>
                <Typography variant="body1">
                  {budget.fiscal_year}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Quý
                </Typography>
                <Typography variant="body1">
                  {budget.quarter ? `Quý ${budget.quarter}` : 'Cả năm'}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ngày tạo
                </Typography>
                <Typography variant="body1">
                  {formatDate(budget.created_at)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Cập nhật lần cuối
                </Typography>
                <Typography variant="body1">
                  {formatDate(budget.updated_at)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Status & Approval */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader title="Trạng thái & Phê duyệt" />
            <CardContent>
              <Box mb={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Trạng thái hiện tại
                </Typography>
                <Chip
                  label={getStatusLabel(budget.status)}
                  color={getStatusColor(budget.status)}
                  size="medium"
                />
              </Box>

              {budget.approved_by && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Người phê duyệt
                  </Typography>
                  <Typography variant="body1">
                    {budget.approver?.name || `User ${budget.approved_by}`}
                  </Typography>
                </Box>
              )}

              {budget.approved_at && (
                <Box mb={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Ngày phê duyệt
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(budget.approved_at)}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Action Buttons */}
              <Box display="flex" gap={1} flexWrap="wrap">
                {budget.status === 'draft' && (
                  <Button
                    startIcon={<CheckCircle />}
                    onClick={() => setApproveDialog(true)}
                    color="success"
                    variant="outlined"
                    size="small"
                  >
                    Phê duyệt
                  </Button>
                )}

                {budget.status === 'approved' && (
                  <Button
                    startIcon={<Schedule />}
                    onClick={() => handleStatusChange('active')}
                    color="primary"
                    variant="outlined"
                    size="small"
                  >
                    Kích hoạt
                  </Button>
                )}

                {budget.status === 'active' && (
                  <Button
                    startIcon={<CheckCircle />}
                    onClick={() => handleStatusChange('closed')}
                    color="secondary"
                    variant="outlined"
                    size="small"
                  >
                    Đóng
                  </Button>
                )}

                {['draft', 'approved'].includes(budget.status) && (
                  <Button
                    startIcon={<Cancel />}
                    onClick={() => handleStatusChange('cancelled')}
                    color="error"
                    variant="outlined"
                    size="small"
                  >
                    Hủy
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Approve Dialog */}
      <Dialog open={approveDialog} onClose={() => setApproveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Phê duyệt ngân sách</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn phê duyệt ngân sách này?
          </Alert>
          <TextField
            fullWidth
            label="Ghi chú (tùy chọn)"
            multiline
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Nhập ghi chú về việc phê duyệt..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleApprove}
            disabled={loading}
            color="success"
            variant="contained"
          >
            {loading ? 'Đang xử lý...' : 'Phê duyệt'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}