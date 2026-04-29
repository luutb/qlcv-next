'use client';

import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  MonetizationOn,
  CheckCircle,
  Pending,
  Cancel,
  CalendarToday,
} from '@mui/icons-material';
import { useState } from 'react';

interface PaymentMilestone {
  id: number;
  name: string;
  amount: number;
  due_date?: string;
  paid_at?: string;
  status: 'pending' | 'paid' | 'overdue';
  description?: string;
}

interface PaymentMilestoneTrackerProps {
  contractId: number;
  milestones: PaymentMilestone[];
  onUpdate?: (milestone: PaymentMilestone) => Promise<void>;
  onDelete?: (milestoneId: number) => Promise<void>;
  onMarkPaid?: (milestoneId: number, amount: number) => Promise<void>;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'overdue':
      return 'error';
    default:
      return 'warning';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'paid':
      return 'Đã thanh toán';
    case 'overdue':
      return 'Quá hạn';
    default:
      return 'Chưa thanh toán';
  }
};

export default function PaymentMilestoneTracker({
  contractId,
  milestones,
  onUpdate,
  onDelete,
  onMarkPaid,
}: PaymentMilestoneTrackerProps) {
  const [open, setOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<PaymentMilestone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    due_date: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleOpen = (milestone?: PaymentMilestone) => {
    if (milestone) {
      setEditingMilestone(milestone);
      setFormData({
        name: milestone.name,
        amount: milestone.amount.toString(),
        due_date: milestone.due_date || '',
        description: milestone.description || '',
      });
    } else {
      setEditingMilestone(null);
      setFormData({
        name: '',
        amount: '',
        due_date: '',
        description: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMilestone(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const milestoneData: PaymentMilestone = {
        id: editingMilestone?.id ?? Date.now(),
        name: formData.name,
        amount: parseFloat(formData.amount) || 0,
        due_date: formData.due_date || undefined,
        description: formData.description || undefined,
        status: editingMilestone?.status || 'pending',
      };

      if (onUpdate) {
        await onUpdate(milestoneData);
      }
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (milestoneId: number) => {
    if (onDelete) {
      await onDelete(milestoneId);
    }
  };

  const handleMarkPaid = async (milestoneId: number) => {
    if (onMarkPaid) {
      const milestone = milestones.find((m) => m.id === milestoneId);
      if (milestone) {
        await onMarkPaid(milestoneId, milestone.amount);
      }
    }
  };

  const handleToggleStatus = async (milestone: PaymentMilestone) => {
    if (onUpdate) {
      const newStatus = milestone.status === 'paid' ? 'pending' : 'paid';
      await onUpdate({ ...milestone, status: newStatus });
    }
  };

  const totalAmount = milestones.reduce((acc, m) => acc + m.amount, 0);
  const paidAmount = milestones.filter((m) => m.status === 'paid').reduce((acc, m) => acc + m.amount, 0);
  const progress = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <MonetizationOn fontSize="small" color="action" />
        <Typography variant="h6">Tiến độ thanh toán</Typography>
        <Chip
          label={`${milestones.length} mốc`}
          size="small"
          color="primary"
        />
      </Box>

      {/* Progress Bar */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Đã thanh toán: {formatCurrency(paidAmount)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng: {formatCurrency(totalAmount)}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 8, borderRadius: 1 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
          {progress.toFixed(1)}% hoàn thành
        </Typography>
      </Paper>

      {/* Add Button */}
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        Thêm mốc thanh toán
      </Button>

      {/* Milestone List */}
      {milestones.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Chưa có mốc thanh toán nào
          </Typography>
        </Paper>
      ) : (
        <List>
          {milestones.map((milestone) => (
            <ListItem
              key={milestone.id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                bgcolor: milestone.status === 'paid' ? 'success.light' : 'background.paper',
              }}
            >
              <ListItemIcon>
                <Chip
                  label={getStatusLabel(milestone.status)}
                  size="small"
                  color={getStatusColor(milestone.status)}
                  variant="outlined"
                />
              </ListItemIcon>

              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="500">
                      {milestone.name}
                    </Typography>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      {formatCurrency(milestone.amount)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    {milestone.description && (
                      <Typography variant="caption" color="text.secondary">
                        {milestone.description}
                      </Typography>
                    )}
                    {milestone.due_date && (
                      <Typography variant="caption" color="text.secondary">
                        {' • '}
                        <CalendarToday fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        Hạn: {new Date(milestone.due_date).toLocaleDateString('vi-VN')}
                      </Typography>
                    )}
                    {milestone.paid_at && (
                      <Typography variant="caption" color="success.main">
                        {' • '}
                        Đã thanh toán: {new Date(milestone.paid_at).toLocaleDateString('vi-VN')}
                      </Typography>
                    )}
                  </Box>
                }
              />

              <ListItemSecondaryAction>
                {milestone.status !== 'paid' && onMarkPaid && (
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleMarkPaid(milestone.id)}
                    title="Đánh dấu đã thanh toán"
                  >
                    <CheckCircle fontSize="small" />
                  </IconButton>
                )}
                {onUpdate && (
                  <IconButton
                    size="small"
                    onClick={() => handleToggleStatus(milestone)}
                    title="Chuyển đổi trạng thái"
                  >
                    {milestone.status === 'paid' ? <Pending fontSize="small" /> : <CheckCircle fontSize="small" />}
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={() => handleOpen(milestone)}
                  title="Chỉnh sửa"
                >
                  <Edit fontSize="small" />
                </IconButton>
                {onDelete && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(milestone.id)}
                    title="Xóa"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Add/Edit Milestone Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMilestone ? 'Chỉnh sửa mốc thanh toán' : 'Tạo mốc thanh toán mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Tên mốc"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <TextField
              label="Số tiền (VND)"
              type="number"
              required
              fullWidth
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              slotProps={{ htmlInput: { min: 0 } }}
            />

            <TextField
              label="Hạn thanh toán"
              type="date"
              fullWidth
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              label="Mô tả"
              multiline
              rows={2}
              fullWidth
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <Alert severity="info" sx={{ fontSize: 12 }}>
              Khi đánh dấu một mốc là đã thanh toán, hệ thống sẽ tự động cập nhật tiến độ thanh toán của hợp đồng.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || !formData.amount || loading}
          >
            {editingMilestone ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
