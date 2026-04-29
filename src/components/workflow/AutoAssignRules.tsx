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
  MenuItem,
  Switch,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  AutoAwesome,
  People,
  Schedule,
} from '@mui/icons-material';
import { useState } from 'react';

interface AutoAssignRule {
  id: number;
  name: string;
  department_id?: number;
  department_name?: string;
  workload_balance: 'round_robin' | 'least_busy' | 'most_available';
  priority: number;
  is_active: boolean;
}

interface AutoAssignRulesProps {
  rules: AutoAssignRule[];
  onAdd?: (rule: Omit<AutoAssignRule, 'id'>) => Promise<void>;
  onUpdate?: (rule: AutoAssignRule) => Promise<void>;
  onDelete?: (ruleId: number) => Promise<void>;
}

const WORKLOAD_BALANCE_OPTIONS = [
  { value: 'round_robin', label: 'Vòng quay (Round Robin)', description: 'Phân công đều cho tất cả thành viên' },
  { value: 'least_busy', label: 'Ít bận nhất (Least Busy)', description: 'Phân cho người có ít task nhất' },
  { value: 'most_available', label: 'Nhiều thời gian nhất (Most Available)', description: 'Phân cho người có nhiều thời gian rảnh' },
];

export default function AutoAssignRules({
  rules,
  onAdd,
  onUpdate,
  onDelete,
}: AutoAssignRulesProps) {
  const [open, setOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoAssignRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    department_id: '' as string | undefined,
    workload_balance: 'round_robin' as 'round_robin' | 'least_busy' | 'most_available',
    priority: 0,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  const handleOpen = (rule?: AutoAssignRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        department_id: rule.department_id?.toString(),
        workload_balance: rule.workload_balance,
        priority: rule.priority,
        is_active: rule.is_active,
      });
    } else {
      setEditingRule(null);
      setFormData({
        name: '',
        department_id: undefined,
        workload_balance: 'round_robin',
        priority: 0,
        is_active: true,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRule(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (editingRule) {
        if (onUpdate) {
          await onUpdate({
            ...editingRule,
            ...formData,
            department_id: formData.department_id ? parseInt(formData.department_id) : undefined,
          });
        }
      } else if (onAdd) {
        await onAdd({
          ...formData,
          department_id: formData.department_id ? parseInt(formData.department_id) : undefined,
        });
      }
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ruleId: number) => {
    if (onDelete) {
      await onDelete(ruleId);
    }
  };

  const handleToggleActive = async (rule: AutoAssignRule) => {
    if (onUpdate) {
      await onUpdate({ ...rule, is_active: !rule.is_active });
    }
  };

  const getWorkloadBalanceLabel = (value: string) => {
    return WORKLOAD_BALANCE_OPTIONS.find((o) => o.value === value)?.label || value;
  };

  const getWorkloadBalanceDescription = (value: string) => {
    return WORKLOAD_BALANCE_OPTIONS.find((o) => o.value === value)?.description || '';
  };

  const getStatusColor = (active: boolean) => {
    return active ? 'success' : 'default';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome fontSize="small" color="action" />
          <Typography variant="h6">Quy tắc tự động phân công</Typography>
          <Chip
            label={`${rules.length} quy tắc`}
            size="small"
            color="primary"
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Thêm quy tắc
        </Button>
      </Box>

      {rules.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Chưa có quy tắc tự động phân công
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => handleOpen()}
          >
            Tạo quy tắc đầu tiên
          </Button>
        </Paper>
      ) : (
        <List>
          {rules.map((rule) => (
            <ListItem
              key={rule.id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                bgcolor: rule.is_active ? 'background.paper' : 'action.disabledBackground',
              }}
            >
              <ListItemIcon>
                <Chip
                  label={`Priority: ${rule.priority}`}
                  size="small"
                  color={rule.priority < 10 ? 'primary' : 'default'}
                  variant="outlined"
                />
              </ListItemIcon>

              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight="500">
                      {rule.name}
                    </Typography>
                    {rule.is_active && (
                      <Chip
                        label="Đang hoạt động"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    {rule.department_name && (
                      <Typography variant="caption" color="text.secondary">
                        Khoa: {rule.department_name}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {' • '}
                      {getWorkloadBalanceLabel(rule.workload_balance)}
                    </Typography>
                    {getWorkloadBalanceDescription(rule.workload_balance) && (
                      <Typography variant="caption" color="text.secondary">
                        {' • '}
                        {getWorkloadBalanceDescription(rule.workload_balance)}
                      </Typography>
                    )}
                  </Box>
                }
              />

              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  checked={rule.is_active}
                  onChange={() => handleToggleActive(rule)}
                  inputProps={{ 'aria-label': 'Toggle active' }}
                />
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => handleOpen(rule)}
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton
                  edge="end"
                  size="small"
                  color="error"
                  onClick={() => handleDelete(rule.id)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Add/Edit Rule Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRule ? 'Chỉnh sửa quy tắc' : 'Tạo quy tắc mới'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Tên quy tắc"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <TextField
              select
              label="Khoa"
              fullWidth
              value={formData.department_id || ''}
              onChange={(e) => setFormData({ ...formData, department_id: e.target.value || undefined })}
            >
              <MenuItem value="">Tất cả khoa</MenuItem>
              {/* TODO: Add department options */}
              <MenuItem value="1">Khoa Kỹ thuật</MenuItem>
              <MenuItem value="2">Khoa Kinh doanh</MenuItem>
              <MenuItem value="3">Khoa Tài chính</MenuItem>
            </TextField>

            <TextField
              select
              label="Chiến lược phân công"
              fullWidth
              value={formData.workload_balance}
              onChange={(e) => setFormData({ ...formData, workload_balance: e.target.value as any })}
            >
              {WORKLOAD_BALANCE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box>
                    <Typography variant="body2">{option.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Mức độ ưu tiên"
              type="number"
              fullWidth
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              helperText="Số càng nhỏ thì ưu tiên càng cao"
              slotProps={{ htmlInput: { min: 0 } }}
            />

            <Alert severity="info" sx={{ fontSize: 12 }}>
              Quy tắc sẽ được áp dụng tự động khi tạo task mới. Các quy tắc sẽ được xử lý theo thứ tự ưu tiên.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name || loading}
          >
            {editingRule ? 'Cập nhật' : 'Tạo'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
